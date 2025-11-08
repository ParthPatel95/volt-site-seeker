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

    console.log('Starting automated training workflow...');

    // Step 1: Fetch historical data
    console.log('Step 1: Fetching historical AESO data...');
    const { data: historicalData, error: historicalError } = await supabase.functions.invoke('aeso-historical-data-fetcher');
    
    if (historicalError) {
      console.error('Historical data fetch failed:', historicalError);
      throw new Error(`Historical data fetch failed: ${historicalError.message}`);
    }
    
    console.log('Historical data fetched:', historicalData);

    // Step 2: Collect weather data
    console.log('Step 2: Collecting weather data...');
    const { data: weatherData, error: weatherError } = await supabase.functions.invoke('aeso-weather-collector');
    
    if (weatherError) {
      console.error('Weather data collection failed:', weatherError);
      // Don't throw - weather data is supplementary
    }
    
    console.log('Weather data collected:', weatherData);

    // Step 3: Train the model
    console.log('Step 3: Training AI model...');
    const { data: trainingResult, error: trainingError } = await supabase.functions.invoke('aeso-model-trainer');
    
    if (trainingError) {
      console.error('Model training failed:', trainingError);
      throw new Error(`Model training failed: ${trainingError.message}`);
    }
    
    console.log('Model training complete:', trainingResult);

    // Step 4: Validate predictions (if any exist)
    console.log('Step 4: Validating existing predictions...');
    const { data: validationData, error: validationError } = await supabase.functions.invoke('aeso-prediction-validator');
    
    if (validationError) {
      console.error('Validation failed:', validationError);
      // Don't throw - validation is optional
    }
    
    console.log('Validation complete:', validationData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Automated training workflow completed successfully',
      steps: {
        historical_data: historicalData,
        weather_data: weatherData,
        training: trainingResult,
        validation: validationData
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auto-trainer error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
