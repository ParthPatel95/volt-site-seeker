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

    console.log('🔍 Starting comprehensive data quality analysis...');

    // Fetch all training data
    const { data: allData, error } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error || !allData || allData.length === 0) {
      throw new Error('No training data available for analysis');
    }

    console.log(`📊 Analyzing ${allData.length} records...`);

    // ========== QUALITY CHECKS ==========
    
    // 1. Missing Data Analysis
    const missingAnalysis: Record<string, number> = {};
    const criticalFeatures = [
      'pool_price', 'ail_mw', 'generation_wind', 'generation_solar',
      'generation_gas', 'generation_coal', 'generation_hydro',
      'temperature_calgary', 'temperature_edmonton'
    ];

    for (const feature of criticalFeatures) {
      const missing = allData.filter(d => d[feature] === null || d[feature] === undefined).length;
      missingAnalysis[feature] = (missing / allData.length) * 100;
    }

    // 2. Outlier Detection
    const priceData = allData.map(d => d.pool_price).filter(p => p !== null).sort((a, b) => a - b);
    const q1 = priceData[Math.floor(priceData.length * 0.25)];
    const q3 = priceData[Math.floor(priceData.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 3 * iqr;
    const upperBound = q3 + 3 * iqr;
    
    const outliers = allData.filter(d => 
      d.pool_price !== null && (d.pool_price < lowerBound || d.pool_price > upperBound)
    );

    // 3. Data Completeness by Time Period
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentData = allData.filter(d => new Date(d.timestamp) >= last30Days);
    const recentCompleteness = recentData.filter(d => 
      d.pool_price !== null && 
      d.ail_mw !== null && 
      d.generation_wind !== null &&
      d.price_lag_1h !== null
    ).length / recentData.length * 100;

    // 4. Feature Coverage Analysis
    const enhancedFeatureCoverage = {
      price_lag_1h: allData.filter(d => d.price_lag_1h !== null).length / allData.length * 100,
      price_rolling_avg_24h: allData.filter(d => d.price_rolling_avg_24h !== null).length / allData.length * 100,
      net_demand: allData.filter(d => d.net_demand !== null).length / allData.length * 100,
      renewable_penetration: allData.filter(d => d.renewable_penetration !== null).length / allData.length * 100,
      heating_degree_days: allData.filter(d => d.heating_degree_days !== null).length / allData.length * 100
    };

    // 5. Data Consistency Checks
    const negativeprices = allData.filter(d => d.pool_price !== null && d.pool_price < 0).length;
    const negativeDemand = allData.filter(d => d.ail_mw !== null && d.ail_mw < 0).length;
    const negativeGeneration = allData.filter(d => 
      (d.generation_wind !== null && d.generation_wind < 0) ||
      (d.generation_solar !== null && d.generation_solar < 0) ||
      (d.generation_gas !== null && d.generation_gas < 0)
    ).length;

    // 6. Temporal Gaps
    const timestamps = allData.map(d => new Date(d.timestamp).getTime()).sort((a, b) => a - b);
    const gaps: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      const gapHours = (timestamps[i] - timestamps[i-1]) / (1000 * 60 * 60);
      if (gapHours > 1.5) { // More than 1.5 hours
        gaps.push(gapHours);
      }
    }

    // 7. Price Distribution Analysis
    const priceStats = {
      min: Math.min(...priceData),
      max: Math.max(...priceData),
      mean: priceData.reduce((a, b) => a + b, 0) / priceData.length,
      median: priceData[Math.floor(priceData.length / 2)],
      q1,
      q3,
      iqr,
      stdDev: Math.sqrt(priceData.reduce((sum, val) => sum + Math.pow(val - priceData.reduce((a, b) => a + b, 0) / priceData.length, 2), 0) / priceData.length)
    };

    // 8. Overall Quality Score
    const qualityFactors = {
      missingDataScore: 100 - Math.max(...Object.values(missingAnalysis)),
      outlierScore: 100 - (outliers.length / allData.length * 100),
      recentCompletenessScore: recentCompleteness,
      enhancedFeatureScore: Object.values(enhancedFeatureCoverage).reduce((a, b) => a + b, 0) / Object.keys(enhancedFeatureCoverage).length,
      consistencyScore: 100 - ((negativeprices + negativeDemand + negativeGeneration) / allData.length * 100),
      temporalContinuityScore: 100 - Math.min(100, gaps.length / allData.length * 1000)
    };

    const overallQualityScore = Object.values(qualityFactors).reduce((a, b) => a + b, 0) / Object.keys(qualityFactors).length;

    // ========== RECOMMENDATIONS ==========
    const recommendations: string[] = [];
    
    if (overallQualityScore < 80) {
      recommendations.push('Overall data quality is below optimal. Consider data cleaning and backfill operations.');
    }
    
    for (const [feature, missingPct] of Object.entries(missingAnalysis)) {
      if (missingPct > 5) {
        recommendations.push(`${feature} has ${missingPct.toFixed(1)}% missing data. Improve data collection.`);
      }
    }
    
    if (outliers.length > allData.length * 0.05) {
      recommendations.push(`${outliers.length} outliers detected (${(outliers.length/allData.length*100).toFixed(1)}%). Consider outlier handling in model.`);
    }
    
    if (recentCompleteness < 95) {
      recommendations.push(`Recent data completeness is only ${recentCompleteness.toFixed(1)}%. Check data collection processes.`);
    }
    
    if (gaps.length > 10) {
      recommendations.push(`${gaps.length} temporal gaps detected. Ensure continuous data collection.`);
    }

    for (const [feature, coverage] of Object.entries(enhancedFeatureCoverage)) {
      if (coverage < 90) {
        recommendations.push(`Enhanced feature ${feature} only ${coverage.toFixed(1)}% coverage. Run feature calculator.`);
      }
    }

    // Store quality report
    const { error: insertError } = await supabase
      .from('aeso_data_quality_reports')
      .insert({
        report_date: new Date().toISOString(),
        total_records: allData.length,
        quality_score: overallQualityScore,
        missing_data_analysis: missingAnalysis,
        outlier_count: outliers.length,
        recent_completeness: recentCompleteness,
        enhanced_feature_coverage: enhancedFeatureCoverage,
        quality_factors: qualityFactors,
        price_statistics: priceStats,
        recommendations: recommendations,
        temporal_gaps: gaps.length
      });

    if (insertError) {
      console.error('⚠️ Could not store quality report:', insertError);
    }

    console.log(`✅ Data quality analysis complete. Overall score: ${overallQualityScore.toFixed(1)}%`);
    console.log(`📋 Generated ${recommendations.length} recommendations`);

    return new Response(
      JSON.stringify({
        success: true,
        overall_quality_score: overallQualityScore,
        quality_factors: qualityFactors,
        missing_data_analysis: missingAnalysis,
        outlier_analysis: {
          count: outliers.length,
          percentage: (outliers.length / allData.length * 100),
          threshold_lower: lowerBound,
          threshold_upper: upperBound
        },
        recent_completeness: recentCompleteness,
        enhanced_feature_coverage: enhancedFeatureCoverage,
        price_statistics: priceStats,
        temporal_gaps: {
          count: gaps.length,
          max_gap_hours: gaps.length > 0 ? Math.max(...gaps) : 0
        },
        recommendations: recommendations
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Data quality analysis error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Data quality analysis failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
