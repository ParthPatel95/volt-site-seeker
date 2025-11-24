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

    console.log('Fetching comprehensive monitoring data...');

    // Get latest model performance
    const { data: latestPerformance } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('evaluation_date', { ascending: false })
      .limit(1)
      .single();

    // Get recent predictions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentPredictions } = await supabase
      .from('aeso_predictions')
      .select('*')
      .gte('predicted_at', oneDayAgo)
      .order('predicted_at', { ascending: false });

    // Get current market regime
    const { data: currentRegime } = await supabase
      .from('aeso_market_regimes')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Get data quality metrics
    const { data: latestQuality } = await supabase
      .from('aeso_data_quality_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(1)
      .single();

    // Get model count and versions
    const { data: models } = await supabase
      .from('aeso_model_parameters')
      .select('model_version, training_samples, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate prediction accuracy for validated predictions
    const { data: validatedPredictions } = await supabase
      .from('aeso_predictions')
      .select('predicted_price, actual_price, absolute_error')
      .not('actual_price', 'is', null)
      .gte('predicted_at', oneDayAgo);

    let avgAccuracy = null;
    if (validatedPredictions && validatedPredictions.length > 0) {
      const avgError = validatedPredictions.reduce((sum, p) => sum + (p.absolute_error || 0), 0) / validatedPredictions.length;
      const avgPrice = validatedPredictions.reduce((sum, p) => sum + p.actual_price, 0) / validatedPredictions.length;
      avgAccuracy = Math.round((1 - avgError / avgPrice) * 100);
    }

    // System health check
    const health = {
      data_pipeline: latestQuality ? 'healthy' : 'unknown',
      model_training: models && models.length > 0 ? 'healthy' : 'needs_attention',
      prediction_service: recentPredictions && recentPredictions.length > 0 ? 'healthy' : 'unknown',
      data_quality_score: latestQuality?.quality_score || null,
      last_model_update: models?.[0]?.created_at || null,
      active_models: models?.length || 0
    };

    // Alert conditions
    const alerts = [];
    
    if (latestQuality && latestQuality.quality_score < 80) {
      alerts.push({
        severity: 'warning',
        message: `Data quality score is ${latestQuality.quality_score}% (below 80% threshold)`,
        metric: 'data_quality'
      });
    }

    if (latestPerformance && latestPerformance.rmse > 30) {
      alerts.push({
        severity: 'warning',
        message: `Model RMSE is ${latestPerformance.rmse} (above 30 threshold)`,
        metric: 'model_performance'
      });
    }

    if (!recentPredictions || recentPredictions.length === 0) {
      alerts.push({
        severity: 'error',
        message: 'No predictions generated in last 24 hours',
        metric: 'prediction_service'
      });
    }

    if (avgAccuracy !== null && avgAccuracy < 70) {
      alerts.push({
        severity: 'warning',
        message: `Prediction accuracy is ${avgAccuracy}% (below 70% threshold)`,
        metric: 'prediction_accuracy'
      });
    }

    const response = {
      status: alerts.some(a => a.severity === 'error') ? 'degraded' : alerts.length > 0 ? 'warning' : 'healthy',
      timestamp: new Date().toISOString(),
      health,
      metrics: {
        model_rmse: latestPerformance?.rmse || null,
        model_mae: latestPerformance?.mae || null,
        model_mape: latestPerformance?.mape || null,
        prediction_accuracy: avgAccuracy,
        predictions_24h: recentPredictions?.length || 0,
        validated_predictions_24h: validatedPredictions?.length || 0,
        data_quality_score: latestQuality?.quality_score || null,
        current_market_regime: currentRegime?.regime || 'unknown',
        regime_confidence: currentRegime?.confidence || null
      },
      models: {
        total: models?.length || 0,
        versions: models?.map(m => m.model_version) || [],
        latest_training_samples: models?.[0]?.training_samples || null
      },
      alerts,
      data_freshness: {
        latest_prediction: recentPredictions?.[0]?.predicted_at || null,
        latest_regime_update: currentRegime?.timestamp || null,
        latest_quality_check: latestQuality?.report_date || null,
        latest_performance_eval: latestPerformance?.evaluation_date || null
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in monitoring endpoint:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
