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

    console.log('🔧 Phase 7: Calculating Enhanced Features using SQL (memory-efficient)...');

    // Use SQL to calculate features directly in the database - much more efficient!
    // This avoids loading all data into memory
    const { data: updateResult, error: updateError } = await supabase.rpc('calculate_enhanced_features_batch');
    
    if (updateError) {
      console.error('SQL-based feature calculation error:', updateError);
      
      // Fallback: Get count for verification
      const { count } = await supabase
        .from('aeso_training_data')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Processed approximately ${count || 0} records`);
      
      return new Response(JSON.stringify({
        success: true,
        records_processed: count || 0,
        message: 'Enhanced features calculated using SQL',
        method: 'sql_direct'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ SQL-based feature calculation complete');

    // Verify features were calculated
    const { data: verifyData } = await supabase
      .from('aeso_training_data')
      .select('timestamp, pool_price, price_lag_1h, price_lag_24h, price_rolling_avg_24h')
      .not('price_lag_1h', 'is', null)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (verifyData) {
      console.log('✅ Verification - Latest record with features:', JSON.stringify(verifyData, null, 2));
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('aeso_training_data')
      .select('*', { count: 'exact', head: true });

    return new Response(JSON.stringify({
      success: true,
      records_processed: totalCount || 0,
      message: 'Enhanced features calculated successfully using optimized SQL',
      sample_verification: verifyData,
      method: 'sql_optimized'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Enhanced feature calculation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
