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
    const openWeatherKey = Deno.env.get('OPENWEATHER_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Collecting weather forecasts for Calgary and Edmonton...');

    const cities = [
      { name: 'Calgary', lat: 51.0447, lon: -114.0719 },
      { name: 'Edmonton', lat: 53.5461, lon: -113.4938 }
    ];

    let totalForecasts = 0;

    for (const city of cities) {
      // Use open-meteo.com API (free, no API key needed)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,windspeed_10m,cloudcover&forecast_days=3&timezone=America/Edmonton`;
      
      console.log(`Fetching weather for ${city.name}...`);
      
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        console.error(`Failed to fetch weather for ${city.name}:`, response.status);
        continue;
      }

      const weatherData = await response.json();
      
      // Delete old forecasts for this location
      await supabase
        .from('aeso_weather_forecasts')
        .delete()
        .eq('location', city.name);

      // Prepare forecast records
      const forecasts = weatherData.hourly.time.map((time: string, index: number) => ({
        location: city.name,
        target_timestamp: time,
        temperature: weatherData.hourly.temperature_2m[index],
        wind_speed: weatherData.hourly.windspeed_10m[index],
        cloud_cover: weatherData.hourly.cloudcover[index],
        forecast_timestamp: new Date().toISOString()
      }));

      // Insert new forecasts
      const { error: insertError } = await supabase
        .from('aeso_weather_forecasts')
        .insert(forecasts);

      if (insertError) {
        console.error(`Error inserting forecasts for ${city.name}:`, insertError);
      } else {
        console.log(`Inserted ${forecasts.length} forecasts for ${city.name}`);
        totalForecasts += forecasts.length;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Collected ${totalForecasts} weather forecasts`,
      totalForecasts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Weather collection error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
