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

    console.log('🎯 Starting ensemble prediction...');
    const startTime = Date.now();

    // Parse request
    const { hoursAhead = 24, useAdaptiveWeights = true } = await req.json().catch(() => ({}));

    // Step 1: Get recent data for all models
    // Phase 1 Improvement: Use 730 days (2 years) for better long-term patterns
    const { data: recentData, error: dataError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .not('pool_price', 'is', null)
      .not('price_lag_1h', 'is', null)
      .order('timestamp', { ascending: false })
      .limit(17520); // Last 730 days (2 years)

    if (dataError || !recentData?.length) {
      throw new Error('Failed to fetch recent data for ensemble');
    }

    console.log(`✅ Loaded ${recentData.length} records for ensemble`);

    // Step 2: Get optimal weights (if using adaptive weights)
    let weights = {
      ml: 0.4,
      ma: 0.2,
      arima: 0.2,
      seasonal: 0.2
    };

    if (useAdaptiveWeights) {
      const { data: latestWeights } = await supabase
        .from('aeso_model_weights')
        .select('*')
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (latestWeights) {
        weights = {
          ml: latestWeights.ml_weight,
          ma: latestWeights.ma_weight,
          arima: latestWeights.arima_weight,
          seasonal: latestWeights.seasonal_weight
        };
        console.log('📊 Using adaptive weights:', weights);
      }
    }

    // Step 3: Generate predictions from each model
    const ensemblePredictions = [];
    const currentTime = new Date(recentData[0].timestamp);

    for (let h = 1; h <= hoursAhead; h++) {
      const targetTime = new Date(currentTime.getTime() + h * 60 * 60 * 1000);
      
      // Model 1: ML-based predictor (using recent trends and features)
      const mlPrice = predictMLModel(recentData, h);
      
      // Model 2: Moving Average (simple but robust)
      const maPrice = predictMovingAverage(recentData, h);
      
      // Model 3: ARIMA-style (autoregressive with hour-of-day adjustment)
      const arimaPrice = predictARIMA(recentData, targetTime, h);
      
      // Model 4: Seasonal decomposition (day-of-week + hour patterns)
      const seasonalPrice = predictSeasonal(recentData, targetTime);

      // Calculate ensemble prediction
      const rawEnsemblePrice = 
        weights.ml * mlPrice +
        weights.ma * maPrice +
        weights.arima * arimaPrice +
        weights.seasonal * seasonalPrice;
      
      // Phase 1 Improvement: Clip predictions to realistic range [$0-$1000]
      const ensemblePrice = Math.max(0, Math.min(1000, rawEnsemblePrice));

      // Calculate prediction uncertainty (std of individual predictions)
      const predictions = [mlPrice, maPrice, arimaPrice, seasonalPrice];
      const mean = predictions.reduce((a, b) => a + b, 0) / predictions.length;
      const variance = predictions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / predictions.length;
      const stdDev = Math.sqrt(variance);

      // 95% confidence interval (±1.96 * std)
      const confidenceLower = ensemblePrice - 1.96 * stdDev;
      const confidenceUpper = ensemblePrice + 1.96 * stdDev;

      ensemblePredictions.push({
        target_timestamp: targetTime.toISOString(),
        ml_predictor_price: mlPrice,
        moving_average_price: maPrice,
        arima_price: arimaPrice,
        seasonal_price: seasonalPrice,
        ensemble_price: ensemblePrice,
        ml_weight: weights.ml,
        ma_weight: weights.ma,
        arima_weight: weights.arima,
        seasonal_weight: weights.seasonal,
        prediction_std: stdDev,
        confidence_interval_lower: confidenceLower,
        confidence_interval_upper: confidenceUpper,
        model_version: 'ensemble_v1'
      });
    }

    // Step 4: Store predictions
    const { error: insertError } = await supabase
      .from('aeso_ensemble_predictions')
      .insert(ensemblePredictions);

    if (insertError) {
      console.error('❌ Error storing ensemble predictions:', insertError);
      throw insertError;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Ensemble prediction complete (${duration}s)`);
    console.log(`📊 Generated ${ensemblePredictions.length} ensemble predictions`);

    return new Response(JSON.stringify({
      success: true,
      duration_seconds: parseFloat(duration),
      predictions: ensemblePredictions,
      weights_used: weights,
      message: `Generated ${ensemblePredictions.length} ensemble predictions`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Ensemble prediction error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Model 1: ML-based predictor using recent trends
function predictMLModel(data: any[], hoursAhead: number): number {
  const latest = data[0];
  
  // Use lag features and momentum
  const lag1 = latest.price_lag_1h || latest.pool_price;
  const lag24 = latest.price_lag_24h || latest.pool_price;
  const momentum1h = latest.price_momentum_1h || 0;
  const volatility24h = latest.price_rolling_std_24h || 10;
  
  // Simple linear combination of features (mimicking ML model)
  let prediction = 
    0.5 * lag1 +
    0.3 * lag24 +
    0.15 * momentum1h +
    0.05 * volatility24h;
  
  // Apply hour-ahead decay (predictions get closer to moving average over time)
  const decayFactor = Math.exp(-hoursAhead / 24);
  const movingAvg = latest.price_rolling_avg_24h || latest.pool_price;
  prediction = prediction * decayFactor + movingAvg * (1 - decayFactor);
  
  return Math.max(0, prediction);
}

// Model 2: Moving Average with exponential weighting
function predictMovingAverage(data: any[], hoursAhead: number): number {
  const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Exponentially decaying weights
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const price = data[i].pool_price;
    if (price && price > 0) {
      weightedSum += price * weights[i];
      totalWeight += weights[i];
    }
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : data[0].pool_price;
}

// Model 3: ARIMA-style autoregressive model
function predictARIMA(data: any[], targetTime: Date, hoursAhead: number): number {
  const latest = data[0];
  const hourOfDay = targetTime.getHours();
  
  // Autoregressive component (weighted recent prices)
  const ar1 = latest.pool_price;
  const ar2 = data[1]?.pool_price || ar1;
  const ar24 = data[23]?.pool_price || ar1;
  
  // Calculate hour-of-day adjustment
  const hourlyPrices = data.slice(0, 168) // Last week
    .filter(d => new Date(d.timestamp).getHours() === hourOfDay)
    .map(d => d.pool_price);
  
  const hourlyAvg = hourlyPrices.length > 0
    ? hourlyPrices.reduce((a, b) => a + b, 0) / hourlyPrices.length
    : ar1;
  
  const overallAvg = data.slice(0, 168).reduce((sum, d) => sum + d.pool_price, 0) / Math.min(168, data.length);
  const seasonalFactor = hourlyAvg / overallAvg;
  
  // ARIMA prediction: AR(2) with seasonal adjustment
  const prediction = (0.6 * ar1 + 0.3 * ar2 + 0.1 * ar24) * seasonalFactor;
  
  return Math.max(0, prediction);
}

// Model 4: Seasonal decomposition (day + hour patterns)
function predictSeasonal(data: any[], targetTime: Date): number {
  const dayOfWeek = targetTime.getDay();
  const hourOfDay = targetTime.getHours();
  
  // Calculate day-of-week pattern (last 4 weeks)
  const dayPrices = data.slice(0, 672) // Last 4 weeks
    .filter(d => new Date(d.timestamp).getDay() === dayOfWeek)
    .map(d => d.pool_price);
  
  const dayAvg = dayPrices.length > 0
    ? dayPrices.reduce((a, b) => a + b, 0) / dayPrices.length
    : data[0].pool_price;
  
  // Calculate hour-of-day pattern
  const hourPrices = data.slice(0, 168) // Last week
    .filter(d => new Date(d.timestamp).getHours() === hourOfDay)
    .map(d => d.pool_price);
  
  const hourAvg = hourPrices.length > 0
    ? hourPrices.reduce((a, b) => a + b, 0) / hourPrices.length
    : data[0].pool_price;
  
  // Combine day and hour patterns
  const overallAvg = data.slice(0, 168).reduce((sum, d) => sum + d.pool_price, 0) / Math.min(168, data.length);
  const dayFactor = dayAvg / overallAvg;
  const hourFactor = hourAvg / overallAvg;
  
  // Seasonal prediction
  const prediction = overallAvg * dayFactor * hourFactor;
  
  return Math.max(0, prediction);
}
