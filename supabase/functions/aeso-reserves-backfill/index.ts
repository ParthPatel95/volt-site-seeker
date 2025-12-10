import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * AESO Reserves Backfill Function
 * 
 * Uses AESO Operating Reserve Offer Control API to backfill historical reserve data.
 * Note: This API has a 60-day delay for public data access.
 * 
 * Also backfills from any existing training data that has reserve columns populated.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { days = 30, mode = 'check' } = await req.json().catch(() => ({}));
    
    console.log(`AESO Reserves Backfill - Mode: ${mode}, Days: ${days}`);

    // Step 1: Check current state of reserves data
    const { data: reservesStats, error: statsError } = await supabase
      .from('aeso_training_data')
      .select('id, timestamp, operating_reserve, spinning_reserve_mw, supplemental_reserve_mw, operating_reserve_price')
      .not('operating_reserve', 'is', null)
      .gt('operating_reserve', 0)
      .order('timestamp', { ascending: false })
      .limit(100);

    const recordsWithReserves = reservesStats?.length || 0;
    console.log(`Records with operating_reserve > 0: ${recordsWithReserves}`);

    // Step 2: Check total records and records missing reserves
    const { count: totalRecords } = await supabase
      .from('aeso_training_data')
      .select('id', { count: 'exact', head: true });

    const { count: missingReserves } = await supabase
      .from('aeso_training_data')
      .select('id', { count: 'exact', head: true })
      .or('operating_reserve.is.null,operating_reserve.eq.0');

    console.log(`Total training records: ${totalRecords}`);
    console.log(`Records missing reserves: ${missingReserves}`);

    if (mode === 'check') {
      // Just return stats
      return new Response(JSON.stringify({
        success: true,
        mode: 'check',
        stats: {
          totalRecords,
          recordsWithReserves,
          missingReserves,
          coveragePercent: totalRecords ? ((recordsWithReserves / totalRecords) * 100).toFixed(2) : 0,
          latestWithReserves: reservesStats?.[0]?.timestamp || null
        },
        message: 'Use mode: "backfill" to attempt historical data collection'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 3: Attempt to fetch from AESO OR API (if available)
    const aesoApiKey = Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY') ||
                       Deno.env.get('AESO_API_KEY') ||
                       Deno.env.get('AESO_SUB_KEY');

    let apiRecordsFetched = 0;
    let apiErrors: string[] = [];

    if (aesoApiKey && mode === 'backfill') {
      console.log('Attempting AESO Operating Reserve API backfill...');
      
      // Calculate date range (AESO OR data is delayed 60 days)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 60); // 60 day delay
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      
      try {
        // Try the Operating Reserve Report endpoint
        const orUrl = `https://apimgw.aeso.ca/public/operatingreserve-api/v1/orReport?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`;
        
        console.log(`Fetching OR data from: ${orUrl}`);
        
        const response = await fetch(orUrl, {
          headers: {
            'Accept': 'application/json',
            'Ocp-Apim-Subscription-Key': aesoApiKey
          }
        });

        if (response.ok) {
          const orData = await response.json();
          console.log('OR API response:', JSON.stringify(orData).slice(0, 500));
          
          // Process and store the data
          const reports = orData?.return?.['Operating Reserve Report'] || orData?.return || [];
          
          if (Array.isArray(reports) && reports.length > 0) {
            console.log(`Found ${reports.length} OR records to process`);
            
            for (const record of reports) {
              const timestamp = record.date_time || record.timestamp;
              const spinningMW = parseFloat(record.dispatched_spinning_reserve_mw) || 0;
              const supplementalMW = parseFloat(record.dispatched_supplemental_reserve_mw) || 0;
              const orPrice = parseFloat(record.or_price) || null;
              const totalReserve = spinningMW + supplementalMW;

              if (timestamp && totalReserve > 0) {
                // Update existing training record if it exists
                const { error: updateError } = await supabase
                  .from('aeso_training_data')
                  .update({
                    operating_reserve: totalReserve,
                    spinning_reserve_mw: spinningMW,
                    supplemental_reserve_mw: supplementalMW,
                    operating_reserve_price: orPrice
                  })
                  .eq('timestamp', timestamp);

                if (!updateError) {
                  apiRecordsFetched++;
                }
              }
            }
          } else {
            apiErrors.push('OR API returned empty or unexpected format');
          }
        } else {
          apiErrors.push(`OR API returned ${response.status}: ${response.statusText}`);
        }
      } catch (e: any) {
        apiErrors.push(`OR API error: ${e.message}`);
        console.error('OR API fetch error:', e);
      }
    }

    // Step 4: Summary
    const summary = {
      success: true,
      mode,
      stats: {
        totalRecords,
        recordsWithReserves: recordsWithReserves + apiRecordsFetched,
        missingReserves: (missingReserves || 0) - apiRecordsFetched,
        newRecordsFromApi: apiRecordsFetched,
        apiErrors: apiErrors.length > 0 ? apiErrors : undefined
      },
      notes: [
        'Operating reserves are collected in real-time by the aeso-data-collector function',
        'Historical AESO OR data has a 60-day public access delay',
        'Reserve data will accumulate over time from hourly collection'
      ]
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Backfill error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
