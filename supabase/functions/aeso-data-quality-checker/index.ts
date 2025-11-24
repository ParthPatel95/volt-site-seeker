import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Running data quality checks...');

    // Get recent training data (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .gte('timestamp', sevenDaysAgo)
      .order('timestamp', { ascending: true });

    if (fetchError) throw fetchError;
    if (!recentData || recentData.length === 0) {
      throw new Error('No recent training data available');
    }

    console.log(`Analyzing ${recentData.length} records for quality issues...`);

    const issues: any[] = [];
    const cleanedRecords: any[] = [];
    let outlierCount = 0;
    let missingValueCount = 0;
    let duplicateCount = 0;

    // Check for duplicates
    const timestamps = new Set();
    const duplicates = new Set();
    for (const record of recentData) {
      if (timestamps.has(record.timestamp)) {
        duplicates.add(record.timestamp);
        duplicateCount++;
      }
      timestamps.add(record.timestamp);
    }

    if (duplicates.size > 0) {
      issues.push({
        type: 'duplicate_timestamps',
        severity: 'error',
        count: duplicateCount,
        message: `Found ${duplicateCount} duplicate timestamp records`,
        timestamps: Array.from(duplicates).slice(0, 10)
      });
    }

    // Check each record for quality issues
    for (const record of recentData) {
      const recordIssues: string[] = [];

      // Check for missing critical values
      const criticalFields = ['pool_price', 'ail_mw', 'tng_mw'];
      for (const field of criticalFields) {
        if (record[field] === null || record[field] === undefined) {
          recordIssues.push(`missing_${field}`);
          missingValueCount++;
        }
      }

      // Detect outliers in pool price (outside 3 standard deviations)
      if (record.pool_price !== null) {
        const prices = recentData
          .filter(r => r.pool_price !== null)
          .map(r => r.pool_price);
        
        const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const stdDev = Math.sqrt(
          prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
        );

        if (Math.abs(record.pool_price - mean) > 3 * stdDev) {
          recordIssues.push('price_outlier');
          outlierCount++;
        }

        // Check for impossible values
        if (record.pool_price < -1000 || record.pool_price > 10000) {
          recordIssues.push('price_impossible');
        }
      }

      // Check load values
      if (record.ail_mw !== null && (record.ail_mw < 5000 || record.ail_mw > 15000)) {
        recordIssues.push('load_unusual');
      }

      // Check generation values
      if (record.tng_mw !== null && (record.tng_mw < 5000 || record.tng_mw > 20000)) {
        recordIssues.push('generation_unusual');
      }

      // If no issues, record is clean
      if (recordIssues.length === 0) {
        cleanedRecords.push(record);
      } else {
        issues.push({
          timestamp: record.timestamp,
          issues: recordIssues,
          record_id: record.id
        });
      }
    }

    // Calculate data quality score
    const qualityScore = Math.round(
      ((recentData.length - issues.length) / recentData.length) * 100
    );

    // Store quality report
    const { error: reportError } = await supabase
      .from('aeso_data_quality_reports')
      .insert({
        report_date: new Date().toISOString(),
        records_checked: recentData.length,
        clean_records: cleanedRecords.length,
        total_issues: issues.length,
        outlier_count: outlierCount,
        missing_value_count: missingValueCount,
        duplicate_count: duplicateCount,
        quality_score: qualityScore,
        issue_details: issues.slice(0, 100) // Store first 100 issues
      });

    if (reportError) {
      console.error('Error storing quality report:', reportError);
    }

    console.log(`Quality check complete - Score: ${qualityScore}%`);

    return new Response(
      JSON.stringify({ 
        success: true,
        quality_score: qualityScore,
        records_checked: recentData.length,
        clean_records: cleanedRecords.length,
        issues: {
          outliers: outlierCount,
          missing_values: missingValueCount,
          duplicates: duplicateCount,
          total: issues.length
        },
        sample_issues: issues.slice(0, 10)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in data quality checker:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
