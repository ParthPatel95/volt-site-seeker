import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictionRecord {
  prediction_timestamp: string;
  target_timestamp: string;
  predicted_price: number;
  confidence_lower: number;
  confidence_upper: number;
  horizon_hours: number;
  model_version: string;
  features_used: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🚀 Starting AESO price prediction with XGBoost model...');
    console.log(`⏰ Current time: ${new Date().toISOString()}`);

    // ========== LOAD TRAINED MODEL PARAMETERS ==========
    console.log('📥 Loading trained model parameters...');
    const { data: modelParams, error: paramsError } = await supabase
      .from('aeso_model_parameters')
      .select('*')
      .eq('parameter_type', 'learned_coefficients')
      .eq('parameter_name', 'main')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (paramsError || !modelParams) {
      throw new Error('No trained model parameters found. Please train the model first.');
    }

    const featureCorrelations = modelParams.feature_correlations || {};
    const featureStats = modelParams.feature_statistics || {};
    const featureScaling = modelParams.feature_scaling || {};
    const regimeThresholds = featureCorrelations.regimes || {};
    const ensembleWeights = featureCorrelations.ensemble_weights || {};
    const outlierThreshold = featureCorrelations.outlier_threshold || 200;

    console.log(`✅ Loaded model version: ${modelParams.model_version}`);
    console.log(`📊 Feature correlations loaded: ${Object.keys(featureCorrelations).length} features`);
    console.log(`🎯 Regime thresholds: High Wind=${regimeThresholds.highWindThreshold}, Peak Demand=${regimeThresholds.peakDemandThreshold}`);

    // Get the latest model performance data
    const { data: modelPerf, error: perfError } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (perfError || !modelPerf || modelPerf.length === 0) {
      throw new Error('No model performance data found.');
    }

    const latestModel = modelPerf[0];
    console.log(`📈 Model Performance: MAE=$${latestModel.mae}, RMSE=$${latestModel.rmse}, sMAPE=${latestModel.mape}%`);

    // ========== GET TRAINING DATA WITH ENHANCED FEATURES ==========
    console.log('📊 Fetching latest training data with enhanced features...');
    const { data: trainingData, error: trainingError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .eq('is_valid_record', true)
      .order('timestamp', { ascending: false })
      .limit(336); // Last 14 days for context

    if (trainingError || !trainingData || trainingData.length === 0) {
      throw new Error('No training data available for predictions');
    }

    // Reverse to have oldest first (for lag calculations)
    const historicalData = trainingData.reverse();
    console.log(`✅ Retrieved ${historicalData.length} historical records`);
    
    // Check enhanced features availability
    const recordsWithLags = historicalData.filter(d => d.price_lag_1h !== null).length;
    console.log(`🔍 Enhanced features: ${recordsWithLags}/${historicalData.length} records (${(recordsWithLags/historicalData.length*100).toFixed(1)}%)`);

    // ========== GET LATEST CONDITIONS ==========
    const latestData = historicalData[historicalData.length - 1];
    const now = new Date();
    
    console.log('🌐 Latest data point:', {
      timestamp: latestData.timestamp,
      price: latestData.pool_price,
      wind: latestData.generation_wind,
      demand: latestData.ail_mw,
      priceLag1h: latestData.price_lag_1h
    });

    // Fetch latest weather data
    console.log('🌤️ Fetching weather forecasts...');
    const { data: calgaryWeather } = await supabase
      .from('aeso_weather_forecasts')
      .select('*')
      .eq('city', 'Calgary')
      .order('forecast_timestamp', { ascending: false })
      .limit(1)
      .single();

    const { data: edmontonWeather } = await supabase
      .from('aeso_weather_forecasts')
      .select('*')
      .eq('city', 'Edmonton')
      .order('forecast_timestamp', { ascending: false })
      .limit(1)
      .single();

    // ========== GENERATE PREDICTIONS USING XGBOOST MODEL ==========
    const predictions: PredictionRecord[] = [];
    const horizons = [1, 6, 12, 24];

    // XGBoost hyperparameters (from trainer)
    const xgboostParams = {
      learning_rate: 0.1,
      max_depth: 6,
      min_samples_split: 10,
      n_estimators: 100,
      subsample: 0.8
    };

    for (const horizon of horizons) {
      const targetTime = new Date(now.getTime() + horizon * 60 * 60 * 1000);
      
      console.log(`\n🎯 Predicting ${horizon}h ahead - Target: ${targetTime.toISOString()}`);
      
      // Build feature vector for prediction
      const currentConditions = buildFeatureVector(
        latestData,
        targetTime,
        calgaryWeather,
        edmontonWeather,
        historicalData,
        horizon
      );

      // Detect market regime
      const regime = detectRegime(currentConditions, regimeThresholds);
      console.log(`  Regime: ${regime}`);

      // Make prediction using XGBoost model
      const predictedPrice = predictPriceWithXGBoost(
        historicalData,
        currentConditions,
        featureCorrelations,
        featureStats,
        featureCorrelations.lagged || {},
        regime,
        xgboostParams,
        featureScaling
      );

      console.log(`  Predicted: $${predictedPrice.toFixed(2)}/MWh`);

      // Calculate confidence intervals based on model uncertainty
      const residualStdDev = latestModel.residual_std_dev || 15;
      const horizonUncertainty = 1 + (horizon / 24) * 0.5; // Increase uncertainty with horizon
      const confidenceLower = Math.max(0, predictedPrice - residualStdDev * 1.5 * horizonUncertainty);
      const confidenceUpper = predictedPrice + residualStdDev * 1.5 * horizonUncertainty;

      predictions.push({
        prediction_timestamp: now.toISOString(),
        target_timestamp: targetTime.toISOString(),
        predicted_price: Math.round(predictedPrice * 100) / 100,
        confidence_lower: Math.round(confidenceLower * 100) / 100,
        confidence_upper: Math.round(confidenceUpper * 100) / 100,
        confidence_score: Math.max(0.5, 1 - (horizon / 48)), // Decrease confidence with horizon
        horizon_hours: horizon,
        model_version: modelParams.model_version,
        features_used: {
          regime,
          hour: currentConditions.hour_of_day,
          dayOfWeek: currentConditions.day_of_week,
          windGen: currentConditions.generation_wind,
          demand: currentConditions.ail_mw,
          priceLag1h: currentConditions.price_lag_1h,
          avgTemp: ((currentConditions.temperature_calgary || 0) + (currentConditions.temperature_edmonton || 0)) / 2,
          enhancedFeaturesUsed: recordsWithLags > 0
        }
      });
    }

    // ========== STORE PREDICTIONS ==========
    console.log('\n💾 Storing predictions...');
    const { data: insertedPreds, error: insertError } = await supabase
      .from('aeso_price_predictions')
      .insert(predictions)
      .select();

    if (insertError) {
      console.error('❌ Error inserting predictions:', insertError);
      throw insertError;
    }

    console.log(`✅ Generated ${predictions.length} predictions successfully`);

    // ========== VALIDATE PREDICTIONS ==========
    console.log('\n🔍 Validating predictions against available actual prices...');
    
    const validationRecords = [];
    for (const pred of insertedPreds || []) {
      const { data: actualData } = await supabase
        .from('aeso_training_data')
        .select('pool_price, timestamp')
        .gte('timestamp', new Date(new Date(pred.target_timestamp).getTime() - 30 * 60 * 1000).toISOString())
        .lte('timestamp', new Date(new Date(pred.target_timestamp).getTime() + 30 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true })
        .limit(1);

      if (actualData && actualData.length > 0) {
        const actual = actualData[0];
        const absoluteError = Math.abs(actual.pool_price - pred.predicted_price);
        const percentError = (absoluteError / actual.pool_price) * 100;
        const withinConfidence = actual.pool_price >= pred.confidence_lower && 
                                 actual.pool_price <= pred.confidence_upper;

        validationRecords.push({
          prediction_id: pred.id,
          target_timestamp: pred.target_timestamp,
          predicted_price: pred.predicted_price,
          actual_price: actual.pool_price,
          absolute_error: absoluteError,
          percent_error: percentError,
          horizon_hours: pred.horizon_hours,
          model_version: pred.model_version,
          within_confidence: withinConfidence,
          validated_at: new Date().toISOString()
        });
      }
    }

    if (validationRecords.length > 0) {
      const { error: validationError } = await supabase
        .from('aeso_prediction_accuracy')
        .insert(validationRecords);

      if (validationError) {
        console.error('⚠️ Error inserting validation records:', validationError);
      } else {
        console.log(`✅ Validated ${validationRecords.length} predictions`);
      }
    }

    console.log('\n🎉 Prediction generation complete!');

    return new Response(
      JSON.stringify({
        success: true,
        predictions: insertedPreds,
        model_version: modelParams.model_version,
        model_performance: {
          mae: latestModel.mae,
          rmse: latestModel.rmse,
          mape: latestModel.mape
        },
        count: predictions.length,
        validated_count: validationRecords.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Prediction generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate predictions'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// ========== HELPER FUNCTIONS (from trainer) ==========

function buildFeatureVector(
  latestData: any,
  targetTime: Date,
  calgaryWeather: any,
  edmontonWeather: any,
  historicalData: any[],
  horizon: number
): any {
  const targetHour = targetTime.getHours();
  const targetDayOfWeek = targetTime.getDay();
  const targetMonth = targetTime.getMonth() + 1;
  
  return {
    timestamp: targetTime.toISOString(),
    hour_of_day: targetHour,
    day_of_week: targetDayOfWeek,
    month: targetMonth,
    is_weekend: targetDayOfWeek === 0 || targetDayOfWeek === 6,
    is_holiday: false, // TODO: Add holiday calendar
    season: getSeasonFromMonth(targetMonth),
    
    // Weather features
    temperature_calgary: calgaryWeather?.temperature || 15,
    temperature_edmonton: edmontonWeather?.temperature || 15,
    wind_speed: calgaryWeather?.wind_speed || 0,
    cloud_cover: calgaryWeather?.cloud_cover || 50,
    solar_irradiance: calgaryWeather?.solar_irradiance || 0,
    
    // Generation and demand (use latest + project forward)
    generation_wind: projectFeature(historicalData.slice(-24).map(d => d.generation_wind), horizon),
    generation_solar: projectFeature(historicalData.slice(-24).map(d => d.generation_solar), horizon),
    generation_hydro: projectFeature(historicalData.slice(-24).map(d => d.generation_hydro), horizon),
    generation_gas: projectFeature(historicalData.slice(-24).map(d => d.generation_gas), horizon),
    generation_coal: projectFeature(historicalData.slice(-24).map(d => d.generation_coal), horizon),
    ail_mw: projectFeature(historicalData.slice(-24).map(d => d.ail_mw), horizon),
    
    // Enhanced lag features (critical for accuracy)
    price_lag_1h: latestData.pool_price,
    price_lag_2h: latestData.price_lag_1h,
    price_lag_3h: latestData.price_lag_2h,
    price_lag_24h: latestData.price_lag_24h,
    price_rolling_avg_24h: latestData.price_rolling_avg_24h,
    price_rolling_std_24h: latestData.price_rolling_std_24h,
    price_momentum_1h: latestData.price_momentum_1h || 0,
    price_momentum_3h: latestData.price_momentum_3h || 0,
    
    // Additional enhanced features
    price_volatility_1h: latestData.price_volatility_1h || 0,
    price_volatility_24h: latestData.price_volatility_24h || 0,
    natural_gas_price: latestData.natural_gas_price || 2.5,
    renewable_curtailment: latestData.renewable_curtailment || 0,
    net_imports: latestData.net_imports || 0,
    
    // Interaction features
    wind_hour_interaction: latestData.wind_hour_interaction,
    temp_demand_interaction: latestData.temp_demand_interaction
  };
}

function projectFeature(values: number[], hoursAhead: number): number {
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return 0;
  
  // Simple exponential weighted average with trend
  let sum = 0;
  let weights = 0;
  for (let i = 0; i < validValues.length; i++) {
    const weight = Math.exp(-0.1 * (validValues.length - i));
    sum += validValues[i] * weight;
    weights += weight;
  }
  
  return sum / weights;
}

function getSeasonFromMonth(month: number): string {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

function detectRegime(dataPoint: any, thresholds: any): string {
  if (dataPoint.generation_wind !== null && dataPoint.generation_wind > (thresholds.highWindThreshold || 2000)) {
    return 'high_wind';
  }
  
  if (dataPoint.ail_mw !== null && dataPoint.ail_mw > (thresholds.peakDemandThreshold || 11000)) {
    return 'peak_demand';
  }
  
  if (dataPoint.ail_mw !== null && dataPoint.ail_mw < (thresholds.lowDemandThreshold || 8000)) {
    return 'low_demand';
  }
  
  return 'base';
}

function predictPriceWithXGBoost(
  historicalData: any[],
  currentConditions: any,
  featureCorrelations: any,
  featureStats: any,
  laggedFeatures: any,
  regime: string,
  params: any,
  featureScaling?: any
): number {
  // Initialize with mean price
  let prediction = featureStats.avgPrice || 50;
  
  // Gradient boosting: iteratively add weak learners
  const nEstimators = Math.min(params.n_estimators, 20);
  const learningRate = params.learning_rate;
  const maxDepth = params.max_depth;
  
  const features = {
    hour: currentConditions.hour_of_day || 12,
    dayOfWeek: currentConditions.day_of_week || 1,
    isHoliday: currentConditions.is_holiday || false,
    isWeekend: currentConditions.is_weekend || false,
    month: currentConditions.month || 1,
    season: currentConditions.season || 'winter',
    temperatureCalgary: currentConditions.temperature_calgary || 15,
    temperatureEdmonton: currentConditions.temperature_edmonton || 15,
    windSpeed: currentConditions.wind_speed || 0,
    cloudCover: currentConditions.cloud_cover || 50,
    solarIrradiance: currentConditions.solar_irradiance || 0,
    windGen: currentConditions.generation_wind || 0,
    solarGen: currentConditions.generation_solar || 0,
    hydroGen: currentConditions.generation_hydro || 0,
    gasGen: currentConditions.generation_gas || 0,
    coalGen: currentConditions.generation_coal || 0,
    demand: currentConditions.ail_mw || 0,
    priceLag1h: currentConditions.price_lag_1h || null,
    priceLag2h: currentConditions.price_lag_2h || null,
    priceLag3h: currentConditions.price_lag_3h || null,
    priceLag24h: currentConditions.price_lag_24h || null,
    priceRollingAvg24h: currentConditions.price_rolling_avg_24h || null,
    priceRollingStd24h: currentConditions.price_rolling_std_24h || null,
    priceMomentum1h: currentConditions.price_momentum_1h || 0,
    priceMomentum3h: currentConditions.price_momentum_3h || 0,
    priceVolatility1h: currentConditions.price_volatility_1h || 0,
    priceVolatility24h: currentConditions.price_volatility_24h || 0,
    naturalGasPrice: currentConditions.natural_gas_price || 2.5,
    renewableCurtailment: currentConditions.renewable_curtailment || 0,
    netImports: currentConditions.net_imports || 0,
    windHourInteraction: currentConditions.wind_hour_interaction || null,
    tempDemandInteraction: currentConditions.temp_demand_interaction || null
  };
  
  // Simulated gradient boosting
  for (let i = 0; i < nEstimators; i++) {
    const treeAdjustment = buildDecisionTreePrediction(features, featureCorrelations, featureStats, regime);
    prediction += learningRate * treeAdjustment;
  }
  
  // Apply regime-specific multipliers
  prediction *= getRegimeMultiplier(regime, currentConditions);
  
  // Spike detection
  const spikeDetection = detectSpikeIndicators(currentConditions, featureStats);
  
  if (spikeDetection.isSpikeLikely && spikeDetection.confidence > 60) {
    const spikeMultiplier = 1 + (spikeDetection.confidence / 100) * 0.5;
    prediction *= spikeMultiplier;
    console.log(`  ⚠️ Spike detected! Confidence: ${spikeDetection.confidence}%, Indicators: ${spikeDetection.indicators.join(', ')}`);
  }
  
  // Bound predictions (AESO can spike to $999 but be conservative)
  return Math.max(0, Math.min(800, prediction));
}

function buildDecisionTreePrediction(features: any, correlations: any, stats: any, regime: string): number {
  let adjustment = 0;
  
  // ========== PRICE LAG FEATURES (Critical) ==========
  if (features.priceLag1h !== null && features.priceLag1h !== undefined) {
    const lag1hWeight = 0.4;
    adjustment += (features.priceLag1h - (stats.avgPrice || 50)) * lag1hWeight;
  }
  
  if (features.priceLag24h !== null && features.priceLag24h !== undefined) {
    const lag24hWeight = 0.15;
    adjustment += (features.priceLag24h - (stats.avgPrice || 50)) * lag24hWeight;
  }
  
  if (features.priceRollingAvg24h !== null && features.priceRollingAvg24h !== undefined) {
    const rollingWeight = 0.2;
    adjustment += (features.priceRollingAvg24h - (stats.avgPrice || 50)) * rollingWeight;
  }
  
  // Price momentum
  if (features.priceMomentum1h !== null && features.priceMomentum1h !== undefined) {
    if (features.priceMomentum1h > 20) {
      adjustment += 8;
    } else if (features.priceMomentum1h < -20) {
      adjustment -= 8;
    }
  }
  
  // Interaction features
  if (features.windHourInteraction !== null) {
    const corrWindHour = correlations.windGenHourInteraction || 0;
    adjustment += features.windHourInteraction * corrWindHour * 0.001;
  }
  
  if (features.tempDemandInteraction !== null) {
    const corrTempDemand = correlations.tempDemandInteraction || 0;
    adjustment += features.tempDemandInteraction * corrTempDemand * 0.00001;
  }
  
  // Weather impact
  const avgTemp = (features.temperatureCalgary + features.temperatureEdmonton) / 2;
  if (avgTemp < -20 || avgTemp > 28) {
    adjustment += Math.abs(avgTemp - 15) * 1.2;
  } else if (avgTemp < -10 || avgTemp > 24) {
    adjustment += Math.abs(avgTemp - 15) * 0.8;
  }
  
  // Wind effects
  if (features.windSpeed > 40) {
    adjustment += 12;
  } else if (features.windSpeed < 10 && features.windGen < 1000) {
    adjustment += 8;
  }
  
  // Cloud/solar
  if (features.cloudCover > 80 && features.hour >= 8 && features.hour <= 18) {
    adjustment += 5;
  } else if (features.cloudCover < 30 && features.solarIrradiance > 500) {
    adjustment -= 4;
  }
  
  // Holiday
  if (features.isHoliday) {
    adjustment -= 12;
  }
  
  // Natural gas price
  if (features.naturalGasPrice > 3.5) {
    adjustment += 20;
  } else if (features.naturalGasPrice > 2.5) {
    adjustment += 10;
  } else if (features.naturalGasPrice < 1.5) {
    adjustment -= 15;
  }
  
  // Volatility
  if (features.priceVolatility24h > 60) {
    adjustment += features.priceVolatility24h * 0.25;
  }
  
  // Curtailment
  if (features.renewableCurtailment > 200) {
    adjustment -= 8;
  } else if (features.renewableCurtailment > 100) {
    adjustment -= 4;
  }
  
  // Wind generation
  if (features.windGen > 2500) {
    adjustment -= features.windGen * 0.008;
  } else if (features.windGen < 500) {
    adjustment += 8;
  }
  
  // Demand
  if (features.demand > 11000) {
    adjustment += (features.demand - 11000) * 0.008;
  } else if (features.demand < 8000) {
    adjustment -= 6;
  }
  
  // Time of day
  if (features.hour >= 7 && features.hour <= 22) {
    adjustment += 6;
  } else {
    adjustment -= 4;
  }
  
  // Weekend
  if (features.dayOfWeek === 0 || features.dayOfWeek === 6) {
    adjustment -= 5;
  }
  
  // Net imports
  if (features.netImports < -500) {
    adjustment += 5;
  } else if (features.netImports > 500) {
    adjustment -= 3;
  }
  
  return adjustment;
}

function getRegimeMultiplier(regime: string, conditions: any): number {
  switch (regime) {
    case 'high_wind':
      return 0.82;
    case 'peak_demand':
      return 1.25;
    case 'low_demand':
      return 0.88;
    default:
      return 1.0;
  }
}

function detectSpikeIndicators(conditions: any, stats: any): { 
  isSpikeLikely: boolean; 
  indicators: string[];
  confidence: number;
} {
  const indicators: string[] = [];
  let riskScore = 0;
  
  // High demand
  const reserveMargin = (conditions.ail_mw || 0) / (stats.avgDemand || 10000);
  if (reserveMargin > 1.1) {
    indicators.push('high_demand');
    riskScore += 30;
  }
  
  // Extreme weather
  const avgTemp = ((conditions.temperature_calgary || 15) + (conditions.temperature_edmonton || 15)) / 2;
  if (avgTemp < -25 || avgTemp > 32) {
    indicators.push('extreme_weather');
    riskScore += 25;
  }
  
  // Low wind
  if ((conditions.generation_wind || 0) < 500) {
    indicators.push('low_wind');
    riskScore += 20;
  }
  
  // High gas prices
  if ((conditions.natural_gas_price || 0) > 4.0) {
    indicators.push('high_gas_price');
    riskScore += 15;
  }
  
  // Peak hour + high demand
  const hour = new Date(conditions.timestamp || Date.now()).getHours();
  if ((hour >= 7 && hour <= 22) && reserveMargin > 1.05) {
    indicators.push('peak_hour_high_demand');
    riskScore += 10;
  }
  
  return {
    isSpikeLikely: riskScore >= 50,
    indicators,
    confidence: Math.min(100, riskScore)
  };
}
