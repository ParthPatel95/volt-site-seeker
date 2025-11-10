import { serve, createClient } from "../_shared/imports.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting complete backfill and training pipeline...');
    const startTime = Date.now();
    const results: any = {
      naturalGas: null,
      weather: null,
      features: null,
      training: null,
      errors: []
    };

    // Step 1: Backfill Natural Gas Prices (4 years)
    console.log('📊 Step 1/4: Backfilling natural gas prices...');
    try {
      const { data: gasData, error: gasError } = await supabase.functions.invoke(
        'aeso-natural-gas-collector',
        { body: {} }
      );
      
      if (gasError) throw gasError;
      results.naturalGas = gasData;
      console.log('✅ Natural gas backfill complete:', gasData);
    } catch (error) {
      console.error('❌ Natural gas backfill failed:', error);
      results.errors.push({ step: 'natural_gas', error: error.message });
    }

    // Step 2: Backfill Weather Data for all missing records
    console.log('🌤️ Step 2/4: Backfilling weather data...');
    try {
      const { data: weatherData, error: weatherError } = await supabase.functions.invoke(
        'aeso-weather-backfill',
        { body: {} }
      );
      
      if (weatherError) throw weatherError;
      results.weather = weatherData;
      console.log('✅ Weather backfill complete:', weatherData);
    } catch (error) {
      console.error('❌ Weather backfill failed:', error);
      results.errors.push({ step: 'weather', error: error.message });
    }

    // Step 3: Calculate Enhanced Features
    console.log('🔧 Step 3/4: Calculating enhanced features...');
    try {
      const { data: featuresData, error: featuresError } = await supabase.functions.invoke(
        'aeso-feature-calculator',
        { body: {} }
      );
      
      if (featuresError) throw featuresError;
      results.features = featuresData;
      console.log('✅ Feature calculation complete:', featuresData);
    } catch (error) {
      console.error('❌ Feature calculation failed:', error);
      results.errors.push({ step: 'features', error: error.message });
    }

    // Step 4: Train Model with Complete Data
    console.log('🤖 Step 4/4: Training model with complete dataset...');
    try {
      const { data: trainingData, error: trainingError } = await supabase.functions.invoke(
        'aeso-model-trainer',
        { body: {} }
      );
      
      if (trainingError) throw trainingError;
      results.training = trainingData;
      console.log('✅ Model training complete:', trainingData);
    } catch (error) {
      console.error('❌ Model training failed:', error);
      results.errors.push({ step: 'training', error: error.message });
    }

    const totalTime = Date.now() - startTime;
    const success = results.errors.length === 0;

    console.log(`${success ? '✅' : '⚠️'} Pipeline complete in ${(totalTime / 1000 / 60).toFixed(2)} minutes`);

    return new Response(
      JSON.stringify({
        success,
        duration_minutes: (totalTime / 1000 / 60).toFixed(2),
        results,
        summary: {
          natural_gas_records: results.naturalGas?.recordsGenerated || results.naturalGas?.recordsInserted || 0,
          weather_records_updated: results.weather?.recordsUpdated || 0,
          features_calculated: results.features?.recordsProcessed || 0,
          model_performance: results.training?.performance || null,
          errors_count: results.errors.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Pipeline error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
