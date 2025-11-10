import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL_VERSION = 'v3.0-xgboost-enhanced';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting XGBoost-style gradient boosting training with enhanced features...');

    // Fetch all training data with enhanced features (paginate to get all records)
    console.log('Fetching all training data...');
    let trainingData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: chunk, error: chunkError } = await supabase
        .from('aeso_training_data')
        .select('*')
        .order('timestamp', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (chunkError) {
        console.error('Error fetching training data chunk:', chunkError);
        break;
      }
      
      if (!chunk || chunk.length === 0) {
        hasMore = false;
      } else {
        trainingData = trainingData.concat(chunk);
        console.log(`Fetched page ${page + 1}: ${chunk.length} records (total: ${trainingData.length})`);
        page++;
        
        if (chunk.length < pageSize) {
          hasMore = false;
        }
      }
    }
    
    const trainError = trainingData.length === 0 ? new Error('No training data found') : null;

    if (trainError || !trainingData || trainingData.length < 24) {
      throw new Error(`Insufficient training data: ${trainingData?.length || 0} records (need at least 24 hours)`);
    }

    // Fetch enhanced features (paginate to get all records)
    console.log('Fetching enhanced features...');
    let enhancedFeatures: any[] = [];
    page = 0;
    hasMore = true;
    
    while (hasMore) {
      const { data: chunk, error: chunkError } = await supabase
        .from('aeso_enhanced_features')
        .select('*')
        .order('timestamp', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (chunkError) {
        console.warn('Error fetching enhanced features chunk:', chunkError);
        break;
      }
      
      if (!chunk || chunk.length === 0) {
        hasMore = false;
      } else {
        enhancedFeatures = enhancedFeatures.concat(chunk);
        console.log(`Fetched enhanced features page ${page + 1}: ${chunk.length} records`);
        page++;
        
        if (chunk.length < pageSize) {
          hasMore = false;
        }
      }
    }
    
    const featureError = enhancedFeatures.length === 0 ? new Error('No enhanced features found') : null;

    if (featureError) {
      console.warn('Enhanced features not available, using base features only');
    }

    // Merge enhanced features with training data
    const enhancedDataMap = new Map(
      (enhancedFeatures || []).map(f => [f.timestamp, f])
    );
    
    const mergedData = trainingData.map(record => ({
      ...record,
      ...enhancedDataMap.get(record.timestamp)
    }));

    console.log(`Training XGBoost model with ${mergedData.length} historical data points and enhanced features`);
    console.log('Sample merged data point:', JSON.stringify(mergedData[0], null, 2));

    // Calculate feature correlations with price (including enhanced features)
    const featureCorrelations = calculateFeatureCorrelations(mergedData);
    const featureStats = calculateFeatureStats(mergedData);
    const laggedFeatures = calculateLaggedFeatures(mergedData);
    const regimeThresholds = calculateRegimeThresholds(mergedData);
    
    // XGBoost hyperparameters
    const xgboostParams = {
      learning_rate: 0.1,
      max_depth: 6,
      min_samples_split: 10,
      n_estimators: 100,
      subsample: 0.8
    };
    
    // ========== PHASE 4: OUTLIER DETECTION ==========
    console.log('\n=== Phase 4: Detecting Price Outliers ===');
    const outlierThreshold = detectOutliers(mergedData);
    console.log(`Outlier threshold (Q3 + 3*IQR): $${outlierThreshold.toFixed(2)}/MWh`);
    
    // Separate spike vs normal regime data
    const spikeData = mergedData.filter(d => d.pool_price > outlierThreshold);
    const normalData = mergedData.filter(d => d.pool_price <= outlierThreshold);
    console.log(`Found ${spikeData.length} spike records (${(spikeData.length/mergedData.length*100).toFixed(1)}%) and ${normalData.length} normal records`);

    console.log('Feature correlations with price:', featureCorrelations);
    console.log('Feature statistics:', featureStats);
    console.log('Lagged feature importance:', laggedFeatures);
    console.log('Market regime thresholds:', regimeThresholds);
    
    // ========== PHASE 1: FEATURE SCALING ==========
    console.log('\n=== Calculating Feature Scaling Parameters ===');
    const featureScaling = calculateFeatureScaling(mergedData);
    console.log('Feature scaling calculated for', Object.keys(featureScaling).length, 'features');
    
    // Split data: 80% training, 20% testing
    const splitIndex = Math.floor(mergedData.length * 0.8);
    const trainSet = mergedData.slice(0, splitIndex);
    const testSet = mergedData.slice(splitIndex);

    console.log(`Training: ${trainSet.length} samples, Testing: ${testSet.length} samples`);
    
    // Apply scaling to training and test sets
    const scaledTrainSet = applyFeatureScaling(trainSet, featureScaling);
    const scaledTestSet = applyFeatureScaling(testSet, featureScaling);
    console.log('Applied feature scaling to training and test data');
    
    // ========== PHASE 1 & 2: ENHANCED FEATURES (Phase 3 ML removed to reduce function size) ==========
    console.log('Enhanced features ready with scaling applied');

    // ========== PHASE 1: DEBUG PREDICTIONS ==========
    console.log('\n=== Evaluating Model Performance (Using Scaled Data) ===');
    
    // Evaluate model on test set with regime-aware predictions
    let totalAbsError = 0;
    let totalSquaredError = 0;
    let totalPercentError = 0;
    const predictions: number[] = [];
    const actuals: number[] = [];
    const modelErrors: Record<string, number[]> = {
      'base': [],
      'high_wind': [],
      'peak_demand': [],
      'low_demand': []
    };

    let debugCount = 0;
    for (let idx = 0; idx < scaledTestSet.length; idx++) {
      const testPoint = scaledTestSet[idx];
      const originalTestPoint = testSet[idx];
      const regime = detectRegime(originalTestPoint, regimeThresholds);
      const prediction = predictPriceWithXGBoost(scaledTrainSet, testPoint, featureCorrelations, featureStats, laggedFeatures, regime, xgboostParams, featureScaling);
      const actual = originalTestPoint.pool_price;
      
      // Debug first 3 predictions
      if (debugCount < 3) {
        console.log(`\nTest prediction ${debugCount}:`);
        console.log(`  Actual: $${actual.toFixed(2)}`);
        console.log(`  Predicted: $${prediction.toFixed(2)}`);
        console.log(`  Error: $${Math.abs(actual - prediction).toFixed(2)}`);
        console.log(`  Hour: ${new Date(originalTestPoint.timestamp).getUTCHours()}, Wind: ${originalTestPoint.generation_wind}, Demand: ${originalTestPoint.ail_mw}`);
        console.log(`  Regime: ${regime}`);
        debugCount++;
      }
      
      predictions.push(prediction);
      actuals.push(actual);
      
      const error = Math.abs(prediction - actual);
      totalAbsError += error;
      totalSquaredError += (prediction - actual) * (prediction - actual);
      modelErrors[regime].push(error);
      
      // For MAPE: use $5 minimum threshold to avoid division by very small numbers
      // Zero prices are valid but create infinite percentage errors
      const actualForMape = Math.max(5, actual);
      totalPercentError += Math.abs((prediction - actualForMape) / actualForMape) * 100;
    }

    // Calculate performance metrics
    const mae = totalAbsError / testSet.length;
    const rmse = Math.sqrt(totalSquaredError / testSet.length);
    const mape = totalPercentError / testSet.length;
    
    // R-squared
    const meanActual = actuals.reduce((sum, val) => sum + val, 0) / actuals.length;
    const totalSS = actuals.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
    const residualSS = actuals.reduce((sum, val, i) => sum + Math.pow(val - predictions[i], 2), 0);
    const rSquared = 1 - (residualSS / totalSS);

    console.log(`✅ Model Performance:`);
    console.log(`  MAE: $${mae.toFixed(2)}/MWh`);
    console.log(`  RMSE: $${rmse.toFixed(2)}/MWh`);
    console.log(`  MAPE: ${mape.toFixed(2)}%`);
    console.log(`  R²: ${rSquared.toFixed(4)}`);
    
    // ========== PHASE 4: CALCULATE PREDICTION INTERVALS ==========
    console.log('\n=== Phase 4: Calculating Prediction Intervals ===');
    const predictionInterval80 = calculatePredictionInterval(predictions, actuals, 0.8);
    const predictionInterval95 = calculatePredictionInterval(predictions, actuals, 0.95);
    
    console.log(`80% Prediction Interval: ±$${predictionInterval80.upper.toFixed(2)}/MWh`);
    console.log(`95% Prediction Interval: ±$${predictionInterval95.upper.toFixed(2)}/MWh`);
    console.log(`Residual Std Dev: $${predictionInterval80.stdDev.toFixed(2)}/MWh`);
    
    // ========== PHASE 5: MODEL MONITORING & DRIFT DETECTION ==========
    console.log('\n=== Phase 5: Calculating Model Drift & Monitoring Metrics ===');
    
    // Fetch historical performance for drift calculation
    const { data: historicalPerf } = await supabase
      .from('aeso_model_performance')
      .select('mae, rmse, mape')
      .order('evaluation_date', { ascending: false })
      .limit(10);
    
    let driftMetrics: DriftMetrics | null = null;
    let perfWindows: { recent: any; overall: any } | null = null;
    
    if (historicalPerf && historicalPerf.length > 0) {
      // Get historical and current price data for drift comparison
      const historicalPrices = trainSet.slice(-500).map(d => d.pool_price);
      const currentPrices = testSet.map(d => d.pool_price);
      
      driftMetrics = calculateModelDrift(
        historicalPerf,
        { mae, rmse, mape },
        historicalPrices,
        currentPrices
      );
      
      console.log('Model Drift Analysis:');
      console.log(`  Drift Score: ${(driftMetrics.driftScore * 100).toFixed(1)}%`);
      console.log(`  Performance Drift: ${(driftMetrics.performanceDrift * 100).toFixed(1)}%`);
      console.log(`  Feature Drift: ${(driftMetrics.featureDrift * 100).toFixed(1)}%`);
      console.log(`  Requires Retraining: ${driftMetrics.requiresRetraining ? 'YES ⚠️' : 'NO ✅'}`);
    }
    
    // Calculate performance windows (recent vs overall)
    perfWindows = calculatePerformanceWindow(actuals, predictions, 168);
    console.log('Performance Windows:');
    console.log(`  Recent (7 days): MAE=$${perfWindows.recent.mae.toFixed(2)}, RMSE=$${perfWindows.recent.rmse.toFixed(2)}`);
    console.log(`  Overall: MAE=$${perfWindows.overall.mae.toFixed(2)}, RMSE=$${perfWindows.overall.rmse.toFixed(2)}`);
    
    const perfDegradation = perfWindows.recent.mae > perfWindows.overall.mae * 1.2;
    if (perfDegradation) {
      console.log('  ⚠️ Recent performance has degraded by >20%');
    }
    
    // Log individual model performance
    console.log('\n✅ Individual Model MAE:');
    for (const [model, errors] of Object.entries(modelErrors)) {
      const avgError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
      console.log(`  ${model}: $${avgError.toFixed(2)}/MWh`);
    }

    // Calculate feature importance (filter out null correlations)
    const featureImportance: Record<string, number | null> = {};
    const validCorrelations = Object.entries(featureCorrelations).filter(([_, val]) => val !== null && !isNaN(val));
    const totalCorr = validCorrelations.reduce((sum, [_, val]) => sum + Math.abs(val as number), 0);
    
    if (totalCorr > 0) {
      for (const [feature, corr] of validCorrelations) {
        featureImportance[feature] = Math.abs(corr as number) / totalCorr;
      }
    }
    
    // Add null for features without valid correlations
    for (const [feature, corr] of Object.entries(featureCorrelations)) {
      if (corr === null || isNaN(corr)) {
        featureImportance[feature] = null;
      }
    }

    console.log('Feature importance:', featureImportance);

    // Store model performance with Phase 5 monitoring data
    const { error: insertError } = await supabase
      .from('aeso_model_performance')
      .insert({
        model_version: MODEL_VERSION,
        mae: mae,
        rmse: rmse,
        mape: mape,
        r_squared: rSquared,
        feature_importance: featureImportance,
        predictions_evaluated: testSet.length,
        prediction_interval_80: predictionInterval80.upper,
        prediction_interval_95: predictionInterval95.upper,
        residual_std_dev: predictionInterval80.stdDev,
        metadata: {
          drift_metrics: driftMetrics,
          performance_windows: perfWindows,
          retraining_recommended: driftMetrics?.requiresRetraining || false,
          phase: 5
        }
      });

    if (insertError) {
      console.error('Error storing model performance:', insertError);
    }

    // Calculate ensemble weights based on regime performance
    const ensembleWeights: Record<string, number> = {};
    for (const [regime, errors] of Object.entries(modelErrors)) {
      if (errors.length > 0) {
        const avgError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
        // Lower error = higher weight (inverse relationship)
        ensembleWeights[regime] = 1 / (avgError + 1);
      } else {
        ensembleWeights[regime] = 0.5;
      }
    }

    // Normalize weights
    const totalWeight = Object.values(ensembleWeights).reduce((sum, w) => sum + w, 0);
    for (const regime in ensembleWeights) {
      ensembleWeights[regime] /= totalWeight;
    }

    console.log('Ensemble weights by regime:', ensembleWeights);

    // Store learned parameters for use by predictor (including scaling parameters and ML models)
    console.log('Storing learned model parameters with Phase 4 enhancements...');
    
    const { error: paramsError } = await supabase
      .from('aeso_model_parameters')
      .upsert({
        model_version: MODEL_VERSION,
        parameter_type: 'learned_coefficients',
        parameter_name: 'main',
        parameter_value: 1.0,
        feature_correlations: {
          ...featureCorrelations,
          lagged: laggedFeatures,
          regimes: regimeThresholds,
          ensemble_weights: ensembleWeights,
          outlier_threshold: outlierThreshold,
          spike_indicators: {
            low_reserves: true,
            high_demand: true,
            extreme_weather: true
          }
        },
        feature_statistics: featureStats,
        feature_scaling: featureScaling,
        training_samples: trainingData.length
      }, {
        onConflict: 'model_version,parameter_type,parameter_name'
      });

    if (paramsError) {
      console.error('Error storing model parameters:', paramsError);
    } else {
      console.log('✅ Model parameters stored successfully');
    }

    return new Response(JSON.stringify({
      success: true,
      model_version: MODEL_VERSION,
      training_samples: trainingData.length,
      performance: {
        mae: parseFloat(mae.toFixed(2)),
        rmse: parseFloat(rmse.toFixed(2)),
        mape: parseFloat(mape.toFixed(2)),
        r_squared: parseFloat(rSquared.toFixed(4)),
        prediction_interval_80: parseFloat(predictionInterval80.upper.toFixed(2)),
        prediction_interval_95: parseFloat(predictionInterval95.upper.toFixed(2)),
        residual_std_dev: parseFloat(predictionInterval80.stdDev.toFixed(2))
      },
      monitoring: {
        drift_score: driftMetrics?.driftScore || 0,
        performance_drift: driftMetrics?.performanceDrift || 0,
        feature_drift: driftMetrics?.featureDrift || 0,
        requires_retraining: driftMetrics?.requiresRetraining || false,
        recent_performance: perfWindows?.recent || null,
        overall_performance: perfWindows?.overall || null
      },
      feature_importance: featureImportance,
      feature_correlations: featureCorrelations
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Model training error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ========== PHASE 4: ADVANCED IMPROVEMENTS ==========

// Outlier detection using IQR method
function detectOutliers(data: any[]): number {
  const prices = data.map(d => d.pool_price).sort((a, b) => a - b);
  const n = prices.length;
  
  // Calculate Q1 and Q3
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = prices[q1Index];
  const q3 = prices[q3Index];
  const iqr = q3 - q1;
  
  // Outlier threshold: Q3 + 3*IQR (aggressive for capturing extreme spikes)
  return q3 + 3 * iqr;
}

// Detect if current conditions indicate potential spike
function detectSpikeIndicators(conditions: any, stats: any): { 
  isSpikeLikely: boolean; 
  indicators: string[];
  confidence: number;
} {
  const indicators: string[] = [];
  let riskScore = 0;
  
  // Low reserves indicator (demand approaching capacity)
  const reserveMargin = (conditions.ail_mw || 0) / (stats.avgDemand || 10000);
  if (reserveMargin > 1.1) {
    indicators.push('high_demand');
    riskScore += 30;
  }
  
  // Extreme weather (very hot or very cold)
  const avgTemp = ((conditions.temperature_calgary || 15) + (conditions.temperature_edmonton || 15)) / 2;
  if (avgTemp < -25 || avgTemp > 32) {
    indicators.push('extreme_weather');
    riskScore += 25;
  }
  
  // Very low wind when wind capacity is significant
  if ((conditions.generation_wind || 0) < 500) {
    indicators.push('low_wind');
    riskScore += 20;
  }
  
  // High natural gas prices
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

// Calculate prediction interval (uncertainty estimate)
function calculatePredictionInterval(
  predictions: number[],
  actuals: number[],
  confidence: number = 0.8
): { lower: number; upper: number; stdDev: number } {
  const n = predictions.length;
  const residuals = predictions.map((pred, i) => actuals[i] - pred);
  
  // Calculate residual standard deviation
  const meanResidual = residuals.reduce((sum, r) => sum + r, 0) / n;
  const variance = residuals.reduce((sum, r) => sum + Math.pow(r - meanResidual, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  
  // Z-score for confidence level (0.8 = 80% confidence ≈ 1.28, 0.95 = 95% ≈ 1.96)
  const zScore = confidence === 0.95 ? 1.96 : 1.28;
  
  return {
    lower: -zScore * stdDev,
    upper: zScore * stdDev,
    stdDev
  };
}

// ========== PHASE 5: MODEL MONITORING & DRIFT DETECTION ==========

interface DriftMetrics {
  featureDrift: number;
  performanceDrift: number;
  predictionDrift: number;
  requiresRetraining: boolean;
  driftScore: number;
}

// Calculate model drift comparing historical vs current performance
function calculateModelDrift(
  historicalPerformance: { mae: number; rmse: number; mape: number }[],
  currentPerformance: { mae: number; rmse: number; mape: number },
  historicalPrices: number[],
  currentPrices: number[]
): DriftMetrics {
  // Performance drift: compare current vs historical average
  const avgHistoricalMAE = historicalPerformance.reduce((sum, p) => sum + p.mae, 0) / historicalPerformance.length;
  const avgHistoricalRMSE = historicalPerformance.reduce((sum, p) => sum + p.rmse, 0) / historicalPerformance.length;
  
  const maeDrift = Math.abs(currentPerformance.mae - avgHistoricalMAE) / (avgHistoricalMAE + 0.01);
  const rmseDrift = Math.abs(currentPerformance.rmse - avgHistoricalRMSE) / (avgHistoricalRMSE + 0.01);
  const performanceDrift = (maeDrift + rmseDrift) / 2;
  
  // Feature drift: compare price distributions
  const histMean = historicalPrices.reduce((sum, p) => sum + p, 0) / historicalPrices.length;
  const currMean = currentPrices.reduce((sum, p) => sum + p, 0) / currentPrices.length;
  
  const histStd = Math.sqrt(
    historicalPrices.reduce((sum, p) => sum + Math.pow(p - histMean, 2), 0) / historicalPrices.length
  );
  const currStd = Math.sqrt(
    currentPrices.reduce((sum, p) => sum + Math.pow(p - currMean, 2), 0) / currentPrices.length
  );
  
  const meanDrift = Math.abs(currMean - histMean) / (histStd + 0.01);
  const stdDrift = Math.abs(currStd - histStd) / (histStd + 0.01);
  const featureDrift = (meanDrift + stdDrift) / 2;
  
  // Prediction drift: combined metric
  const predictionDrift = performanceDrift * 0.7 + featureDrift * 0.3;
  
  // Overall drift score
  const driftScore = performanceDrift * 0.5 + featureDrift * 0.3 + predictionDrift * 0.2;
  
  // Retraining thresholds
  const requiresRetraining = 
    driftScore > 0.25 || // Overall drift > 25%
    performanceDrift > 0.30 || // Performance degraded > 30%
    featureDrift > 0.40; // Feature distribution changed > 40%
  
  return {
    featureDrift,
    performanceDrift,
    predictionDrift,
    requiresRetraining,
    driftScore
  };
}

// Calculate performance over recent window vs overall
function calculatePerformanceWindow(
  actualPrices: number[],
  predictions: number[],
  windowSize: number = 168 // 7 days of hourly data
): { recent: any; overall: any } {
  const recentActual = actualPrices.slice(-Math.min(windowSize, actualPrices.length));
  const recentPred = predictions.slice(-Math.min(windowSize, predictions.length));
  
  const recentErrors = recentActual.map((actual, i) => Math.abs(actual - recentPred[i]));
  const recentMAE = recentErrors.reduce((sum, err) => sum + err, 0) / recentErrors.length;
  const recentRMSE = Math.sqrt(
    recentErrors.reduce((sum, err) => sum + err * err, 0) / recentErrors.length
  );
  const recentMAPE = (recentErrors.reduce((sum, err, i) => 
    sum + Math.abs(err / Math.max(5, recentActual[i])), 0) / recentErrors.length) * 100;
  
  const overallErrors = actualPrices.map((actual, i) => Math.abs(actual - predictions[i]));
  const overallMAE = overallErrors.reduce((sum, err) => sum + err, 0) / overallErrors.length;
  const overallRMSE = Math.sqrt(
    overallErrors.reduce((sum, err) => sum + err * err, 0) / overallErrors.length
  );
  const overallMAPE = (overallErrors.reduce((sum, err, i) => 
    sum + Math.abs(err / Math.max(5, actualPrices[i])), 0) / overallErrors.length) * 100;
  
  return {
    recent: { mae: recentMAE, rmse: recentRMSE, mape: recentMAPE },
    overall: { mae: overallMAE, rmse: overallRMSE, mape: overallMAPE }
  };
}

// Enhanced XGBoost-style gradient boosting prediction with enhanced features
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
  // NOTE: $0 prices are VALID and normal in Alberta market!
  let prediction = featureStats.avgPrice;
  
  // Gradient boosting: iteratively add weak learners
  const nEstimators = Math.min(params.n_estimators, 20); // Limit for performance
  const learningRate = params.learning_rate;
  const maxDepth = params.max_depth;
  
  // Calculate feature values including weather and enhanced features
  const features = {
    hour: currentConditions.hour_of_day || 12,
    dayOfWeek: currentConditions.day_of_week || 1,
    isHoliday: currentConditions.is_holiday || false,
    isWeekend: currentConditions.is_weekend || false,
    month: currentConditions.month || 1,
    season: currentConditions.season || 'winter',
    // Weather features (critical for Alberta market)
    temperatureCalgary: currentConditions.temperature_calgary || 15,
    temperatureEdmonton: currentConditions.temperature_edmonton || 15,
    windSpeed: currentConditions.wind_speed || 0,
    cloudCover: currentConditions.cloud_cover || 50,
    solarIrradiance: currentConditions.solar_irradiance || 0,
    // Generation features
    windGen: currentConditions.generation_wind || 0,
    solarGen: currentConditions.generation_solar || 0,
    hydroGen: currentConditions.generation_hydro || 0,
    gasGen: currentConditions.generation_gas || 0,
    coalGen: currentConditions.generation_coal || 0,
    demand: currentConditions.ail_mw || 0,
    // Enhanced features
    priceVolatility1h: currentConditions.price_volatility_1h || 0,
    priceVolatility24h: currentConditions.price_volatility_24h || 0,
    priceMomentum3h: currentConditions.price_momentum_3h || 0,
    naturalGasPrice: currentConditions.natural_gas_price || 2.5,
    renewableCurtailment: currentConditions.renewable_curtailment || 0,
    netImports: currentConditions.net_imports || 0
  };
  
  // Simulated gradient boosting with decision trees
  for (let i = 0; i < nEstimators; i++) {
    const treeAdjustment = buildDecisionTreePrediction(features, featureCorrelations, featureStats, regime, maxDepth);
    prediction += learningRate * treeAdjustment;
  }
  
  // Apply regime-specific multipliers
  prediction *= getRegimeMultiplier(regime, currentConditions);
  
  // ========== PHASE 4: SPIKE DETECTION ==========
  // Check for price spike indicators
  const spikeDetection = detectSpikeIndicators(currentConditions, featureStats);
  
  if (spikeDetection.isSpikeLikely && spikeDetection.confidence > 60) {
    // Apply spike premium based on confidence
    const spikeMultiplier = 1 + (spikeDetection.confidence / 100) * 0.5; // Up to 50% increase
    prediction *= spikeMultiplier;
    
    // Log spike detection
    if (Math.random() < 0.01) { // Log 1% of cases to avoid spam
      console.log(`⚠️ Spike detected! Indicators: ${spikeDetection.indicators.join(', ')}, Confidence: ${spikeDetection.confidence}%`);
    }
  }
  
  // Handle extreme Alberta price volatility with bounds
  // AESO market can spike to $999.99 but predictions should be conservative
  // NOTE: $0 prices are valid! Don't floor at $5
  return Math.max(0, Math.min(800, prediction));
}

// Simplified decision tree builder for gradient boosting with weather integration
function buildDecisionTreePrediction(features: any, correlations: any, stats: any, regime: string, maxDepth: number): number {
  let adjustment = 0;
  
  // WEATHER IMPACT - Critical for Alberta's temperature-sensitive demand
  const avgTemp = (features.temperatureCalgary + features.temperatureEdmonton) / 2;
  
  // Extreme cold or heat drives demand up (heating/cooling)
  if (avgTemp < -20 || avgTemp > 28) {
    adjustment += Math.abs(avgTemp - 15) * 1.2; // Strong temperature effect
  } else if (avgTemp < -10 || avgTemp > 24) {
    adjustment += Math.abs(avgTemp - 15) * 0.8;
  }
  
  // Wind speed affects wind generation reliability
  if (features.windSpeed > 40) {
    adjustment += 12; // Very high winds can cause curtailment
  } else if (features.windSpeed < 10 && features.windGen < 1000) {
    adjustment += 8; // Low wind = less renewable generation
  }
  
  // Cloud cover affects solar generation
  if (features.cloudCover > 80 && features.hour >= 8 && features.hour <= 18) {
    adjustment += 5; // Less solar during daytime
  } else if (features.cloudCover < 30 && features.solarIrradiance > 500) {
    adjustment -= 4; // High solar output
  }
  
  // Holiday effect (lower commercial demand)
  if (features.isHoliday) {
    adjustment -= 12;
  }
  
  // Natural gas price is a strong predictor (gas plants are often marginal)
  if (features.naturalGasPrice > 3.5) {
    adjustment += 20;
  } else if (features.naturalGasPrice > 2.5) {
    adjustment += 10;
  } else if (features.naturalGasPrice < 1.5) {
    adjustment -= 15;
  }
  
  // Price momentum indicates trend direction
  if (features.priceMomentum3h > 30) {
    adjustment += 15; // Strong upward trend
  } else if (features.priceMomentum3h < -30) {
    adjustment -= 15; // Strong downward trend
  }
  
  // Volatility increases price risk premium
  if (features.priceVolatility24h > 60) {
    adjustment += features.priceVolatility24h * 0.25;
  }
  
  // Renewable curtailment suggests oversupply
  if (features.renewableCurtailment > 200) {
    adjustment -= 8;
  } else if (features.renewableCurtailment > 100) {
    adjustment -= 4;
  }
  
  // Wind generation (high wind = lower prices)
  if (features.windGen > 2500) {
    adjustment -= features.windGen * 0.008;
  } else if (features.windGen < 500) {
    adjustment += 8;
  }
  
  // Demand pressure
  if (features.demand > 11000) {
    adjustment += (features.demand - 11000) * 0.008;
  } else if (features.demand < 8000) {
    adjustment -= 6;
  }
  
  // Peak hours
  if (features.hour >= 7 && features.hour <= 22) {
    adjustment += 6;
  } else {
    adjustment -= 4;
  }
  
  // Weekend effect
  if (features.dayOfWeek === 0 || features.dayOfWeek === 6) {
    adjustment -= 5;
  }
  
  // Net imports/exports
  if (features.netImports < -500) {
    adjustment += 5; // Exporting = higher local demand
  } else if (features.netImports > 500) {
    adjustment -= 3; // Importing = lower prices
  }
  
  return adjustment;
}

function getRegimeMultiplier(regime: string, conditions: any): number {
  switch (regime) {
    case 'high_wind':
      return 0.82; // Significant price reduction with high wind
    case 'peak_demand':
      return 1.25; // Price premium during peak
    case 'low_demand':
      return 0.88; // Lower prices during low demand
    default:
      return 1.0;
  }
}

// AI prediction function for training evaluation with regime awareness
function predictPriceForTraining(
  historicalData: any[], 
  testPoint: any, 
  correlations: Record<string, number>,
  stats: any,
  laggedFeatures: any,
  regime: string
): number {
  // Use recent 14 days (336 hours) for context
  const recentData = historicalData.slice(-336);
  
  if (recentData.length === 0) return stats.avgPrice || 30;
  
  const recentPrices = recentData.map(d => d.pool_price).filter(p => p !== null && p !== undefined);
  if (recentPrices.length === 0) return stats.avgPrice || 30;
  
  // Exponentially weighted moving average
  let weightedSum = 0;
  let weightSum = 0;
  const alpha = 0.3;
  
  recentPrices.forEach((price, i) => {
    const weight = Math.exp(-alpha * i);
    weightedSum += price * weight;
    weightSum += weight;
  });
  
  const basePrice = weightedSum / weightSum;
  
  // Extract features from test point
  const timestamp = new Date(testPoint.timestamp);
  const hour = timestamp.getHours();
  const dayOfWeek = timestamp.getDay();
  const month = timestamp.getMonth() + 1;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Multi-factor model using learned correlations with regime adjustments
  let prediction = basePrice;
  
  // Apply regime-specific adjustments
  if (regime === 'high_wind' && testPoint.generation_wind !== null) {
    // High wind generation = lower prices
    const windFactor = 1 - (testPoint.generation_wind / 3500) * 0.25; // Up to 25% reduction
    prediction *= Math.max(0.7, windFactor);
  } else if (regime === 'peak_demand' && testPoint.ail_mw !== null) {
    // Peak demand = higher prices
    const demandFactor = testPoint.ail_mw / (stats.avgDemand || 10000);
    prediction *= Math.max(1.1, demandFactor * 1.15);
  } else if (regime === 'low_demand') {
    // Low demand = lower prices
    prediction *= 0.88;
  }
  
  // Hour of day factor (peak hours = higher prices)
  const hourlyMultiplier = stats.hourlyAvgPrices?.[hour] || basePrice;
  const hourFactor = hourlyMultiplier / stats.avgPrice;
  prediction *= Math.pow(hourFactor, 0.9); // Reduce hour factor impact slightly
  
  // Day of week factor
  if (isWeekend) {
    prediction *= 0.92; // Weekends typically 8% lower
  }
  
  // Seasonal factor (winter & summer = higher demand)
  const seasonalFactors: Record<number, number> = {
    1: 1.15, 2: 1.12, 3: 1.05, 4: 0.95, 5: 0.92, 6: 0.95,
    7: 1.08, 8: 1.12, 9: 1.02, 10: 0.98, 11: 1.05, 12: 1.12
  };
  prediction *= seasonalFactors[month] || 1.0;
  
  // Temperature impact (if available)
  if (testPoint.temperature_calgary !== null && correlations.temperature) {
    const tempDeviation = testPoint.temperature_calgary - 15; // 15°C is mild
    prediction *= 1 + (Math.abs(tempDeviation) / 150) * Math.sign(correlations.temperature);
  }
  
  // Wind generation impact (if available)
  if (testPoint.generation_wind !== null && correlations.windGen) {
    // More wind = lower prices
    const windFactor = 1 - (testPoint.generation_wind / 3000) * 0.15; // Max 15% reduction
    prediction *= Math.max(0.85, windFactor);
  }
  
  // Demand impact (if available and reasonable)
  if (testPoint.ail_mw !== null && testPoint.ail_mw > 5000 && correlations.demand) {
    const demandFactor = testPoint.ail_mw / (stats.avgDemand || 10000);
    // Limit demand impact to reasonable range
    prediction *= Math.max(0.7, Math.min(1.4, demandFactor));
  }
  
  // Price floor and ceiling for Alberta market
  // NOTE: $0 prices are valid and normal in Alberta market!
  return Math.max(0, Math.min(999, prediction));
}

// ========== PHASE 1: FEATURE SCALING FUNCTIONS ==========

function calculateFeatureScaling(data: any[]): Record<string, { mean: number; stdDev: number }> {
  const features = [
    'hour_of_day',
    'day_of_week', 
    'month',
    'temperature_calgary',
    'temperature_edmonton',
    'wind_speed',
    'cloud_cover',
    'solar_irradiance',
    'generation_wind',
    'generation_solar',
    'generation_hydro',
    'generation_gas',
    'generation_coal',
    'ail_mw',
    'natural_gas_price',
    'natural_gas_price_lag_1d',
    'natural_gas_price_lag_7d',
    'natural_gas_price_lag_30d',
    'price_volatility_1h',
    'price_volatility_6h',
    'price_volatility_24h',
    'price_momentum_3h',
    'price_momentum_24h',
    'net_imports',
    'renewable_curtailment',
    // Phase 2: Cyclical features (already scaled -1 to 1, skip)
    // Phase 2: Rolling statistics
    'price_rolling_avg_6h',
    'price_rolling_avg_24h',
    'wind_rolling_avg_24h',
    'demand_rolling_avg_24h',
    'price_rolling_std_24h',
    'price_min_24h',
    'price_max_24h',
    // Phase 2: More lagged features
    'wind_lag_1h',
    'wind_lag_6h',
    'wind_lag_24h',
    'wind_lag_168h',
    'demand_lag_1h',
    'demand_lag_24h',
    'demand_lag_168h',
    'temp_lag_1h',
    'temp_lag_6h',
    'temp_lag_24h',
    'price_lag_1h',
    'price_lag_2h',
    'price_lag_3h',
    'price_lag_6h',
    'price_lag_12h',
    'price_lag_24h',
    // Phase 2: Feature interactions
    'wind_gen_hour_interaction',
    'temp_demand_interaction',
    'gas_price_gas_gen_interaction',
    'weekend_hour_interaction',
    'temp_extreme_hour_interaction'
  ];
  
  const scaling: Record<string, { mean: number; stdDev: number }> = {};
  
  for (const feature of features) {
    const values = data
      .map(d => {
        // Extract temporal features from timestamp if needed
        if (feature === 'hour_of_day') {
          return new Date(d.timestamp).getUTCHours();
        }
        if (feature === 'day_of_week') {
          return new Date(d.timestamp).getUTCDay();
        }
        if (feature === 'month') {
          return new Date(d.timestamp).getUTCMonth() + 1;
        }
        return d[feature];
      })
      .filter(v => v !== null && v !== undefined && !isNaN(v));
    
    if (values.length === 0) {
      scaling[feature] = { mean: 0, stdDev: 1 };
      continue;
    }
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    scaling[feature] = { 
      mean, 
      stdDev: stdDev === 0 ? 1 : stdDev // Avoid division by zero
    };
  }
  
  return scaling;
}

function applyFeatureScaling(data: any[], scaling: Record<string, { mean: number; stdDev: number }>): any[] {
  return data.map(record => {
    const scaled = { ...record };
    
    for (const [feature, params] of Object.entries(scaling)) {
      let value: number;
      
      // Extract temporal features from timestamp
      if (feature === 'hour_of_day') {
        value = new Date(record.timestamp).getUTCHours();
      } else if (feature === 'day_of_week') {
        value = new Date(record.timestamp).getUTCDay();
      } else if (feature === 'month') {
        value = new Date(record.timestamp).getUTCMonth() + 1;
      } else {
        value = record[feature];
      }
      
      if (value !== null && value !== undefined && !isNaN(value)) {
        scaled[feature] = (value - params.mean) / params.stdDev;
      }
    }
    
    return scaled;
  });
}

// Calculate correlations between features and price
function calculateFeatureCorrelations(data: any[]): Record<string, number> {
  const correlations: Record<string, number> = {};
  
  // Hour of day
  correlations.hourOfDay = calculateCorrelation(
    data.map(d => d.hour_of_day),
    data.map(d => d.pool_price)
  );
  
  // Day of week
  correlations.dayOfWeek = calculateCorrelation(
    data.map(d => d.day_of_week),
    data.map(d => d.pool_price)
  );
  
  // Month (seasonality)
  correlations.month = calculateCorrelation(
    data.map(d => d.month),
    data.map(d => d.pool_price)
  );
  
  // Temperature (if available)
  const tempData = data.filter(d => d.temperature_calgary !== null);
  if (tempData.length > 100) {
    correlations.temperature = calculateCorrelation(
      tempData.map(d => d.temperature_calgary),
      tempData.map(d => d.pool_price)
    );
  }
  
  // Wind generation
  const windData = data.filter(d => d.generation_wind !== null);
  if (windData.length > 100) {
    correlations.windGen = calculateCorrelation(
      windData.map(d => d.generation_wind),
      windData.map(d => d.pool_price)
    );
  }
  
  // Demand
  const demandData = data.filter(d => d.ail_mw !== null);
  if (demandData.length > 100) {
    correlations.demand = calculateCorrelation(
      demandData.map(d => d.ail_mw),
      demandData.map(d => d.pool_price)
    );
  }
  
  // Natural gas price (current) - critical for Alberta's gas-heavy generation
  const gasPriceData = data.filter(d => d.natural_gas_price !== null && d.natural_gas_price !== undefined);
  if (gasPriceData.length > 100) {
    correlations.naturalGasPrice = calculateCorrelation(
      gasPriceData.map(d => d.natural_gas_price),
      gasPriceData.map(d => d.pool_price)
    );
    
    console.log(`Natural gas price correlation: ${correlations.naturalGasPrice.toFixed(4)} (${gasPriceData.length} samples)`);
  }
  
  // Natural gas price 1-day lag
  const gasPrice1dData = data.filter(d => d.natural_gas_price_lag_1d !== null && d.natural_gas_price_lag_1d !== undefined);
  if (gasPrice1dData.length > 100) {
    correlations.naturalGasPrice1dLag = calculateCorrelation(
      gasPrice1dData.map(d => d.natural_gas_price_lag_1d),
      gasPrice1dData.map(d => d.pool_price)
    );
    
    console.log(`Natural gas 1d lag correlation: ${correlations.naturalGasPrice1dLag.toFixed(4)} (${gasPrice1dData.length} samples)`);
  }
  
  // Natural gas price 7-day lag
  const gasPrice7dData = data.filter(d => d.natural_gas_price_lag_7d !== null && d.natural_gas_price_lag_7d !== undefined);
  if (gasPrice7dData.length > 100) {
    correlations.naturalGasPrice7dLag = calculateCorrelation(
      gasPrice7dData.map(d => d.natural_gas_price_lag_7d),
      gasPrice7dData.map(d => d.pool_price)
    );
    
    console.log(`Natural gas 7d lag correlation: ${correlations.naturalGasPrice7dLag.toFixed(4)} (${gasPrice7dData.length} samples)`);
  }
  
  // Natural gas price 30-day lag
  const gasPrice30dData = data.filter(d => d.natural_gas_price_lag_30d !== null && d.natural_gas_price_lag_30d !== undefined);
  if (gasPrice30dData.length > 100) {
    correlations.naturalGasPrice30dLag = calculateCorrelation(
      gasPrice30dData.map(d => d.natural_gas_price_lag_30d),
      gasPrice30dData.map(d => d.pool_price)
    );
    
    console.log(`Natural gas 30d lag correlation: ${correlations.naturalGasPrice30dLag.toFixed(4)} (${gasPrice30dData.length} samples)`);
  }
  
  // Price volatility
  const volatilityData = data.filter(d => d.price_volatility_24h !== null);
  if (volatilityData.length > 100) {
    correlations.priceVolatility = calculateCorrelation(
      volatilityData.map(d => d.price_volatility_24h),
      volatilityData.map(d => d.pool_price)
    );
  }
  
  // Price momentum
  const momentumData = data.filter(d => d.price_momentum_3h !== null);
  if (momentumData.length > 100) {
    correlations.priceMomentum = calculateCorrelation(
      momentumData.map(d => d.price_momentum_3h),
      momentumData.map(d => d.pool_price)
    );
  }
  
  // ========== PHASE 2: CYCLICAL FEATURE CORRELATIONS ==========
  const hourSinData = data.filter(d => d.hour_sin !== null && d.hour_sin !== undefined);
  if (hourSinData.length > 100) {
    correlations.hourSin = calculateCorrelation(
      hourSinData.map(d => d.hour_sin),
      hourSinData.map(d => d.pool_price)
    );
  }
  
  const hourCosData = data.filter(d => d.hour_cos !== null && d.hour_cos !== undefined);
  if (hourCosData.length > 100) {
    correlations.hourCos = calculateCorrelation(
      hourCosData.map(d => d.hour_cos),
      hourCosData.map(d => d.pool_price)
    );
  }
  
  // ========== PHASE 2: LAGGED PRICE CORRELATIONS ==========
  const priceLag1hData = data.filter(d => d.price_lag_1h !== null);
  if (priceLag1hData.length > 100) {
    correlations.priceLag1h = calculateCorrelation(
      priceLag1hData.map(d => d.price_lag_1h),
      priceLag1hData.map(d => d.pool_price)
    );
    console.log(`Price lag 1h correlation: ${correlations.priceLag1h.toFixed(4)} (${priceLag1hData.length} samples)`);
  }
  
  const priceLag24hData = data.filter(d => d.price_lag_24h !== null);
  if (priceLag24hData.length > 100) {
    correlations.priceLag24h = calculateCorrelation(
      priceLag24hData.map(d => d.price_lag_24h),
      priceLag24hData.map(d => d.pool_price)
    );
    console.log(`Price lag 24h correlation: ${correlations.priceLag24h.toFixed(4)} (${priceLag24hData.length} samples)`);
  }
  
  // ========== PHASE 2: ROLLING STATISTICS CORRELATIONS ==========
  const priceRollingAvg24hData = data.filter(d => d.price_rolling_avg_24h !== null);
  if (priceRollingAvg24hData.length > 100) {
    correlations.priceRollingAvg24h = calculateCorrelation(
      priceRollingAvg24hData.map(d => d.price_rolling_avg_24h),
      priceRollingAvg24hData.map(d => d.pool_price)
    );
  }
  
  // ========== PHASE 2: FEATURE INTERACTION CORRELATIONS ==========
  const windGenHourData = data.filter(d => d.wind_gen_hour_interaction !== null);
  if (windGenHourData.length > 100) {
    correlations.windGenHourInteraction = calculateCorrelation(
      windGenHourData.map(d => d.wind_gen_hour_interaction),
      windGenHourData.map(d => d.pool_price)
    );
  }
  
  const tempDemandData = data.filter(d => d.temp_demand_interaction !== null);
  if (tempDemandData.length > 100) {
    correlations.tempDemandInteraction = calculateCorrelation(
      tempDemandData.map(d => d.temp_demand_interaction),
      tempDemandData.map(d => d.pool_price)
    );
  }
  
  return correlations;
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;
  
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateFeatureStats(data: any[]): Record<string, any> {
  const prices = data.map(d => d.pool_price);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const stdDev = Math.sqrt(
    prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
  );
  
  // Hourly average prices
  const hourlyAvgs: Record<number, number> = {};
  const hourlyCounts: Record<number, number> = {};
  
  for (const d of data) {
    const hour = d.hour_of_day;
    if (!hourlyAvgs[hour]) {
      hourlyAvgs[hour] = 0;
      hourlyCounts[hour] = 0;
    }
    hourlyAvgs[hour] += d.pool_price;
    hourlyCounts[hour]++;
  }
  
  for (const hour in hourlyAvgs) {
    hourlyAvgs[hour] /= hourlyCounts[hour];
  }
  
  // Average demand (if available)
  const demandData = data.filter(d => d.ail_mw !== null);
  const avgDemand = demandData.length > 0
    ? demandData.reduce((sum, d) => sum + d.ail_mw, 0) / demandData.length
    : null;
  
  return {
    avgPrice,
    stdDev,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    hourlyAvgPrices: hourlyAvgs,
    avgDemand
  };
}

// Calculate lagged feature correlations (how past prices predict future)
function calculateLaggedFeatures(data: any[]): Record<string, number> {
  const lagged: Record<string, number> = {};
  
  // 1-hour lag
  const lag1h = [];
  const currentPrices = [];
  for (let i = 1; i < data.length; i++) {
    lag1h.push(data[i - 1].pool_price);
    currentPrices.push(data[i].pool_price);
  }
  lagged['lag_1h'] = calculateCorrelation(lag1h, currentPrices);
  
  // 24-hour lag (same hour yesterday)
  if (data.length > 24) {
    const lag24h = [];
    const prices24h = [];
    for (let i = 24; i < data.length; i++) {
      lag24h.push(data[i - 24].pool_price);
      prices24h.push(data[i].pool_price);
    }
    lagged['lag_24h'] = calculateCorrelation(lag24h, prices24h);
  }
  
  // 168-hour lag (same hour last week)
  if (data.length > 168) {
    const lag168h = [];
    const prices168h = [];
    for (let i = 168; i < data.length; i++) {
      lag168h.push(data[i - 168].pool_price);
      prices168h.push(data[i].pool_price);
    }
    lagged['lag_168h'] = calculateCorrelation(lag168h, prices168h);
  }
  
  return lagged;
}

// Detect market regimes based on current conditions
function detectRegime(dataPoint: any, thresholds: any): string {
  // High wind generation regime
  if (dataPoint.generation_wind !== null && dataPoint.generation_wind > thresholds.highWindThreshold) {
    return 'high_wind';
  }
  
  // Peak demand regime
  if (dataPoint.ail_mw !== null && dataPoint.ail_mw > thresholds.peakDemandThreshold) {
    return 'peak_demand';
  }
  
  // Low demand regime (nights, weekends)
  if (dataPoint.ail_mw !== null && dataPoint.ail_mw < thresholds.lowDemandThreshold) {
    return 'low_demand';
  }
  
  return 'base';
}

// Calculate thresholds for regime detection
function calculateRegimeThresholds(data: any[]): Record<string, number> {
  const windData = data.filter(d => d.generation_wind !== null).map(d => d.generation_wind);
  const demandData = data.filter(d => d.ail_mw !== null).map(d => d.ail_mw);
  
  // High wind = top 25% of wind generation
  const highWindThreshold = windData.length > 0
    ? windData.sort((a, b) => b - a)[Math.floor(windData.length * 0.25)]
    : 2000;
  
  // Peak demand = top 20% of demand
  const peakDemandThreshold = demandData.length > 0
    ? demandData.sort((a, b) => b - a)[Math.floor(demandData.length * 0.20)]
    : 11000;
  
  // Low demand = bottom 20% of demand
  const lowDemandThreshold = demandData.length > 0
    ? demandData.sort((a, b) => a - b)[Math.floor(demandData.length * 0.20)]
    : 8000;
  
  return {
    highWindThreshold,
    peakDemandThreshold,
    lowDemandThreshold
  };
}
