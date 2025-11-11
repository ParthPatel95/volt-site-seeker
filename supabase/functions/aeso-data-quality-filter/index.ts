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

    console.log('🔍 Starting data quality filtering...');

    // Get all records to analyze
    const { data: allData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false });

    if (fetchError) throw fetchError;

    if (!allData || allData.length === 0) {
      throw new Error('No training data found');
    }

    console.log(`📊 Analyzing ${allData.length} records for quality issues`);

    // Calculate statistics for outlier detection
    const prices = allData.map(r => r.pool_price).filter(p => p !== null && p !== undefined);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const stdDev = Math.sqrt(
      prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
    );

    const upperBound = avgPrice + (3 * stdDev); // 3 standard deviations
    const lowerBound = Math.max(0, avgPrice - (3 * stdDev));

    console.log(`Price bounds: ${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)} $/MWh`);

    let invalidCount = 0;
    let nullFeatureCount = 0;
    let extremeOutlierCount = 0;
    let negativeValueCount = 0;

    const updatePromises = [];

    for (const record of allData) {
      let isValid = true;
      let reason = '';

      // Check 1: Null pool price
      if (record.pool_price === null || record.pool_price === undefined) {
        isValid = false;
        reason = 'null_price';
        invalidCount++;
      }
      // Check 2: Critical features missing (Phase 3)
      else if (
        record.price_lag_1h === null ||
        record.net_demand === null ||
        record.renewable_penetration === null
      ) {
        isValid = false;
        reason = 'missing_features';
        nullFeatureCount++;
      }
      // Check 3: Extreme price outliers (beyond 3 std dev)
      else if (record.pool_price < lowerBound || record.pool_price > upperBound) {
        isValid = false;
        reason = 'extreme_outlier';
        extremeOutlierCount++;
      }
      // Check 4: Negative generation values
      else if (
        (record.generation_wind !== null && record.generation_wind < 0) ||
        (record.generation_solar !== null && record.generation_solar < 0) ||
        (record.generation_gas !== null && record.generation_gas < 0)
      ) {
        isValid = false;
        reason = 'negative_generation';
        negativeValueCount++;
      }

      // Update is_valid_record flag
      if (record.is_valid_record !== isValid) {
        updatePromises.push(
          supabase
            .from('aeso_training_data')
            .update({ is_valid_record: isValid })
            .eq('id', record.id)
        );
      }
    }

    // Execute all updates in batches
    console.log(`📝 Updating ${updatePromises.length} records...`);
    
    // Process in batches of 100
    for (let i = 0; i < updatePromises.length; i += 100) {
      const batch = updatePromises.slice(i, i + 100);
      await Promise.all(batch);
    }

    const validCount = allData.length - invalidCount - nullFeatureCount - extremeOutlierCount - negativeValueCount;

    const summary = {
      total_records: allData.length,
      valid_records: validCount,
      invalid_records: invalidCount + nullFeatureCount + extremeOutlierCount + negativeValueCount,
      issues: {
        null_price: invalidCount,
        missing_features: nullFeatureCount,
        extreme_outliers: extremeOutlierCount,
        negative_values: negativeValueCount
      },
      price_statistics: {
        mean: avgPrice.toFixed(2),
        std_dev: stdDev.toFixed(2),
        lower_bound: lowerBound.toFixed(2),
        upper_bound: upperBound.toFixed(2)
      }
    };

    console.log('✅ Data quality filtering complete:', JSON.stringify(summary, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        ...summary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Data quality filtering error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Data quality filtering failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
