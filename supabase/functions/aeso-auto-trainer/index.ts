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

    // Step 1: Fetch historical data (20 years)
    console.log('Step 1: Fetching historical AESO data (20 years)...');
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

    // Step 3: Collect natural gas prices
    console.log('Step 3: Collecting natural gas prices...');
    const { data: gasData, error: gasError } = await supabase.functions.invoke('aeso-natural-gas-collector');
    
    if (gasError) {
      console.error('Natural gas data collection failed:', gasError);
      // Don't throw - gas data is supplementary
    }
    
    console.log('Natural gas prices collected:', gasData);

    // Step 4: Calculate enhanced features
    console.log('Step 4: Calculating enhanced features...');
    const { data: featuresData, error: featuresError } = await supabase.functions.invoke('aeso-feature-calculator');
    
    if (featuresError) {
      console.error('Enhanced features calculation failed:', featuresError);
      // Don't throw - enhanced features are supplementary
    }
    
    console.log('Enhanced features calculated:', featuresData);

    // Step 5: Train the XGBoost model with enhanced features
    console.log('Step 5: Training XGBoost model with enhanced features...');
    const { data: trainingResult, error: trainingError } = await supabase.functions.invoke('aeso-model-trainer');
    
    if (trainingError) {
      console.error('Model training failed:', trainingError);
      throw new Error(`Model training failed: ${trainingError.message}`);
    }
    
    console.log('Model training complete:', trainingResult);

    // Step 6: Validate predictions (if any exist)
    console.log('Step 6: Validating existing predictions...');
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
        gas_data: gasData,
        enhanced_features: featuresData,
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
