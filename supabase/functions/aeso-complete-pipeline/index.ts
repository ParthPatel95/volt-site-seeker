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

    console.log('🚀 Starting AESO Complete Pipeline...');
    console.log('====================================');
    
    const results: any = {
      steps: [],
      success: true,
      startTime: new Date().toISOString()
    };

    // STEP 1: Collect current market data
    console.log('\n📊 STEP 1: Collecting current market data...');
    try {
      const { data: collectorData, error: collectorError } = await supabase.functions.invoke('aeso-data-collector');
      
      if (collectorError) {
        console.error('Data collection failed:', collectorError);
        results.steps.push({
          step: 1,
          name: 'Data Collection',
          success: false,
          error: collectorError.message
        });
      } else {
        console.log('✅ Current market data collected');
        results.steps.push({
          step: 1,
          name: 'Data Collection',
          success: true,
          data: collectorData
        });
      }
    } catch (error: any) {
      console.error('Data collection error:', error);
      results.steps.push({
        step: 1,
        name: 'Data Collection',
        success: false,
        error: error.message
      });
    }

    // STEP 2: Calculate enhanced features (lag features, rolling averages, etc.)
    console.log('\n🔧 STEP 2: Calculating enhanced features...');
    try {
      const { error: featuresError } = await supabase.rpc('calculate_enhanced_features_batch');
      
      if (featuresError) {
        console.error('Enhanced features calculation failed:', featuresError);
        results.steps.push({
          step: 2,
          name: 'Enhanced Features',
          success: false,
          error: featuresError.message
        });
      } else {
        console.log('✅ Enhanced features calculated');
        
        // Get count of records with features
        const { count } = await supabase
          .from('aeso_training_data')
          .select('*', { count: 'exact', head: true })
          .not('price_lag_1h', 'is', null);
        
        results.steps.push({
          step: 2,
          name: 'Enhanced Features',
          success: true,
          recordsWithFeatures: count
        });
      }
    } catch (error: any) {
      console.error('Enhanced features error:', error);
      results.steps.push({
        step: 2,
        name: 'Enhanced Features',
        success: false,
        error: error.message
      });
    }

    // STEP 3: Check data quality
    console.log('\n🔍 STEP 3: Analyzing data quality...');
    try {
      const { data: qualityData, error: qualityError } = await supabase.functions.invoke('aeso-data-quality-analyzer');
      
      if (qualityError) {
        console.warn('Data quality analysis failed:', qualityError);
        results.steps.push({
          step: 3,
          name: 'Data Quality Analysis',
          success: false,
          error: qualityError.message
        });
      } else {
        console.log('✅ Data quality analyzed');
        results.steps.push({
          step: 3,
          name: 'Data Quality Analysis',
          success: true,
          quality: qualityData
        });
      }
    } catch (error: any) {
      console.warn('Data quality analysis error:', error);
      results.steps.push({
        step: 3,
        name: 'Data Quality Analysis',
        success: false,
        error: error.message
      });
    }

    // STEP 4: Train the model with enhanced features
    console.log('\n🤖 STEP 4: Training model with enhanced features...');
    try {
      const { data: trainData, error: trainError } = await supabase.functions.invoke('aeso-model-trainer');
      
      if (trainError) {
        console.error('Model training failed:', trainError);
        results.steps.push({
          step: 4,
          name: 'Model Training',
          success: false,
          error: trainError.message
        });
        results.success = false;
      } else {
        console.log('✅ Model training completed');
        results.steps.push({
          step: 4,
          name: 'Model Training',
          success: true,
          performance: trainData
        });
      }
    } catch (error: any) {
      console.error('Model training error:', error);
      results.steps.push({
        step: 4,
        name: 'Model Training',
        success: false,
        error: error.message
      });
      results.success = false;
    }

    // STEP 5: Get latest model performance
    console.log('\n📈 STEP 5: Retrieving model performance metrics...');
    try {
      const { data: perfData, error: perfError } = await supabase
        .from('aeso_model_performance')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (perfError) {
        console.warn('Performance retrieval failed:', perfError);
      } else {
        console.log('✅ Performance metrics retrieved');
        const smape = perfData.smape || perfData.mape; // Use sMAPE if available, fallback to MAPE
        const trainingRecords = perfData.training_records || perfData.predictions_evaluated;
        
        console.log(`   sMAPE: ${smape?.toFixed(2)}%`);
        console.log(`   MAE: $${perfData.mae?.toFixed(2)}/MWh`);
        console.log(`   RMSE: $${perfData.rmse?.toFixed(2)}/MWh`);
        console.log(`   R²: ${perfData.r_squared?.toFixed(4)}`);
        console.log(`   Training Records: ${trainingRecords}`);
        
        results.steps.push({
          step: 5,
          name: 'Performance Metrics',
          success: true,
          metrics: {
            smape: smape,
            mape: perfData.mape,
            mae: perfData.mae,
            rmse: perfData.rmse,
            r_squared: perfData.r_squared,
            training_records: trainingRecords,
            predictions_evaluated: perfData.predictions_evaluated,
            model_version: perfData.model_version
          }
        });
      }
    } catch (error: any) {
      console.warn('Performance retrieval error:', error);
    }

    results.endTime = new Date().toISOString();
    results.duration = (new Date(results.endTime).getTime() - new Date(results.startTime).getTime()) / 1000;

    console.log('\n====================================');
    console.log(`🏁 Pipeline complete in ${results.duration}s`);
    console.log(`✅ Success: ${results.success}`);
    
    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: results.success ? 200 : 500
    });

  } catch (error: any) {
    console.error('Pipeline error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
