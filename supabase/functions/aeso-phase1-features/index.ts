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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🚀 Phase 1 Feature Calculation Starting...');
    console.log('📊 New features: 6h/12h/168h lags, quantiles, day_type');

    // Call the SQL function to calculate all enhanced features (now includes Phase 1)
    const { data, error } = await supabase.rpc('calculate_enhanced_features_batch');

    if (error) {
      console.error('❌ Error calculating Phase 1 features:', error);
      throw error;
    }

    // Count records with new Phase 1 features
    const { count, error: countError } = await supabase
      .from('aeso_training_data')
      .select('*', { count: 'exact', head: true })
      .not('price_lag_6h', 'is', null);

    if (countError) {
      console.error('Error counting records:', countError);
    }

    console.log(`✅ Phase 1 features calculated for ${count || 'all'} records`);

    // Get sample of new Phase 1 features
    const { data: sampleData } = await supabase
      .from('aeso_training_data')
      .select(`
        timestamp,
        pool_price,
        price_lag_6h, 
        price_lag_12h, 
        price_lag_168h,
        price_quantile_10th_24h,
        price_quantile_50th_24h,
        price_quantile_90th_24h,
        demand_quantile_90th_24h,
        day_type
      `)
      .order('timestamp', { ascending: false })
      .limit(5);

    console.log('Sample Phase 1 features:', JSON.stringify(sampleData, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        records_processed: count || 0,
        message: 'Phase 1 ML improvements applied: Extended lags (6h, 12h, 168h), quantile features, day_type, and prediction clipping [$0-$1000]',
        improvements: {
          extended_lags: ['6h', '12h', '168h (1 week)'],
          quantile_features: ['10th, 50th, 90th percentile prices', '90th percentile demand'],
          day_type: 'Categorical feature (0=weekday, 1=weekend, 2=holiday)',
          prediction_clipping: 'All predictions now clipped to [$0-$1000] range',
          training_window: 'Using all available historical data for better patterns'
        },
        sample_features: sampleData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Phase 1 feature calculation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Phase 1 feature calculation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
