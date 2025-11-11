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

    console.log('🤖 Phase 6: Adaptive Retraining - Checking if retraining needed...');

    // Get latest performance metrics
    const { data: latestPerformance, error: perfError } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('evaluation_date', { ascending: false })
      .limit(1)
      .single();

    if (perfError || !latestPerformance) {
      throw new Error('Could not fetch latest performance metrics');
    }

    console.log('Latest Performance:', {
      mae: latestPerformance.mae,
      rmse: latestPerformance.rmse,
      mape: latestPerformance.mape,
      r_squared: latestPerformance.r_squared
    });

    // Check drift metrics
    const driftMetrics = latestPerformance.drift_metrics || {};
    const requiresRetraining = driftMetrics.requiresRetraining || false;
    const driftScore = driftMetrics.driftScore || 0;

    console.log('Drift Analysis:', {
      driftScore: (driftScore * 100).toFixed(1) + '%',
      requiresRetraining
    });

    // Retraining triggers
    const triggers = {
      drift_detected: requiresRetraining,
      high_mae: latestPerformance.mae > 50,
      high_mape: latestPerformance.mape > 200,
      poor_r2: latestPerformance.r_squared < 0.5,
      scheduled: false // Can be set via request body
    };

    const { force_retrain = false } = await req.json().catch(() => ({ force_retrain: false }));

    const shouldRetrain = force_retrain || Object.values(triggers).some(t => t);

    if (!shouldRetrain) {
      console.log('✅ No retraining needed - model performing well');
      
      return new Response(JSON.stringify({
        success: true,
        retraining_needed: false,
        current_performance: {
          mae: latestPerformance.mae,
          rmse: latestPerformance.rmse,
          mape: latestPerformance.mape,
          r_squared: latestPerformance.r_squared
        },
        triggers,
        message: 'Model is performing within acceptable thresholds'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Determine trigger reason
    const triggerReason = force_retrain ? 'manual' : 
      triggers.drift_detected ? 'drift_detection' :
      triggers.high_mae ? 'high_mae' :
      triggers.high_mape ? 'high_mape' :
      triggers.poor_r2 ? 'poor_r2' :
      'scheduled';

    console.log(`⚠️ Retraining triggered by: ${triggerReason}`);

    // Create retraining schedule entry
    const { data: scheduleEntry, error: scheduleError } = await supabase
      .from('aeso_retraining_schedule')
      .insert({
        model_version: MODEL_VERSION,
        scheduled_at: new Date().toISOString(),
        triggered_by: triggerReason,
        trigger_reason: JSON.stringify(triggers),
        status: 'running',
        training_started_at: new Date().toISOString(),
        performance_before: {
          mae: latestPerformance.mae,
          rmse: latestPerformance.rmse,
          mape: latestPerformance.mape,
          r_squared: latestPerformance.r_squared
        }
      })
      .select()
      .single();

    if (scheduleError) {
      console.error('Error creating schedule entry:', scheduleError);
    }

    console.log('📅 Retraining scheduled, starting training...');

    // Invoke model trainer
    const { data: trainingResult, error: trainingError } = await supabase.functions.invoke(
      'aeso-model-trainer',
      { body: {} }
    );

    if (trainingError) {
      // Update schedule entry as failed
      if (scheduleEntry) {
        await supabase
          .from('aeso_retraining_schedule')
          .update({
            status: 'failed',
            training_completed_at: new Date().toISOString()
          })
          .eq('id', scheduleEntry.id);
      }

      throw new Error(`Training failed: ${trainingError.message}`);
    }

    console.log('✅ Training completed successfully!');

    // Get new performance metrics
    const { data: newPerformance } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('evaluation_date', { ascending: false })
      .limit(1)
      .single();

    // Calculate improvement
    const improvement = {
      mae: ((latestPerformance.mae - (newPerformance?.mae || latestPerformance.mae)) / latestPerformance.mae * 100).toFixed(1),
      rmse: ((latestPerformance.rmse - (newPerformance?.rmse || latestPerformance.rmse)) / latestPerformance.rmse * 100).toFixed(1),
      mape: ((latestPerformance.mape - (newPerformance?.mape || latestPerformance.mape)) / latestPerformance.mape * 100).toFixed(1)
    };

    console.log('Performance Improvement:', improvement);

    // Update schedule entry as completed
    if (scheduleEntry) {
      await supabase
        .from('aeso_retraining_schedule')
        .update({
          status: 'completed',
          training_completed_at: new Date().toISOString(),
          performance_after: {
            mae: newPerformance?.mae,
            rmse: newPerformance?.rmse,
            mape: newPerformance?.mape,
            r_squared: newPerformance?.r_squared
          }
        })
        .eq('id', scheduleEntry.id);
    }

    return new Response(JSON.stringify({
      success: true,
      retraining_completed: true,
      triggered_by: triggerReason,
      performance_before: {
        mae: latestPerformance.mae,
        rmse: latestPerformance.rmse,
        mape: latestPerformance.mape,
        r_squared: latestPerformance.r_squared
      },
      performance_after: {
        mae: newPerformance?.mae,
        rmse: newPerformance?.rmse,
        mape: newPerformance?.mape,
        r_squared: newPerformance?.r_squared
      },
      improvement,
      training_result: trainingResult,
      schedule_id: scheduleEntry?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Adaptive retraining error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
