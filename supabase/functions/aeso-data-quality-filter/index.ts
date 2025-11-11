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

    let validCount = 0;
    let invalidCount = 0;
    const invalidReasons: Record<string, number> = {
      negative_price: 0,
      extreme_spike: 0,
      outlier: 0,
      missing_critical_data: 0
    };

    // Mark invalid records
    for (const record of trainingData) {
      let isValid = true;
      const reasons: string[] = [];

      // Check for negative prices only (zero is valid in energy markets)
      if (record.pool_price < 0) {
        isValid = false;
        reasons.push('negative_price');
        invalidReasons.negative_price++;
      }

      // Check for extreme spikes (>$500/MWh is unusual for AESO)
      if (record.pool_price > 500) {
        isValid = false;
        reasons.push('extreme_spike');
        invalidReasons.extreme_spike++;
      }

      // Check for statistical outliers
      if (record.pool_price < lowerBound || record.pool_price > upperBound) {
        isValid = false;
        reasons.push('outlier');
        invalidReasons.outlier++;
      }

      // Check for missing critical data (optional - don't invalidate if we have price)
      // if (!record.ail_mw || !record.generation_wind) {
      //   invalidReasons.missing_critical_data++;
      // }

      // Update record validity
      await supabase
        .from('aeso_training_data')
        .update({ is_valid_record: isValid })
        .eq('id', record.id);

      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
        if (invalidCount <= 5) {
          console.log(`  Invalid record: $${record.pool_price} at ${record.timestamp} - ${reasons.join(', ')}`);
        }
      }
    }

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
