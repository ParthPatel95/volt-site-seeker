import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for batch control
    let limit = 500; // Default batch size
    try {
      const body = await req.json();
      if (body.limit) limit = Math.min(body.limit, 1000);
    } catch { /* Use defaults */ }

    console.log(`Starting weather data backfill (batch size: ${limit})...`);

    // Fetch records missing weather data - limited batch
    const { data: recordsToBackfill, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('id, timestamp')
      .or('temperature_calgary.is.null,temperature_edmonton.is.null,wind_speed.is.null,cloud_cover.is.null')
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (fetchError) {
      throw new Error(`Failed to fetch records: ${fetchError.message}`);
    }

    if (!recordsToBackfill || recordsToBackfill.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No records need weather backfill',
        recordsUpdated: 0,
        isComplete: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${recordsToBackfill.length} records`);

    // Group records by date to minimize API calls
    const recordsByDate = new Map<string, typeof recordsToBackfill>();
    
    for (const record of recordsToBackfill) {
      const date = new Date(record.timestamp);
      const dateKey = date.toISOString().split('T')[0];
      
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
    const errors: string[] = [];

    for (const [dateKey, records] of recordsByDate.entries()) {
      try {
        const weatherData = await fetchHistoricalWeather(dateKey, cities);
        
        if (!weatherData.calgary?.hourly || !weatherData.edmonton?.hourly) {
          console.error(`Invalid weather data for ${dateKey}`);
          errors.push(`Invalid data for ${dateKey}`);
          continue;
        }
        
        // Batch update all records for this date
        for (const record of records) {
          const recordTime = new Date(record.timestamp);
          const hour = recordTime.getHours();
          
          const tempCalgary = weatherData.calgary.hourly.temperature_2m?.[hour];
          const tempEdmonton = weatherData.edmonton.hourly.temperature_2m?.[hour];
          const windCalg = weatherData.calgary.hourly.windspeed_10m?.[hour] ?? 0;
          const windEdm = weatherData.edmonton.hourly.windspeed_10m?.[hour] ?? 0;
          const cloudCalg = weatherData.calgary.hourly.cloudcover?.[hour] ?? 50;
          const cloudEdm = weatherData.edmonton.hourly.cloudcover?.[hour] ?? 50;
          
          const avgWind = (windCalg + windEdm) / 2;
          const avgCloud = (cloudCalg + cloudEdm) / 2;
          const solarIrradiance = calculateSolarIrradiance(avgCloud, hour);
          
          const { error: updateError } = await supabase
            .from('aeso_training_data')
            .update({
              temperature_calgary: tempCalgary,
              temperature_edmonton: tempEdmonton,
              wind_speed: avgWind,
              cloud_cover: avgCloud,
              solar_irradiance: solarIrradiance
            })
            .eq('id', record.id);
          
          if (updateError) {
            console.error(`Failed to update record ${record.id}:`, updateError);
          } else {
            totalUpdated++;
          }
        }
        
        processedDates++;
        if (processedDates % 5 === 0) {
          console.log(`Progress: ${processedDates}/${recordsByDate.size} dates, ${totalUpdated} records updated`);
        }
        
      } catch (error) {
        console.error(`Failed to process date ${dateKey}:`, error);
        errors.push(`${dateKey}: ${error.message}`);
        continue;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Check remaining
    const { count: remaining } = await supabase
      .from('aeso_training_data')
      .select('id', { count: 'exact', head: true })
      .or('temperature_calgary.is.null,temperature_edmonton.is.null,wind_speed.is.null,cloud_cover.is.null');

    return new Response(JSON.stringify({
      success: true,
      message: `Backfilled weather for ${totalUpdated} records`,
      recordsUpdated: totalUpdated,
      datesProcessed: processedDates,
      remainingRecords: remaining || 0,
      isComplete: (remaining || 0) === 0,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined
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
  const dateObj = new Date(date);
  const now = new Date();
  const isHistorical = dateObj < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  for (const city of cities) {
    let url: string;
    if (isHistorical) {
      // Use archive API for historical data (older than 7 days)
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,wind_speed_10m,cloud_cover&start_date=${date}&end_date=${date}&timezone=America/Edmonton`;
    } else {
      // Use forecast API for recent data
      url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,wind_speed_10m,cloud_cover&start_date=${date}&end_date=${date}&timezone=America/Edmonton`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Weather API error for ${city.name} on ${date}: ${response.status}`);
      throw new Error(`Failed to fetch weather for ${city.name} on ${date}`);
    }
    
    const data = await response.json();
    
    // Normalize field names (archive uses underscores, forecast uses camelCase)
    if (data.hourly) {
      data.hourly.windspeed_10m = data.hourly.windspeed_10m || data.hourly.wind_speed_10m;
      data.hourly.cloudcover = data.hourly.cloudcover || data.hourly.cloud_cover;
    }
    
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
