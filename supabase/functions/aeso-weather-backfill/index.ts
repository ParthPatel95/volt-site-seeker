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
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting weather data backfill...');

    // Fetch all records missing weather data
    const { data: recordsToBackfill, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('id, timestamp')
      .or('temperature.is.null,wind_speed.is.null,cloud_cover.is.null')
      .order('timestamp', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch records: ${fetchError.message}`);
    }

    if (!recordsToBackfill || recordsToBackfill.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No records need weather backfill',
        recordsUpdated: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${recordsToBackfill.length} records needing weather data`);

    // Group records by date to minimize API calls
    const recordsByDate = new Map<string, typeof recordsToBackfill>();
    
    for (const record of recordsToBackfill) {
      const date = new Date(record.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!recordsByDate.has(dateKey)) {
        recordsByDate.set(dateKey, []);
      }
      recordsByDate.get(dateKey)!.push(record);
    }

    console.log(`Processing ${recordsByDate.size} unique dates`);

    const cities = [
      { name: 'Calgary', lat: 51.0447, lon: -114.0719 },
      { name: 'Edmonton', lat: 53.5461, lon: -113.4938 }
    ];

    let totalUpdated = 0;
    let processedDates = 0;

    // Process in batches of dates to avoid timeouts
    const dateEntries = Array.from(recordsByDate.entries());
    const batchSize = 30; // Process 30 days at a time

    for (let i = 0; i < dateEntries.length; i += batchSize) {
      const batch = dateEntries.slice(i, i + batchSize);
      
      for (const [dateKey, records] of batch) {
        try {
          // Fetch weather for this date from both cities
          const weatherData = await fetchHistoricalWeather(dateKey, cities);
          
          // Update all records for this date
          for (const record of records) {
            const recordTime = new Date(record.timestamp);
            const hour = recordTime.getHours();
            
            // Average weather from both cities
            const avgTemp = (weatherData.calgary.hourly.temperature_2m[hour] + 
                           weatherData.edmonton.hourly.temperature_2m[hour]) / 2;
            const avgWind = (weatherData.calgary.hourly.windspeed_10m[hour] + 
                           weatherData.edmonton.hourly.windspeed_10m[hour]) / 2;
            const avgCloud = (weatherData.calgary.hourly.cloudcover[hour] + 
                            weatherData.edmonton.hourly.cloudcover[hour]) / 2;
            const solarIrradiance = calculateSolarIrradiance(avgCloud, hour);
            
            const { error: updateError } = await supabase
              .from('aeso_training_data')
              .update({
                temperature: avgTemp,
                wind_speed: avgWind,
                cloud_cover: avgCloud,
                solar_irradiance: solarIrradiance,
                updated_at: new Date().toISOString()
              })
              .eq('id', record.id);
            
            if (updateError) {
              console.error(`Failed to update record ${record.id}:`, updateError);
            } else {
              totalUpdated++;
            }
          }
          
          processedDates++;
          if (processedDates % 10 === 0) {
            console.log(`Progress: ${processedDates}/${recordsByDate.size} dates processed`);
          }
          
        } catch (error) {
          console.error(`Failed to process date ${dateKey}:`, error);
          continue;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dateEntries.length / batchSize)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully backfilled weather data`,
      recordsUpdated: totalUpdated,
      datesProcessed: processedDates,
      totalRecordsFound: recordsToBackfill.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Weather backfill error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function fetchHistoricalWeather(date: string, cities: any[]) {
  const weatherData: any = {};
  
  for (const city of cities) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,windspeed_10m,cloudcover&start_date=${date}&end_date=${date}&timezone=America/Edmonton`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather for ${city.name} on ${date}`);
    }
    
    const data = await response.json();
    weatherData[city.name.toLowerCase()] = data;
  }
  
  return weatherData;
}

function calculateSolarIrradiance(cloudCover: number, hour: number): number {
  // Solar irradiance calculation (simplified model)
  // Peak solar irradiance in Alberta is around 1000 W/m² at noon
  const maxIrradiance = 1000;
  
  // Time-based factor (sunrise ~7am, sunset ~9pm, peak at 1pm)
  let timeFactor = 0;
  if (hour >= 7 && hour <= 21) {
    const hoursSinceSunrise = hour - 7;
    const dayLength = 14; // hours
    timeFactor = Math.sin((hoursSinceSunrise / dayLength) * Math.PI);
  }
  
  // Cloud cover reduces irradiance (0-100% cloud cover)
  const cloudFactor = 1 - (cloudCover / 100) * 0.75; // 75% reduction at full cloud cover
  
  return maxIrradiance * timeFactor * cloudFactor;
}
