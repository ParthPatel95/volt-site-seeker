import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL_VERSION = 'v5.0-enhanced-xgboost';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 Starting Enhanced ML Model Training v5.0');
    console.log('📅 Training on ALL available data with recency weighting...');

    // ========== STEP 1: FETCH ALL TRAINING DATA ==========
    // First, get total count to ensure we use all records
    const { count: totalRecords } = await supabase
      .from('aeso_training_data')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total records in database: ${totalRecords}`);

    // Fetch ALL training data with required features (no limit)
    const { data: allData, error: dataError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .not('pool_price', 'is', null)
      .gt('pool_price', 0)
      .order('timestamp', { ascending: true });

    if (dataError || !allData || allData.length === 0) {
      throw new Error(`Failed to fetch training data: ${dataError?.message}`);
    }

    console.log(`📊 Loaded ${allData.length} valid records for training`);

    // ========== STEP 2: DATA QUALITY ANALYSIS ==========
    const recordsWithLagFeatures = allData.filter(d => d.price_lag_1h != null && d.price_lag_24h != null);
    const recordsWithWeather = allData.filter(d => d.temperature_calgary != null || d.temperature_edmonton != null);
    const recordsWithGeneration = allData.filter(d => d.generation_wind != null || d.generation_gas != null);
    
    console.log(`🔍 Data Quality:`);
    console.log(`   - With lag features: ${recordsWithLagFeatures.length} (${(recordsWithLagFeatures.length/allData.length*100).toFixed(1)}%)`);
    console.log(`   - With weather: ${recordsWithWeather.length} (${(recordsWithWeather.length/allData.length*100).toFixed(1)}%)`);
    console.log(`   - With generation: ${recordsWithGeneration.length} (${(recordsWithGeneration.length/allData.length*100).toFixed(1)}%)`);

    // Use records with lag features for training (best quality)
    const trainingData = recordsWithLagFeatures.length >= 1000 
      ? recordsWithLagFeatures 
      : allData;
    
    console.log(`✅ Using ${trainingData.length} records for training`);

    // ========== STEP 3: RECENCY-WEIGHTED FEATURE PREPARATION ==========
    const features = prepareFeatures(trainingData);
    console.log(`✅ Prepared ${features.length} feature vectors`);

    // Calculate date range
    const minDate = new Date(trainingData[0].timestamp);
    const maxDate = new Date(trainingData[trainingData.length - 1].timestamp);
    const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    console.log(`📅 Date range: ${minDate.toISOString().split('T')[0]} to ${maxDate.toISOString().split('T')[0]} (${totalDays.toFixed(0)} days)`);

    // ========== STEP 4: TIME-BASED TRAIN/VALIDATION SPLIT ==========
    // Use last 30 days for validation, rest for training
    const validationDays = 30;
    const validationStart = new Date(maxDate.getTime() - validationDays * 24 * 60 * 60 * 1000);
    
    const trainSet = features.filter(f => new Date(f.timestamp) < validationStart);
    const validSet = features.filter(f => new Date(f.timestamp) >= validationStart);

    console.log(`📈 Train: ${trainSet.length} records, Validation: ${validSet.length} records`);

    // ========== STEP 5: TRAIN WITH RECENCY WEIGHTING ==========
    const model = trainGradientBoostingModelWithRecency(trainSet, validationStart);
    console.log('✅ Model training completed with recency weighting');

    // ========== STEP 6: VALIDATE MODEL PERFORMANCE ==========
    const validation = validateModel(model, validSet);
    console.log(`📊 Validation Metrics:`);
    console.log(`   - sMAPE: ${validation.smape.toFixed(2)}%`);
    console.log(`   - MAE: $${validation.mae.toFixed(2)}`);
    console.log(`   - RMSE: $${validation.rmse.toFixed(2)}`);
    console.log(`   - R²: ${validation.r2.toFixed(4)}`);

    // ========== STEP 7: CALCULATE REGIME-SPECIFIC PERFORMANCE ==========
    const regimePerformance = calculateRegimePerformance(model, validSet);
    console.log(`📊 Regime Performance:`);
    Object.entries(regimePerformance).forEach(([regime, metrics]: [string, any]) => {
      if (metrics.count > 0) {
        console.log(`   - ${regime}: MAE=$${metrics.mae.toFixed(2)}, n=${metrics.count}`);
      }
    });

    // ========== STEP 8: SAVE MODEL PARAMETERS ==========
    await saveModelParameters(supabase, model, validation, trainingData.length);
    console.log('💾 Model parameters saved');

    // ========== STEP 9: TRACK PERFORMANCE IN DATABASE ==========
    await supabase.from('aeso_model_performance').insert({
      model_version: MODEL_VERSION,
      smape: validation.smape,
      mae: validation.mae,
      rmse: validation.rmse,
      r_squared: validation.r2,
      training_records: trainingData.length,
      training_period_start: trainingData[0].timestamp,
      training_period_end: trainingData[trainingData.length - 1].timestamp,
      feature_importance: model.featureImportance,
      regime_performance: regimePerformance,
      evaluation_date: new Date().toISOString(),
      metadata: {
        total_database_records: totalRecords,
        records_with_lag_features: recordsWithLagFeatures.length,
        training_days: totalDays,
        validation_days: validationDays,
        recency_half_life_days: 30
      }
    });

    // ========== STEP 10: UPDATE MODEL STATUS ==========
    await supabase.from('aeso_model_status').upsert({
      model_version: MODEL_VERSION,
      trained_at: new Date().toISOString(),
      mae: validation.mae,
      rmse: validation.rmse,
      smape: validation.smape,
      r_squared: validation.r2,
      training_records: trainingData.length,
      predictions_evaluated: 0,
      model_quality: validation.smape < 15 ? 'excellent' : 
                     validation.smape < 25 ? 'good' : 
                     validation.smape < 35 ? 'fair' : 'needs_improvement',
      available_training_records: totalRecords || trainingData.length,
      records_with_features: recordsWithLagFeatures.length
    }, { onConflict: 'model_version' });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Training completed in ${duration}s`);

    return new Response(JSON.stringify({
      success: true,
      model_version: MODEL_VERSION,
      training_records: trainingData.length,
      total_available_records: totalRecords,
      date_range: {
        start: trainingData[0].timestamp,
        end: trainingData[trainingData.length - 1].timestamp,
        days: totalDays
      },
      performance: {
        smape: validation.smape,
        mae: validation.mae,
        rmse: validation.rmse,
        r2: validation.r2
      },
      regime_performance: regimePerformance,
      feature_importance: model.featureImportance,
      duration_seconds: duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Training error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

interface FeatureVector {
  timestamp: string;
  target: number;
  recencyWeight: number;
  features: {
    price_lag_1h: number;
    price_lag_2h: number;
    price_lag_3h: number;
    price_lag_6h: number;
    price_lag_24h: number;
    price_lag_168h: number;
    price_rolling_avg_24h: number;
    price_rolling_std_24h: number;
    price_momentum_1h: number;
    price_momentum_3h: number;
    hour: number;
    day_of_week: number;
    month: number;
    is_weekend: number;
    is_peak_hour: number;
    ail_mw: number;
    demand_lag_3h: number;
    generation_wind: number;
    generation_solar: number;
    generation_gas: number;
    renewable_penetration: number;
    temperature_avg: number;
    net_demand: number;
    reserve_margin_percent: number;
    price_volatility_6h: number;
  };
}

function prepareFeatures(data: any[]): FeatureVector[] {
  const now = new Date();
  const halfLifeDays = 30; // Recent data is weighted more heavily
  
  return data
    .filter(d => d.pool_price != null && d.pool_price > 0)
    .map(d => {
      const recordDate = new Date(d.timestamp);
      const daysSinceRecord = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Exponential decay weight - recent data matters more
      const recencyWeight = Math.exp(-daysSinceRecord / halfLifeDays);
      
      const hour = recordDate.getHours();
      const dayOfWeek = recordDate.getDay();
      const month = recordDate.getMonth() + 1;
      
      // Peak hours: 7-9 AM and 5-9 PM
      const isPeakHour = ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 21)) ? 1 : 0;
      
      return {
        timestamp: d.timestamp,
        target: d.pool_price,
        recencyWeight: Math.max(0.1, recencyWeight), // Minimum weight 0.1
        features: {
          price_lag_1h: d.price_lag_1h || d.pool_price,
          price_lag_2h: d.price_lag_2h || d.price_lag_1h || d.pool_price,
          price_lag_3h: d.price_lag_3h || d.pool_price,
          price_lag_6h: d.price_lag_6h || d.pool_price,
          price_lag_24h: d.price_lag_24h || d.pool_price,
          price_lag_168h: d.price_lag_168h || d.price_lag_24h || d.pool_price,
          price_rolling_avg_24h: d.price_rolling_avg_24h || d.pool_price,
          price_rolling_std_24h: d.price_rolling_std_24h || 10,
          price_momentum_1h: d.price_momentum_1h || 0,
          price_momentum_3h: d.price_momentum_3h || 0,
          hour,
          day_of_week: dayOfWeek,
          month,
          is_weekend: (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0,
          is_peak_hour: isPeakHour,
          ail_mw: d.ail_mw || 9500,
          demand_lag_3h: d.demand_lag_3h || d.ail_mw || 9500,
          generation_wind: d.generation_wind || 0,
          generation_solar: d.generation_solar || 0,
          generation_gas: d.generation_gas || 0,
          renewable_penetration: d.renewable_penetration || 0,
          temperature_avg: ((d.temperature_calgary || 10) + (d.temperature_edmonton || 10)) / 2,
          net_demand: d.net_demand || d.ail_mw || 9500,
          reserve_margin_percent: d.reserve_margin_percent || 15,
          price_volatility_6h: d.price_volatility_6h || 10
        }
      };
    });
}

interface GradientBoostingModel {
  trees: DecisionTree[];
  learningRate: number;
  featureImportance: { [key: string]: number };
  meanTarget: number;
  stdTarget: number;
  recentMeanTarget: number;
}

interface DecisionTree {
  splits: TreeNode[];
}

interface TreeNode {
  feature: string;
  threshold: number;
  leftValue?: number;
  rightValue?: number;
  leftNode?: TreeNode;
  rightNode?: TreeNode;
}

function trainGradientBoostingModelWithRecency(trainSet: FeatureVector[], validationStart: Date): GradientBoostingModel {
  const numTrees = 150;
  const learningRate = 0.08;
  const maxDepth = 7;
  
  // Calculate weighted target statistics
  let weightedSum = 0;
  let weightedSquareSum = 0;
  let totalWeight = 0;
  
  for (const d of trainSet) {
    weightedSum += d.target * d.recencyWeight;
    weightedSquareSum += d.target * d.target * d.recencyWeight;
    totalWeight += d.recencyWeight;
  }
  
  const meanTarget = weightedSum / totalWeight;
  const variance = (weightedSquareSum / totalWeight) - (meanTarget * meanTarget);
  const stdTarget = Math.sqrt(Math.max(0, variance));
  
  // Calculate recent mean (last 30 days only)
  const recentRecords = trainSet.filter(d => new Date(d.timestamp) >= new Date(validationStart.getTime() - 30 * 24 * 60 * 60 * 1000));
  const recentMeanTarget = recentRecords.length > 0 
    ? recentRecords.reduce((sum, d) => sum + d.target, 0) / recentRecords.length
    : meanTarget;
  
  console.log(`🎯 Target stats - Mean: $${meanTarget.toFixed(2)}, Recent Mean: $${recentMeanTarget.toFixed(2)}, StdDev: $${stdTarget.toFixed(2)}`);
  
  // Initialize predictions with weighted mean
  let predictions = trainSet.map(() => meanTarget);
  const trees: DecisionTree[] = [];
  const featureImportance: { [key: string]: number } = {};
  
  const featureNames = Object.keys(trainSet[0].features);
  featureNames.forEach(f => featureImportance[f] = 0);
  
  // Gradient boosting iterations with weighted samples
  for (let t = 0; t < numTrees; t++) {
    // Calculate weighted residuals
    const residuals = trainSet.map((d, i) => (d.target - predictions[i]) * d.recencyWeight);
    
    // Build weighted regression tree
    const tree = buildWeightedRegressionTree(trainSet, residuals, maxDepth, featureImportance);
    trees.push(tree);
    
    // Update predictions
    for (let i = 0; i < trainSet.length; i++) {
      const treePrediction = predictTree(tree, trainSet[i].features);
      predictions[i] += learningRate * treePrediction;
    }
    
    if ((t + 1) % 30 === 0) {
      const weightedMAE = trainSet.reduce((sum, d, i) => 
        sum + Math.abs(d.target - predictions[i]) * d.recencyWeight, 0
      ) / totalWeight;
      console.log(`🌲 Tree ${t + 1}/${numTrees} - Weighted MAE: $${weightedMAE.toFixed(2)}`);
    }
  }
  
  // Normalize feature importance
  const totalImportance = Object.values(featureImportance).reduce((a, b) => a + b, 0);
  Object.keys(featureImportance).forEach(f => {
    featureImportance[f] = Math.round((featureImportance[f] / totalImportance) * 10000) / 100;
  });
  
  // Sort by importance
  const sortedImportance = Object.fromEntries(
    Object.entries(featureImportance).sort((a, b) => b[1] - a[1]).slice(0, 10)
  );
  
  return {
    trees,
    learningRate,
    featureImportance: sortedImportance,
    meanTarget,
    stdTarget,
    recentMeanTarget
  };
}

function buildWeightedRegressionTree(
  data: FeatureVector[],
  residuals: number[],
  maxDepth: number,
  featureImportance: { [key: string]: number }
): DecisionTree {
  const splits: TreeNode[] = [];
  
  function buildNode(indices: number[], depth: number): TreeNode {
    if (depth >= maxDepth || indices.length < 30) {
      const weightedSum = indices.reduce((sum, i) => sum + residuals[i], 0);
      const avg = weightedSum / indices.length;
      return { feature: '', threshold: 0, leftValue: avg, rightValue: avg };
    }
    
    let bestFeature = '';
    let bestThreshold = 0;
    let bestGain = -Infinity;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];
    
    const featureNames = Object.keys(data[0].features);
    
    for (const feature of featureNames) {
      const values = indices.map(i => (data[i].features as any)[feature]);
      const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
      
      // Sample thresholds for efficiency
      const sampleSize = Math.min(uniqueValues.length, 15);
      const step = Math.max(1, Math.floor(uniqueValues.length / sampleSize));
      
      for (let j = step; j < uniqueValues.length; j += step) {
        const threshold = (uniqueValues[j - step] + uniqueValues[j]) / 2;
        
        const leftIndices = indices.filter(i => (data[i].features as any)[feature] <= threshold);
        const rightIndices = indices.filter(i => (data[i].features as any)[feature] > threshold);
        
        if (leftIndices.length < 15 || rightIndices.length < 15) continue;
        
        const leftMean = leftIndices.reduce((sum, i) => sum + residuals[i], 0) / leftIndices.length;
        const rightMean = rightIndices.reduce((sum, i) => sum + residuals[i], 0) / rightIndices.length;
        
        // Variance reduction as gain
        const parentVariance = indices.reduce((sum, i) => sum + residuals[i] * residuals[i], 0);
        const leftVariance = leftIndices.reduce((sum, i) => sum + Math.pow(residuals[i] - leftMean, 2), 0);
        const rightVariance = rightIndices.reduce((sum, i) => sum + Math.pow(residuals[i] - rightMean, 2), 0);
        
        const gain = parentVariance - leftVariance - rightVariance;
        
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
          bestLeftIndices = leftIndices;
          bestRightIndices = rightIndices;
        }
      }
    }
    
    if (bestFeature === '' || bestGain <= 0) {
      const avg = indices.reduce((sum, i) => sum + residuals[i], 0) / indices.length;
      return { feature: '', threshold: 0, leftValue: avg, rightValue: avg };
    }
    
    featureImportance[bestFeature] += bestGain;
    
    return {
      feature: bestFeature,
      threshold: bestThreshold,
      leftNode: buildNode(bestLeftIndices, depth + 1),
      rightNode: buildNode(bestRightIndices, depth + 1)
    };
  }
  
  const rootNode = buildNode(data.map((_, i) => i), 0);
  splits.push(rootNode);
  
  return { splits };
}

