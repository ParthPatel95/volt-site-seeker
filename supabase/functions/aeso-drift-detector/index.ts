import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Starting drift detection analysis...');

    // Get recent predictions with actuals
    const { data: predictions, error: predError } = await supabase
      .from('aeso_price_predictions')
      .select('*')
      .not('actual_price', 'is', null)
      .order('created_at', { ascending: false })
      .limit(168); // Last week of predictions

    if (predError || !predictions || predictions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          drift_detected: false,
          needs_retraining: false,
          message: 'Insufficient validated predictions for drift detection',
          stats: { validated_predictions: 0 }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Analyzing ${predictions.length} validated predictions`);

    // Calculate recent performance metrics
    let totalSMAPE = 0;
    let totalMAE = 0;
    let totalRMSE = 0;
    let spikeErrors = 0; // Count of large errors (>50%)

    predictions.forEach((pred: any) => {
      if (pred.symmetric_percent_error) {
        totalSMAPE += pred.symmetric_percent_error;
      }
      if (pred.absolute_error) {
        totalMAE += pred.absolute_error;
        totalRMSE += pred.absolute_error ** 2;
      }
      if (pred.symmetric_percent_error && pred.symmetric_percent_error > 50) {
        spikeErrors++;
      }
    });

    const avgSMAPE = totalSMAPE / predictions.length;
    const avgMAE = totalMAE / predictions.length;
    const avgRMSE = Math.sqrt(totalRMSE / predictions.length);
    const spikeErrorRate = (spikeErrors / predictions.length) * 100;

    console.log(`Recent Performance: sMAPE=${avgSMAPE.toFixed(2)}%, MAE=$${avgMAE.toFixed(2)}, RMSE=$${avgRMSE.toFixed(2)}`);
    console.log(`Spike Error Rate: ${spikeErrorRate.toFixed(1)}%`);

    // Get model training performance baseline
    const { data: modelPerf, error: perfError } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (perfError || !modelPerf) {
      throw new Error('No model performance baseline found');
    }

    console.log(`Training Baseline: sMAPE=${modelPerf.smape?.toFixed(2)}%`);

    // Drift detection thresholds
    const SMAPE_DEGRADATION_THRESHOLD = 1.25; // 25% worse than training
    const SPIKE_ERROR_THRESHOLD = 15; // More than 15% of predictions are spikes
    const ABSOLUTE_SMAPE_THRESHOLD = 12; // Absolute sMAPE above 12%

    const smapeDegradation = avgSMAPE / (modelPerf.smape || avgSMAPE);
    const driftDetected = 
      smapeDegradation > SMAPE_DEGRADATION_THRESHOLD ||
      spikeErrorRate > SPIKE_ERROR_THRESHOLD ||
      avgSMAPE > ABSOLUTE_SMAPE_THRESHOLD;

    const needsRetraining = driftDetected;

    // Calculate data freshness
    const { data: latestData } = await supabase
      .from('aeso_training_data')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    const dataAgeHours = latestData?.timestamp 
      ? (Date.now() - new Date(latestData.timestamp).getTime()) / (1000 * 60 * 60)
      : null;

    const driftReasons = [];
    if (smapeDegradation > SMAPE_DEGRADATION_THRESHOLD) {
      driftReasons.push(`Performance degraded by ${((smapeDegradation - 1) * 100).toFixed(1)}%`);
    }
    if (spikeErrorRate > SPIKE_ERROR_THRESHOLD) {
      driftReasons.push(`High spike error rate: ${spikeErrorRate.toFixed(1)}%`);
    }
    if (avgSMAPE > ABSOLUTE_SMAPE_THRESHOLD) {
      driftReasons.push(`sMAPE above threshold: ${avgSMAPE.toFixed(2)}%`);
    }

    console.log(`🎯 Drift Status: ${driftDetected ? '⚠️ DRIFT DETECTED' : '✅ No Drift'}`);
    
    if (needsRetraining) {
      console.log('📢 RECOMMENDATION: Retrain model to restore performance');
    }

    return new Response(
      JSON.stringify({
        success: true,
        drift_detected: driftDetected,
        needs_retraining: needsRetraining,
        drift_reasons: driftReasons,
        current_performance: {
          smape: avgSMAPE,
          mae: avgMAE,
          rmse: avgRMSE,
          spike_error_rate: spikeErrorRate
        },
        baseline_performance: {
          smape: modelPerf.smape,
          mae: modelPerf.mae,
          rmse: modelPerf.rmse
        },
        degradation_factor: smapeDegradation,
        stats: {
          validated_predictions: predictions.length,
          model_version: modelPerf.model_version,
          model_trained_at: modelPerf.created_at,
          data_age_hours: dataAgeHours
        },
        recommendations: needsRetraining 
          ? ['Retrain model immediately', 'Check for market regime changes', 'Verify data quality']
          : ['Continue monitoring', 'Model performing within acceptable range'],
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('❌ Drift detection error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
