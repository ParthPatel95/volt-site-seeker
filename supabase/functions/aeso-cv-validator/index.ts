import { serve } from "../_shared/imports.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔄 Starting time series cross-validation...');
    const startTime = Date.now();

    // Parse request parameters
    const { numFolds = 5, validationWindowHours = 168 } = await req.json().catch(() => ({}));

    console.log(`Generating ${numFolds} CV folds with ${validationWindowHours}h validation windows...`);

    // Step 1: Generate CV folds
    const { data: folds, error: foldsError } = await supabase.rpc('generate_time_series_cv_folds', {
      num_folds: numFolds,
      validation_window_hours: validationWindowHours
    });

    if (foldsError) {
      console.error('❌ Error generating CV folds:', foldsError);
      throw foldsError;
    }

    console.log(`✅ Generated ${folds?.length || 0} CV folds`);

    // Step 2: Train and validate on each fold
    const foldResults = [];

    for (const fold of folds || []) {
      console.log(`\n📊 Processing Fold ${fold.fold_number}/${numFolds}`);
      console.log(`  Training: ${fold.train_start} to ${fold.train_end}`);
      console.log(`  Validation: ${fold.validation_start} to ${fold.validation_end}`);

      try {
        // Get training data for this fold
        const { data: trainingData, error: trainError } = await supabase
          .from('aeso_training_data')
          .select('*')
          .gte('timestamp', fold.train_start)
          .lte('timestamp', fold.train_end)
          .not('pool_price', 'is', null)
          .not('price_lag_1h', 'is', null)
          .not('price_lag_24h', 'is', null)
          .order('timestamp', { ascending: true });

        if (trainError) {
          console.error(`❌ Error fetching training data for fold ${fold.fold_number}:`, trainError);
          continue;
        }

        console.log(`  Training records: ${trainingData?.length || 0}`);

        // Get validation data for this fold
        const { data: validationData, error: valError } = await supabase
          .from('aeso_training_data')
          .select('*')
          .gte('timestamp', fold.validation_start)
          .lte('timestamp', fold.validation_end)
          .not('pool_price', 'is', null)
          .not('price_lag_1h', 'is', null)
          .not('price_lag_24h', 'is', null)
          .order('timestamp', { ascending: true });

        if (valError) {
          console.error(`❌ Error fetching validation data for fold ${fold.fold_number}:`, valError);
          continue;
        }

        console.log(`  Validation records: ${validationData?.length || 0}`);

        if (!trainingData?.length || !validationData?.length) {
          console.log(`  ⚠️ Skipping fold ${fold.fold_number} - insufficient data`);
          continue;
        }

        // Train model using aeso-ml-predictor (using training data to build model parameters)
        const { data: modelResponse, error: modelError } = await supabase.functions.invoke('aeso-ml-predictor', {
          body: {
            trainingData: trainingData.slice(-1000), // Use last 1000 records for efficiency
            predictionData: validationData,
            mode: 'validate'
          }
        });

        if (modelError) {
          console.error(`❌ Error training/validating model for fold ${fold.fold_number}:`, modelError);
          continue;
        }

        const predictions = modelResponse?.predictions || [];
        console.log(`  Generated ${predictions.length} predictions`);

        // Calculate metrics
        let totalAbsError = 0;
        let totalSquaredError = 0;
        let totalSymmetricError = 0;
        let totalPercentError = 0;
        let validCount = 0;

        for (let i = 0; i < Math.min(predictions.length, validationData.length); i++) {
          const actual = validationData[i].pool_price;
          const predicted = predictions[i];

          if (actual && predicted && actual > 0) {
            const absError = Math.abs(predicted - actual);
            const symmetricError = (absError / ((Math.abs(actual) + Math.abs(predicted)) / 2)) * 100;
            const percentError = (absError / actual) * 100;

            totalAbsError += absError;
            totalSquaredError += absError * absError;
            totalSymmetricError += symmetricError;
            totalPercentError += percentError;
            validCount++;
          }
        }

        if (validCount > 0) {
          const mae = totalAbsError / validCount;
          const rmse = Math.sqrt(totalSquaredError / validCount);
          const smape = totalSymmetricError / validCount;
          const mape = totalPercentError / validCount;

          console.log(`  📈 Fold ${fold.fold_number} Metrics:`);
          console.log(`     sMAPE: ${smape.toFixed(2)}%`);
          console.log(`     MAE: ${mae.toFixed(2)}`);
          console.log(`     RMSE: ${rmse.toFixed(2)}`);
          console.log(`     MAPE: ${mape.toFixed(2)}%`);

          // Store fold results
          const { error: insertError } = await supabase
            .from('aeso_cv_folds')
            .insert({
              fold_number: fold.fold_number,
              train_start_date: fold.train_start,
              train_end_date: fold.train_end,
              validation_start_date: fold.validation_start,
              validation_end_date: fold.validation_end,
              model_version: 'ml_predictor_v1',
              smape: smape,
              mae: mae,
              rmse: rmse,
              mape: mape
            });

          if (insertError) {
            console.error(`❌ Error storing fold ${fold.fold_number} results:`, insertError);
          }

          foldResults.push({
            fold_number: fold.fold_number,
            smape,
            mae,
            rmse,
            mape,
            validation_samples: validCount
          });
        }

      } catch (foldError) {
        console.error(`❌ Error processing fold ${fold.fold_number}:`, foldError);
      }
    }

    // Step 3: Calculate average metrics across all folds
    if (foldResults.length > 0) {
      const avgSMAPE = foldResults.reduce((sum, r) => sum + r.smape, 0) / foldResults.length;
      const avgMAE = foldResults.reduce((sum, r) => sum + r.mae, 0) / foldResults.length;
      const avgRMSE = foldResults.reduce((sum, r) => sum + r.rmse, 0) / foldResults.length;
      const avgMAPE = foldResults.reduce((sum, r) => sum + r.mape, 0) / foldResults.length;

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`\n✅ Cross-Validation Complete (${duration}s)`);
      console.log(`📊 Average Metrics across ${foldResults.length} folds:`);
      console.log(`   sMAPE: ${avgSMAPE.toFixed(2)}%`);
      console.log(`   MAE: ${avgMAE.toFixed(2)}`);
      console.log(`   RMSE: ${avgRMSE.toFixed(2)}`);
      console.log(`   MAPE: ${avgMAPE.toFixed(2)}%`);

      return new Response(JSON.stringify({
        success: true,
        duration_seconds: parseFloat(duration),
        num_folds: foldResults.length,
        fold_results: foldResults,
        average_metrics: {
          smape: avgSMAPE,
          mae: avgMAE,
          rmse: avgRMSE,
          mape: avgMAPE
        },
        message: `Cross-validation complete. Average sMAPE: ${avgSMAPE.toFixed(2)}%`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('No folds completed successfully');
    }

  } catch (error) {
    console.error('❌ Cross-validation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
