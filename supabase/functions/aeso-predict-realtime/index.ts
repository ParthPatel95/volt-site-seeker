import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

import { corsHeaders } from "../_shared/cors.ts";

// Predictions are only as fresh as the last `aeso_training_data` row. If
// the data-collector cron has lagged, calling this function "real-time"
// is misleading: features will reflect old market state. We:
//  1. Always include `data_age_minutes` in the response so the UI can
//     render a "based on data N min old" caveat.
//  2. Auto-trigger a one-shot `aeso-data-collector` invocation when the
//     freshest training row is older than this threshold.
const TRAINING_DATA_STALE_MIN = 30;

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
    let { data: latestData, error: dataError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(168); // Last week for feature calculation

    if (dataError || !latestData || latestData.length === 0) {
      throw new Error('Insufficient data for prediction. Please collect market data first.');
    }

    // Stale-data guard: if the freshest training row is too old, trigger
    // the collector and re-read. We don't await collector failures — if
    // it fails we still serve the stale data and tag it as such so the UI
    // can warn the user.
    const newestTs = latestData[0]?.timestamp ? new Date(latestData[0].timestamp).getTime() : 0;
    let dataAgeMinutes = newestTs ? Math.round((Date.now() - newestTs) / 60000) : Number.POSITIVE_INFINITY;
    let dataRefreshed = false;

    if (dataAgeMinutes > TRAINING_DATA_STALE_MIN) {
      console.warn(`⚠️ Training data is ${dataAgeMinutes}m old (threshold ${TRAINING_DATA_STALE_MIN}m); kicking aeso-data-collector`);
      try {
        await supabase.functions.invoke('aeso-data-collector', { body: { reason: 'predict-realtime stale' } });
        const refreshed = await supabase
          .from('aeso_training_data')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(168);
        if (!refreshed.error && refreshed.data && refreshed.data.length > 0) {
          latestData = refreshed.data;
          const newTs = refreshed.data[0]?.timestamp ? new Date(refreshed.data[0].timestamp).getTime() : 0;
          if (newTs) {
            dataAgeMinutes = Math.round((Date.now() - newTs) / 60000);
            dataRefreshed = true;
          }
        }
      } catch (collectorErr) {
        console.error('⚠️ aeso-data-collector invocation failed; proceeding with stale data', collectorErr);
      }
    }

    console.log(`✅ Retrieved ${latestData.length} records for feature calculation (age: ${dataAgeMinutes}m, refreshed: ${dataRefreshed})`);

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
        // Underlying-data freshness info so the UI can render a caveat
        // when predictions are based on stale market features.
        data_freshness: {
          newest_data_at: latestData[0]?.timestamp ?? null,
          data_age_minutes: Number.isFinite(dataAgeMinutes) ? dataAgeMinutes : null,
          refreshed_during_request: dataRefreshed,
          stale: dataAgeMinutes > TRAINING_DATA_STALE_MIN,
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
