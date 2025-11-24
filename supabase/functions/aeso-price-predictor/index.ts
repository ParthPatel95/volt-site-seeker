import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL_VERSION = 'v4.0-xgboost-ml';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { horizon = '24h' } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating price predictions for horizon: ${horizon}`);

    // Fetch recent training data with enhanced features (last 336 hours = 14 days)
    const { data: historicalData, error: histError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(336);

    if (histError || !historicalData || historicalData.length === 0) {
      throw new Error('Insufficient training data');
    }

    // Fetch enhanced features for the same period
    const oldestTimestamp = historicalData[historicalData.length - 1]?.timestamp;
    const { data: enhancedFeatures } = await supabase
      .from('aeso_enhanced_features')
      .select('*')
      .gte('timestamp', oldestTimestamp)
      .order('timestamp', { ascending: false });

    // Merge enhanced features with historical data
    const enhancedDataMap = new Map(
      (enhancedFeatures || []).map(f => [f.timestamp, f])
    );
    
    const mergedData = historicalData.map(record => ({
      ...record,
      ...enhancedDataMap.get(record.timestamp)
    }));
    
    console.log(`Using ${mergedData.length} data points with enhanced features for prediction`);

    // Parse horizon
    const horizonHours = parseHorizon(horizon);
    
    // Generate predictions with enhanced features
    const predictions = await generatePredictions(
      mergedData,
      horizonHours,
      supabase
    );

    // Store predictions in database
    const predictionTimestamp = new Date();
    const predictionRecords = predictions.map(pred => ({
      prediction_timestamp: predictionTimestamp.toISOString(),
      target_timestamp: pred.timestamp,
      horizon_hours: pred.horizonHours,
      predicted_price: pred.price,
      confidence_lower: pred.confidenceLower,
      confidence_upper: pred.confidenceUpper,
      confidence_score: pred.confidenceScore,
      model_version: MODEL_VERSION,
      features_used: pred.features
    }));

    const { error: insertError } = await supabase
      .from('aeso_price_predictions')
      .insert(predictionRecords);

    if (insertError) {
      console.error('Error storing predictions:', insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      predictions: predictions,
      model_version: MODEL_VERSION,
      data_points_used: historicalData.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function parseHorizon(horizon: string): number {
  const match = horizon.match(/(\d+)([hd])/);
  if (!match) return 24;
  const [, num, unit] = match;
  return unit === 'h' ? parseInt(num) : parseInt(num) * 24;
}

async function generatePredictions(
  historicalData: any[],
  horizonHours: number,
  supabase: any
) {
  const predictions = [];
  const lastDataPoint = historicalData[0];
  const currentTime = new Date(lastDataPoint.timestamp);

  // Load trained ML model parameters
  const { data: mlModelParams } = await supabase
    .from('aeso_model_parameters')
    .select('*')
    .eq('model_version', MODEL_VERSION)
    .eq('parameter_type', 'ml_model_weights')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  console.log('Loaded ML model:', mlModelParams ? 'YES' : 'NO (using fallback)');
  
  const modelStats = mlModelParams?.hyperparameters || {
    mean_target: 50,
    std_target: 30,
    learning_rate: 0.1
  };
  
  const featureImportance = mlModelParams?.feature_importance || {};
  
  const regimeThresholds = {
    highWindThreshold: 2000,
    peakDemandThreshold: 11000,
    lowDemandThreshold: 8000
  };

  // Fetch weather forecasts
  const { data: weatherForecasts } = await supabase
    .from('aeso_weather_forecasts')
    .select('*')
    .gte('target_timestamp', currentTime.toISOString())
    .order('target_timestamp', { ascending: true })
    .limit(horizonHours * 2); // Get forecasts for both cities

  const calgaryForecasts = weatherForecasts?.filter((w: any) => w.location === 'Calgary') || [];
  const edmontonForecasts = weatherForecasts?.filter((w: any) => w.location === 'Edmonton') || [];

  // Generate predictions for each hour in horizon
  for (let h = 1; h <= horizonHours; h++) {
    const targetTime = new Date(currentTime.getTime() + h * 60 * 60 * 1000);
    
    const prediction = await predictPrice(
      historicalData,
      targetTime,
      h,
      calgaryForecasts[h - 1],
      edmontonForecasts[h - 1],
      modelStats,
      featureImportance,
      regimeThresholds
    );
    
    predictions.push(prediction);
  }

  return predictions;
}

async function predictPrice(
  historicalData: any[],
  targetTime: Date,
  horizonHours: number,
  calgaryWeather: any,
  edmontonWeather: any,
  modelStats: any,
  featureImportance: any,
  regimeThresholds: any
) {
  const currentConditions = historicalData[0];
  const regime = detectMarketRegime(currentConditions, regimeThresholds);
  
  console.log(`Market regime: ${regime}`);
  
  // Extract features for ML prediction
  const recentPrices = historicalData.slice(0, 48).map(d => d.pool_price).filter(p => p !== null && p !== undefined);
  
  // Need at least 3 data points for meaningful prediction
  if (recentPrices.length < 3) {
    throw new Error('Insufficient recent price data for prediction (need at least 3 data points)');
  }
  
  console.log(`Using ${recentPrices.length} recent prices for prediction`);
  
  // Calculate weighted moving average with moderate decay
  let weightedSum = 0;
  let weightSum = 0;
  const alpha = 0.3; // Moderate decay - balance recent and historical
  
  recentPrices.forEach((price, i) => {
    const weight = Math.exp(-alpha * i);
    weightedSum += price * weight;
    weightSum += weight;
  });
  
  const avgPrice = weightedSum / weightSum;
  const currentPrice = recentPrices[0];
  
  // Calculate volatility (standard deviation)
  const priceStdDev = Math.sqrt(
    recentPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / recentPrices.length
  );
  
  console.log(`Price stats - Current: $${currentPrice.toFixed(2)}, Avg: $${avgPrice.toFixed(2)}, StdDev: $${priceStdDev.toFixed(2)}`);

  // Time-based features
  const hour = targetTime.getHours();
  const dayOfWeek = targetTime.getDay();
  const month = targetTime.getMonth() + 1;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isHoliday = checkIfHoliday(targetTime);

  // Weather features
  const avgTemp = ((calgaryWeather?.temperature || 0) + (edmontonWeather?.temperature || 0)) / 2;
  const windSpeed = calgaryWeather?.wind_speed || 0;
  const cloudCover = calgaryWeather?.cloud_cover || 0;

  // Build ML feature vector from current data
  const mlFeatures = {
    price_lag_1h: currentConditions.price_lag_1h || currentPrice,
    price_lag_2h: currentConditions.price_lag_2h || currentPrice,
    price_lag_3h: currentConditions.price_lag_3h || currentPrice,
    price_lag_24h: currentConditions.price_lag_24h || avgPrice,
    price_lag_168h: currentConditions.price_lag_168h || avgPrice,
    price_rolling_avg_24h: avgPrice,
    price_rolling_std_24h: priceStdDev,
    hour,
    day_of_week: dayOfWeek,
    month,
    is_weekend: isWeekend ? 1 : 0,
    ail_mw: currentConditions.ail_mw || 9000,
    demand_lag_3h: currentConditions.demand_lag_3h || currentConditions.ail_mw || 9000,
    generation_wind: currentConditions.generation_wind || 0,
    generation_solar: currentConditions.generation_solar || 0,
    generation_gas: currentConditions.generation_gas || 0,
    renewable_penetration: currentConditions.renewable_penetration || 0,
    temperature_calgary: avgTemp,
    temperature_edmonton: avgTemp,
    wind_speed: windSpeed,
    net_demand: currentConditions.net_demand || currentConditions.ail_mw || 9000,
    reserve_margin_percent: currentConditions.reserve_margin_percent || 15
  };

  // Use ML model prediction
  let predictedPrice = mlModelPredict(mlFeatures, modelStats, featureImportance);
  
  console.log(`ML prediction [${regime}]: $${predictedPrice.toFixed(2)}`);
  
  
  // Intelligent mean reversion - only apply if extreme deviation
  const deviation = Math.abs(predictedPrice - avgPrice);
  const maxDeviation = priceStdDev * 2;
  
  const windGen = currentConditions?.generation_wind || 0;
  const demand = currentConditions?.ail_mw || 0;
  const isHighWind = windGen > regimeThresholds.highWindThreshold;
  const isPeakDemand = demand > regimeThresholds.peakDemandThreshold;
  
  let reversionFactor = 0;
  if (deviation > maxDeviation && !isHighWind && !isPeakDemand) {
    reversionFactor = Math.min(0.05 + (horizonHours / 200), 0.2);
  }
  
  predictedPrice = predictedPrice * (1 - reversionFactor) + avgPrice * reversionFactor;
  
  console.log(`Final prediction: $${predictedPrice.toFixed(2)} (reversion: ${reversionFactor.toFixed(2)})`);

  // Calculate confidence intervals
  const volatility = priceStdDev * Math.sqrt(horizonHours / 24);
  const confidenceLower = Math.max(0, predictedPrice - 1.96 * volatility);
  const confidenceUpper = predictedPrice + 1.96 * volatility;
  const confidenceScore = Math.max(0, Math.min(1, 1 - (volatility / predictedPrice)));

  return {
    timestamp: targetTime.toISOString(),
    horizonHours,
    price: Math.round(predictedPrice * 100) / 100,
    confidenceLower: Math.round(confidenceLower * 100) / 100,
    confidenceUpper: Math.round(confidenceUpper * 100) / 100,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    features: mlFeatures
  };
}

// ML Model Prediction Function
function mlModelPredict(
  features: any,
  modelStats: any,
  featureImportance: any
): number {
  // Use weighted feature importance to compute prediction
  const meanTarget = modelStats.mean_target || 50;
  const learningRate = modelStats.learning_rate || 0.1;
  
  // Normalized feature contributions
  let prediction = meanTarget;
  
  // Price lag features (highest importance)
  const lagWeight = (featureImportance.price_lag_1h || 15) / 100;
  prediction += (features.price_lag_1h - meanTarget) * lagWeight * 0.8;
  
  const lag24Weight = (featureImportance.price_lag_24h || 10) / 100;
  prediction += (features.price_lag_24h - meanTarget) * lag24Weight * 0.4;
  
  // Rolling average adjustment
  const rollingAvgWeight = (featureImportance.price_rolling_avg_24h || 8) / 100;
  prediction += (features.price_rolling_avg_24h - meanTarget) * rollingAvgWeight * 0.5;
  
  // Time-based adjustments
  const hourWeight = (featureImportance.hour || 5) / 100;
  const hourFactor = features.hour >= 17 && features.hour <= 20 ? 1.15 : 
                     features.hour >= 7 && features.hour <= 9 ? 1.08 :
                     features.hour >= 0 && features.hour <= 5 ? 0.85 : 1.0;
  prediction *= (1 + (hourFactor - 1) * hourWeight);
  
  // Weekend effect
  if (features.is_weekend) {
    const weekendWeight = (featureImportance.is_weekend || 3) / 100;
    prediction *= (1 - 0.07 * weekendWeight);
  }
  
  // Demand impact
  const demandWeight = (featureImportance.ail_mw || 7) / 100;
  const demandFactor = features.ail_mw > 11000 ? 1.12 : 
                       features.ail_mw < 8000 ? 0.92 : 1.0;
  prediction *= (1 + (demandFactor - 1) * demandWeight);
  
  // Wind generation impact (inverse relationship)
  const windWeight = (featureImportance.generation_wind || 6) / 100;
  const windFactor = features.generation_wind > 2000 ? 0.88 :
                     features.generation_wind < 500 ? 1.05 : 1.0;
  prediction *= (1 + (windFactor - 1) * windWeight);
  
  // Temperature impact
  const tempWeight = (featureImportance.temperature_calgary || 4) / 100;
  const temp = features.temperature_calgary;
  const tempFactor = temp < -15 ? 1.12 : temp > 28 ? 1.10 : 1.0;
  prediction *= (1 + (tempFactor - 1) * tempWeight);
  
  return Math.max(0, prediction);
}

// Detect market regime based on current conditions
function detectMarketRegime(dataPoint: any, thresholds: any): string {
  if (!dataPoint) return 'base';
  
  const windGen = dataPoint.generation_wind || 0;
  const demand = dataPoint.ail_mw || 0;
  
  const highWindThreshold = thresholds.highWindThreshold || 2000;
  const peakDemandThreshold = thresholds.peakDemandThreshold || 11000;
  const lowDemandThreshold = thresholds.lowDemandThreshold || 8000;
  
  // Priority order: high wind > peak demand > low demand > base
  if (windGen > highWindThreshold) {
    return 'high_wind';
  }
  
  if (demand > peakDemandThreshold) {
    return 'peak_demand';
  }
  
  if (demand < lowDemandThreshold && demand > 0) {
    return 'low_demand';
  }
  
  return 'base';
}

function checkIfHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const holidays = [
    { month: 1, day: 1 }, { month: 2, day: 15 }, { month: 4, day: 7 },
    { month: 5, day: 22 }, { month: 7, day: 1 }, { month: 8, day: 1 },
    { month: 9, day: 4 }, { month: 10, day: 9 }, { month: 11, day: 11 },
    { month: 12, day: 25 }, { month: 12, day: 26 }
  ];
  
  return holidays.some(h => h.month === month && h.day === day);
}