function predictTree(tree: DecisionTree, features: any): number {
  function traverse(node: TreeNode): number {
    if (node.leftValue !== undefined && node.feature === '') return node.leftValue;
    
    const featureValue = features[node.feature];
    if (featureValue === undefined) return node.leftValue || 0;
    
    if (featureValue <= node.threshold) {
      return node.leftNode ? traverse(node.leftNode) : (node.leftValue || 0);
    } else {
      return node.rightNode ? traverse(node.rightNode) : (node.rightValue || 0);
    }
  }
  
  return traverse(tree.splits[0]);
}

function predictModel(model: GradientBoostingModel, features: any): number {
  // Blend historical mean with recent mean for better adaptation
  const blendedMean = model.meanTarget * 0.3 + model.recentMeanTarget * 0.7;
  let prediction = blendedMean;
  
  for (const tree of model.trees) {
    prediction += model.learningRate * predictTree(tree, features);
  }
  
  return Math.max(0, prediction);
}

function validateModel(model: GradientBoostingModel, validSet: FeatureVector[]) {
  const predictions: number[] = [];
  const actuals: number[] = [];
  
  for (const sample of validSet) {
    const pred = predictModel(model, sample.features);
    predictions.push(pred);
    actuals.push(sample.target);
  }
  
  const errors = predictions.map((p, i) => actuals[i] - p);
  const absErrors = errors.map(e => Math.abs(e));
  const squaredErrors = errors.map(e => e * e);
  
  // sMAPE (handles zeros better)
  const smapeErrors = predictions.map((p, i) => {
    const denom = (Math.abs(actuals[i]) + Math.abs(p)) / 2;
    return denom > 0.01 ? (Math.abs(actuals[i] - p) / denom) : 0;
  });
  
  const mae = absErrors.reduce((a, b) => a + b, 0) / absErrors.length;
  const rmse = Math.sqrt(squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length);
  const smape = (smapeErrors.reduce((a, b) => a + b, 0) / smapeErrors.length) * 100;
  
  const meanActual = actuals.reduce((a, b) => a + b, 0) / actuals.length;
  const totalSS = actuals.reduce((sum, a) => sum + Math.pow(a - meanActual, 2), 0);
  const residualSS = squaredErrors.reduce((a, b) => a + b, 0);
  const r2 = 1 - (residualSS / totalSS);
  
  return { mae, rmse, smape, r2 };
}

