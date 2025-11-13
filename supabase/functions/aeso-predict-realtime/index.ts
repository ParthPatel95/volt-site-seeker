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

    const { hoursAhead = 24 } = await req.json();
    console.log(`🔮 Real-time prediction request for ${hoursAhead} hours ahead`);

    // Get latest trained model info
    const { data: modelData, error: modelError } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (modelError || !modelData) {
      throw new Error('No trained model found. Please train a model first.');
    }

    console.log(`📊 Using model: ${modelData.model_version} (sMAPE: ${modelData.smape?.toFixed(2)}%)`);

    // Get latest market data for feature calculation
    const { data: latestData, error: dataError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(168); // Last week for feature calculation

    if (dataError || !latestData || latestData.length === 0) {
      throw new Error('Insufficient data for prediction. Please collect market data first.');
    }

    console.log(`✅ Retrieved ${latestData.length} records for feature calculation`);

    // Generate predictions using ensemble
    const { data: ensembleData, error: ensembleError } = await supabase.functions.invoke(
      'aeso-ensemble-predictor',
      { body: { hoursAhead } }
    );

    if (ensembleError) {
      throw new Error(`Ensemble prediction failed: ${ensembleError.message}`);
    }

    if (!ensembleData?.success) {
      throw new Error(ensembleData?.error || 'Ensemble prediction failed');
    }

    console.log(`✅ Generated ${ensembleData.predictions.length} predictions`);

    // Calculate prediction confidence metrics
    const predictions = ensembleData.predictions.map((pred: any) => ({
      ...pred,
      confidence_level: pred.prediction_std < 10 ? 'high' : 
                       pred.prediction_std < 20 ? 'medium' : 'low',
      model_version: modelData.model_version,
      prediction_quality: {
        model_smape: modelData.smape,
        model_mae: modelData.mae,
        model_rmse: modelData.rmse,
        prediction_uncertainty: pred.prediction_std
      }
    }));

    return new Response(
      JSON.stringify({
        success: true,
        predictions,
        model_info: {
          version: modelData.model_version,
          trained_at: modelData.created_at,
          performance: {
            smape: modelData.smape,
            mae: modelData.mae,
            rmse: modelData.rmse,
            r_squared: modelData.r_squared
          }
        },
        weights_used: ensembleData.weights_used,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('❌ Real-time prediction error:', error);
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
