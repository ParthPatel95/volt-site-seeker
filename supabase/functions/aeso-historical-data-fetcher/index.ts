import { serve, createClient } from "../_shared/imports.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // Use correct API key that works with working endpoints
    const aesoApiKey = Deno.env.get('AESO_SUBSCRIPTION_KEY_PRIMARY') ||
                       Deno.env.get('AESO_API_KEY') ||
                       Deno.env.get('AESO_SUB_KEY') ||
                       Deno.env.get('AESO_SUBSCRIPTION_KEY_SECONDARY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!aesoApiKey) {
      throw new Error('AESO API key not configured. Please set AESO_SUBSCRIPTION_KEY_PRIMARY.');
    }

    console.log('Fetching AESO historical data for 30,000 hours (~3.4 years)...');

    // Target: 30,000 hours = 1,250 days ≈ 3.4 years
    const HOURS_NEEDED = 30000;

    // Check what data we already have
    const { data: existingData, count } = await supabase
      .from('aeso_training_data')
      .select('timestamp', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .limit(1);

    console.log(`Current data in database: ${count || 0} records`);

    const currentTime = new Date();
    const startDate = new Date();
    
    if (existingData?.[0]?.timestamp && (count || 0) >= HOURS_NEEDED) {
      console.log(`✅ Already have ${count} records (target: ${HOURS_NEEDED}). No additional fetch needed.`);
      return new Response(JSON.stringify({
        success: true,
        recordsProcessed: 0,
        recordsInserted: 0,
        totalRecords: count,
        message: 'Sufficient historical data already present'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Fetch exactly 30,000 hours back from now
    startDate.setTime(currentTime.getTime() - HOURS_NEEDED * 60 * 60 * 1000);
    console.log(`Starting fresh fetch from ${startDate.toISOString()} (30,000 hours ago)`);

    // Fetch in 11-month chunks (max 366 days per AESO API request)
    const chunks: Array<{start: Date, end: Date}> = [];
    let chunkStart = new Date(startDate);
    
    while (chunkStart < currentTime) {
      const chunkEnd = new Date(chunkStart);
      chunkEnd.setMonth(chunkEnd.getMonth() + 11); // 11 months = ~330 days (safe under 366)
      
      if (chunkEnd > currentTime) {
        chunks.push({ start: chunkStart, end: currentTime });
      } else {
        chunks.push({ start: chunkStart, end: chunkEnd });
      }
      
      chunkStart = new Date(chunkEnd);
      chunkStart.setDate(chunkStart.getDate() + 1); // Move to next day after chunk end
    }

    console.log(`Fetching ${chunks.length} chunks (~11 months each) of historical data`);
    
    let totalRecords = 0;
    let totalInserted = 0;

    for (const chunk of chunks) {
      const formattedStart = chunk.start.toISOString().split('T')[0]; // YYYY-MM-DD format (not YYYYMMDD)
      const formattedEnd = chunk.end.toISOString().split('T')[0];
      
      console.log(`Fetching chunk: ${formattedStart} to ${formattedEnd}`);
      
      try {
        // Use WORKING Pool Price API from aeso-historical-pricing (v1.1 with hyphens)
        const poolPriceUrl = `https://apimgw.aeso.ca/public/poolprice-api/v1.1/price/poolPrice?startDate=${formattedStart}&endDate=${formattedEnd}`;
        
        console.log(`Calling: ${poolPriceUrl}`);
        const response = await fetch(poolPriceUrl, {
          headers: {
            'API-KEY': aesoApiKey,  // Use API-KEY header (not Ocp-Apim-Subscription-Key)
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error for chunk ${formattedStart}-${formattedEnd}: ${response.status} - ${errorText.substring(0, 200)}`);
          continue;
        }

        let data;
        try {
          data = await response.json();
          console.log('✅ API response received, keys:', Object.keys(data));
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          const text = await response.text();
          console.error('Response text (first 500 chars):', text.substring(0, 500));
          continue;
        }
        
        if (data.return) {
          console.log('  data.return keys:', Object.keys(data.return));
        }
        
        // AESO API returns { "return": { "Pool Price Report": [...] } } with SPACE in key name
        const priceReports = data.return?.['Pool Price Report'] || data.return?.Pool_Price_Report || [];
        
        console.log(`Found ${priceReports.length} price records in response`);
        
        if (priceReports.length === 0) {
          console.log(`❌ No data for chunk ${formattedStart}-${formattedEnd}`);
          console.log('Response structure:', JSON.stringify(data).substring(0, 300));
          continue;
        }

        totalRecords += priceReports.length;
        
        console.log(`✅ Processing ${priceReports.length} records from chunk`);
        
        // Convert to training data format
        const trainingRecords = priceReports.map((report: any) => {
          const timestamp = new Date(report.begin_datetime_mpt);
          const poolPrice = parseFloat(report.pool_price);
          
          // Extract time-based features
          const hour = timestamp.getHours();
          const dayOfWeek = timestamp.getDay();
          const month = timestamp.getMonth() + 1;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          return {
            timestamp: timestamp.toISOString(),
            pool_price: poolPrice,
            ail_mw: null, // Historical data doesn't have all features
            temperature_calgary: null,
            temperature_edmonton: null,
            wind_speed: null,
            cloud_cover: null,
            solar_irradiance: null,
            generation_coal: null,
            generation_gas: null,
            generation_wind: null,
            generation_solar: null,
            generation_hydro: null,
            interchange_net: null,
            operating_reserve: null,
            outage_capacity_mw: null,
            is_holiday: false, // Could be enriched later
            is_weekend: isWeekend,
            day_of_week: dayOfWeek,
            hour_of_day: hour,
            month: month,
            season: getSeason(month)
          };
        });
        
        // Insert in batches of 500 (use regular insert, not upsert)
        const batchSize = 500;
        for (let i = 0; i < trainingRecords.length; i += batchSize) {
          const batch = trainingRecords.slice(i, i + batchSize);
          
          const { error } = await supabase
            .from('aeso_training_data')
            .insert(batch, { ignoreDuplicates: false }); // Regular insert

          if (error) {
            console.error(`Error inserting batch:`, error);
          } else {
            totalInserted += batch.length;
            console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records`);
          }
        }
        
        // Small delay between chunks to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing chunk ${formattedStart}-${formattedEnd}:`, error);
        continue;
      }
    }

    console.log(`✅ Historical data fetch complete: ${totalInserted}/${totalRecords} records inserted`);
    console.log(`📊 Total records in database now: ${(count || 0) + totalInserted}`);
    
    // After successful backfill, trigger model training
    console.log('🤖 Triggering model training with historical data...');
    const { data: trainResult, error: trainError } = await supabase.functions.invoke('aeso-model-trainer');
    
    if (trainError) {
      console.error('Model training failed:', trainError);
    } else {
      console.log('✅ Model training completed:', trainResult);
    }

    return new Response(JSON.stringify({
      success: true,
      recordsProcessed: totalRecords,
      recordsInserted: totalInserted,
      totalRecordsNow: (count || 0) + totalInserted,
      chunksProcessed: chunks.length,
      targetHours: HOURS_NEEDED,
      modelTrained: !trainError,
      trainingResult: trainResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Historical data fetch error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}
