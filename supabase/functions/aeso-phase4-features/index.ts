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

    console.log('🔬 Starting Phase 4 feature calculation (Advanced Feature Engineering)...');

    // Fetch training data
    const { data: trainingData, error: trainingError } = await supabase
      .from('aeso_training_data')
      .select(`
        id, timestamp, pool_price, ail_mw,
        generation_wind, generation_solar, generation_gas, generation_coal, generation_hydro,
        temperature_calgary, temperature_edmonton,
        renewable_penetration, price_rolling_avg_24h,
        gas_price_aeco, wind_speed, hour_of_day
      `)
      .order('timestamp', { ascending: true });

    if (trainingError) {
      console.error('Error fetching training data:', trainingError);
      throw trainingError;
    }

    console.log(`📊 Processing ${trainingData?.length || 0} training records`);

    // Process records in batches
    const batchSize = 500;
    let updatedCount = 0;
    let polynomialFeatures = 0;
    let ratioFeatures = 0;
    let crossFeatures = 0;
    let binningFeatures = 0;

    for (let i = 0; i < (trainingData?.length || 0); i += batchSize) {
      const batch = trainingData!.slice(i, i + batchSize);
      const updates = [];

      for (const record of batch) {
        const update: any = { id: record.id };

        // === POLYNOMIAL FEATURES ===
        // Price squared and cubed (capture non-linear price dynamics)
        if (record.pool_price !== null) {
          update.price_squared = Math.pow(record.pool_price, 2);
          update.price_cubed = Math.pow(record.pool_price, 3);
          polynomialFeatures += 2;
        }

        // Demand squared (capture non-linear demand effects)
        if (record.ail_mw !== null) {
          update.demand_squared = Math.pow(record.ail_mw, 2);
          polynomialFeatures++;
        }

        // Wind generation squared (capture wind variability impact)
        if (record.generation_wind !== null) {
          update.wind_generation_squared = Math.pow(record.generation_wind, 2);
          polynomialFeatures++;
        }

        // === RATIO FEATURES ===
        // Price to demand ratio (efficiency metric)
        if (record.pool_price !== null && record.ail_mw !== null && record.ail_mw > 0) {
          update.price_per_mw_demand = record.pool_price / record.ail_mw;
          ratioFeatures++;
        }

        // Renewable generation ratio
        const totalGen = (record.generation_wind || 0) + (record.generation_solar || 0) + 
                        (record.generation_gas || 0) + (record.generation_coal || 0) + 
                        (record.generation_hydro || 0);
        
        if (totalGen > 0) {
          const renewableGen = (record.generation_wind || 0) + (record.generation_solar || 0);
          update.renewable_ratio = renewableGen / totalGen;
          ratioFeatures++;
        }

        // Gas generation ratio
        if (totalGen > 0 && record.generation_gas !== null) {
          update.gas_generation_ratio = record.generation_gas / totalGen;
          ratioFeatures++;
        }

        // Price to moving average ratio (price momentum indicator)
        if (record.pool_price !== null && record.price_rolling_avg_24h !== null && record.price_rolling_avg_24h > 0) {
          update.price_to_ma_ratio = record.pool_price / record.price_rolling_avg_24h;
          ratioFeatures++;
        }

        // === CROSS FEATURES ===
        // Price × Demand interaction
        if (record.pool_price !== null && record.ail_mw !== null) {
          update.price_demand_cross = record.pool_price * record.ail_mw / 10000;
          crossFeatures++;
        }

        // Renewable penetration × Price
        if (record.renewable_penetration !== null && record.pool_price !== null) {
          update.renewable_price_cross = record.renewable_penetration * record.pool_price / 100;
          crossFeatures++;
        }

        // Gas price × Demand
        if (record.gas_price_aeco !== null && record.ail_mw !== null) {
          update.gas_price_demand_cross = record.gas_price_aeco * record.ail_mw / 10000;
          crossFeatures++;
        }

        // Temperature × Demand (heating/cooling effect)
        const avgTemp = record.temperature_calgary && record.temperature_edmonton
          ? (record.temperature_calgary + record.temperature_edmonton) / 2
          : null;
        
        if (avgTemp !== null && record.ail_mw !== null) {
          update.temperature_demand_cross = avgTemp * record.ail_mw / 10000;
          crossFeatures++;
        }

        // Wind speed × Wind generation (wind efficiency)
        if (record.wind_speed !== null && record.generation_wind !== null) {
          update.wind_speed_generation_cross = record.wind_speed * record.generation_wind / 1000;
          crossFeatures++;
        }

        // === BINNING FEATURES ===
        // Price bins (categorize price levels)
        if (record.pool_price !== null) {
          if (record.pool_price < 0) {
            update.price_bin = 0; // Negative pricing
          } else if (record.pool_price < 50) {
            update.price_bin = 1; // Low price
          } else if (record.pool_price < 100) {
            update.price_bin = 2; // Normal price
          } else if (record.pool_price < 200) {
            update.price_bin = 3; // High price
          } else if (record.pool_price < 500) {
            update.price_bin = 4; // Very high price
          } else {
            update.price_bin = 5; // Extreme price spike
          }
          binningFeatures++;
        }

        // Demand bins
        if (record.ail_mw !== null) {
          if (record.ail_mw < 8000) {
            update.demand_bin = 0; // Very low
          } else if (record.ail_mw < 9500) {
            update.demand_bin = 1; // Low
          } else if (record.ail_mw < 11000) {
            update.demand_bin = 2; // Normal
          } else if (record.ail_mw < 12000) {
            update.demand_bin = 3; // High
          } else {
            update.demand_bin = 4; // Very high
          }
          binningFeatures++;
        }

        // Time of day bins
        if (record.hour_of_day !== null) {
          if (record.hour_of_day < 6) {
            update.time_bin = 0; // Night
          } else if (record.hour_of_day < 9) {
            update.time_bin = 1; // Morning ramp
          } else if (record.hour_of_day < 17) {
            update.time_bin = 2; // Day
          } else if (record.hour_of_day < 21) {
            update.time_bin = 3; // Evening peak
          } else {
            update.time_bin = 4; // Late evening
          }
          binningFeatures++;
        }

        // Renewable penetration bins
        if (record.renewable_penetration !== null) {
          if (record.renewable_penetration < 10) {
            update.renewable_bin = 0; // Very low renewables
          } else if (record.renewable_penetration < 25) {
            update.renewable_bin = 1; // Low renewables
          } else if (record.renewable_penetration < 40) {
            update.renewable_bin = 2; // Moderate renewables
          } else if (record.renewable_penetration < 60) {
            update.renewable_bin = 3; // High renewables
          } else {
            update.renewable_bin = 4; // Very high renewables
          }
          binningFeatures++;
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
      polynomial_features: polynomialFeatures,
      ratio_features: ratioFeatures,
      cross_features: crossFeatures,
      binning_features: binningFeatures,
    };

    console.log('📊 Phase 4 Statistics:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        phase: 'phase_4',
        description: 'Advanced Feature Engineering: Polynomials, Ratios, Crosses & Binning',
        stats,
        improvements: [
          '✅ Polynomial features (price², price³, demand², wind²)',
          '✅ Ratio features (price/demand, renewable/total, gas/total, price/MA)',
          '✅ Cross features (price×demand, renewable×price, gas×demand, temp×demand, wind×generation)',
          '✅ Binning features (price bins, demand bins, time bins, renewable bins)'
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Phase 4 feature calculation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Phase 4 feature calculation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
