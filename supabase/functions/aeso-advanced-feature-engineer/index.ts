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

    console.log('🚀 Starting Advanced Feature Engineering Pipeline...');
    console.log('This includes: Fourier transforms, natural gas integration, weather forecasts, and advanced interactions');

    // Step 1: Get all training data with timestamps
    console.log('\n📊 Step 1: Fetching training data...');
    const { data: trainingData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: true });

    if (fetchError || !trainingData || trainingData.length === 0) {
      throw new Error(`Failed to fetch training data: ${fetchError?.message}`);
    }

    console.log(`✅ Loaded ${trainingData.length} records`);

    // Step 2: Fetch natural gas prices and create lookup map
    console.log('\n⛽ Step 2: Fetching natural gas prices...');
    const { data: gasData, error: gasError } = await supabase
      .from('aeso_natural_gas_prices')
      .select('*')
      .order('timestamp', { ascending: true });

    if (gasError) {
      console.warn('⚠️ Failed to fetch natural gas data:', gasError.message);
    }

    // Create gas price lookup by date
    const gasPriceLookup = new Map();
    if (gasData) {
      for (const gas of gasData) {
        const dateKey = new Date(gas.timestamp).toISOString().split('T')[0];
        gasPriceLookup.set(dateKey, gas.price_per_mmbtu);
      }
      console.log(`✅ Loaded ${gasData.length} natural gas price records`);
    }

    // Step 3: Calculate Fourier features for seasonality
    console.log('\n🌊 Step 3: Calculating Fourier features...');
    const updatedRecords = [];
    
    for (let i = 0; i < trainingData.length; i++) {
      const record = trainingData[i];
      const timestamp = new Date(record.timestamp);
      
      // Calculate Fourier features
      const hourOfYear = (timestamp.getMonth() * 30 * 24) + (timestamp.getDate() * 24) + timestamp.getHours();
      const dayOfYear = Math.floor(hourOfYear / 24);
      
      // Daily cycle (24 hours)
      const daily_sin_1 = Math.sin(2 * Math.PI * timestamp.getHours() / 24);
      const daily_cos_1 = Math.cos(2 * Math.PI * timestamp.getHours() / 24);
      const daily_sin_2 = Math.sin(4 * Math.PI * timestamp.getHours() / 24);
      const daily_cos_2 = Math.cos(4 * Math.PI * timestamp.getHours() / 24);
      
      // Weekly cycle (7 days)
      const weekly_sin = Math.sin(2 * Math.PI * timestamp.getDay() / 7);
      const weekly_cos = Math.cos(2 * Math.PI * timestamp.getDay() / 7);
      
      // Annual cycle (365 days)
      const annual_sin_1 = Math.sin(2 * Math.PI * dayOfYear / 365);
      const annual_cos_1 = Math.cos(2 * Math.PI * dayOfYear / 365);
      const annual_sin_2 = Math.sin(4 * Math.PI * dayOfYear / 365);
      const annual_cos_2 = Math.cos(4 * Math.PI * dayOfYear / 365);
      
      // Get natural gas price for this date
      const dateKey = timestamp.toISOString().split('T')[0];
      const gas_price = gasPriceLookup.get(dateKey) || null;
      
      // Calculate gas price momentum if we have previous data
      let gas_price_lag_24h = null;
      let gas_price_momentum = null;
      let gas_price_ma_7d = null;
      
      if (gas_price !== null) {
        // Look back 24 hours for lag
        const lag24Date = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
        const lag24Key = lag24Date.toISOString().split('T')[0];
        gas_price_lag_24h = gasPriceLookup.get(lag24Key) || null;
        
        if (gas_price_lag_24h !== null) {
          gas_price_momentum = ((gas_price - gas_price_lag_24h) / gas_price_lag_24h) * 100;
        }
        
        // Calculate 7-day moving average
        let sum = 0;
        let count = 0;
        for (let j = 0; j < 7; j++) {
          const backDate = new Date(timestamp.getTime() - j * 24 * 60 * 60 * 1000);
          const backKey = backDate.toISOString().split('T')[0];
          const backPrice = gasPriceLookup.get(backKey);
          if (backPrice !== undefined) {
            sum += backPrice;
            count++;
          }
        }
        if (count > 0) {
          gas_price_ma_7d = sum / count;
        }
      }
      
      // Advanced interaction features
      const temp_avg = (record.temperature_calgary + record.temperature_edmonton) / 2;
      const gas_temp_interaction = gas_price !== null ? gas_price * temp_avg : null;
      const gas_demand_interaction = gas_price !== null && record.ail_mw !== null ? gas_price * record.ail_mw : null;
      const gas_wind_interaction = gas_price !== null && record.generation_wind !== null ? gas_price * (10000 - record.generation_wind) : null;
      
      // Market timing features
      const is_morning_ramp = timestamp.getHours() >= 6 && timestamp.getHours() <= 9 ? 1 : 0;
      const is_evening_peak = timestamp.getHours() >= 17 && timestamp.getHours() <= 21 ? 1 : 0;
      const is_overnight = timestamp.getHours() >= 23 || timestamp.getHours() <= 5 ? 1 : 0;
      
      // Weekend interaction with demand
      const weekend_demand_factor = record.is_weekend && record.ail_mw !== null ? record.ail_mw * 0.85 : record.ail_mw;
      
      // Temperature extremes
      const temp_extreme_cold = temp_avg < -10 ? 1 : 0;
      const temp_extreme_hot = temp_avg > 25 ? 1 : 0;
      
      // Renewable generation volatility
      let renewable_volatility = null;
      if (i >= 6) {
        const recentRenewables = [];
        for (let j = 0; j < 6; j++) {
          const prevRecord = trainingData[i - j];
          const renewable = (prevRecord.generation_wind || 0) + (prevRecord.generation_solar || 0);
          recentRenewables.push(renewable);
        }
        const mean = recentRenewables.reduce((sum, val) => sum + val, 0) / recentRenewables.length;
        const variance = recentRenewables.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentRenewables.length;
        renewable_volatility = Math.sqrt(variance);
      }
      
      updatedRecords.push({
        id: record.id,
        // Fourier features
        fourier_daily_sin_1: daily_sin_1,
        fourier_daily_cos_1: daily_cos_1,
        fourier_daily_sin_2: daily_sin_2,
        fourier_daily_cos_2: daily_cos_2,
        fourier_weekly_sin: weekly_sin,
        fourier_weekly_cos: weekly_cos,
        fourier_annual_sin_1: annual_sin_1,
        fourier_annual_cos_1: annual_cos_1,
        fourier_annual_sin_2: annual_sin_2,
        fourier_annual_cos_2: annual_cos_2,
        // Natural gas features
        gas_price_aeco: gas_price,
        gas_price_lag_24h: gas_price_lag_24h,
        gas_price_momentum: gas_price_momentum,
        gas_price_ma_7d: gas_price_ma_7d,
        // Gas interactions
        gas_temp_interaction: gas_temp_interaction,
        gas_demand_interaction: gas_demand_interaction,
        gas_wind_interaction: gas_wind_interaction,
        // Market timing
        is_morning_ramp: is_morning_ramp,
        is_evening_peak: is_evening_peak,
        is_overnight: is_overnight,
        // Advanced features
        weekend_demand_factor: weekend_demand_factor,
        temp_extreme_cold: temp_extreme_cold,
        temp_extreme_hot: temp_extreme_hot,
        renewable_volatility: renewable_volatility,
      });
    }

    console.log(`✅ Calculated advanced features for ${updatedRecords.length} records`);

    // Step 4: Update records in batches
    console.log('\n💾 Step 4: Updating database...');
    const batchSize = 500;
    let updated = 0;
    
    for (let i = 0; i < updatedRecords.length; i += batchSize) {
      const batch = updatedRecords.slice(i, i + batchSize);
      
      for (const record of batch) {
        const { error: updateError } = await supabase
          .from('aeso_training_data')
          .update(record)
          .eq('id', record.id);
        
        if (updateError) {
          console.error(`Error updating record ${record.id}:`, updateError.message);
        } else {
          updated++;
        }
      }
      
      console.log(`Updated ${Math.min(i + batchSize, updatedRecords.length)}/${updatedRecords.length} records...`);
    }

    console.log(`\n✅ Advanced feature engineering complete! Updated ${updated} records`);
    
    // Calculate feature coverage statistics
    const gasCoverage = updatedRecords.filter(r => r.gas_price_aeco !== null).length;
    const gasPercentage = (gasCoverage / updatedRecords.length * 100).toFixed(1);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Advanced features calculated successfully',
      stats: {
        total_records: updatedRecords.length,
        updated_records: updated,
        natural_gas_coverage: `${gasCoverage} records (${gasPercentage}%)`,
        fourier_features: 10,
        gas_features: 7,
        timing_features: 3,
        advanced_features: 4
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Advanced feature engineering error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
