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

    console.log('🧮 Starting Phase 3 feature calculation (Weather, Gas, Interactions, Volatility, Momentum)...');

    // Fetch natural gas prices first to join with training data
    const { data: gasData, error: gasError } = await supabase
      .from('aeso_natural_gas_prices')
      .select('timestamp, price')
      .order('timestamp', { ascending: true });

    if (gasError) {
      console.error('Error fetching gas prices:', gasError);
      throw gasError;
    }

    console.log(`📊 Fetched ${gasData?.length || 0} natural gas price records`);

    // Fetch training data with weather info
    const { data: trainingData, error: trainingError } = await supabase
      .from('aeso_training_data')
      .select(`
        id, timestamp, pool_price, ail_mw, 
        generation_wind, generation_solar,
        temperature_calgary, temperature_edmonton,
        wind_speed, cloud_cover,
        hour_of_day
      `)
      .order('timestamp', { ascending: true });

    if (trainingError) {
      console.error('Error fetching training data:', trainingError);
      throw trainingError;
    }

    console.log(`📊 Processing ${trainingData?.length || 0} training records`);

    // Create a map of gas prices by timestamp (rounded to hour)
    const gasPriceMap = new Map(
      gasData?.map(g => [
        new Date(g.timestamp).toISOString().substring(0, 13),
        g.price
      ]) || []
    );

    // Process records in batches
    const batchSize = 500;
    let updatedCount = 0;
    let gasFeatures = 0;
    let interactionFeatures = 0;
    let volatilityFeatures = 0;
    let momentumFeatures = 0;

    for (let i = 0; i < (trainingData?.length || 0); i += batchSize) {
      const batch = trainingData!.slice(i, i + batchSize);
      const updates = [];

      for (let j = 0; j < batch.length; j++) {
        const record = batch[j];
        const timestamp = new Date(record.timestamp);
        const hourKey = timestamp.toISOString().substring(0, 13);
        
        // Get natural gas price for this hour
        const gasPrice = gasPriceMap.get(hourKey) || null;
        
        // Calculate gas lag features
        const lag24Key = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000).toISOString().substring(0, 13);
        const gasLag24 = gasPriceMap.get(lag24Key) || null;

        // Calculate 7-day moving average
        let gasSum = 0;
        let gasCount = 0;
        for (let d = 0; d < 7; d++) {
          const lagKey = new Date(timestamp.getTime() - d * 24 * 60 * 60 * 1000).toISOString().substring(0, 13);
          const price = gasPriceMap.get(lagKey);
          if (price) {
            gasSum += price;
            gasCount++;
          }
        }
        const gasMa7d = gasCount > 0 ? gasSum / gasCount : null;

        // Calculate gas momentum (24h change)
        const gasMomentum = gasPrice && gasLag24 ? gasPrice - gasLag24 : null;

        // Calculate interaction features
        const avgTemp = record.temperature_calgary && record.temperature_edmonton 
          ? (record.temperature_calgary + record.temperature_edmonton) / 2 
          : null;

        const gasDemandInteraction = gasPrice && record.ail_mw 
          ? gasPrice * record.ail_mw / 10000 
          : null;

        const gasTempInteraction = gasPrice && avgTemp 
          ? gasPrice * avgTemp / 100 
          : null;

        const gasWindInteraction = gasPrice && record.wind_speed 
          ? gasPrice * record.wind_speed / 10 
          : null;

        const tempDemandInteraction = avgTemp && record.ail_mw 
          ? avgTemp * record.ail_mw / 10000 
          : null;

        const windHourInteraction = record.wind_speed && record.hour_of_day 
          ? record.wind_speed * record.hour_of_day / 10 
          : null;

        const windSolarDemandInteraction = record.generation_wind && record.generation_solar && record.ail_mw 
          ? (record.generation_wind + record.generation_solar) * record.ail_mw / 100000 
          : null;

        const tempDemandHourInteraction = avgTemp && record.ail_mw && record.hour_of_day 
          ? avgTemp * record.ail_mw * record.hour_of_day / 100000 
          : null;

        // Calculate volatility features from recent price history
        const recentPrices = trainingData!
          .filter(r => {
            const rt = new Date(r.timestamp).getTime();
            const ct = timestamp.getTime();
            return rt <= ct && rt > ct - 24 * 60 * 60 * 1000;
          })
          .map(r => r.pool_price);

        const priceStd = recentPrices.length > 1 
          ? Math.sqrt(recentPrices.reduce((sum, p) => sum + Math.pow(p - recentPrices.reduce((a, b) => a + b) / recentPrices.length, 2), 0) / (recentPrices.length - 1))
          : null;

        const recentWind = trainingData!
          .filter(r => {
            const rt = new Date(r.timestamp).getTime();
            const ct = timestamp.getTime();
            return rt <= ct && rt > ct - 6 * 60 * 60 * 1000 && r.generation_wind != null;
          })
          .map(r => r.generation_wind!);

        const windVolatility = recentWind.length > 1
          ? Math.sqrt(recentWind.reduce((sum, w) => sum + Math.pow(w - recentWind.reduce((a, b) => a + b) / recentWind.length, 2), 0) / (recentWind.length - 1))
          : null;

        const renewableVolatility = record.generation_wind && record.generation_solar && windVolatility
          ? windVolatility * (record.generation_wind + record.generation_solar) / 1000
          : null;

        // Calculate momentum features
        const priceMomentum1h = trainingData![j > 0 ? j - 1 : j] 
          ? record.pool_price - trainingData![j > 0 ? j - 1 : j].pool_price 
          : null;

        const priceMomentum3h = trainingData![j > 2 ? j - 3 : j]
          ? record.pool_price - trainingData![j > 2 ? j - 3 : j].pool_price
          : null;

        const update: any = { id: record.id };

        // Gas features
        if (gasPrice !== null) {
          update.gas_price_aeco = gasPrice;
          gasFeatures++;
        }
        if (gasLag24 !== null) update.gas_price_lag_24h = gasLag24;
        if (gasMa7d !== null) update.gas_price_ma_7d = gasMa7d;
        if (gasMomentum !== null) {
          update.gas_price_momentum = gasMomentum;
          momentumFeatures++;
        }

        // Interaction features
        if (gasDemandInteraction !== null) {
          update.gas_demand_interaction = gasDemandInteraction;
          interactionFeatures++;
        }
        if (gasTempInteraction !== null) {
          update.gas_temp_interaction = gasTempInteraction;
          interactionFeatures++;
        }
        if (gasWindInteraction !== null) {
          update.gas_wind_interaction = gasWindInteraction;
          interactionFeatures++;
        }
        if (tempDemandInteraction !== null) {
          update.temp_demand_interaction = tempDemandInteraction;
          interactionFeatures++;
        }
        if (windHourInteraction !== null) {
          update.wind_hour_interaction = windHourInteraction;
          interactionFeatures++;
        }
        if (windSolarDemandInteraction !== null) {
          update.wind_solar_demand_interaction = windSolarDemandInteraction;
          interactionFeatures++;
        }
        if (tempDemandHourInteraction !== null) {
          update.temp_demand_hour_interaction = tempDemandHourInteraction;
          interactionFeatures++;
        }

        // Volatility features
        if (windVolatility !== null) {
          update.wind_volatility_6h = windVolatility;
          volatilityFeatures++;
        }
        if (renewableVolatility !== null) {
          update.renewable_volatility = renewableVolatility;
          volatilityFeatures++;
        }

        // Momentum features
        if (priceMomentum1h !== null) {
          update.price_momentum_1h = priceMomentum1h;
          momentumFeatures++;
        }
        if (priceMomentum3h !== null) {
          update.price_momentum_3h = priceMomentum3h;
          momentumFeatures++;
        }

        updates.push(update);
      }

      // Batch update
      const { error: updateError } = await supabase
        .from('aeso_training_data')
        .upsert(updates, { onConflict: 'id' });

      if (updateError) {
        console.error('Batch update error:', updateError);
        throw updateError;
      }

      updatedCount += updates.length;
      console.log(`✅ Updated batch ${Math.floor(i / batchSize) + 1}, ${updatedCount} records total`);
    }

    const stats = {
      total_records: trainingData?.length || 0,
      updated_records: updatedCount,
      gas_features: gasFeatures,
      interaction_features: interactionFeatures,
      volatility_features: volatilityFeatures,
      momentum_features: momentumFeatures,
      natural_gas_coverage: `${gasData?.length || 0} price points`,
    };

    console.log('📊 Phase 3 Statistics:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        phase: 'phase_3',
        description: 'Weather Integration, Natural Gas Prices, Interactions, Volatility & Momentum',
        stats,
        improvements: [
          '✅ Natural gas price integration with AECO prices',
          '✅ Weather interaction features (temp-demand, wind-hour, etc.)',
          '✅ Gas interaction features (gas-demand, gas-temp, gas-wind)',
          '✅ Volatility metrics for wind and renewable generation',
          '✅ Price and gas momentum indicators'
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Phase 3 feature calculation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Phase 3 feature calculation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
