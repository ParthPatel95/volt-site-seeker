import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

/**
 * Backfill SMP data with true hourly granularity from AESO Pool Price Report API.
 * 
 * The previous collector stored one SMP value per day (daily summary) which is invalid.
 * This function fetches the actual hourly SMP from the AESO API and updates records.
 * 
 * Step 1 (mode=clear): Null out all existing invalid daily-granularity SMP values
 * Step 2 (mode=backfill): Fetch real hourly SMP from AESO and update records
 */
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

    // Mode: clear — null out all existing invalid daily-granularity SMP
    if (mode === 'clear') {
      console.log('🧹 Clearing invalid daily-granularity SMP values...');
      
      // Process in batches to avoid timeouts
      let totalCleared = 0;
      const BATCH = 100;
      
      for (let i = 0; i < 50; i++) { // max 50 batches = 5000 records
        const { data: batch } = await supabase
          .from('aeso_training_data')
          .select('id')
          .not('system_marginal_price', 'is', null)
          .limit(BATCH);

        if (!batch || batch.length === 0) break;

        const ids = batch.map(r => r.id);
        const { error } = await supabase
          .from('aeso_training_data')
          .update({ system_marginal_price: null, smp_pool_price_spread: null })
          .in('id', ids);

        if (error) {
          console.error('Clear batch error:', error.message);
          break;
        }
        totalCleared += ids.length;
        if (totalCleared % 500 === 0) console.log(`Cleared ${totalCleared} records...`);
      }

      // Check remaining
      const { count: remaining } = await supabase
        .from('aeso_training_data')
        .select('id', { count: 'exact', head: true })
        .not('system_marginal_price', 'is', null);

      return new Response(JSON.stringify({
        success: true,
        mode: 'clear',
        cleared: totalCleared,
        remaining: remaining ?? 0,
        message: remaining && remaining > 0
          ? `Call again to clear remaining ${remaining} records`
          : 'All invalid SMP values cleared'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Mode: backfill — fetch real hourly SMP from AESO API
    console.log(`📊 SMP hourly backfill (max ${maxDays} days per run)...`);

    // Find the earliest record that needs SMP (only Nov 2025+ when we have CSD data)
    const { data: missingRange } = await supabase
      .from('aeso_training_data')
      .select('timestamp')
      .is('system_marginal_price', null)
      .gte('timestamp', '2025-11-01T00:00:00Z')
      .order('timestamp', { ascending: true })
      .limit(1);

    if (!missingRange || missingRange.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No records need SMP backfill from Nov 2025 onward',
        updated: 0, remaining: 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const startDate = new Date(missingRange[0].timestamp);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + maxDays);
    const now = new Date();
    if (endDate > now) endDate.setTime(now.getTime());

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    console.log(`Fetching SMP for ${startStr} to ${endStr}`);

    // AESO Pool Price Report includes hourly pool price data
    // Try the dedicated SMP endpoint first
    let smpByHour: Record<string, number> = {};
    let source = 'unknown';

    // Attempt 1: Pool Price Report v1.1 (may include SMP field)
    try {
      const ppUrl = `https://apimgw.aeso.ca/public/poolprice-api/v1.1/price/poolPrice?startDate=${startStr}&endDate=${endStr}`;
      const ppResp = await fetch(ppUrl, {
        headers: { 'Accept': 'application/json', 'API-KEY': aesoKey },
        signal: AbortSignal.timeout(20000)
      });
      
      if (ppResp.ok) {
        const ppData = await ppResp.json();
        const records = ppData?.return?.['Pool Price Report'] || [];
        console.log(`Pool Price Report returned ${records.length} records`);
        if (records.length > 0) {
          console.log('PP sample fields:', Object.keys(records[0]));
        }

        // Check if it has SMP
        for (const r of records) {
          if (r.system_marginal_price !== undefined && r.system_marginal_price !== null) {
            const ts = r.begin_datetime_utc;
            const smp = parseFloat(r.system_marginal_price);
            if (ts && !isNaN(smp)) {
              smpByHour[ts] = smp;
            }
          }
        }

        if (Object.keys(smpByHour).length > 0) {
          source = 'pool_price_report';
          console.log(`✅ Got ${Object.keys(smpByHour).length} SMP values from Pool Price Report`);
        }
      }
    } catch (e: any) {
      console.warn('Pool Price Report fetch failed:', e.message);
    }

    // Attempt 2: Dedicated SMP Report API (if pool price didn't have SMP)
    if (Object.keys(smpByHour).length === 0) {
      try {
        const smpUrl = `https://apimgw.aeso.ca/public/systemmarginalprice-api/v1.1/price/systemMarginalPrice?startDate=${startStr}&endDate=${endStr}`;
        console.log('Trying SMP Report API...');
        const smpResp = await fetch(smpUrl, {
          headers: { 'Accept': 'application/json', 'API-KEY': aesoKey },
          signal: AbortSignal.timeout(20000)
        });

        if (smpResp.ok) {
          const smpData = await smpResp.json();
          const smpRecords = smpData?.return?.['System Marginal Price Report'] || [];
          console.log(`SMP Report returned ${smpRecords.length} records`);
          if (smpRecords.length > 0) {
            console.log('SMP sample fields:', Object.keys(smpRecords[0]));
            console.log('SMP sample:', JSON.stringify(smpRecords[0]));
          }

          // SMP report has sub-hourly data; take the last value per hour
          // Timestamps are in format "YYYY-MM-DD HH:MM" — normalize to "YYYY-MM-DD HH"
          for (const r of smpRecords) {
            const ts = r.begin_datetime_utc || r.date_time;
            const smp = parseFloat(r.system_marginal_price || r.price || r.smp);
            if (ts && !isNaN(smp)) {
              // Normalize: "2025-11-13 06:32" → "2025-11-13 06"
              const hourKey = ts.replace('T', ' ').substring(0, 13);
              smpByHour[hourKey] = smp; // Last value per hour wins
            }
          }
          source = 'smp_report';
          console.log(`✅ Got ${Object.keys(smpByHour).length} SMP values from SMP Report`);
        } else {
          console.error(`SMP Report API returned ${smpResp.status}`);
          await smpResp.text(); // consume body
        }
      } catch (e: any) {
        console.warn('SMP Report fetch failed:', e.message);
      }
    }

    const smpKeys = Object.keys(smpByHour);
    const smpCount = smpKeys.length;
    if (smpCount === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Could not extract hourly SMP from AESO API for this date range.',
        updated: 0, dateRange: { start: startStr, end: endStr }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Log some SMP keys for debugging
    console.log('SMP hourKey samples:', smpKeys.slice(0, 5));

    // Determine the actual date range covered by SMP data
    const smpDates = smpKeys.map(k => k.substring(0, 10)).sort();
    const smpMinDate = smpDates[0];
    const smpMaxDate = smpDates[smpDates.length - 1];
    console.log(`SMP data covers ${smpMinDate} to ${smpMaxDate}`);

    // Fetch training records that overlap with the SMP date range
    const { data: records, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('id, timestamp, pool_price')
      .is('system_marginal_price', null)
      .gte('timestamp', smpMinDate + 'T00:00:00Z')
      .lte('timestamp', smpMaxDate + 'T23:59:59Z')
      .order('timestamp')
      .limit(5000);

    if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);
    if (!records || records.length === 0) {
      return new Response(JSON.stringify({
        success: true, message: 'No training records in the SMP date range', updated: 0,
        smpDateRange: { start: smpMinDate, end: smpMaxDate }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Matching ${records.length} training records with ${smpCount} SMP values...`);
    // Log a training timestamp sample for debugging
    if (records.length > 0) {
      console.log('Training timestamp sample:', records[0].timestamp);
      const sampleHourKey = records[0].timestamp.replace('T', ' ').substring(0, 13);
      console.log('Training hourKey sample:', sampleHourKey, 'match?', smpByHour[sampleHourKey] !== undefined);
    }

    // Match and update in batches
    let updated = 0;
    const BATCH = 200;

    for (let i = 0; i < records.length; i += BATCH) {
      const chunk = records.slice(i, i + BATCH);

      // Group updates by SMP value for efficient batch updates
      const smpGroups: Record<string, { ids: string[]; poolPrices: number[] }> = {};

      for (const r of chunk) {
        // Normalize: "2025-11-05 06:07:06.43+00" → "2025-11-05 06"
        const hourKey = r.timestamp.replace('T', ' ').substring(0, 13);
        const smp = smpByHour[hourKey];
        if (smp !== undefined) {
          const key = String(smp);
          if (!smpGroups[key]) smpGroups[key] = { ids: [], poolPrices: [] };
          smpGroups[key].ids.push(r.id);
          smpGroups[key].poolPrices.push(r.pool_price);
        }
      }

      // Execute grouped updates
      const promises = Object.entries(smpGroups).map(([smpVal, group]) => {
        const smpNum = parseFloat(smpVal);
        return supabase
          .from('aeso_training_data')
          .update({ system_marginal_price: smpNum })
          .in('id', group.ids);
      });

      if (promises.length > 0) {
        await Promise.all(promises);
        updated += Object.values(smpGroups).reduce((sum, g) => sum + g.ids.length, 0);
      }
    }

    // Also update smp_pool_price_spread for records that now have SMP
    // Do this in a second pass to keep batches simple
    if (updated > 0) {
      const { data: updatedRecords } = await supabase
        .from('aeso_training_data')
        .select('id, pool_price, system_marginal_price')
        .not('system_marginal_price', 'is', null)
        .is('smp_pool_price_spread', null)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .limit(5000);

      if (updatedRecords && updatedRecords.length > 0) {
        for (let i = 0; i < updatedRecords.length; i += BATCH) {
          const chunk = updatedRecords.slice(i, i + BATCH);
          const spreadGroups: Record<string, string[]> = {};
          
          for (const r of chunk) {
            if (r.system_marginal_price !== null && r.pool_price !== null) {
              const spread = Math.round((r.pool_price - r.system_marginal_price) * 100) / 100;
              const key = String(spread);
              if (!spreadGroups[key]) spreadGroups[key] = [];
              spreadGroups[key].push(r.id);
            }
          }

          const spreadPromises = Object.entries(spreadGroups).map(([spread, ids]) =>
            supabase
              .from('aeso_training_data')
              .update({ smp_pool_price_spread: parseFloat(spread) })
              .in('id', ids)
          );
          await Promise.all(spreadPromises);
        }
      }
    }

    // Count remaining
    const { count: remaining } = await supabase
      .from('aeso_training_data')
      .select('id', { count: 'exact', head: true })
      .is('system_marginal_price', null)
      .gte('timestamp', '2025-11-01T00:00:00Z');

    console.log(`✅ SMP backfill: ${updated} updated, ${remaining ?? '?'} remaining`);

    return new Response(JSON.stringify({
      success: true,
      updated,
      remaining: remaining ?? 0,
      source,
      dateRange: { start: startStr, end: endStr },
      smpValuesFound: smpCount,
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
