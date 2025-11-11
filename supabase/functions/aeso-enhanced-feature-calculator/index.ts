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

    console.log('🔧 Phase 7: Calculating Enhanced Features with Proper Lags...');

    // Fetch all training data ordered by timestamp
    const { data: trainingData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('id, timestamp, pool_price, ail_mw, generation_wind, generation_solar, temperature_calgary, temperature_edmonton, hour_of_day')
      .order('timestamp', { ascending: true });

    if (fetchError || !trainingData || trainingData.length === 0) {
      throw new Error(`Failed to fetch training data: ${fetchError?.message || 'No data'}`);
    }

    console.log(`Processing ${trainingData.length} records...`);

    const updates: any[] = [];
    let processedCount = 0;

    // Calculate features for each record
    for (let i = 0; i < trainingData.length; i++) {
      const record = trainingData[i];
      const timestamp = new Date(record.timestamp);

      // Find lagged prices by looking backwards in the array
      const lag1h = i >= 1 ? trainingData[i - 1]?.pool_price : null;
      const lag2h = i >= 2 ? trainingData[i - 2]?.pool_price : null;
      const lag3h = i >= 3 ? trainingData[i - 3]?.pool_price : null;
      const lag24h = i >= 24 ? trainingData[i - 24]?.pool_price : null;

      // Calculate rolling average and std dev (24h window)
      let rolling_avg_24h = null;
      let rolling_std_24h = null;
      if (i >= 24) {
        const window24h = trainingData.slice(i - 24, i).map(r => r.pool_price);
        rolling_avg_24h = window24h.reduce((sum, p) => sum + p, 0) / 24;
        
        const variance = window24h.reduce((sum, p) => sum + Math.pow(p - rolling_avg_24h!, 2), 0) / 24;
        rolling_std_24h = Math.sqrt(variance);
      }

      // Calculate momentum (rate of change)
      const momentum_1h = lag1h !== null ? ((record.pool_price - lag1h) / lag1h) * 100 : null;
      const momentum_3h = lag3h !== null ? ((record.pool_price - lag3h) / lag3h) * 100 : null;

      // Calculate interaction terms
      const wind_hour_interaction = record.generation_wind !== null && record.hour_of_day !== null
        ? record.generation_wind * record.hour_of_day
        : null;

      const avg_temp = record.temperature_calgary !== null && record.temperature_edmonton !== null
        ? (record.temperature_calgary + record.temperature_edmonton) / 2
        : null;
      
      const temp_demand_interaction = avg_temp !== null && record.ail_mw !== null
        ? avg_temp * record.ail_mw
        : null;

      updates.push({
        id: record.id,
        price_lag_1h: lag1h,
        price_lag_2h: lag2h,
        price_lag_3h: lag3h,
        price_lag_24h: lag24h,
        price_rolling_avg_24h: rolling_avg_24h,
        price_rolling_std_24h: rolling_std_24h,
        price_momentum_1h: momentum_1h,
        price_momentum_3h: momentum_3h,
        wind_hour_interaction,
        temp_demand_interaction
      });

      processedCount++;

      // Batch update every 1000 records
      if (updates.length >= 1000) {
        console.log(`Updating batch at record ${processedCount}...`);
        
        for (const update of updates) {
          await supabase
            .from('aeso_training_data')
            .update(update)
            .eq('id', update.id);
        }
        
        updates.length = 0; // Clear array
      }
    }

    // Update remaining records
    if (updates.length > 0) {
      console.log(`Updating final batch of ${updates.length} records...`);
      
      for (const update of updates) {
        await supabase
          .from('aeso_training_data')
          .update(update)
          .eq('id', update.id);
      }
    }

    console.log(`✅ Enhanced features calculated for ${processedCount} records`);

    return new Response(JSON.stringify({
      success: true,
      records_processed: processedCount,
      message: 'Enhanced features calculated successfully'
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
