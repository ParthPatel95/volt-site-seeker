import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL_VERSION = 'v1.0-ensemble';

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

    // Fetch recent training data (last 336 hours = 14 days for better pattern recognition)
    const { data: historicalData, error: histError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(336);

    if (histError || !historicalData || historicalData.length === 0) {
      throw new Error('Insufficient training data');
    }
    
    console.log(`Using ${historicalData.length} data points for prediction`);

    // Parse horizon
    const horizonHours = parseHorizon(horizon);
    
    // Generate predictions
    const predictions = await generatePredictions(
      historicalData,
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
      edmontonForecasts[h - 1]
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
  edmontonWeather: any
) {
  // Extract features - use available data (up to 48 hours for better patterns)
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

  // Ensemble prediction using multiple models
  const pred1 = linearRegressionPredict(avgPrice, hour, dayOfWeek, avgTemp, windSpeed);
  const pred2 = timeSeriesDecompositionPredict(recentPrices, hour, dayOfWeek, month);
  const pred3 = gradientBoostingPredict(avgPrice, priceStdDev, hour, isWeekend, avgTemp, windSpeed, cloudCover);
  const pred4 = seasonalPatternPredict(historicalData, hour, month, isWeekend);
  
  console.log(`Model predictions - LR: $${pred1.toFixed(2)}, TS: $${pred2.toFixed(2)}, GB: $${pred3.toFixed(2)}, SP: $${pred4.toFixed(2)}`);

  // Adaptive ensemble weights based on horizon and volatility
  const weights = getEnsembleWeights(horizonHours, priceStdDev);
  let predictedPrice = pred1 * weights[0] + pred2 * weights[1] + pred3 * weights[2] + pred4 * weights[3];
  
  // Smart mean reversion - less aggressive for short horizons
  const reversionFactor = Math.min(0.3 + (horizonHours / 100), 0.6);
  predictedPrice = predictedPrice * (1 - reversionFactor) + currentPrice * reversionFactor;
  
  console.log(`Final prediction: $${predictedPrice.toFixed(2)} (reversion factor: ${reversionFactor.toFixed(2)})`);

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
    features: {
      avgPrice,
      hour,
      dayOfWeek,
      avgTemp,
      windSpeed,
      cloudCover,
      isWeekend,
      isHoliday
    }
  };
}

function linearRegressionPredict(
  avgPrice: number,
  hour: number,
  dayOfWeek: number,
  temp: number,
  windSpeed: number
): number {
  // Linear model with realistic coefficients
  const hourFactor = (hour >= 7 && hour <= 21) ? 1.12 : 0.88;
  const weekdayFactor = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.05 : 0.95;
  const tempFactor = 1 + (Math.abs(temp - 15) / 150);
  const windFactor = Math.max(0.85, 1 - (windSpeed / 150));
  
  return avgPrice * hourFactor * weekdayFactor * tempFactor * windFactor;
}

function timeSeriesDecompositionPredict(
  recentPrices: number[],
  hour: number,
  dayOfWeek: number,
  month: number
): number {
  // Use median for robustness against outliers
  const sortedPrices = [...recentPrices].sort((a, b) => a - b);
  const trend = sortedPrices[Math.floor(sortedPrices.length / 2)];
  
  // Realistic hourly patterns for Alberta
  const hourlyMultipliers = [
    0.82, 0.78, 0.76, 0.75, 0.77, 0.85, 0.95, 1.08,
    1.15, 1.18, 1.16, 1.12, 1.08, 1.05, 1.08, 1.12,
    1.18, 1.22, 1.25, 1.20, 1.12, 1.02, 0.92, 0.87
  ];
  const hourlyFactor = hourlyMultipliers[hour];
  
  const weeklyFactor = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.04 : 0.96;
  
  // Alberta seasonal patterns (heating/cooling demand)
  const monthlyMultipliers = [
    1.15, 1.12, 1.05, 0.95, 0.92, 0.95,
    1.08, 1.12, 1.02, 0.98, 1.05, 1.12
  ];
  const monthlyFactor = monthlyMultipliers[month - 1];
  
  return trend * hourlyFactor * weeklyFactor * monthlyFactor;
}

function gradientBoostingPredict(
  avgPrice: number,
  stdDev: number,
  hour: number,
  isWeekend: boolean,
  temp: number,
  windSpeed: number,
  cloudCover: number
): number {
  let prediction = avgPrice;
  
  // Peak hour premium (evening demand surge)
  if (hour >= 17 && hour <= 20) prediction *= 1.20;
  else if (hour >= 7 && hour <= 9) prediction *= 1.12;
  else if (hour >= 0 && hour <= 5) prediction *= 0.82;
  
  // Weekend discount (lower industrial demand)
  if (isWeekend) prediction *= 0.93;
  
  // Temperature impacts (heating/cooling demand)
  if (temp < -15) prediction *= 1.18; // Heating demand
  else if (temp > 28) prediction *= 1.15; // Cooling demand
  else if (temp >= 10 && temp <= 20) prediction *= 0.95; // Mild weather
  
  // Wind generation (Alberta has significant wind capacity)
  if (windSpeed > 25) prediction *= 0.88; // High wind = more generation
  else if (windSpeed < 8) prediction *= 1.08; // Low wind = less generation
  
  // Solar impact (less significant than wind in Alberta)
  if (cloudCover > 80 && hour >= 10 && hour <= 16) prediction *= 1.03;
  
  return prediction;
}

function seasonalPatternPredict(
  historicalData: any[],
  hour: number,
  month: number,
  isWeekend: boolean
): number {
  // Look at last 7 days for patterns
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentData = historicalData.filter(d => new Date(d.timestamp).getTime() > sevenDaysAgo);
  
  if (recentData.length === 0) {
    return historicalData[0]?.pool_price || 30;
  }
  
  // Find similar time periods (same hour ±1, same day type)
  const similarPeriods = recentData.filter(d => {
    const dHour = new Date(d.timestamp).getHours();
    const dIsWeekend = [0, 6].includes(new Date(d.timestamp).getDay());
    
    return Math.abs(dHour - hour) <= 1 && dIsWeekend === isWeekend;
  });
  
  if (similarPeriods.length === 0) {
    return recentData[0].pool_price;
  }
  
  // Use median to avoid outlier influence
  const prices = similarPeriods.map(d => d.pool_price).sort((a, b) => a - b);
  return prices[Math.floor(prices.length / 2)];
}

function getEnsembleWeights(horizonHours: number, volatility: number): number[] {
  // Adaptive weights based on horizon and market volatility
  const isHighVolatility = volatility > 15;
  
  if (horizonHours <= 6) {
    // Near-term: favor seasonal patterns and time series
    return isHighVolatility 
      ? [0.15, 0.35, 0.25, 0.25]  // More weight on gradient boosting in volatile markets
      : [0.15, 0.30, 0.15, 0.40]; // Heavy seasonal in stable markets
  } else if (horizonHours <= 24) {
    // Medium-term: balanced approach
    return isHighVolatility
      ? [0.20, 0.30, 0.25, 0.25]
      : [0.20, 0.30, 0.20, 0.30];
  } else {
    // Long-term: rely more on statistical models
    return [0.25, 0.30, 0.25, 0.20];
  }
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
