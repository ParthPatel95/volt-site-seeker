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

    console.log('🚀 Starting historical data collection for 3 years...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3); // 3 years back
    
    let recordsInserted = 0;
    let currentDate = new Date(startDate);

    // Process in 30-day chunks to avoid overwhelming the APIs
    while (currentDate < endDate) {
      const chunkEnd = new Date(currentDate);
      chunkEnd.setDate(chunkEnd.getDate() + 30);
      if (chunkEnd > endDate) chunkEnd.setTime(endDate.getTime());

      console.log(`📅 Processing chunk: ${currentDate.toISOString().split('T')[0]} to ${chunkEnd.toISOString().split('T')[0]}`);

      try {
        // Fetch AESO historical pool price data
        const aesoData = await fetchAESOHistoricalData(currentDate, chunkEnd);
        
        // Fetch historical weather data for Calgary and Edmonton
        const weatherData = await fetchHistoricalWeather(currentDate, chunkEnd);
        
        // Merge and insert data
        const trainingRecords = mergeDataForTraining(aesoData, weatherData);
        
        if (trainingRecords.length > 0) {
          const { error: insertError } = await supabase
            .from('aeso_training_data')
            .upsert(trainingRecords, { onConflict: 'timestamp' });

          if (insertError) {
            console.error('Error inserting chunk:', insertError);
          } else {
            recordsInserted += trainingRecords.length;
            console.log(`✅ Inserted ${trainingRecords.length} records. Total: ${recordsInserted}`);
          }
        }
      } catch (chunkError) {
        console.error(`Error processing chunk:`, chunkError);
        // Continue with next chunk even if one fails
      }

      currentDate = chunkEnd;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`🎉 Historical data collection complete! Total records: ${recordsInserted}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recordsInserted,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in historical data loader:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchAESOHistoricalData(startDate: Date, endDate: Date) {
  // AESO provides historical pool price data
  // Format: YYYY-MM-DD
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  const url = `http://ets.aeso.ca/ets_web/ip/Market/Reports/PoolPriceReportServlet?beginDate=${start}&endDate=${end}&contentType=json`;
  
  console.log(`Fetching AESO data: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`AESO API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.return?.Pool_Price_Report || [];
  } catch (error) {
    console.error('Error fetching AESO data:', error);
    return [];
  }
}

async function fetchHistoricalWeather(startDate: Date, endDate: Date) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  // Fetch for both Calgary and Edmonton
  const calgaryPromise = fetchWeatherForLocation(51.0447, -114.0719, start, end, 'Calgary');
  const edmontonPromise = fetchWeatherForLocation(53.5461, -113.4938, start, end, 'Edmonton');
  
  const [calgary, edmonton] = await Promise.all([calgaryPromise, edmontonPromise]);
  
  return { calgary, edmonton };
}

async function fetchWeatherForLocation(lat: number, lon: number, start: string, end: string, city: string) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&hourly=temperature_2m,windspeed_10m,cloudcover,precipitation&timezone=America/Edmonton`;
  
  console.log(`Fetching historical weather for ${city}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error for ${city}: ${response.status}`);
    }
    
    const data = await response.json();
    return data.hourly;
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return null;
  }
}

function mergeDataForTraining(aesoData: any[], weatherData: any) {
  const trainingRecords = [];
  
  for (const aesoRecord of aesoData) {
    try {
      const timestamp = new Date(aesoRecord.begin_datetime_mpt);
      const hour = timestamp.getHours();
      const dayOfWeek = timestamp.getDay();
      const month = timestamp.getMonth() + 1;
      
      // Find matching weather data
      const weatherIndex = weatherData.calgary?.time?.findIndex((t: string) => 
        new Date(t).getTime() === timestamp.getTime()
      ) || 0;
      
      const calgaryTemp = weatherData.calgary?.temperature_2m?.[weatherIndex] || 0;
      const edmontonTemp = weatherData.edmonton?.temperature_2m?.[weatherIndex] || 0;
      const windSpeed = (weatherData.calgary?.windspeed_10m?.[weatherIndex] || 0);
      const cloudCover = (weatherData.calgary?.cloudcover?.[weatherIndex] || 0);
      const precipitation = (weatherData.calgary?.precipitation?.[weatherIndex] || 0);
      
      // Calculate solar irradiance
      const solarIrradiance = calculateSolarIrradiance(cloudCover, hour);
      
      trainingRecords.push({
        timestamp: timestamp.toISOString(),
        pool_price: parseFloat(aesoRecord.pool_price) || 0,
        ail_mw: parseFloat(aesoRecord.ail) || 0,
        generation_coal: parseFloat(aesoRecord.coal_gen || 0),
        generation_gas: parseFloat(aesoRecord.gas_gen || 0),
        generation_hydro: parseFloat(aesoRecord.hydro_gen || 0),
        generation_wind: parseFloat(aesoRecord.wind_gen || 0),
        generation_solar: parseFloat(aesoRecord.other_gen || 0),
        temperature_calgary: calgaryTemp,
        temperature_edmonton: edmontonTemp,
        wind_speed: windSpeed,
        cloud_cover: cloudCover,
        solar_irradiance: solarIrradiance,
        hour_of_day: hour,
        day_of_week: dayOfWeek,
        month: month,
        season: getSeason(month),
        is_weekend: dayOfWeek === 0 || dayOfWeek === 6,
        is_holiday: checkIfHoliday(timestamp),
        interchange_net: 0, // Not in historical data
        operating_reserve: 0, // Not in historical data
        outage_capacity_mw: 0, // Not in historical data
      });
    } catch (recordError) {
      console.error('Error processing record:', recordError);
      // Skip this record and continue
    }
  }
  
  return trainingRecords;
}

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

function checkIfHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay();
  
  // Canadian federal holidays and Alberta holidays
  if (month === 1 && day === 1) return true; // New Year's Day
  if (month === 2 && dayOfWeek === 1 && day >= 15 && day <= 21) return true; // Family Day (3rd Monday)
  if (month === 7 && day === 1) return true; // Canada Day
  if (month === 9 && dayOfWeek === 1 && day <= 7) return true; // Labour Day (1st Monday)
  if (month === 10 && dayOfWeek === 1 && day >= 8 && day <= 14) return true; // Thanksgiving (2nd Monday)
  if (month === 12 && day === 25) return true; // Christmas
  if (month === 12 && day === 26) return true; // Boxing Day
  
  return false;
}

function calculateSolarIrradiance(cloudCover: number, hour: number): number {
  // Simplified solar irradiance calculation
  const maxIrradiance = 1000; // W/m^2 at solar noon
  const cloudFactor = 1 - (cloudCover / 100) * 0.75;
  
  // Time of day factor (peak at noon)
  let timeFactor = 0;
  if (hour >= 6 && hour <= 18) {
    const hourAngle = (hour - 12) * 15; // degrees from solar noon
    timeFactor = Math.cos(hourAngle * Math.PI / 180);
  }
  
  return Math.max(0, maxIrradiance * timeFactor * cloudFactor);
}
