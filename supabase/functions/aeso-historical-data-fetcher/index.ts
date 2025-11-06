import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

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
    const aesoApiKey = Deno.env.get('AESO_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching AESO historical data (up to 10 years)...');

    // Check what data we already have
    const { data: existingData } = await supabase
      .from('aeso_training_data')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1);

    const currentTime = new Date();
    const startDate = new Date();
    
    if (existingData?.[0]?.timestamp) {
      // Start from last data point minus 1 day overlap
      startDate.setTime(new Date(existingData[0].timestamp).getTime() - 24 * 60 * 60 * 1000);
      console.log(`Continuing from last data point: ${existingData[0].timestamp}`);
    } else {
      // Start from 10 years ago
      startDate.setFullYear(startDate.getFullYear() - 10);
      console.log('Starting fresh fetch from 10 years ago');
    }

    // AESO API might have limits, so we'll fetch in chunks (1 year at a time)
    const chunks: Array<{start: Date, end: Date}> = [];
    let chunkStart = new Date(startDate);
    
    while (chunkStart < currentTime) {
      const chunkEnd = new Date(chunkStart);
      chunkEnd.setFullYear(chunkEnd.getFullYear() + 1);
      
      if (chunkEnd > currentTime) {
        chunks.push({ start: chunkStart, end: currentTime });
      } else {
        chunks.push({ start: chunkStart, end: chunkEnd });
      }
      
      chunkStart = new Date(chunkEnd);
    }

    console.log(`Fetching ${chunks.length} year chunks of data`);
    
    let totalRecords = 0;
    let totalInserted = 0;

    for (const chunk of chunks) {
      const formattedStart = chunk.start.toISOString().split('T')[0].replace(/-/g, '');
      const formattedEnd = chunk.end.toISOString().split('T')[0].replace(/-/g, '');
      
      console.log(`Fetching chunk: ${formattedStart} to ${formattedEnd}`);
      
      try {
        const poolPriceUrl = `https://api.aeso.ca/report/v1.1/price/poolPrice?startDate=${formattedStart}&endDate=${formattedEnd}`;
        
        const response = await fetch(poolPriceUrl, {
          headers: {
            'accept': 'application/json',
            'X-API-Key': aesoApiKey
          }
        });

        if (!response.ok) {
          console.error(`API error for chunk ${formattedStart}-${formattedEnd}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (!data.return?.Pool_Price_Report || data.return.Pool_Price_Report.length === 0) {
          console.log(`No data for chunk ${formattedStart}-${formattedEnd}`);
          continue;
        }

        const priceReports = data.return.Pool_Price_Report;
        totalRecords += priceReports.length;
        
        console.log(`Processing ${priceReports.length} records from chunk`);
        
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
        
        // Insert in batches of 500
        const batchSize = 500;
        for (let i = 0; i < trainingRecords.length; i += batchSize) {
          const batch = trainingRecords.slice(i, i + batchSize);
          
          const { error } = await supabase
            .from('aeso_training_data')
            .upsert(batch, { 
              onConflict: 'timestamp',
              ignoreDuplicates: true 
            });

          if (error) {
            console.error(`Error inserting batch:`, error);
          } else {
            totalInserted += batch.length;
          }
        }
        
        // Small delay between chunks to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing chunk ${formattedStart}-${formattedEnd}:`, error);
        continue;
      }
    }

    console.log(`Historical data fetch complete: ${totalInserted}/${totalRecords} records inserted`);

    return new Response(JSON.stringify({
      success: true,
      recordsProcessed: totalRecords,
      recordsInserted: totalInserted,
      chunksProcessed: chunks.length
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
