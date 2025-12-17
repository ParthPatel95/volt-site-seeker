import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🔍 Starting comprehensive prediction validation...');
    const now = new Date();

    // ========== STEP 1: FIND UNVALIDATED PREDICTIONS ==========
    // Get ALL predictions where:
    // 1. target_timestamp has passed (we should have actual data)
    // 2. actual_price is null OR validated_at is null
    const { data: predictions, error: fetchError } = await supabase
      .from('aeso_price_predictions')
      .select('*')
      .lte('target_timestamp', now.toISOString())
      .or('actual_price.is.null,validated_at.is.null')
      .order('target_timestamp', { ascending: false })
      .limit(1000);

    if (fetchError) {
      console.error('Error fetching predictions:', fetchError);
      throw fetchError;
    }

    if (!predictions || predictions.length === 0) {
      console.log('✅ No predictions ready for validation');
      return new Response(
        JSON.stringify({ success: true, validated: 0, message: 'No predictions ready' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${predictions.length} predictions to validate`);

    // ========== STEP 2: BATCH FETCH ACTUAL PRICES ==========
    // Get unique target timestamps and fetch all actual prices in one query
    const targetTimestamps = [...new Set(predictions.map(p => p.target_timestamp))];
    const minTimestamp = new Date(Math.min(...targetTimestamps.map(t => new Date(t).getTime())) - 60 * 60 * 1000).toISOString();
    const maxTimestamp = new Date(Math.max(...targetTimestamps.map(t => new Date(t).getTime())) + 60 * 60 * 1000).toISOString();

    const { data: actualData, error: actualError } = await supabase
      .from('aeso_training_data')
      .select('timestamp, pool_price')
      .gte('timestamp', minTimestamp)
      .lte('timestamp', maxTimestamp)
      .not('pool_price', 'is', null)
      .gt('pool_price', 0)
      .order('timestamp', { ascending: true });

    if (actualError) {
      console.error('Error fetching actual data:', actualError);
      throw actualError;
    }

    console.log(`📊 Fetched ${actualData?.length || 0} actual price records`);

    // Create lookup map for quick matching
    const actualPriceMap = new Map<string, number>();
    for (const record of actualData || []) {
      const hourKey = new Date(record.timestamp).toISOString().substring(0, 13); // YYYY-MM-DDTHH
      actualPriceMap.set(hourKey, record.pool_price);
    }

    // ========== STEP 3: VALIDATE EACH PREDICTION ==========
    const validationRecords = [];
    const predictionUpdates = [];
    let validatedCount = 0;
    let noDataCount = 0;

    for (const pred of predictions) {
      const targetHourKey = new Date(pred.target_timestamp).toISOString().substring(0, 13);
      const actualPrice = actualPriceMap.get(targetHourKey);

      if (actualPrice === undefined) {
        noDataCount++;
        continue;
      }

      const predictedPrice = pred.predicted_price;
      
      // Calculate error metrics
      const absoluteError = Math.abs(actualPrice - predictedPrice);
      const percentError = actualPrice > 0.01 ? (absoluteError / actualPrice) * 100 : 0;
      
      // Symmetric MAPE (better for prices near zero)
      const denominator = (Math.abs(actualPrice) + Math.abs(predictedPrice)) / 2;
      const symmetricPercentError = denominator > 0.01 ? (absoluteError / denominator) * 100 : 0;

      const withinConfidence = actualPrice >= (pred.confidence_lower || 0) && 
                               actualPrice <= (pred.confidence_upper || 999);

      // Determine actual regime
      let actualRegime = 'normal';
      if (actualPrice >= 200) actualRegime = 'spike';
      else if (actualPrice >= 100) actualRegime = 'elevated';
      else if (actualPrice < 30) actualRegime = 'low';

      validationRecords.push({
        prediction_id: pred.id,
        target_timestamp: pred.target_timestamp,
        predicted_price: predictedPrice,
        actual_price: actualPrice,
        absolute_error: Math.round(absoluteError * 100) / 100,
        percent_error: Math.round(percentError * 100) / 100,
        symmetric_percent_error: Math.round(symmetricPercentError * 100) / 100,
        horizon_hours: pred.horizon_hours,
        model_version: pred.model_version,
        within_confidence: withinConfidence,
        validated_at: now.toISOString(),
        actual_regime: actualRegime,
        predicted_regime: pred.features_used?.regime || pred.features_used?.market_regime || 'unknown',
        spike_risk: pred.features_used?.spikeRisk || pred.features_used?.ai_confidence || 0
      });

      // Track updates for the predictions table
      predictionUpdates.push({
        id: pred.id,
        actual_price: actualPrice,
        absolute_error: Math.round(absoluteError * 100) / 100,
        percent_error: Math.round(percentError * 100) / 100,
        symmetric_percent_error: Math.round(symmetricPercentError * 100) / 100,
        validated_at: now.toISOString()
      });

      validatedCount++;
    }

    console.log(`✅ Matched ${validatedCount} predictions with actual prices`);
    console.log(`⚠️ ${noDataCount} predictions have no matching actual data yet`);

    // ========== STEP 4: STORE VALIDATION RESULTS ==========
    if (validationRecords.length > 0) {
      // Insert into accuracy tracking table
      const { error: insertError } = await supabase
        .from('aeso_prediction_accuracy')
        .upsert(validationRecords, { 
          onConflict: 'prediction_id',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error('Error inserting validation records:', insertError);
        // Continue anyway to update predictions table
      }

      // Update predictions table with actual prices (batch update)
      for (const update of predictionUpdates) {
        await supabase
          .from('aeso_price_predictions')
          .update({
            actual_price: update.actual_price,
            absolute_error: update.absolute_error,
            percent_error: update.percent_error,
            symmetric_percent_error: update.symmetric_percent_error,
            validated_at: update.validated_at
          })
          .eq('id', update.id);
      }
    }

    // ========== STEP 5: CALCULATE AGGREGATE METRICS ==========
    const summary = calculateValidationSummary(validationRecords);
    console.log('📈 Validation Summary:', JSON.stringify(summary, null, 2));

    // ========== STEP 6: UPDATE MODEL PERFORMANCE IF SIGNIFICANT SAMPLE ==========
    if (validatedCount >= 24) {
      await updateModelPerformanceMetrics(supabase, validationRecords);
    }

    return new Response(
      JSON.stringify({
        success: true,
        validated: validatedCount,
        no_data: noDataCount,
        total_processed: predictions.length,
        summary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Validation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Validation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function calculateValidationSummary(records: any[]) {
  if (records.length === 0) return { total: 0 };

  // Group by horizon
  const byHorizon: Record<number, any[]> = {};
  for (const r of records) {
    const h = r.horizon_hours;
    if (!byHorizon[h]) byHorizon[h] = [];
    byHorizon[h].push(r);
  }

  // Group by model version
  const byModel: Record<string, any[]> = {};
  for (const r of records) {
    const m = r.model_version || 'unknown';
    if (!byModel[m]) byModel[m] = [];
    byModel[m].push(r);
  }

  // Group by regime
  const byRegime: Record<string, any[]> = {};
  for (const r of records) {
    const regime = r.actual_regime || 'unknown';
    if (!byRegime[regime]) byRegime[regime] = [];
    byRegime[regime].push(r);
  }

  // Calculate metrics for each group
  const calculateMetrics = (arr: any[]) => {
    if (arr.length === 0) return { count: 0 };
    const mae = arr.reduce((s, r) => s + r.absolute_error, 0) / arr.length;
    const smape = arr.reduce((s, r) => s + r.symmetric_percent_error, 0) / arr.length;
    const confHitRate = arr.filter(r => r.within_confidence).length / arr.length * 100;
    return {
      count: arr.length,
      mae: Math.round(mae * 100) / 100,
      smape: Math.round(smape * 100) / 100,
      confidence_hit_rate: Math.round(confHitRate * 10) / 10
    };
  };

  return {
    total: records.length,
    overall: calculateMetrics(records),
    by_horizon: Object.fromEntries(
      Object.entries(byHorizon).map(([h, arr]) => [h, calculateMetrics(arr)])
    ),
    by_model: Object.fromEntries(
      Object.entries(byModel).map(([m, arr]) => [m, calculateMetrics(arr)])
    ),
    by_regime: Object.fromEntries(
      Object.entries(byRegime).map(([r, arr]) => [r, calculateMetrics(arr)])
    )
  };
}

async function updateModelPerformanceMetrics(supabase: any, records: any[]) {
  // Group by model and calculate performance
  const byModel: Record<string, any[]> = {};
  for (const r of records) {
    const m = r.model_version || 'unknown';
    if (!byModel[m]) byModel[m] = [];
    byModel[m].push(r);
  }

  for (const [modelVersion, modelRecords] of Object.entries(byModel)) {
    if (modelRecords.length < 10) continue;

    const mae = modelRecords.reduce((s, r) => s + r.absolute_error, 0) / modelRecords.length;
    const smape = modelRecords.reduce((s, r) => s + r.symmetric_percent_error, 0) / modelRecords.length;
    const rmse = Math.sqrt(modelRecords.reduce((s, r) => s + r.absolute_error * r.absolute_error, 0) / modelRecords.length);

    // Update existing model performance record or create new validation entry
    await supabase.from('aeso_model_performance').insert({
      model_version: modelVersion,
      mae: Math.round(mae * 100) / 100,
      smape: Math.round(smape * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
      predictions_evaluated: modelRecords.length,
      evaluation_date: new Date().toISOString(),
      metadata: {
        validation_type: 'post_hoc',
        horizon_breakdown: Object.fromEntries(
          Object.entries(
            modelRecords.reduce((acc: any, r: any) => {
              const h = r.horizon_hours;
              if (!acc[h]) acc[h] = [];
              acc[h].push(r.absolute_error);
              return acc;
            }, {})
          ).map(([h, errors]: [string, any]) => [
            h,
            Math.round(errors.reduce((a: number, b: number) => a + b, 0) / errors.length * 100) / 100
          ])
        )
      }
    });

    console.log(`📊 Updated performance for ${modelVersion}: MAE=$${mae.toFixed(2)}, sMAPE=${smape.toFixed(2)}%`);
  }
}
