import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const aesoKey = Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY') || Deno.env.get('AESO_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!aesoKey) {
      return new Response(JSON.stringify({ success: false, error: 'AESO API key not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json().catch(() => ({}));
    const { mode = 'backfill', maxDays = 7 } = body;

    // Mode: clear
    if (mode === 'clear') {
      let totalCleared = 0;
      const BATCH = 100;
      for (let i = 0; i < 50; i++) {
        const { data: batch } = await supabase
          .from('aeso_training_data')
          .select('id')
          .not('system_marginal_price', 'is', null)
          .limit(BATCH);
        if (!batch || batch.length === 0) break;
        const ids = batch.map(r => r.id);
        await supabase.from('aeso_training_data')
          .update({ system_marginal_price: null, smp_pool_price_spread: null })
          .in('id', ids);
        totalCleared += ids.length;
      }
      const { count: remaining } = await supabase
        .from('aeso_training_data')
        .select('id', { count: 'exact', head: true })
        .not('system_marginal_price', 'is', null);
      return new Response(JSON.stringify({ success: true, mode: 'clear', cleared: totalCleared, remaining: remaining ?? 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Mode: backfill — process small date chunks, working backwards from most recent null records
    console.log(`📊 SMP hourly backfill (max ${maxDays} days per chunk)...`);

    const { data: latestNull } = await supabase
      .from('aeso_training_data')
      .select('timestamp')
      .is('system_marginal_price', null)
      .gte('timestamp', '2025-11-01T00:00:00Z')
      .order('timestamp', { ascending: false })
      .limit(1);

    const { data: earliestNull } = await supabase
      .from('aeso_training_data')
      .select('timestamp')
      .is('system_marginal_price', null)
      .gte('timestamp', '2025-11-01T00:00:00Z')
      .order('timestamp', { ascending: true })
      .limit(1);

    if (!latestNull?.length || !earliestNull?.length) {
      return new Response(JSON.stringify({
        success: true, message: 'No records need SMP backfill', updated: 0, remaining: 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Process in small chunks (7 days max) — start from the LATEST null and work backwards
    // This ensures we match with the most recent AESO API data first
    const latestDate = new Date(latestNull[0].timestamp);
    const earliestDate = new Date(earliestNull[0].timestamp);
    
    // Calculate chunk: last maxDays days of null data
    const chunkEnd = new Date(latestDate);
    chunkEnd.setDate(chunkEnd.getDate() + 1); // include the day
    const chunkStart = new Date(chunkEnd);
    chunkStart.setDate(chunkStart.getDate() - Math.min(maxDays, 7)); // max 7 days per API call
    if (chunkStart < earliestDate) chunkStart.setTime(earliestDate.getTime());

    const startStr = chunkStart.toISOString().split('T')[0];
    const endStr = chunkEnd.toISOString().split('T')[0];
    console.log(`Fetching SMP for chunk: ${startStr} to ${endStr}`);

    // Fetch SMP from AESO API
    let smpByHour: Record<string, number> = {};
    let source = 'unknown';

    // Try SMP Report API first (has dedicated hourly SMP)
    try {
      const smpUrl = `https://apimgw.aeso.ca/public/systemmarginalprice-api/v1.1/price/systemMarginalPrice?startDate=${startStr}&endDate=${endStr}`;
      console.log('Fetching SMP Report API:', smpUrl);
      const smpResp = await fetch(smpUrl, {
        headers: { 'Accept': 'application/json', 'API-KEY': aesoKey },
        signal: AbortSignal.timeout(25000)
      });

      if (smpResp.ok) {
        const smpData = await smpResp.json();
        const smpRecords = smpData?.return?.['System Marginal Price Report'] || [];
        console.log(`SMP Report returned ${smpRecords.length} records`);
        if (smpRecords.length > 0) {
          console.log('SMP sample:', JSON.stringify(smpRecords[0]));
        }

        for (const r of smpRecords) {
          const ts = r.begin_datetime_utc || r.date_time;
          const smp = parseFloat(r.system_marginal_price || r.price || r.smp);
          if (ts && !isNaN(smp)) {
            // Normalize: "2025-11-13 06:32" → "2025-11-13 06"
            const hourKey = ts.replace('T', ' ').substring(0, 13);
            smpByHour[hourKey] = smp;
          }
        }
        source = 'smp_report';
        console.log(`Got ${Object.keys(smpByHour).length} unique hourly SMP values`);
      } else {
        console.error(`SMP Report API returned ${smpResp.status}: ${await smpResp.text()}`);
      }
    } catch (e: any) {
      console.warn('SMP Report fetch failed:', e.message);
    }

    // Fallback: Pool Price Report (has pool_price but maybe not SMP)
    if (Object.keys(smpByHour).length === 0) {
      try {
        const ppUrl = `https://apimgw.aeso.ca/public/poolprice-api/v1.1/price/poolPrice?startDate=${startStr}&endDate=${endStr}`;
        const ppResp = await fetch(ppUrl, {
          headers: { 'Accept': 'application/json', 'API-KEY': aesoKey },
          signal: AbortSignal.timeout(25000)
        });
        if (ppResp.ok) {
          const ppData = await ppResp.json();
          const records = ppData?.return?.['Pool Price Report'] || [];
          console.log(`Pool Price Report returned ${records.length} records, fields: ${records.length > 0 ? Object.keys(records[0]).join(',') : 'none'}`);
          for (const r of records) {
            if (r.system_marginal_price !== undefined && r.system_marginal_price !== null) {
              const ts = r.begin_datetime_utc;
              const smp = parseFloat(r.system_marginal_price);
              if (ts && !isNaN(smp)) {
                smpByHour[ts.replace('T', ' ').substring(0, 13)] = smp;
              }
            }
          }
          if (Object.keys(smpByHour).length > 0) source = 'pool_price_report';
        }
      } catch (e: any) {
        console.warn('Pool Price Report fetch failed:', e.message);
      }
    }

    const smpKeys = Object.keys(smpByHour).sort();
    const smpCount = smpKeys.length;
    
    if (smpCount === 0) {
      return new Response(JSON.stringify({
        success: true, message: 'No SMP data available from AESO API for this date range',
        updated: 0, dateRange: { start: startStr, end: endStr }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Log diagnostic info
    console.log(`SMP keys range: ${smpKeys[0]} to ${smpKeys[smpKeys.length - 1]}`);
    console.log(`First 5 SMP keys: ${smpKeys.slice(0, 5).join(', ')}`);
    console.log(`Last 5 SMP keys: ${smpKeys.slice(-5).join(', ')}`);

    // Fetch training records in the SMP date range
    const smpMinDate = smpKeys[0].substring(0, 10);
    const smpMaxDate = smpKeys[smpKeys.length - 1].substring(0, 10);

    const { data: records, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('id, timestamp, pool_price')
      .is('system_marginal_price', null)
      .gte('timestamp', smpMinDate + 'T00:00:00Z')
      .lte('timestamp', smpMaxDate + 'T23:59:59Z')
      .order('timestamp', { ascending: false })
      .limit(5000);

    if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);
    if (!records || records.length === 0) {
      return new Response(JSON.stringify({
        success: true, message: 'No null-SMP training records in this date range',
        updated: 0, smpKeysFound: smpCount, dateRange: { start: smpMinDate, end: smpMaxDate }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Found ${records.length} training records to match`);
    
    // Log the first few training timestamps and their hourKeys for debugging
    for (let i = 0; i < Math.min(3, records.length); i++) {
      const ts = records[i].timestamp;
      const hourKey = ts.replace('T', ' ').substring(0, 13);
      const match = smpByHour[hourKey];
      console.log(`Training[${i}]: ts=${ts} hourKey="${hourKey}" smp=${match !== undefined ? match : 'NO MATCH'}`);
    }

    // Match and group by SMP value for efficient batch updates
    let updated = 0;
    let noMatch = 0;

    // Group records by their SMP+spread values
    const smpGroups: Record<string, string[]> = {};
    const spreadUpdates: { id: string; spread: number }[] = [];

    for (const r of records) {
      const hourKey = r.timestamp.replace('T', ' ').substring(0, 13);
      const smp = smpByHour[hourKey];
      if (smp !== undefined) {
        const key = String(smp);
        if (!smpGroups[key]) smpGroups[key] = [];
        smpGroups[key].push(r.id);
        const spread = Math.round((r.pool_price - smp) * 100) / 100;
        spreadUpdates.push({ id: r.id, spread });
      } else {
        noMatch++;
      }
    }

    // Batch update SMP values (grouped by value, max 50 IDs per call)
    for (const [smpVal, ids] of Object.entries(smpGroups)) {
      for (let i = 0; i < ids.length; i += 50) {
        const batch = ids.slice(i, i + 50);
        const { error } = await supabase
          .from('aeso_training_data')
          .update({ system_marginal_price: parseFloat(smpVal) })
          .in('id', batch);
        if (!error) updated += batch.length;
      }
    }

    // Batch update spreads (group by spread value)
    const spreadGroups: Record<string, string[]> = {};
    for (const s of spreadUpdates) {
      const key = String(s.spread);
      if (!spreadGroups[key]) spreadGroups[key] = [];
      spreadGroups[key].push(s.id);
    }
    for (const [spreadVal, ids] of Object.entries(spreadGroups)) {
      for (let i = 0; i < ids.length; i += 50) {
        const batch = ids.slice(i, i + 50);
        await supabase
          .from('aeso_training_data')
          .update({ smp_pool_price_spread: parseFloat(spreadVal) })
          .in('id', batch);
      }
    }

    console.log(`Batch updated ${updated} SMP values, ${noMatch} unmatched`);

    // Count remaining
    const { count: remaining } = await supabase
      .from('aeso_training_data')
      .select('id', { count: 'exact', head: true })
      .is('system_marginal_price', null)
      .gte('timestamp', '2025-11-01T00:00:00Z');

    console.log(`✅ SMP backfill: ${updated} updated, ${noMatch} unmatched, ${remaining ?? '?'} remaining`);

    return new Response(JSON.stringify({
      success: true, updated, noMatch, remaining: remaining ?? 0, source,
      dateRange: { start: startStr, end: endStr },
      smpKeysFound: smpCount,
      smpKeyRange: { first: smpKeys[0], last: smpKeys[smpKeys.length - 1] },
      message: remaining && remaining > 0
        ? `Call again to process remaining ${remaining} records`
        : 'SMP backfill complete'
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('❌ SMP backfill error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
