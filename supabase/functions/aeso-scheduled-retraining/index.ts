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

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 Scheduled Retraining Check Started');

    // Step 1: Check model status and performance
    const { data: modelStatus, error: statusError } = await supabase
      .from('aeso_model_status')
      .select('*')
      .order('trained_at', { ascending: false })
      .limit(1)
      .single();

    if (statusError) {
      console.log('⚠️ No model found - triggering initial training');
      
      const { data: backfillData, error: backfillError } = await supabase.functions.invoke('aeso-ml-trainer');
      
      if (backfillError) throw backfillError;

      return new Response(JSON.stringify({
        success: true,
        action: 'initial_training',
        message: 'Initial model training completed',
        duration_ms: Date.now() - startTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const now = new Date();
    const lastTrained = new Date(modelStatus.trained_at);
    const hoursSinceTraining = (now.getTime() - lastTrained.getTime()) / (1000 * 60 * 60);
    
    console.log(`📊 Model Status:`);
    console.log(`  - Last trained: ${lastTrained.toISOString()}`);
    console.log(`  - Hours since training: ${hoursSinceTraining.toFixed(1)}`);
    console.log(`  - sMAPE: ${modelStatus.smape?.toFixed(2)}%`);
    console.log(`  - Training records: ${modelStatus.training_records}`);
    console.log(`  - Data quality: ${modelStatus.model_quality}`);

    // Step 2: Determine if retraining is needed
    const reasons: string[] = [];
    let shouldRetrain = false;

    // Reason 1: Model performance degraded (sMAPE > 40%)
    if (modelStatus.smape && modelStatus.smape > 40) {
      reasons.push(`Poor accuracy (sMAPE: ${modelStatus.smape.toFixed(1)}%)`);
      shouldRetrain = true;
    }

    // Reason 2: More than 24 hours since last training
    if (hoursSinceTraining > 24) {
      reasons.push(`Scheduled daily refresh (${hoursSinceTraining.toFixed(1)}h since last training)`);
      shouldRetrain = true;
    }

    // Reason 3: Insufficient training data
    if (modelStatus.training_records < 5000) {
      reasons.push(`Insufficient data (${modelStatus.training_records} records)`);
      shouldRetrain = true;
    }

    if (!shouldRetrain) {
      console.log('✅ Model is healthy - no retraining needed');
      
      // Log the check
      await supabase.from('aeso_retraining_history').insert({
        triggered: false,
        reason: 'Scheduled check - model healthy',
        performance_before: modelStatus.smape,
        training_records_before: modelStatus.training_records
      });

      return new Response(JSON.stringify({
        success: true,
        action: 'no_action',
        message: 'Model is healthy',
        model_status: {
          smape: modelStatus.smape,
          hours_since_training: hoursSinceTraining.toFixed(1),
          training_records: modelStatus.training_records
        },
        duration_ms: Date.now() - startTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Step 3: Trigger retraining
    console.log('🔄 Retraining triggered due to:', reasons.join(', '));
    
    const retrainingStart = Date.now();
    
    const { data: backfillData, error: backfillError } = await supabase.functions.invoke('aeso-ml-trainer');
    
    if (backfillError) throw backfillError;

    const retrainingDuration = Date.now() - retrainingStart;

    // Get updated model status
    const { data: newModelStatus, error: newStatusError } = await supabase
      .from('aeso_model_status')
      .select('*')
      .order('trained_at', { ascending: false })
      .limit(1)
      .single();

    const improvement = modelStatus.smape && newModelStatus?.smape 
      ? modelStatus.smape - newModelStatus.smape 
      : 0;

    // Log the retraining
    await supabase.from('aeso_retraining_history').insert({
      triggered: true,
      reason: reasons.join(', '),
      performance_before: modelStatus.smape,
      performance_after: newModelStatus?.smape,
      improvement: improvement,
      training_records_before: modelStatus.training_records,
      training_records_after: newModelStatus?.training_records,
      duration_seconds: Math.round(retrainingDuration / 1000)
    });

    console.log('✅ Retraining completed');
    console.log(`  - Duration: ${(retrainingDuration / 1000).toFixed(1)}s`);
    console.log(`  - sMAPE before: ${modelStatus.smape?.toFixed(2)}%`);
    console.log(`  - sMAPE after: ${newModelStatus?.smape?.toFixed(2)}%`);
    console.log(`  - Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(2)}%`);

    return new Response(JSON.stringify({
      success: true,
      action: 'retrained',
      message: 'Model retrained successfully',
      reasons,
      performance: {
        before: modelStatus.smape,
        after: newModelStatus?.smape,
        improvement: improvement.toFixed(2)
      },
      duration_ms: Date.now() - startTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error('❌ Scheduled retraining error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Scheduled retraining failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
