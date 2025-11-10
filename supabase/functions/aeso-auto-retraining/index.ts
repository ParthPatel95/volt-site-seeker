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

    console.log('🤖 Phase 6: Automated Retraining Check');

    // Fetch latest model performance with drift metrics
    const { data: latestPerf, error: perfError } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('evaluation_date', { ascending: false })
      .limit(1)
      .single();

    if (perfError || !latestPerf) {
      throw new Error('No model performance data found');
    }

    console.log('Latest Model Performance:', {
      version: latestPerf.model_version,
      mae: latestPerf.mae,
      evaluation_date: latestPerf.evaluation_date
    });

    // Extract drift metrics from metadata
    const driftMetrics = latestPerf.metadata?.drift_metrics || null;
    const retrainingRecommended = latestPerf.metadata?.retraining_recommended || false;

    console.log('Drift Metrics:', driftMetrics);

    // Check if retraining is needed
    let retrainingTriggered = false;
    let retrainingReason = '';
    const thresholds = {
      drift_score: 0.25,
      performance_drift: 0.30,
      feature_drift: 0.40,
      mae_threshold: 15.0, // $15/MWh
      days_since_training: 30
    };

    // Calculate days since last training
    const lastTrainingDate = new Date(latestPerf.evaluation_date);
    const daysSinceTraining = (Date.now() - lastTrainingDate.getTime()) / (1000 * 60 * 60 * 24);

    console.log(`Days since last training: ${daysSinceTraining.toFixed(1)}`);

    // Determine if retraining should be triggered
    const triggers: string[] = [];

    if (driftMetrics?.drift_score > thresholds.drift_score) {
      triggers.push(`High drift score: ${(driftMetrics.drift_score * 100).toFixed(1)}%`);
    }
    if (driftMetrics?.performance_drift > thresholds.performance_drift) {
      triggers.push(`Performance degradation: ${(driftMetrics.performance_drift * 100).toFixed(1)}%`);
    }
    if (driftMetrics?.feature_drift > thresholds.feature_drift) {
      triggers.push(`Feature distribution shift: ${(driftMetrics.feature_drift * 100).toFixed(1)}%`);
    }
    if (latestPerf.mae > thresholds.mae_threshold) {
      triggers.push(`MAE exceeds threshold: $${latestPerf.mae.toFixed(2)}/MWh`);
    }
    if (daysSinceTraining > thresholds.days_since_training) {
      triggers.push(`Model age exceeds ${thresholds.days_since_training} days`);
    }

    if (triggers.length > 0 || retrainingRecommended) {
      retrainingTriggered = true;
      retrainingReason = triggers.join('; ');
      
      console.log('🔄 RETRAINING TRIGGERED');
      console.log('Reasons:', retrainingReason);

      // Log retraining trigger
      const { error: logError } = await supabase
        .from('aeso_retraining_history')
        .insert({
          trigger_reason: retrainingReason,
          previous_model_version: latestPerf.model_version,
          previous_mae: latestPerf.mae,
          previous_rmse: latestPerf.rmse,
          drift_score: driftMetrics?.drift_score || 0,
          status: 'triggered'
        });

      if (logError) {
        console.error('Error logging retraining trigger:', logError);
      }

      // Trigger complete backfill and training pipeline
      console.log('Invoking complete backfill pipeline...');
      const { data: backfillData, error: backfillError } = await supabase.functions.invoke('aeso-complete-backfill');

      if (backfillError) {
        console.error('Backfill pipeline error:', backfillError);
        
        // Update retraining history with failure
        await supabase
          .from('aeso_retraining_history')
          .update({ 
            status: 'failed',
            error_message: backfillError.message || 'Unknown error'
          })
          .eq('previous_model_version', latestPerf.model_version)
          .eq('status', 'triggered')
          .order('triggered_at', { ascending: false })
          .limit(1);

        throw backfillError;
      }

      console.log('Backfill completed:', backfillData);

      // Fetch new model performance after retraining
      const { data: newPerf, error: newPerfError } = await supabase
        .from('aeso_model_performance')
        .select('*')
        .order('evaluation_date', { ascending: false })
        .limit(1)
        .single();

      if (!newPerfError && newPerf) {
        // Update retraining history with success
        await supabase
          .from('aeso_retraining_history')
          .update({ 
            status: 'completed',
            new_model_version: newPerf.model_version,
            new_mae: newPerf.mae,
            new_rmse: newPerf.rmse,
            improvement_mae: latestPerf.mae - newPerf.mae,
            completed_at: new Date().toISOString()
          })
          .eq('previous_model_version', latestPerf.model_version)
          .eq('status', 'triggered')
          .order('triggered_at', { ascending: false })
          .limit(1);

        console.log('✅ Retraining completed successfully');
        console.log('New Model Performance:', {
          version: newPerf.model_version,
          mae: newPerf.mae,
          improvement: (latestPerf.mae - newPerf.mae).toFixed(2)
        });
      }

      return new Response(JSON.stringify({
        success: true,
        retraining_triggered: true,
        reason: retrainingReason,
        triggers: triggers,
        previous_performance: {
          version: latestPerf.model_version,
          mae: latestPerf.mae,
          rmse: latestPerf.rmse,
          drift_score: driftMetrics?.drift_score || 0
        },
        new_performance: newPerf ? {
          version: newPerf.model_version,
          mae: newPerf.mae,
          rmse: newPerf.rmse,
          improvement: latestPerf.mae - newPerf.mae
        } : null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      console.log('✅ Model health OK - no retraining needed');
      
      return new Response(JSON.stringify({
        success: true,
        retraining_triggered: false,
        message: 'Model performance within acceptable thresholds',
        current_performance: {
          version: latestPerf.model_version,
          mae: latestPerf.mae,
          rmse: latestPerf.rmse,
          drift_score: driftMetrics?.drift_score || 0,
          days_since_training: daysSinceTraining.toFixed(1)
        },
        thresholds
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Auto-retraining check error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
