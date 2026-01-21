import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.0";

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

    console.log('🚀 Starting database-side ML training...');

    // Call the database training function - runs entirely in PostgreSQL
    const { data: trainingResult, error: trainingError } = await supabase
      .rpc('train_aeso_model');

    if (trainingError) {
      console.error('❌ Training failed:', trainingError);
      throw trainingError;
    }

    console.log('✅ Training complete:', JSON.stringify(trainingResult, null, 2));

    // Update aeso_model_status for dashboard compatibility
    const { error: statusError } = await supabase
      .from('aeso_model_status')
      .upsert({
        model_version: trainingResult.model_version,
        trained_at: new Date().toISOString(),
        mae: trainingResult.metrics?.mae || 0,
        rmse: trainingResult.metrics?.rmse || 0,
        smape: trainingResult.metrics?.smape || 0,
        r_squared: trainingResult.metrics?.r_squared || 0,
        training_records: trainingResult.training_records || 0,
        model_quality: trainingResult.metrics?.smape < 20 ? 'excellent' :
                       trainingResult.metrics?.smape < 30 ? 'good' :
                       trainingResult.metrics?.smape < 40 ? 'fair' : 'needs_improvement',
        available_training_records: trainingResult.training_records || 0,
        records_with_features: trainingResult.training_records || 0
      }, { onConflict: 'model_version' });

    if (statusError) {
      console.warn('⚠️ Could not update model status:', statusError.message);
    }

    const duration = Date.now() - startTime;
    console.log(`⏱️ Total training time: ${duration}ms`);

    return new Response(JSON.stringify({
      success: true,
      model_version: trainingResult.model_version,
      training_records: trainingResult.training_records,
      global_mean: trainingResult.global_mean,
      metrics: trainingResult.metrics,
      regime_params: trainingResult.regime_params,
      duration_ms: duration,
      method: 'database_side_training'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ ML Trainer error:', errorMessage);

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
