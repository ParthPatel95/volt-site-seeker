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

    console.log('🔍 Starting hourly prediction validation...');
    const now = new Date();

    // ========== STEP 1: FIND PREDICTIONS READY FOR VALIDATION ==========
    // Get predictions where target_timestamp has passed and not yet validated
    const { data: predictions, error: fetchError } = await supabase
      .from('aeso_price_predictions')
      .select('*')
      .lte('target_timestamp', now.toISOString())
      .is('validated_at', null)
      .order('target_timestamp', { ascending: true })
      .limit(500); // Validate up to 500 predictions per run

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

    // ========== STEP 2: VALIDATE EACH PREDICTION ==========
    const validationRecords = [];
    let validatedCount = 0;
    let errorCount = 0;

    for (const pred of predictions) {
      try {
        // Find actual price within ±30 minutes of target
        const { data: actualData, error: actualError } = await supabase
          .from('aeso_training_data')
          .select('pool_price, timestamp')
          .gte('timestamp', new Date(new Date(pred.target_timestamp).getTime() - 30 * 60 * 1000).toISOString())
          .lte('timestamp', new Date(new Date(pred.target_timestamp).getTime() + 30 * 60 * 1000).toISOString())
          .eq('is_valid_record', true)
          .order('timestamp', { ascending: true })
          .limit(1);

        if (actualError) {
          console.error(`Error fetching actual data for prediction ${pred.id}:`, actualError);
          errorCount++;
          continue;
        }

        if (!actualData || actualData.length === 0) {
          console.log(`⚠️ No actual data found for target ${pred.target_timestamp}`);
          errorCount++;
          continue;
        }

        const actual = actualData[0];
        const actualPrice = actual.pool_price;
        const predictedPrice = pred.predicted_price;

        // Calculate error metrics
        const absoluteError = Math.abs(actualPrice - predictedPrice);
        const percentError = actualPrice !== 0 ? (absoluteError / Math.abs(actualPrice)) * 100 : 0;
        
        // Symmetric MAPE (handles zero prices better)
        const denominator = (Math.abs(actualPrice) + Math.abs(predictedPrice)) / 2;
        const symmetricPercentError = denominator > 0.01 ? (absoluteError / denominator) * 100 : 0;

        const withinConfidence = actualPrice >= (pred.confidence_lower || 0) && 
                                 actualPrice <= (pred.confidence_upper || 999);

        // Determine regime of actual price
        let actualRegime = 'normal';
        if (actualPrice >= 200) {
          actualRegime = 'spike';
        } else if (actualPrice >= 100) {
          actualRegime = 'elevated';
        }

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
          predicted_regime: pred.features_used?.regime || 'unknown',
          spike_risk: pred.features_used?.spikeRisk || 0
        });

        validatedCount++;

      } catch (error) {
        console.error(`Error validating prediction ${pred.id}:`, error);
        errorCount++;
      }
    }

    // ========== STEP 3: STORE VALIDATION RESULTS ==========
    if (validationRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('aeso_prediction_accuracy')
        .insert(validationRecords);

      if (insertError) {
        console.error('Error inserting validation records:', insertError);
        throw insertError;
      }

      // Mark predictions as validated
      const predictionIds = validationRecords.map(v => v.prediction_id);
      const { error: updateError } = await supabase
        .from('aeso_price_predictions')
        .update({ validated_at: now.toISOString() })
        .in('id', predictionIds);

      if (updateError) {
        console.error('Error updating predictions:', updateError);
      }

      console.log(`✅ Validated ${validatedCount} predictions successfully`);
    }

    // ========== STEP 4: CALCULATE AGGREGATE METRICS ==========
    // Calculate metrics by horizon
    const metricsByHorizon: Record<number, any> = {};
    for (const record of validationRecords) {
      const h = record.horizon_hours;
      if (!metricsByHorizon[h]) {
        metricsByHorizon[h] = {
          count: 0,
          totalAE: 0,
          totalSMAPE: 0,
          withinConf: 0,
          byRegime: { normal: [], elevated: [], spike: [] }
        };
      }
      
      metricsByHorizon[h].count++;
      metricsByHorizon[h].totalAE += record.absolute_error;
      metricsByHorizon[h].totalSMAPE += record.symmetric_percent_error;
      if (record.within_confidence) metricsByHorizon[h].withinConf++;
      
      metricsByHorizon[h].byRegime[record.actual_regime as 'normal' | 'elevated' | 'spike'].push(record.absolute_error);
    }

    // Calculate metrics by regime
    const metricsByRegime: Record<string, any> = {
      normal: { errors: [], count: 0 },
      elevated: { errors: [], count: 0 },
      spike: { errors: [], count: 0 }
    };

    for (const record of validationRecords) {
      const regime = record.actual_regime;
      metricsByRegime[regime].errors.push(record.absolute_error);
      metricsByRegime[regime].count++;
    }

    // Calculate summary statistics
    const summary: any = {
      timestamp: now.toISOString(),
      total_validated: validatedCount,
      errors: errorCount,
      by_horizon: {},
      by_regime: {}
    };

    for (const [horizon, metrics] of Object.entries(metricsByHorizon)) {
      summary.by_horizon[horizon] = {
        count: metrics.count,
        mae: Math.round(metrics.totalAE / metrics.count * 100) / 100,
        smape: Math.round(metrics.totalSMAPE / metrics.count * 100) / 100,
        confidence_hit_rate: Math.round((metrics.withinConf / metrics.count) * 100 * 100) / 100
      };
    }

    for (const [regime, data] of Object.entries(metricsByRegime)) {
      if (data.count > 0) {
        const mae = data.errors.reduce((sum: number, e: number) => sum + e, 0) / data.count;
        summary.by_regime[regime] = {
          count: data.count,
          mae: Math.round(mae * 100) / 100
        };
      }
    }

    console.log('📈 Validation Summary:', JSON.stringify(summary, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        validated: validatedCount,
        errors: errorCount,
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