function calculateRegimePerformance(model: GradientBoostingModel, validSet: FeatureVector[]) {
  const regimes = {
    low: { errors: [] as number[], count: 0 },
    normal: { errors: [] as number[], count: 0 },
    elevated: { errors: [] as number[], count: 0 },
    spike: { errors: [] as number[], count: 0 }
  };
  
  for (const sample of validSet) {
    const pred = predictModel(model, sample.features);
    const error = Math.abs(sample.target - pred);
    const actual = sample.target;
    
    let regime: keyof typeof regimes;
    if (actual < 30) regime = 'low';
    else if (actual < 100) regime = 'normal';
    else if (actual < 200) regime = 'elevated';
    else regime = 'spike';
    
    regimes[regime].errors.push(error);
    regimes[regime].count++;
  }
  
  return Object.fromEntries(
    Object.entries(regimes).map(([regime, data]) => [
      regime,
      {
        count: data.count,
        mae: data.errors.length > 0 
          ? Math.round(data.errors.reduce((a, b) => a + b, 0) / data.errors.length * 100) / 100 
          : 0
      }
    ])
  );
}

async function saveModelParameters(
  supabase: any,
  model: GradientBoostingModel,
  validation: any,
  trainingRecords: number
) {
  const modelSummary = {
    num_trees: model.trees.length,
    learning_rate: model.learningRate,
    mean_target: model.meanTarget,
    recent_mean_target: model.recentMeanTarget,
    std_target: model.stdTarget,
    recency_weighted: true
  };
  
  await supabase.from('aeso_model_parameters').insert({
    model_version: MODEL_VERSION,
    parameter_type: 'ml_model_weights',
    parameter_name: 'enhanced_gradient_boosting',
    parameter_value: validation.mae,
    training_samples: trainingRecords,
    hyperparameters: modelSummary,
    feature_importance: model.featureImportance
  });
}
