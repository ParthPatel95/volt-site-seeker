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

    console.log('Fetching weather data for AESO prediction...');

    // Fetch weather data from Open-Meteo (free, no API key required)
    // Calgary: 51.05, -114.07
    // Edmonton: 53.55, -113.47
    const calgaryWeather = await fetchWeatherData(51.05, -114.07, 'Calgary');
    const edmontonWeather = await fetchWeatherData(53.55, -113.47, 'Edmonton');

    // Store weather forecasts in database
    const forecastTimestamp = new Date();
    const weatherForecasts = [];

    // Calgary forecasts
    for (let i = 0; i < calgaryWeather.hourly.time.length; i++) {
      weatherForecasts.push({
        forecast_timestamp: forecastTimestamp.toISOString(),
        target_timestamp: calgaryWeather.hourly.time[i],
        location: 'Calgary',
        temperature: calgaryWeather.hourly.temperature_2m[i],
        wind_speed: calgaryWeather.hourly.wind_speed_10m[i],
        cloud_cover: calgaryWeather.hourly.cloud_cover[i],
        precipitation_probability: calgaryWeather.hourly.precipitation_probability?.[i] || 0
      });
    }

    // Edmonton forecasts
    for (let i = 0; i < edmontonWeather.hourly.time.length; i++) {
      weatherForecasts.push({
        forecast_timestamp: forecastTimestamp.toISOString(),
        target_timestamp: edmontonWeather.hourly.time[i],
        location: 'Edmonton',
        temperature: edmontonWeather.hourly.temperature_2m[i],
        wind_speed: edmontonWeather.hourly.wind_speed_10m[i],
        cloud_cover: edmontonWeather.hourly.cloud_cover[i],
        precipitation_probability: edmontonWeather.hourly.precipitation_probability?.[i] || 0
      });
    }

    // Insert into database
    const { error: insertError } = await supabase
      .from('aeso_weather_forecasts')
      .insert(weatherForecasts);

    if (insertError) {
      console.error('Error inserting weather forecasts:', insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      calgary: calgaryWeather,
      edmonton: edmontonWeather,
      forecasts_stored: weatherForecasts.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Weather integration error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function fetchWeatherData(lat: number, lon: number, location: string) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,cloud_cover,wind_speed_10m&forecast_days=7&timezone=America/Edmonton`;
  
  console.log(`Fetching weather for ${location}...`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather API error for ${location}: ${response.statusText}`);
  }
  
  return await response.json();
}
