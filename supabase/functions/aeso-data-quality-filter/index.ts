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

    // Calculate basic statistics (but don't use for aggressive filtering)
    const prices = trainingData.map(r => r.pool_price).filter(p => p !== null);
    prices.sort((a, b) => a - b);
    
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    const q1Index = Math.floor(prices.length * 0.25);
    const q3Index = Math.floor(prices.length * 0.75);
    const q1 = prices[q1Index];
    const q3 = prices[q3Index];
    const iqr = q3 - q1;
    
    // Only filter truly bad data - energy markets have legitimate spikes
    const lowerBound = 0; // Only negative prices are invalid
    const upperBound = 999999; // No upper bound - let model see real volatility
    
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

    // Mark negative prices as invalid (only truly bad data)
    const { data: negativeRecords } = await supabase
      .from('aeso_training_data')
      .update({ is_valid_record: false })
      .lt('pool_price', 0)
      .select('id, pool_price, timestamp');
    
    const negativeCount = negativeRecords?.length || 0;
    if (negativeCount > 0) {
      console.log(`  Found ${negativeCount} negative price records`);
    }

    // Mark impossibly high prices as invalid (>$2000/MWh is data error, not market condition)
    const { data: errorRecords } = await supabase
      .from('aeso_training_data')
      .update({ is_valid_record: false })
      .gt('pool_price', 2000)
      .select('id, pool_price, timestamp');
    
    const errorCount = errorRecords?.length || 0;
    if (errorCount > 0) {
      console.log(`  Found ${errorCount} impossibly high price records (>$2000)`);
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
      data_errors: errorCount,
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
