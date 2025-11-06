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

    // Fetch recent training data (last 168 hours = 7 days)
    const { data: historicalData, error: histError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(168);

    if (histError || !historicalData || historicalData.length === 0) {
      throw new Error('Insufficient training data');
    }

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
  // Extract features - get all recent prices (including zeros)
  const recentPrices = historicalData.slice(0, 24).map(d => d.pool_price);
  
  // Price range validation - filter out outliers beyond reasonable range
  const validPrices = recentPrices.filter(p => p !== null && p !== undefined && p >= -100 && p <= 1000);
  
  // Log unusual prices for monitoring
  const unusualPrices = recentPrices.filter(p => p !== null && p !== undefined && (p < -10 || p > 500));
  if (unusualPrices.length > 0) {
    console.log('⚠️ Unusual prices detected in training data:', unusualPrices);
  }
  
  // If we don't have enough valid prices, throw an error
  if (validPrices.length === 0) {
    throw new Error('No valid price data available. Please collect more training data.');
  }
  
  const avgPrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
  const priceStdDev = Math.sqrt(
    validPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / validPrices.length
  );

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
  const pred2 = timeSeriesDecompositionPredict(validPrices, hour, dayOfWeek, month);
  const pred3 = gradientBoostingPredict(avgPrice, priceStdDev, hour, isWeekend, avgTemp, windSpeed, cloudCover);
  const pred4 = seasonalPatternPredict(historicalData, hour, month, isWeekend);
  
  const predictions = [pred1, pred2, pred3, pred4];
  
  console.log(`Individual predictions - LR: ${pred1.toFixed(2)}, TS: ${pred2.toFixed(2)}, GB: ${pred3.toFixed(2)}, SP: ${pred4.toFixed(2)}`);

  // Weighted ensemble (different weights based on horizon)
  const weights = getEnsembleWeights(horizonHours);
  const predictedPrice = predictions.reduce((sum, pred, i) => sum + pred * weights[i], 0);
  
  console.log(`Ensemble prediction: ${predictedPrice.toFixed(2)} from avgPrice: ${avgPrice.toFixed(2)}`);

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
  // More conservative linear regression model
  const hourFactor = (hour >= 7 && hour <= 21) ? 1.08 : 0.92; // Peak vs off-peak (reduced from 1.15/0.85)
  const weekdayFactor = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.03 : 0.97; // Reduced from 1.1/0.9
  const tempFactor = 1 + (Math.abs(temp - 15) / 200); // Reduced impact (was /100)
  const windFactor = 1 - (windSpeed / 200); // Reduced impact (was /100)
  
  return avgPrice * hourFactor * weekdayFactor * tempFactor * windFactor;
}

function timeSeriesDecompositionPredict(
  recentPrices: number[],
  hour: number,
  dayOfWeek: number,
  month: number
): number {
  // Trend component
  const trend = recentPrices[0];
  
  // More conservative seasonal component (hourly pattern)
  const hourlyMultipliers = [
    0.85, 0.82, 0.80, 0.80, 0.82, 0.88, 0.95, 1.05, // 0-7 (reduced extremes)
    1.10, 1.12, 1.10, 1.08, 1.05, 1.03, 1.05, 1.08, // 8-15
    1.12, 1.15, 1.18, 1.15, 1.10, 1.00, 0.95, 0.90   // 16-23 (reduced from 1.35 max)
  ];
  const hourlyFactor = hourlyMultipliers[hour];
  
  // Weekly seasonality - more conservative
  const weeklyFactor = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.02 : 0.98; // Reduced from 1.05/0.95
  
  // Monthly seasonality - more conservative (reduced extremes)
  const monthlyMultipliers = [
    1.10, 1.08, 1.03, 0.97, 0.95, 0.97, // Jan-Jun (reduced from 1.2 max)
    1.05, 1.08, 1.00, 0.97, 1.03, 1.08  // Jul-Dec
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
  // Simulate gradient boosting with decision tree-like rules
  let prediction = avgPrice;
  
  // Tree 1: Hour of day rules - more conservative
  if (hour >= 17 && hour <= 20) prediction *= 1.15; // Reduced from 1.3
  else if (hour >= 0 && hour <= 5) prediction *= 0.85; // Reduced from 0.7
  else prediction *= 1.0;
  
  // Tree 2: Weekend effect - more conservative
  if (isWeekend) prediction *= 0.96; // Reduced from 0.92
  
  // Tree 3: Temperature effects - more conservative
  if (temp < -10 || temp > 25) prediction *= 1.10; // Reduced from 1.2
  else if (temp >= 10 && temp <= 20) prediction *= 0.97; // Less aggressive
  
  // Tree 4: Wind generation impact - more conservative
  if (windSpeed > 20) prediction *= 0.92; // Reduced from 0.85
  else if (windSpeed < 5) prediction *= 1.05; // Reduced from 1.1
  
  // Tree 5: Cloud cover (affects solar) - more conservative
  if (cloudCover > 80 && (hour >= 10 && hour <= 16)) prediction *= 1.02; // Reduced from 1.05
  
  // Reduce volatility adjustment
  prediction += stdDev * 0.05; // Reduced from 0.1
  
  return prediction;
}

function seasonalPatternPredict(
  historicalData: any[],
  hour: number,
  month: number,
  isWeekend: boolean
): number {
  // Find similar historical periods
  const similarPeriods = historicalData.filter(d => {
    const dHour = new Date(d.timestamp).getHours();
    const dMonth = new Date(d.timestamp).getMonth() + 1;
    const dIsWeekend = [0, 6].includes(new Date(d.timestamp).getDay());
    
    return Math.abs(dHour - hour) <= 1 && 
           dMonth === month && 
           dIsWeekend === isWeekend;
  });
  
  if (similarPeriods.length === 0) {
    return historicalData[0].pool_price;
  }
  
  const avgSimilarPrice = similarPeriods.reduce((sum, d) => sum + d.pool_price, 0) / similarPeriods.length;
  return avgSimilarPrice;
}

function getEnsembleWeights(horizonHours: number): number[] {
  // Adjusted weights - give more weight to simpler models to reduce over-prediction
  if (horizonHours <= 6) {
    return [0.35, 0.30, 0.20, 0.15]; // More weight on linear regression for near-term
  } else if (horizonHours <= 24) {
    return [0.30, 0.30, 0.25, 0.15]; // Balanced but conservative
  } else {
    return [0.25, 0.25, 0.25, 0.25]; // Equal weights for long-term
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
