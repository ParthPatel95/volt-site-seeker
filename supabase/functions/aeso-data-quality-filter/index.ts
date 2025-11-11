import { serve, createClient } from "../_shared/imports.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Phase 7: Filtering Data Quality...');

    // Fetch all training data
    const { data: trainingData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('id, timestamp, pool_price, ail_mw, generation_wind');

    if (fetchError || !trainingData) {
      throw new Error(`Failed to fetch training data: ${fetchError?.message}`);
    }

    console.log(`Analyzing ${trainingData.length} records...`);

    // Calculate statistics for outlier detection (include zeros, exclude nulls)
    const prices = trainingData.map(r => r.pool_price).filter(p => p !== null);
    prices.sort((a, b) => a - b);
    
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    // IQR method for outlier detection
    const q1Index = Math.floor(prices.length * 0.25);
    const q3Index = Math.floor(prices.length * 0.75);
    const q1 = prices[q1Index];
    const q3 = prices[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = Math.max(0, q1 - 3 * iqr); // Prices can't be negative
    const upperBound = q3 + 3 * iqr;
    
    console.log(`Price statistics:`);
    console.log(`  Mean: $${mean.toFixed(2)}, StdDev: $${stdDev.toFixed(2)}`);
    console.log(`  Q1: $${q1.toFixed(2)}, Q3: $${q3.toFixed(2)}, IQR: $${iqr.toFixed(2)}`);
    console.log(`  Valid range: $${lowerBound.toFixed(2)} - $${upperBound.toFixed(2)}`);

    // Use SQL to mark invalid records efficiently (bulk operation)
    console.log('Marking all records as valid by default...');
    await supabase
      .from('aeso_training_data')
      .update({ is_valid_record: true })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    // Mark negative prices as invalid
    const { data: negativeRecords } = await supabase
      .from('aeso_training_data')
      .update({ is_valid_record: false })
      .lt('pool_price', 0)
      .select('id, pool_price, timestamp');
    
    const negativeCount = negativeRecords?.length || 0;
    if (negativeCount > 0) {
      console.log(`  Found ${negativeCount} negative price records`);
    }

    // Mark extreme spikes as invalid (>$500/MWh)
    const { data: spikeRecords } = await supabase
      .from('aeso_training_data')
      .update({ is_valid_record: false })
      .gt('pool_price', 500)
      .select('id, pool_price, timestamp');
    
    const spikeCount = spikeRecords?.length || 0;
    if (spikeCount > 0) {
      console.log(`  Found ${spikeCount} extreme spike records`);
    }

    // Mark statistical outliers as invalid
    const { data: outlierRecords } = await supabase
      .from('aeso_training_data')
      .update({ is_valid_record: false })
      .or(`pool_price.lt.${lowerBound},pool_price.gt.${upperBound}`)
      .select('id, pool_price, timestamp');
    
    const outlierCount = outlierRecords?.length || 0;
    if (outlierCount > 0) {
      console.log(`  Found ${outlierCount} statistical outlier records`);
    }

    // Count final valid/invalid records
    const { count: validCount } = await supabase
      .from('aeso_training_data')
      .select('*', { count: 'exact', head: true })
      .eq('is_valid_record', true);

    const { count: invalidCount } = await supabase
      .from('aeso_training_data')
      .select('*', { count: 'exact', head: true })
      .eq('is_valid_record', false);

    const invalidReasons = {
      negative_price: negativeCount,
      extreme_spike: spikeCount,
      outlier: outlierCount,
      missing_critical_data: 0
    };

    console.log(`\n✅ Data quality filtering complete:`);
    console.log(`  Valid records: ${validCount} (${(validCount / trainingData.length * 100).toFixed(1)}%)`);
    console.log(`  Invalid records: ${invalidCount} (${(invalidCount / trainingData.length * 100).toFixed(1)}%)`);
    console.log(`  Breakdown:`, invalidReasons);

    return new Response(JSON.stringify({
      success: true,
      total_records: trainingData.length,
      valid_records: validCount,
      invalid_records: invalidCount,
      invalid_reasons: invalidReasons,
      quality_score: (validCount / trainingData.length * 100).toFixed(1),
      statistics: {
        mean,
        std_dev: stdDev,
        q1,
        q3,
        iqr,
        valid_range: { lower: lowerBound, upper: upperBound }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Data quality filtering error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
