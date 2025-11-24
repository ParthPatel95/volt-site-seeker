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

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 Starting ML Model Training');

    // Step 1: Fetch ALL training data with complete lag features
    const { data: trainingData, error: dataError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .not('price_lag_1h', 'is', null)
      .not('price_lag_24h', 'is', null)
      .not('pool_price', 'is', null)
      .order('timestamp', { ascending: true });

    if (dataError || !trainingData || trainingData.length === 0) {
      throw new Error(`Failed to fetch training data: ${dataError?.message}`);
    }

    console.log(`📊 Loaded ${trainingData.length} training records`);

    // Step 2: Feature engineering & data preparation
    const features = prepareFeatures(trainingData);
    console.log(`✅ Prepared ${features.length} feature vectors`);

    // Step 3: Train/validation split (80/20)
    const splitIndex = Math.floor(features.length * 0.8);
    const trainSet = features.slice(0, splitIndex);
    const validSet = features.slice(splitIndex);

    console.log(`📈 Train: ${trainSet.length} records, Validation: ${validSet.length} records`);

    // Step 4: Train XGBoost-style gradient boosting model
    const model = trainGradientBoostingModel(trainSet);
    console.log('✅ Model training completed');

    // Step 5: Validate model performance
    const validation = validateModel(model, validSet);
    console.log(`📊 Validation sMAPE: ${validation.smape.toFixed(2)}%`);
    console.log(`📊 Validation MAE: $${validation.mae.toFixed(2)}`);
    console.log(`📊 Validation R²: ${validation.r2.toFixed(4)}`);

    // Step 6: Save model parameters
    await saveModelParameters(supabase, model, validation, trainingData.length);
    console.log('💾 Model parameters saved');

    // Step 7: Track performance in model_performance table
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
      evaluation_date: new Date().toISOString()
    });

    // Step 8: Update model_status table (current active model)
    await supabase.from('aeso_model_status').insert({
      model_version: MODEL_VERSION,
      trained_at: new Date().toISOString(),
      mae: validation.mae,
      rmse: validation.rmse,
      smape: validation.smape,
      r_squared: validation.r2,
      training_records: trainingData.length,
      predictions_evaluated: 0,
      model_quality: validation.smape < 20 ? 'excellent' : 
                     validation.smape < 30 ? 'good' : 
                     validation.smape < 40 ? 'fair' : 'needs_improvement',
      available_training_records: trainingData.length,
      records_with_features: trainingData.length
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Training completed in ${duration}s`);

    return new Response(JSON.stringify({
      success: true,
      model_version: MODEL_VERSION,
      training_records: trainingData.length,
      performance: {
        smape: validation.smape,
        mae: validation.mae,
        rmse: validation.rmse,
        r2: validation.r2
      },
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
  target: number; // pool_price
  features: {
    // Lag features
    price_lag_1h: number;
    price_lag_2h: number;
    price_lag_3h: number;
    price_lag_24h: number;
    price_lag_168h: number;
    
    // Rolling features
    price_rolling_avg_24h: number;
    price_rolling_std_24h: number;
    
    // Time features
    hour: number;
    day_of_week: number;
    month: number;
    is_weekend: number;
    
    // Load features
    ail_mw: number;
    demand_lag_3h: number;
    
    // Generation features
    generation_wind: number;
    generation_solar: number;
    generation_gas: number;
    renewable_penetration: number;
    
    // Weather features
    temperature_calgary: number;
    temperature_edmonton: number;
    wind_speed: number;
    
    // Derived features
    net_demand: number;
    reserve_margin_percent: number;
  };
}

function prepareFeatures(data: any[]): FeatureVector[] {
  return data
    .filter(d => 
      d.price_lag_1h != null &&
      d.price_lag_24h != null &&
      d.pool_price != null &&
      d.pool_price > 0
    )
    .map(d => {
      const hour = new Date(d.timestamp).getHours();
      const dayOfWeek = new Date(d.timestamp).getDay();
      const month = new Date(d.timestamp).getMonth() + 1;
      
      return {
        timestamp: d.timestamp,
        target: d.pool_price,
        features: {
          price_lag_1h: d.price_lag_1h || d.pool_price,
          price_lag_2h: d.price_lag_2h || d.price_lag_1h || d.pool_price,
          price_lag_3h: d.price_lag_3h || d.price_lag_2h || d.pool_price,
          price_lag_24h: d.price_lag_24h || d.pool_price,
          price_lag_168h: d.price_lag_168h || d.price_lag_24h || d.pool_price,
          
          price_rolling_avg_24h: d.price_rolling_avg_24h || d.pool_price,
          price_rolling_std_24h: d.price_rolling_std_24h || 10,
          
          hour,
          day_of_week: dayOfWeek,
          month,
          is_weekend: (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0,
          
          ail_mw: d.ail_mw || 9000,
          demand_lag_3h: d.demand_lag_3h || d.ail_mw || 9000,
          
          generation_wind: d.generation_wind || 0,
          generation_solar: d.generation_solar || 0,
          generation_gas: d.generation_gas || 0,
          renewable_penetration: d.renewable_penetration || 0,
          
          temperature_calgary: d.temperature_calgary || 10,
          temperature_edmonton: d.temperature_edmonton || 10,
          wind_speed: d.wind_speed || 10,
          
          net_demand: d.net_demand || (d.ail_mw || 9000),
          reserve_margin_percent: d.reserve_margin_percent || 15
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

function trainGradientBoostingModel(trainSet: FeatureVector[]): GradientBoostingModel {
  const numTrees = 100;
  const learningRate = 0.1;
  const maxDepth = 6;
  
  // Calculate target statistics for normalization
  const targets = trainSet.map(d => d.target);
  const meanTarget = targets.reduce((a, b) => a + b, 0) / targets.length;
  const stdTarget = Math.sqrt(
    targets.reduce((sum, val) => sum + Math.pow(val - meanTarget, 2), 0) / targets.length
  );
  
  console.log(`🎯 Target stats - Mean: $${meanTarget.toFixed(2)}, StdDev: $${stdTarget.toFixed(2)}`);
  
  // Initialize with mean prediction
  let predictions = new Array(trainSet.length).fill(meanTarget);
  const trees: DecisionTree[] = [];
  const featureImportance: { [key: string]: number } = {};
  
  // Feature names for importance tracking
  const featureNames = Object.keys(trainSet[0].features);
  featureNames.forEach(f => featureImportance[f] = 0);
  
  // Gradient boosting iterations
  for (let t = 0; t < numTrees; t++) {
    // Calculate residuals (gradients)
    const residuals = trainSet.map((d, i) => d.target - predictions[i]);
    
    // Build regression tree on residuals
    const tree = buildRegressionTree(trainSet, residuals, maxDepth, featureImportance);
    trees.push(tree);
    
    // Update predictions
    for (let i = 0; i < trainSet.length; i++) {
      const treePrediction = predictTree(tree, trainSet[i].features);
      predictions[i] += learningRate * treePrediction;
    }
    
    if ((t + 1) % 20 === 0) {
      const mae = residuals.reduce((sum, r) => sum + Math.abs(r), 0) / residuals.length;
      console.log(`🌲 Tree ${t + 1}/${numTrees} - MAE: $${mae.toFixed(2)}`);
    }
  }
  
  // Normalize feature importance
  const totalImportance = Object.values(featureImportance).reduce((a, b) => a + b, 0);
  Object.keys(featureImportance).forEach(f => {
    featureImportance[f] = (featureImportance[f] / totalImportance) * 100;
  });
  
  return {
    trees,
    learningRate,
    featureImportance,
    meanTarget,
    stdTarget
  };
}

function buildRegressionTree(
  data: FeatureVector[],
  residuals: number[],
  maxDepth: number,
  featureImportance: { [key: string]: number }
): DecisionTree {
  const splits: TreeNode[] = [];
  
  function buildNode(indices: number[], depth: number): TreeNode {
    // Stop conditions
    if (depth >= maxDepth || indices.length < 20) {
      const avg = indices.reduce((sum, i) => sum + residuals[i], 0) / indices.length;
      return { feature: '', threshold: 0, leftValue: avg, rightValue: avg };
    }
    
    // Find best split
    let bestFeature = '';
    let bestThreshold = 0;
    let bestGain = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];
    
    const featureNames = Object.keys(data[0].features);
    
    for (const feature of featureNames) {
      const values = indices.map(i => (data[i].features as any)[feature]);
      const sortedValues = [...new Set(values)].sort((a, b) => a - b);
      
      for (let j = 1; j < Math.min(sortedValues.length, 10); j++) {
        const threshold = (sortedValues[j - 1] + sortedValues[j]) / 2;
        
        const leftIndices = indices.filter(i => (data[i].features as any)[feature] <= threshold);
        const rightIndices = indices.filter(i => (data[i].features as any)[feature] > threshold);
        
        if (leftIndices.length < 10 || rightIndices.length < 10) continue;
        
        const leftMean = leftIndices.reduce((sum, i) => sum + residuals[i], 0) / leftIndices.length;
        const rightMean = rightIndices.reduce((sum, i) => sum + residuals[i], 0) / rightIndices.length;
        
        const gain = 
          leftIndices.reduce((sum, i) => sum + Math.pow(residuals[i] - leftMean, 2), 0) +
          rightIndices.reduce((sum, i) => sum + Math.pow(residuals[i] - rightMean, 2), 0);
        
        if (gain < bestGain || bestGain === 0) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
          bestLeftIndices = leftIndices;
          bestRightIndices = rightIndices;
        }
      }
    }
    
    if (bestFeature === '') {
      const avg = indices.reduce((sum, i) => sum + residuals[i], 0) / indices.length;
      return { feature: '', threshold: 0, leftValue: avg, rightValue: avg };
    }
    
    // Track feature importance
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
    if (node.leftValue !== undefined) return node.leftValue;
    
    const featureValue = features[node.feature];
    if (featureValue <= node.threshold) {
      return node.leftNode ? traverse(node.leftNode) : 0;
    } else {
      return node.rightNode ? traverse(node.rightNode) : 0;
    }
  }
  
  return traverse(tree.splits[0]);
}

function predictModel(model: GradientBoostingModel, features: any): number {
  let prediction = model.meanTarget;
  
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
  
  // Calculate metrics
  const errors = predictions.map((p, i) => actuals[i] - p);
  const absErrors = errors.map(e => Math.abs(e));
  const squaredErrors = errors.map(e => e * e);
  const smapeErrors = predictions.map((p, i) => 
    (2 * Math.abs(actuals[i] - p)) / (Math.abs(actuals[i]) + Math.abs(p))
  );
  
  const mae = absErrors.reduce((a, b) => a + b, 0) / absErrors.length;
  const rmse = Math.sqrt(squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length);
  const smape = (smapeErrors.reduce((a, b) => a + b, 0) / smapeErrors.length) * 100;
  
  const meanActual = actuals.reduce((a, b) => a + b, 0) / actuals.length;
  const totalSS = actuals.reduce((sum, a) => sum + Math.pow(a - meanActual, 2), 0);
  const residualSS = squaredErrors.reduce((a, b) => a + b, 0);
  const r2 = 1 - (residualSS / totalSS);
  
  return { mae, rmse, smape, r2 };
}

async function saveModelParameters(
  supabase: any,
  model: GradientBoostingModel,
  validation: any,
  trainingRecords: number
) {
  // Serialize tree structure (simplified - store key splits only)
  const modelSummary = {
    num_trees: model.trees.length,
    learning_rate: model.learningRate,
    mean_target: model.meanTarget,
    std_target: model.stdTarget,
    // Store first few trees for reference
    sample_trees: model.trees.slice(0, 5).map(tree => ({
      root_feature: tree.splits[0].feature,
      root_threshold: tree.splits[0].threshold
    }))
  };
  
  await supabase.from('aeso_model_parameters').insert({
    model_version: MODEL_VERSION,
    parameter_type: 'ml_model_weights',
    parameter_name: 'gradient_boosting_ensemble',
    parameter_value: validation.mae,
    training_samples: trainingRecords,
    hyperparameters: modelSummary,
    feature_importance: model.featureImportance
  });
}
