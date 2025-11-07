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

    console.log('Validating prediction accuracy...');

    // Get predictions that have passed their target time
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: predictions, error: predError } = await supabase
      .from('aeso_price_predictions')
      .select('*')
      .gte('target_timestamp', oneDayAgo.toISOString())
      .lte('target_timestamp', now.toISOString())
      .order('target_timestamp', { ascending: true });

    if (predError) throw predError;

    if (!predictions || predictions.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No predictions to validate',
        validated: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${predictions.length} predictions to validate`);

    const errors = [];
    let validatedCount = 0;

    for (const pred of predictions) {
      // Get actual price at target time
      const targetTime = new Date(pred.target_timestamp);
      const { data: actualData, error: actualError } = await supabase
        .from('aeso_training_data')
        .select('pool_price')
        .gte('timestamp', targetTime.toISOString())
        .lte('timestamp', new Date(targetTime.getTime() + 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true })
        .limit(1)
        .single();

      if (actualError || !actualData) {
        console.log(`No actual data for prediction at ${pred.target_timestamp}`);
        continue;
      }

      const actualPrice = actualData.pool_price;
      const predictedPrice = pred.predicted_price;
      const error = Math.abs(actualPrice - predictedPrice);
      const percentError = (error / actualPrice) * 100;

      errors.push({
        prediction_id: pred.id,
        target_timestamp: pred.target_timestamp,
        predicted_price: predictedPrice,
        actual_price: actualPrice,
        absolute_error: error,
        percent_error: percentError,
        horizon_hours: pred.horizon_hours,
        model_version: pred.model_version,
        within_confidence: actualPrice >= pred.confidence_lower && actualPrice <= pred.confidence_upper,
        validated_at: new Date().toISOString()
      });

      validatedCount++;
    }

    // Store validation results
    if (errors.length > 0) {
      const { error: insertError } = await supabase
        .from('aeso_prediction_accuracy')
        .insert(errors);

      if (insertError) {
        console.error('Error storing validation results:', insertError);
      }
    }

    // Calculate summary statistics
    const mae = errors.reduce((sum, e) => sum + e.absolute_error, 0) / errors.length;
    const mape = errors.reduce((sum, e) => sum + e.percent_error, 0) / errors.length;
    const rmse = Math.sqrt(errors.reduce((sum, e) => sum + Math.pow(e.absolute_error, 2), 0) / errors.length);
    const withinConfidence = errors.filter(e => e.within_confidence).length / errors.length;

    console.log(`Validation complete - MAE: $${mae.toFixed(2)}, MAPE: ${mape.toFixed(2)}%, RMSE: $${rmse.toFixed(2)}, Within CI: ${(withinConfidence * 100).toFixed(1)}%`);

    return new Response(JSON.stringify({
      success: true,
      validated: validatedCount,
      summary: {
        mae: Math.round(mae * 100) / 100,
        mape: Math.round(mape * 100) / 100,
        rmse: Math.round(rmse * 100) / 100,
        withinConfidenceInterval: Math.round(withinConfidence * 100) / 100
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
