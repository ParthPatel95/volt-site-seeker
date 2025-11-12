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

    console.log('🧮 Starting enhanced feature calculation...');

    // Call the SQL function to calculate all enhanced features
    const { data, error } = await supabase.rpc('calculate_enhanced_features_batch');

    if (error) {
      console.error('Error calculating features:', error);
      throw error;
    }

    // Count records with features
    const { count, error: countError } = await supabase
      .from('aeso_training_data')
      .select('*', { count: 'exact', head: true })
      .not('price_lag_1h', 'is', null);

    if (countError) {
      console.error('Error counting records:', countError);
    }

    console.log(`✅ Enhanced features calculated for ${count || 'all'} records`);

    // Get sample of Phase 2 & 3 features
    const { data: sampleData } = await supabase
      .from('aeso_training_data')
      .select(`
        price_lag_48h, price_lag_72h,
        price_volatility_3h, price_volatility_6h, price_volatility_12h,
        market_stress_score, price_spike_probability,
        supply_cushion, price_acceleration,
        net_demand, renewable_penetration
      `)
      .order('timestamp', { ascending: false })
      .limit(5);

    console.log('Sample Phase 2 & 3 features:', JSON.stringify(sampleData, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        records_processed: count || 0,
        message: 'Enhanced features calculated successfully',
        sample_features: sampleData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Feature calculation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Feature calculation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
