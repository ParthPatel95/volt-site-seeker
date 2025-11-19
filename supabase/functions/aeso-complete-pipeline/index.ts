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
  const steps: any = {};

  try {
    console.log('🚀 Starting Complete AESO ML Pipeline...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Data Collection (7-day historical data)
    console.log('Step 1/5: Collecting historical data...');
    try {
      const { data: collectionData, error: collectionError } = await supabase.functions.invoke('aeso-data-collector');
      
      if (collectionError) throw collectionError;
      
      steps.data_collection = {
        success: true,
        records: collectionData?.records_inserted || 0,
        duration_ms: collectionData?.duration_ms
      };
      console.log(`✅ Data Collection: ${steps.data_collection.records} records`);
    } catch (error: any) {
      console.error('❌ Data collection failed:', error.message);
      steps.data_collection = { success: false, error: error.message };
    }

    // Step 2: Phase 1 Features (Extended Lags & Quantiles)
    console.log('Step 2/6: Calculating Phase 1 features...');
    try {
      const { data: phase1Data, error: phase1Error } = await supabase.functions.invoke('aeso-phase1-features');
      
      if (phase1Error) throw phase1Error;
      
      steps.phase1_features = {
        success: true,
        records_processed: phase1Data?.records_processed || 0
      };
      console.log(`✅ Phase 1 Features: ${steps.phase1_features.records_processed} records`);
    } catch (error: any) {
      console.error('❌ Phase 1 feature engineering failed:', error.message);
      steps.phase1_features = { success: false, error: error.message };
    }

    // Step 3: Phase 2 Features (Fourier Transforms & Timing)
    console.log('Step 3/6: Calculating Phase 2 features...');
    try {
      const { data: phase2Data, error: phase2Error } = await supabase.functions.invoke('aeso-phase2-features');
      
      if (phase2Error) throw phase2Error;
      
      steps.phase2_features = {
        success: true,
        stats: phase2Data?.stats || {}
      };
      console.log(`✅ Phase 2 Features: ${phase2Data?.stats?.updated_records || 0} records`);
    } catch (error: any) {
      console.error('❌ Phase 2 feature engineering failed:', error.message);
      steps.phase2_features = { success: false, error: error.message };
    }

    // Step 4: Phase 3 Features (Gas Prices & Interactions)
    console.log('Step 4/6: Calculating Phase 3 features...');
    try {
      const { data: phase3Data, error: phase3Error } = await supabase.functions.invoke('aeso-phase3-features');
      
      if (phase3Error) throw phase3Error;
      
      steps.phase3_features = {
        success: true,
        stats: phase3Data?.stats || {}
      };
      console.log(`✅ Phase 3 Features: ${phase3Data?.stats?.updated_records || 0} records`);
    } catch (error: any) {
      console.error('❌ Phase 3 feature engineering failed:', error.message);
      steps.phase3_features = { success: false, error: error.message };
    }

    // Step 5: Phase 4 Features (Advanced Polynomials & Ratios)
    console.log('Step 5/6: Calculating Phase 4 features...');
    try {
      const { data: phase4Data, error: phase4Error } = await supabase.functions.invoke('aeso-phase4-features');
      
      if (phase4Error) throw phase4Error;
      
      steps.phase4_features = {
        success: true,
        stats: phase4Data?.stats || {}
      };
      console.log(`✅ Phase 4 Features: ${phase4Data?.stats?.updated_records || 0} records`);
    } catch (error: any) {
      console.error('❌ Phase 4 feature engineering failed:', error.message);
      steps.phase4_features = { success: false, error: error.message };
    }

    // Step 6: Data Quality Analysis
    console.log('Step 6/7: Running data quality analysis...');
    try {
      const { data: qualityData, error: qualityError } = await supabase.functions.invoke('aeso-data-quality-filter');
      
      if (qualityError) throw qualityError;
      
      steps.quality_analysis = {
        success: true,
        valid_records: qualityData?.valid_records || 0,
        total_records: qualityData?.total_records || 0
      };
      console.log(`✅ Quality Analysis: ${steps.quality_analysis.valid_records}/${steps.quality_analysis.total_records} valid`);
    } catch (error: any) {
      console.error('❌ Quality analysis failed:', error.message);
      steps.quality_analysis = { success: false, error: error.message };
    }

    // Step 7: Stacked Ensemble Model Training
    console.log('Step 7/7: Training stacked ensemble model...');
    try {
      const { data: trainingData, error: trainingError } = await supabase.functions.invoke('aeso-stacked-ensemble-trainer');
      
      if (trainingError) throw trainingError;
      
      steps.model_training = {
        success: true,
        model_version: trainingData?.model_version,
        metrics: trainingData?.metrics || {}
      };
      console.log(`✅ Model Training: v${steps.model_training.model_version}, sMAPE: ${trainingData?.metrics?.test_smape?.toFixed(2)}%`);
    } catch (error: any) {
      console.error('❌ Model training failed:', error.message);
      steps.model_training = { success: false, error: error.message };
    }

    const duration_ms = Date.now() - startTime;
    const allSuccess = Object.values(steps).every((step: any) => step.success);

    console.log(`\n🎯 Pipeline completed in ${(duration_ms / 1000).toFixed(1)}s`);
    console.log('Steps summary:', Object.entries(steps).map(([name, data]: [string, any]) => 
      `${name}: ${data.success ? '✅' : '❌'}`
    ).join(', '));

    return new Response(
      JSON.stringify({
        success: allSuccess,
        duration_ms,
        steps,
        summary: {
          data_collected: steps.data_collection?.records || 0,
          phase1_records: steps.phase1_features?.records_processed || 0,
          phase2_records: steps.phase2_features?.stats?.updated_records || 0,
          phase3_records: steps.phase3_features?.stats?.updated_records || 0,
          phase4_records: steps.phase4_features?.stats?.updated_records || 0,
          valid_records: steps.quality_analysis?.valid_records || 0,
          model_version: steps.model_training?.model_version,
          test_smape: steps.model_training?.metrics?.test_smape
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error: any) {
    console.error('❌ Pipeline error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        duration_ms: Date.now() - startTime,
        steps
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
