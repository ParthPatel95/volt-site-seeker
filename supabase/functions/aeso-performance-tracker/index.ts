import { serve, createClient } from "../_shared/imports.ts";

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

    console.log('Tracking model performance...');

    // Get all predictions that have actual values now
    const { data: predictions, error: fetchError } = await supabase
      .from('aeso_predictions')
      .select('*')
      .is('actual_price', null)
      .lte('target_timestamp', new Date().toISOString())
      .order('target_timestamp', { ascending: false })
      .limit(1000);

    if (fetchError) throw fetchError;

    if (!predictions || predictions.length === 0) {
      console.log('No predictions to validate');
      return new Response(
        JSON.stringify({ success: true, message: 'No predictions to validate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Validating ${predictions.length} predictions...`);

    let validated = 0;
    const errors: number[] = [];
    const absoluteErrors: number[] = [];

    for (const prediction of predictions) {
      // Get actual price at target timestamp
      const { data: actual, error: actualError } = await supabase
        .from('aeso_training_data')
        .select('pool_price')
        .eq('timestamp', prediction.target_timestamp)
        .single();

      if (actualError || !actual) {
        console.log(`No actual data for ${prediction.target_timestamp}`);
        continue;
      }

      const actualPrice = actual.pool_price;
      const predictedPrice = prediction.predicted_price;
      const error = predictedPrice - actualPrice;
      const absoluteError = Math.abs(error);
      const percentError = (absoluteError / actualPrice) * 100;

      errors.push(error);
      absoluteErrors.push(absoluteError);

      // Update prediction with actual values
      const { error: updateError } = await supabase
        .from('aeso_predictions')
        .update({
          actual_price: actualPrice,
          prediction_error: error,
          absolute_error: absoluteError,
          percent_error: percentError
        })
        .eq('id', prediction.id);

      if (updateError) {
        console.error('Error updating prediction:', updateError);
      } else {
        validated++;
      }
    }

    // Calculate performance metrics
    const rmse = Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / errors.length);
    const mae = absoluteErrors.reduce((sum, e) => sum + e, 0) / absoluteErrors.length;
    const mape = absoluteErrors.reduce((sum, e, i) => {
      const actual = predictions[i].actual_price || 1;
      return sum + (e / actual) * 100;
    }, 0) / absoluteErrors.length;

    console.log(`Performance metrics - RMSE: ${rmse}, MAE: ${mae}, MAPE: ${mape}%`);

    // Store performance metrics using existing table structure
    const { error: metricsError } = await supabase
      .from('aeso_model_performance')
      .insert({
        evaluation_date: new Date().toISOString(),
        predictions_evaluated: validated,
        rmse,
        mae,
        mape,
        model_version: 'ensemble_v1'
      });

    if (metricsError) {
      console.error('Error storing metrics:', metricsError);
    }

    // Check if retraining is needed (performance degradation)
    const { data: recentPerformance } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('evaluation_date', { ascending: false })
      .limit(10);

    let needsRetraining = false;
    if (recentPerformance && recentPerformance.length >= 5) {
      const avgRecentRMSE = recentPerformance
        .slice(0, 5)
        .reduce((sum, p) => sum + p.rmse, 0) / 5;
      
      const avgOlderRMSE = recentPerformance
        .slice(5, 10)
        .reduce((sum, p) => sum + p.rmse, 0) / 5;
      
      // If performance degraded by more than 20%, trigger retraining
      if (avgRecentRMSE > avgOlderRMSE * 1.2) {
        needsRetraining = true;
        console.log('⚠️ Performance degradation detected - retraining recommended');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        validated,
        metrics: {
          rmse: Math.round(rmse * 100) / 100,
          mae: Math.round(mae * 100) / 100,
          mape: Math.round(mape * 100) / 100
        },
        needsRetraining
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in performance tracker:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
