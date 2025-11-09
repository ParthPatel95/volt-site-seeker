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
    const { hours_ahead = 1 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Making ensemble prediction for ${hours_ahead} hours ahead...`);

    // Get current features and context
    const { data: latestData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(48);

    if (fetchError) throw fetchError;
    if (!latestData || latestData.length === 0) {
      throw new Error('No recent data available');
    }

    const latest = latestData[0];

    // Get enhanced features
    const { data: features } = await supabase
      .from('aeso_enhanced_features')
      .select('*')
      .eq('timestamp', latest.timestamp)
      .single();

    // Get current regime
    const { data: regime } = await supabase
      .from('aeso_market_regimes')
      .select('*')
      .eq('timestamp', latest.timestamp)
      .single();

    // Get all model parameters for ensemble
    const { data: models, error: modelsError } = await supabase
      .from('aeso_model_parameters')
      .select('*')
      .order('trained_at', { ascending: false });

    if (modelsError) throw modelsError;

    console.log(`Found ${models?.length || 0} models for ensemble`);

    // Make prediction with each model
    const predictions = [];
    
    for (const model of models || []) {
      try {
        const prediction = await makeSingleModelPrediction(
          model,
          latest,
          features,
          regime,
          latestData,
          hours_ahead
        );
        predictions.push({
          model_id: model.id,
          model_version: model.model_version,
          prediction: prediction.predicted_price,
          confidence: model.accuracy || 0.5,
          rmse: model.rmse || 10
        });
      } catch (error) {
        console.error(`Error with model ${model.id}:`, error);
      }
    }

    if (predictions.length === 0) {
      throw new Error('No models available for ensemble prediction');
    }

    console.log(`Generated ${predictions.length} individual predictions`);

    // Combine predictions using weighted average based on accuracy
    const totalWeight = predictions.reduce((sum, p) => sum + p.confidence, 0);
    const ensemblePrediction = predictions.reduce(
      (sum, p) => sum + (p.prediction * p.confidence / totalWeight),
      0
    );

    // Calculate ensemble confidence (higher when models agree)
    const predictionStdDev = calculateStdDev(predictions.map(p => p.prediction));
    const ensembleConfidence = Math.max(0.3, 1 - (predictionStdDev / 50)); // Lower std = higher confidence

    // Store ensemble prediction
    const { error: insertError } = await supabase
      .from('aeso_predictions')
      .insert({
        predicted_at: new Date().toISOString(),
        target_timestamp: new Date(Date.now() + hours_ahead * 60 * 60 * 1000).toISOString(),
        hours_ahead,
        predicted_price: ensemblePrediction,
        confidence: ensembleConfidence,
        model_version: 'ensemble_v1',
        prediction_method: 'weighted_ensemble',
        individual_predictions: predictions
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ 
        success: true,
        prediction: {
          hours_ahead,
          predicted_price: Math.round(ensemblePrediction * 100) / 100,
          confidence: Math.round(ensembleConfidence * 100) / 100,
          individual_predictions: predictions.length,
          prediction_range: {
            min: Math.min(...predictions.map(p => p.prediction)),
            max: Math.max(...predictions.map(p => p.prediction))
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ensemble predictor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function makeSingleModelPrediction(
  model: any,
  latest: any,
  features: any,
  regime: any,
  history: any[],
  hoursAhead: number
): Promise<{ predicted_price: number }> {
  // Extract model coefficients
  const coeffs = model.coefficients || {};
  
  // Build feature vector
  const X = {
    hour: new Date(latest.timestamp).getHours(),
    day_of_week: new Date(latest.timestamp).getDay(),
    month: new Date(latest.timestamp).getMonth() + 1,
    ail_mw: latest.ail_mw || 0,
    tng_mw: latest.tng_mw || 0,
    generation_wind: latest.generation_wind || 0,
    generation_solar: latest.generation_solar || 0,
    temperature: latest.temperature || 15,
    wind_speed: latest.wind_speed || 0,
    price_lag_1h: history[1]?.pool_price || latest.pool_price,
    price_lag_24h: history[23]?.pool_price || latest.pool_price,
    price_volatility_1h: features?.price_volatility_1h || 0,
    price_volatility_24h: features?.price_volatility_24h || 0,
    natural_gas_price: features?.natural_gas_price || 2.5,
    renewable_curtailment: features?.renewable_curtailment || 0,
    regime_factor: getRegimeFactor(regime?.regime)
  };
  
  // Apply model coefficients with XGBoost-style boosting adjustments
  let prediction = coeffs.intercept || 50;
  
  for (const [feature, value] of Object.entries(X)) {
    const coeff = coeffs[feature] || 0;
    prediction += coeff * (value as number);
  }
  
  // Apply time-ahead adjustment (uncertainty increases with horizon)
  const horizonAdjustment = 1 + (hoursAhead - 1) * 0.05;
  
  return {
    predicted_price: Math.max(0, prediction * horizonAdjustment)
  };
}

function getRegimeFactor(regime: string | undefined): number {
  const factors: Record<string, number> = {
    'high_price': 1.5,
    'low_price': 0.7,
    'high_demand': 1.3,
    'volatile': 1.2,
    'renewable_surge': 0.8,
    'normal': 1.0
  };
  return factors[regime || 'normal'] || 1.0;
}

function calculateStdDev(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}
