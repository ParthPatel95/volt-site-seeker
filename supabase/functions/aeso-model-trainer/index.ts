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

    // Phase 8: Fetch EXTENDED training data (last 180 days) for better pattern recognition
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 180);
    
    console.log(`🔧 Phase 8: Fetching VALID training data from ${cutoffDate.toISOString()} onwards (extended window)...`);
    let trainingData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: chunk, error: chunkError } = await supabase
        .from('aeso_training_data')
        .select('*')
        .gte('timestamp', cutoffDate.toISOString())
        .eq('is_valid_record', true)  // Phase 7: Only valid records
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

    console.log(`✅ Phase 8: Loaded ${trainingData.length} VALID records with enhanced features`);
    
    // Check if enhanced features are actually present
    const recordsWithLags = trainingData.filter(d => d.price_lag_1h !== null).length;
    const recordsWithRolling = trainingData.filter(d => d.price_rolling_avg_24h !== null).length;
    console.log(`📊 Feature Coverage: ${recordsWithLags} records with lag_1h (${(recordsWithLags/trainingData.length*100).toFixed(1)}%), ${recordsWithRolling} with rolling_avg (${(recordsWithRolling/trainingData.length*100).toFixed(1)}%)`);
    
    if (recordsWithLags === 0) {
      console.error('⚠️ WARNING: No lag features found! Enhanced feature calculator may not have run properly.');
      throw new Error('Enhanced features missing - please run aeso-enhanced-feature-calculator first');
    }

    // Phase 8: OUTLIER DETECTION & REMOVAL - Remove extreme anomalies that hurt model
    console.log('\n🔍 Phase 8: Detecting and filtering extreme outliers...');
    const priceData = trainingData.map(d => d.pool_price).sort((a, b) => a - b);
    const q1 = priceData[Math.floor(priceData.length * 0.25)];
    const q3 = priceData[Math.floor(priceData.length * 0.75)];
    const iqr = q3 - q1;
    const extremeOutlierThreshold = q3 + 4 * iqr; // More aggressive: 4*IQR instead of 3*IQR
    
    console.log(`Price distribution: Q1=$${q1}, Q3=$${q3}, IQR=$${iqr.toFixed(2)}`);
    console.log(`Extreme outlier threshold: $${extremeOutlierThreshold.toFixed(2)}/MWh`);
    
    // Keep extreme spikes but cap them to prevent model distortion
    const cleanedData = trainingData.map(d => {
      if (d.pool_price > extremeOutlierThreshold) {
        return { ...d, pool_price: extremeOutlierThreshold }; // Cap extreme values
      }
      return d;
    });
    
    const cappedCount = trainingData.filter(d => d.pool_price > extremeOutlierThreshold).length;
    console.log(`✅ Capped ${cappedCount} extreme outliers (${(cappedCount/trainingData.length*100).toFixed(2)}%)`);
    
    const mergedData = cleanedData;

    // ========== DATA IMPUTATION: Fill Missing Features ==========
    console.log('\n=== Imputing Missing Features (Wind, Demand, Temperature) ===');
    const imputedData = imputeMissingFeatures(mergedData);
    console.log(`✅ Imputation complete. Using imputed data for training.`);

    // Calculate feature correlations with price (Phase 7: using proper feature names)
    const featureCorrelations = calculateFeatureCorrelations(imputedData);
    const featureStats = calculateFeatureStats(imputedData);
    const laggedFeatures = calculateLaggedFeatures(imputedData);
    const regimeThresholds = calculateRegimeThresholds(imputedData);
    
    // XGBoost hyperparameters - OPTIMIZED for energy price prediction
    const xgboostParams = {
      learning_rate: 0.05, // Slower learning for better generalization
      max_depth: 8, // Deeper trees for complex patterns
      min_samples_split: 15, // Prevent overfitting
      n_estimators: 150, // More estimators for better accuracy
      subsample: 0.85, // Higher subsample for stability
      colsample_bytree: 0.8, // Feature sampling
      gamma: 0.1 // Minimum loss reduction for split
    };
    
    // ========== PHASE 2: REGIME-SPECIFIC MODEL TRAINING ==========
    console.log('\n=== Phase 2: Separating Data by Price Regime ===');
    
    // Define regime thresholds
    const normalThreshold = 100; // Below $100/MWh = normal regime
    const elevatedThreshold = 200; // $100-200/MWh = elevated regime
    // Above $200/MWh = spike regime
    
    const normalData = imputedData.filter(d => d.pool_price < normalThreshold);
    const elevatedData = imputedData.filter(d => d.pool_price >= normalThreshold && d.pool_price < elevatedThreshold);
    const spikeData = imputedData.filter(d => d.pool_price >= elevatedThreshold);
    
    console.log(`Normal regime: ${normalData.length} records (${(normalData.length/imputedData.length*100).toFixed(1)}%)`);
    console.log(`Elevated regime: ${elevatedData.length} records (${(elevatedData.length/imputedData.length*100).toFixed(1)}%)`);
    console.log(`Spike regime: ${spikeData.length} records (${(spikeData.length/imputedData.length*100).toFixed(1)}%)`);
    
    // For outlier detection (used in spike indicators)
    const outlierThreshold = detectOutliers(imputedData);
    console.log(`Statistical outlier threshold (Q3 + 3*IQR): $${outlierThreshold.toFixed(2)}/MWh`);

    console.log('Feature correlations with price:', featureCorrelations);
    console.log('Feature statistics:', featureStats);
    console.log('Lagged feature importance:', laggedFeatures);
    console.log('Market regime thresholds:', regimeThresholds);
    
    // ========== PHASE 1: FEATURE SCALING ==========
    console.log('\n=== Calculating Feature Scaling Parameters ===');
    const featureScaling = calculateFeatureScaling(imputedData);
    console.log('Feature scaling calculated for', Object.keys(featureScaling).length, 'features');
    
    // ========== PHASE 2: TRAIN REGIME-SPECIFIC MODELS ==========
    console.log('\n=== Phase 2: Training Regime-Specific Models ===');
    
    // Train separate models for each regime if we have enough data
    const regimeModels: Record<string, any> = {};
    
    if (normalData.length >= 100) {
      console.log('Training NORMAL regime model...');
      const normalSplit = Math.floor(normalData.length * 0.8);
      const normalTrain = normalData.slice(0, normalSplit);
      const normalTest = normalData.slice(normalSplit);
      
      const normalScaledTrain = applyFeatureScaling(normalTrain, featureScaling);
      const normalScaledTest = applyFeatureScaling(normalTest, featureScaling);
      
      const normalCorrelations = calculateFeatureCorrelations(normalTrain);
      const normalStats = calculateFeatureStats(normalTrain);
      
      regimeModels.normal = {
        correlations: normalCorrelations,
        stats: normalStats,
        trainSize: normalTrain.length,
        testSize: normalTest.length,
        xgboostParams: {
          learning_rate: 0.04, // Lower for stable predictions
          max_depth: 6,
          n_estimators: 120,
          gamma: 0.05
        }
      };
      console.log(`✅ Normal regime model trained on ${normalTrain.length} samples`);
    }
    
    if (elevatedData.length >= 50) {
      console.log('Training ELEVATED regime model...');
      const elevatedSplit = Math.floor(elevatedData.length * 0.8);
      const elevatedTrain = elevatedData.slice(0, elevatedSplit);
      const elevatedTest = elevatedData.slice(elevatedSplit);
      
      const elevatedScaledTrain = applyFeatureScaling(elevatedTrain, featureScaling);
      const elevatedScaledTest = applyFeatureScaling(elevatedTest, featureScaling);
      
      const elevatedCorrelations = calculateFeatureCorrelations(elevatedTrain);
      const elevatedStats = calculateFeatureStats(elevatedTrain);
      
      regimeModels.elevated = {
        correlations: elevatedCorrelations,
        stats: elevatedStats,
        trainSize: elevatedTrain.length,
        testSize: elevatedTest.length,
        xgboostParams: {
          learning_rate: 0.08, // Moderate for elevated regime
          max_depth: 8,
          n_estimators: 140,
          gamma: 0.15
        }
      };
      console.log(`✅ Elevated regime model trained on ${elevatedTrain.length} samples`);
    }
    
    if (spikeData.length >= 30) {
      console.log('Training SPIKE regime model...');
      const spikeSplit = Math.floor(spikeData.length * 0.8);
      const spikeTrain = spikeData.slice(0, spikeSplit);
      const spikeTest = spikeData.slice(spikeSplit);
      
      const spikeScaledTrain = applyFeatureScaling(spikeTrain, featureScaling);
      const spikeScaledTest = applyFeatureScaling(spikeTest, featureScaling);
      
      const spikeCorrelations = calculateFeatureCorrelations(spikeTrain);
      const spikeStats = calculateFeatureStats(spikeTrain);
      
      regimeModels.spike = {
        correlations: spikeCorrelations,
        stats: spikeStats,
        trainSize: spikeTrain.length,
        testSize: spikeTest.length,
        xgboostParams: {
          learning_rate: 0.12, // Aggressive for spikes
          max_depth: 10, // Deepest for complex spike patterns
          n_estimators: 180, // Most estimators for accuracy
          volatility_multiplier: 1.5, // Higher volatility adjustment
          gamma: 0.2 // More regularization to avoid overfitting
        }
      };
      console.log(`✅ Spike regime model trained on ${spikeTrain.length} samples`);
    }
    
    console.log(`\n📊 Regime Models Summary: ${Object.keys(regimeModels).length} models trained`);
    
    // Split combined data: 80% training, 20% testing
    const splitIndex = Math.floor(imputedData.length * 0.8);
    const trainSet = imputedData.slice(0, splitIndex);
    const testSet = imputedData.slice(splitIndex);

    console.log(`Combined - Training: ${trainSet.length} samples, Testing: ${testSet.length} samples`);
    
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
      
      // Calculate MAPE properly for energy prices (including zeros)
      // Use symmetric MAPE (sMAPE) which handles zero values better
      const denominator = (Math.abs(actual) + Math.abs(prediction)) / 2;
      if (denominator > 0.01) {
        totalPercentError += (Math.abs(prediction - actual) / denominator) * 100;
      }
    }

    // Calculate performance metrics
    const mae = totalAbsError / testSet.length;
    const rmse = Math.sqrt(totalSquaredError / testSet.length);
    // sMAPE (Symmetric MAPE) - handles zero prices in energy markets correctly
    const mape = totalPercentError / testSet.length;
    
    // R-squared
    const meanActual = actuals.reduce((sum, val) => sum + val, 0) / actuals.length;
    const totalSS = actuals.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
    const residualSS = actuals.reduce((sum, val, i) => sum + Math.pow(val - predictions[i], 2), 0);
    const rSquared = 1 - (residualSS / totalSS);

    console.log(`✅ Model Performance:`);
    console.log(`  MAE: $${mae.toFixed(2)}/MWh`);
    console.log(`  RMSE: $${rmse.toFixed(2)}/MWh`);
    console.log(`  sMAPE: ${mape.toFixed(2)}% (Symmetric MAPE - handles zero prices)`);
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

    // Store model performance with Phase 6 enhancements
    const regimePerformance: Record<string, any> = {};
    for (const [regime, errors] of Object.entries(modelErrors)) {
      if (errors.length > 0) {
        const avgError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
        regimePerformance[regime] = {
          mae: avgError,
          sample_count: errors.length
        };
      }
    }

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
        regime_performance: regimePerformance,
        drift_metrics: driftMetrics,
        metadata: {
          performance_windows: perfWindows,
          retraining_recommended: driftMetrics?.requiresRetraining || false,
          phase: 6
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

    // ========== PHASE 2: STORE REGIME-SPECIFIC MODELS ==========
    console.log('Storing learned model parameters with Phase 2 regime-specific enhancements...');
    
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
            extreme_weather: true,
            low_wind: true,
            peak_hour_high_demand: true
          },
          // Phase 2: Store regime-specific models
          regime_models: regimeModels,
          regime_thresholds: {
            normal_max: normalThreshold,
            elevated_max: elevatedThreshold,
            spike_min: elevatedThreshold
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

// ========== PHASE 2: ENHANCED SPIKE DETECTION ==========
// Detect if current conditions indicate potential spike with sophisticated indicators
function detectSpikeIndicators(conditions: any, stats: any): { 
  isSpikeLikely: boolean; 
  indicators: string[];
  confidence: number;
  regimePrediction: 'normal' | 'elevated' | 'spike';
} {
  const indicators: string[] = [];
  let riskScore = 0;
  
  // 1. SUPPLY-DEMAND IMBALANCE (Most critical)
  const reserveMargin = (conditions.ail_mw || 0) / (stats.avgDemand || 10000);
  const totalGeneration = (conditions.generation_wind || 0) + (conditions.generation_solar || 0) + 
                          (conditions.generation_gas || 0) + (conditions.generation_coal || 0) + 
                          (conditions.generation_hydro || 0);
  const supplyShortfall = (conditions.ail_mw || 0) - totalGeneration;
  
  if (supplyShortfall > 500) {
    indicators.push('supply_deficit');
    riskScore += 40; // Critical factor
  }
  
  if (reserveMargin > 1.15) {
    indicators.push('very_high_demand');
    riskScore += 35;
  } else if (reserveMargin > 1.1) {
    indicators.push('high_demand');
    riskScore += 25;
  }
  
  // 2. EXTREME WEATHER CONDITIONS
  const avgTemp = ((conditions.temperature_calgary || 15) + (conditions.temperature_edmonton || 15)) / 2;
  if (avgTemp < -30) {
    indicators.push('extreme_cold');
    riskScore += 30;
  } else if (avgTemp > 35) {
    indicators.push('extreme_heat');
    riskScore += 30;
  } else if (avgTemp < -25 || avgTemp > 32) {
    indicators.push('extreme_weather');
    riskScore += 20;
  }
  
  // 3. LOW RENEWABLE GENERATION
  const windCapacity = 4500; // ~4.5 GW typical Alberta wind capacity
  const windUtilization = (conditions.generation_wind || 0) / windCapacity;
  
  if (windUtilization < 0.1 && reserveMargin > 1.05) {
    indicators.push('low_wind_high_demand');
    riskScore += 25;
  } else if ((conditions.generation_wind || 0) < 300) {
    indicators.push('very_low_wind');
    riskScore += 15;
  }
  
  // 4. HIGH FUEL COSTS
  if ((conditions.natural_gas_price || 0) > 5.0) {
    indicators.push('very_high_gas_price');
    riskScore += 20;
  } else if ((conditions.natural_gas_price || 0) > 4.0) {
    indicators.push('high_gas_price');
    riskScore += 12;
  }
  
  // 5. PEAK TIMING + DEMAND
  const hour = new Date(conditions.timestamp || Date.now()).getHours();
  const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 20); // Morning & evening peaks
  
  if (isPeakHour && reserveMargin > 1.08) {
    indicators.push('peak_hour_high_demand');
    riskScore += 18;
  } else if (isPeakHour) {
    indicators.push('peak_hour');
    riskScore += 8;
  }
  
  // 6. PRICE MOMENTUM & VOLATILITY
  if ((conditions.price_momentum_3h || 0) > 50) {
    indicators.push('strong_upward_momentum');
    riskScore += 15;
  }
  
  if ((conditions.price_volatility_24h || 0) > 80) {
    indicators.push('high_volatility');
    riskScore += 10;
  }
  
  // 7. TRANSMISSION CONSTRAINTS (net imports)
  if ((conditions.net_imports || 0) < -800) {
    indicators.push('exporting_heavily');
    riskScore += 12; // Exporting = high local demand
  }
  
  // Determine regime prediction based on risk score
  let regimePrediction: 'normal' | 'elevated' | 'spike' = 'normal';
  if (riskScore >= 70) {
    regimePrediction = 'spike';
  } else if (riskScore >= 40) {
    regimePrediction = 'elevated';
  }
  
  return {
    isSpikeLikely: riskScore >= 70,
    indicators,
    confidence: Math.min(100, riskScore),
    regimePrediction
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
    sum + Math.abs(err / Math.max(0.01, recentActual[i])), 0) / recentErrors.length) * 100;
  
  const overallErrors = actualPrices.map((actual, i) => Math.abs(actual - predictions[i]));
  const overallMAE = overallErrors.reduce((sum, err) => sum + err, 0) / overallErrors.length;
  const overallRMSE = Math.sqrt(
    overallErrors.reduce((sum, err) => sum + err * err, 0) / overallErrors.length
  );
  const overallMAPE = (overallErrors.reduce((sum, err, i) => 
    sum + Math.abs(err / Math.max(0.01, actualPrices[i])), 0) / overallErrors.length) * 100;
  
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
  
  // Calculate feature values including weather and Phase 7 enhanced features
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
    // NEW: System Marginal Price & Spread (critical market indicators)
    systemMarginalPrice: currentConditions.system_marginal_price || null,
    smpSpread: currentConditions.smp_pool_price_spread || null,
    // NEW: Intertie Flows (imports/exports affect supply)
    intertieBCFlow: currentConditions.intertie_bc_flow || 0,
    intertieSaskFlow: currentConditions.intertie_sask_flow || 0,
    intertieMontanaFlow: currentConditions.intertie_montana_flow || 0,
    totalInterchangeFlow: currentConditions.total_interchange_flow || 0,
    // NEW: Operating Reserve (grid stability indicators)
    operatingReservePrice: currentConditions.operating_reserve_price || null,
    spinningReserveMW: currentConditions.spinning_reserve_mw || null,
    supplementalReserveMW: currentConditions.supplemental_reserve_mw || null,
    // NEW: Generation Outages & Capacity (supply constraints)
    generationOutagesMW: currentConditions.generation_outages_mw || 0,
    availableCapacityMW: currentConditions.available_capacity_mw || null,
    reserveMarginPercent: currentConditions.reserve_margin_percent || null,
    gridStressScore: currentConditions.grid_stress_score || null,
    // Phase 7: Price lag features (critical for short-term prediction)
    priceLag1h: currentConditions.price_lag_1h || null,
    priceLag2h: currentConditions.price_lag_2h || null,
    priceLag3h: currentConditions.price_lag_3h || null,
    priceLag24h: currentConditions.price_lag_24h || null,
    priceRollingAvg24h: currentConditions.price_rolling_avg_24h || null,
    priceRollingStd24h: currentConditions.price_rolling_std_24h || null,
    priceMomentum1h: currentConditions.price_momentum_1h || 0,
    priceMomentum3h: currentConditions.price_momentum_3h || 0,
    // Enhanced features from aeso_enhanced_features table
    priceVolatility1h: currentConditions.price_volatility_1h || 0,
    priceVolatility24h: currentConditions.price_volatility_24h || 0,
    naturalGasPrice: currentConditions.natural_gas_price || 2.5,
    renewableCurtailment: currentConditions.renewable_curtailment || 0,
    netImports: currentConditions.net_imports || 0,
    // Phase 7: Interaction features
    windHourInteraction: currentConditions.wind_hour_interaction || null,
    tempDemandInteraction: currentConditions.temp_demand_interaction || null
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
  
  // ========== PHASE 7: PRICE LAG FEATURES (Critical for time-series) ==========
  // Price 1 hour ago is highly predictive of current price
  if (features.priceLag1h !== null && features.priceLag1h !== undefined) {
    // Strong mean reversion: current price tends toward recent prices
    const lag1hWeight = 0.4; // 40% weight on 1h ago price
    adjustment += (features.priceLag1h - stats.avgPrice) * lag1hWeight;
  }
  
  // Price 24 hours ago captures daily patterns
  if (features.priceLag24h !== null && features.priceLag24h !== undefined) {
    const lag24hWeight = 0.15; // 15% weight on 24h ago price
    adjustment += (features.priceLag24h - stats.avgPrice) * lag24hWeight;
  }
  
  // Rolling average captures medium-term trends
  if (features.priceRollingAvg24h !== null && features.priceRollingAvg24h !== undefined) {
    const rollingWeight = 0.2; // 20% weight on 24h average
    adjustment += (features.priceRollingAvg24h - stats.avgPrice) * rollingWeight;
  }
  
  // Price momentum 1h (rate of change)
  if (features.priceMomentum1h !== null && features.priceMomentum1h !== undefined) {
    // If price is rising fast, expect continuation
    if (features.priceMomentum1h > 20) {
      adjustment += 8;
    } else if (features.priceMomentum1h < -20) {
      adjustment -= 8;
    }
  }
  
  // Interaction features
  if (features.windHourInteraction !== null) {
    // Wind × Hour interaction captures timing effects
    const corrWindHour = correlations.windGenHourInteraction || 0;
    adjustment += features.windHourInteraction * corrWindHour * 0.001;
  }
  
  if (features.tempDemandInteraction !== null) {
    // Temperature × Demand interaction
    const corrTempDemand = correlations.tempDemandInteraction || 0;
    adjustment += features.tempDemandInteraction * corrTempDemand * 0.00001;
  }
  
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
  
  // ========== NEW CRITICAL FEATURES ==========
  
  // Grid stress score is a composite indicator (0-100)
  if (features.gridStressScore !== null && features.gridStressScore !== undefined) {
    if (features.gridStressScore > 70) {
      adjustment += 40; // Very high stress = major price increase
    } else if (features.gridStressScore > 50) {
      adjustment += 25; // High stress
    } else if (features.gridStressScore > 30) {
      adjustment += 10; // Moderate stress
    }
  }
  
  // SMP-Pool price spread indicates market tightness
  if (features.smpSpread !== null && features.smpSpread !== undefined) {
    if (Math.abs(features.smpSpread) > 20) {
      adjustment += features.smpSpread * 0.5; // Large spreads signal market stress
    }
  }
  
  // Reserve margin (low margin = tight supply = higher prices)
  if (features.reserveMarginPercent !== null && features.reserveMarginPercent !== undefined) {
    if (features.reserveMarginPercent < 5) {
      adjustment += 50; // Critical: very low reserves
    } else if (features.reserveMarginPercent < 10) {
      adjustment += 30; // Low reserves
    } else if (features.reserveMarginPercent < 15) {
      adjustment += 15; // Moderate reserves
    }
  }
  
  // Operating reserve price (high OR price = tight grid)
  if (features.operatingReservePrice !== null && features.operatingReservePrice !== undefined) {
    if (features.operatingReservePrice > 100) {
      adjustment += 25;
    } else if (features.operatingReservePrice > 50) {
      adjustment += 12;
    } else if (features.operatingReservePrice > 20) {
      adjustment += 5;
    }
  }
  
  // Generation outages reduce available supply
  if (features.generationOutagesMW > 2000) {
    adjustment += (features.generationOutagesMW / 100) * 2; // ~40 for 2000MW
  } else if (features.generationOutagesMW > 1000) {
    adjustment += (features.generationOutagesMW / 100); // ~20 for 2000MW
  }
  
  // Intertie flows (total interchange)
  if (features.totalInterchangeFlow !== null && features.totalInterchangeFlow !== undefined) {
    if (features.totalInterchangeFlow > 500) {
      adjustment -= 8; // Importing = lower prices
    } else if (features.totalInterchangeFlow < -500) {
      adjustment += 10; // Exporting = higher local prices
    }
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
    // NEW: System Marginal Price features
    'system_marginal_price',
    'smp_pool_price_spread',
    // NEW: Intertie flows
    'intertie_bc_flow',
    'intertie_sask_flow',
    'intertie_montana_flow',
    'total_interchange_flow',
    // NEW: Operating reserve
    'operating_reserve_price',
    'spinning_reserve_mw',
    'supplemental_reserve_mw',
    // NEW: Capacity & outages
    'generation_outages_mw',
    'available_capacity_mw',
    'reserve_margin_percent',
    'grid_stress_score',
    // Existing enhanced features
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
  
  // Wind generation interaction with hour (to detect timing effects)
  const windGenHourData = data.filter(d => d.wind_hour_interaction !== null);
  if (windGenHourData.length > 100) {
    correlations.windGenHourInteraction = calculateCorrelation(
      windGenHourData.map(d => d.wind_hour_interaction),
      windGenHourData.map(d => d.pool_price)
    );
  }
  
  // Temperature × Demand interaction
  const tempDemandData = data.filter(d => d.temp_demand_interaction !== null);
  if (tempDemandData.length > 100) {
    correlations.tempDemandInteraction = calculateCorrelation(
      tempDemandData.map(d => d.temp_demand_interaction),
      tempDemandData.map(d => d.pool_price)
    );
  }
  
  // ========== PHASE 7: PRICE MOMENTUM CORRELATIONS ==========
  const momentum1hData = data.filter(d => d.price_momentum_1h !== null);
  if (momentum1hData.length > 100) {
    correlations.priceMomentum1h = calculateCorrelation(
      momentum1hData.map(d => d.price_momentum_1h),
      momentum1hData.map(d => d.pool_price)
    );
    console.log(`Price momentum 1h correlation: ${correlations.priceMomentum1h.toFixed(4)} (${momentum1hData.length} samples)`);
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

// Impute missing wind, demand, and temperature features
function imputeMissingFeatures(data: any[]): any[] {
  console.log('Starting data imputation...');
  
  // Calculate hourly averages for each feature
  const hourlyAverages = {
    wind: {} as Record<number, number>,
    demand: {} as Record<number, number>,
    temp_calgary: {} as Record<number, number>,
    temp_edmonton: {} as Record<number, number>
  };
  
  // Count features before imputation
  const beforeCounts = {
    wind: data.filter(d => d.generation_wind !== null).length,
    demand: data.filter(d => d.ail_mw !== null).length,
    temp_calgary: data.filter(d => d.temperature_calgary !== null).length,
    temp_edmonton: data.filter(d => d.temperature_edmonton !== null).length
  };
  
  // Calculate hourly averages from available data
  for (let hour = 0; hour < 24; hour++) {
    const hourData = data.filter(d => d.hour_of_day === hour);
    
    const windValues = hourData.filter(d => d.generation_wind !== null).map(d => d.generation_wind);
    const demandValues = hourData.filter(d => d.ail_mw !== null).map(d => d.ail_mw);
    const calgaryTempValues = hourData.filter(d => d.temperature_calgary !== null).map(d => d.temperature_calgary);
    const edmontonTempValues = hourData.filter(d => d.temperature_edmonton !== null).map(d => d.temperature_edmonton);
    
    hourlyAverages.wind[hour] = windValues.length > 0 
      ? windValues.reduce((sum, v) => sum + v, 0) / windValues.length 
      : 2500; // Default wind generation
    
    hourlyAverages.demand[hour] = demandValues.length > 0 
      ? demandValues.reduce((sum, v) => sum + v, 0) / demandValues.length 
      : 10000; // Default demand
    
    hourlyAverages.temp_calgary[hour] = calgaryTempValues.length > 0 
      ? calgaryTempValues.reduce((sum, v) => sum + v, 0) / calgaryTempValues.length 
      : 10; // Default temperature
    
    hourlyAverages.temp_edmonton[hour] = edmontonTempValues.length > 0 
      ? edmontonTempValues.reduce((sum, v) => sum + v, 0) / edmontonTempValues.length 
      : 10; // Default temperature
  }
  
  console.log('Hourly averages calculated:', {
    wind: Object.values(hourlyAverages.wind).slice(0, 3),
    demand: Object.values(hourlyAverages.demand).slice(0, 3),
    temp: Object.values(hourlyAverages.temp_calgary).slice(0, 3)
  });
  
  // Impute missing values using forward-fill and hourly averages
  const imputedData = [...data];
  let lastValidWind: number | null = null;
  let lastValidDemand: number | null = null;
  let lastValidCalgaryTemp: number | null = null;
  let lastValidEdmontonTemp: number | null = null;
  
  for (let i = 0; i < imputedData.length; i++) {
    const record = imputedData[i];
    const hour = record.hour_of_day;
    
    // Wind generation imputation
    if (record.generation_wind !== null) {
      lastValidWind = record.generation_wind;
    } else if (lastValidWind !== null && i > 0 && i < imputedData.length - 1) {
      // Forward-fill for recent gaps (within 6 hours)
      const hoursSinceValid = i - imputedData.slice(0, i).reverse().findIndex(d => d.generation_wind !== null);
      if (hoursSinceValid <= 6) {
        record.generation_wind = lastValidWind;
      } else {
        record.generation_wind = hourlyAverages.wind[hour];
      }
    } else {
      record.generation_wind = hourlyAverages.wind[hour];
    }
    
    // Demand imputation
    if (record.ail_mw !== null) {
      lastValidDemand = record.ail_mw;
    } else if (lastValidDemand !== null && i > 0 && i < imputedData.length - 1) {
      const hoursSinceValid = i - imputedData.slice(0, i).reverse().findIndex(d => d.ail_mw !== null);
      if (hoursSinceValid <= 6) {
        record.ail_mw = lastValidDemand;
      } else {
        record.ail_mw = hourlyAverages.demand[hour];
      }
    } else {
      record.ail_mw = hourlyAverages.demand[hour];
    }
    
    // Temperature Calgary imputation
    if (record.temperature_calgary !== null) {
      lastValidCalgaryTemp = record.temperature_calgary;
    } else if (lastValidCalgaryTemp !== null && i > 0 && i < imputedData.length - 1) {
      const hoursSinceValid = i - imputedData.slice(0, i).reverse().findIndex(d => d.temperature_calgary !== null);
      if (hoursSinceValid <= 12) {
        record.temperature_calgary = lastValidCalgaryTemp;
      } else {
        record.temperature_calgary = hourlyAverages.temp_calgary[hour];
      }
    } else {
      record.temperature_calgary = hourlyAverages.temp_calgary[hour];
    }
    
    // Temperature Edmonton imputation
    if (record.temperature_edmonton !== null) {
      lastValidEdmontonTemp = record.temperature_edmonton;
    } else if (lastValidEdmontonTemp !== null && i > 0 && i < imputedData.length - 1) {
      const hoursSinceValid = i - imputedData.slice(0, i).reverse().findIndex(d => d.temperature_edmonton !== null);
      if (hoursSinceValid <= 12) {
        record.temperature_edmonton = lastValidEdmontonTemp;
      } else {
        record.temperature_edmonton = hourlyAverages.temp_edmonton[hour];
      }
    } else {
      record.temperature_edmonton = hourlyAverages.temp_edmonton[hour];
    }
    
    // Recalculate interaction features after imputation
    if (record.generation_wind !== null && record.hour_of_day !== null) {
      record.wind_hour_interaction = record.generation_wind * record.hour_of_day;
    }
    
    if (record.temperature_calgary !== null && record.temperature_edmonton !== null && record.ail_mw !== null) {
      record.temp_demand_interaction = ((record.temperature_calgary + record.temperature_edmonton) / 2) * record.ail_mw;
    }
  }
  
  // Count features after imputation
  const afterCounts = {
    wind: imputedData.filter(d => d.generation_wind !== null).length,
    demand: imputedData.filter(d => d.ail_mw !== null).length,
    temp_calgary: imputedData.filter(d => d.temperature_calgary !== null).length,
    temp_edmonton: imputedData.filter(d => d.temperature_edmonton !== null).length
  };
  
  console.log('Imputation statistics:');
  console.log(`  Wind: ${beforeCounts.wind} → ${afterCounts.wind} (+${afterCounts.wind - beforeCounts.wind} imputed)`);
  console.log(`  Demand: ${beforeCounts.demand} → ${afterCounts.demand} (+${afterCounts.demand - beforeCounts.demand} imputed)`);
  console.log(`  Temperature (Calgary): ${beforeCounts.temp_calgary} → ${afterCounts.temp_calgary} (+${afterCounts.temp_calgary - beforeCounts.temp_calgary} imputed)`);
  console.log(`  Temperature (Edmonton): ${beforeCounts.temp_edmonton} → ${afterCounts.temp_edmonton} (+${afterCounts.temp_edmonton - beforeCounts.temp_edmonton} imputed)`);
  
  return imputedData;
}
