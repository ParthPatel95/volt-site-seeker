import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Phase 7: Prediction cache configuration
const CACHE_TTL_MINUTES = 15; // Cache predictions for 15 minutes
const BATCH_SIZE = 24; // Process 24 hours at a time

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { horizon = '24h', forceRefresh = false } = await req.json();
    
    console.log(`🚀 Phase 7: Optimized Predictor (horizon: ${horizon}, forceRefresh: ${forceRefresh})`);

    const horizonHours = parseInt(horizon.replace('h', ''));
    const now = new Date();
    const targetEndTime = new Date(now.getTime() + horizonHours * 60 * 60 * 1000);

    // Step 1: Check cache for recent predictions (unless force refresh)
    let cachedPredictions: any[] = [];
    let cacheHitCount = 0;
    
    if (!forceRefresh) {
      const cacheThreshold = new Date(now.getTime() - CACHE_TTL_MINUTES * 60 * 1000);
      
      const { data: cached, error: cacheError } = await supabase
        .from('aeso_price_predictions')
        .select('*')
        .gte('target_timestamp', now.toISOString())
        .lte('target_timestamp', targetEndTime.toISOString())
        .gte('created_at', cacheThreshold.toISOString())
        .order('target_timestamp', { ascending: true })
        .order('prediction_timestamp', { ascending: false });

      if (!cacheError && cached && cached.length > 0) {
        // Deduplicate: keep only most recent prediction per hour
        const uniqueByHour = new Map();
        cached.forEach(p => {
          const targetDate = new Date(p.target_timestamp);
          const hourKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}-${String(targetDate.getHours()).padStart(2, '0')}`;
          if (!uniqueByHour.has(hourKey)) {
            uniqueByHour.set(hourKey, p);
          }
        });
        
        cachedPredictions = Array.from(uniqueByHour.values())
          .sort((a, b) => new Date(a.target_timestamp).getTime() - new Date(b.target_timestamp).getTime())
          .slice(0, horizonHours); // Ensure we don't exceed requested hours
        
        cacheHitCount = cachedPredictions.length;
        console.log(`✅ Cache hit: ${cacheHitCount} predictions (${(cacheHitCount / horizonHours * 100).toFixed(1)}% coverage)`);
      }
    }

    // Step 2: Determine which timestamps need fresh predictions
    const cachedTimestamps = new Set(cachedPredictions.map(p => p.target_timestamp));
    const timestampsNeeded: Date[] = [];
    
    for (let i = 1; i <= horizonHours; i++) {
      const targetTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const targetIso = targetTime.toISOString();
      if (!cachedTimestamps.has(targetIso)) {
        timestampsNeeded.push(targetTime);
      }
    }

    console.log(`📊 Need to generate ${timestampsNeeded.length} new predictions`);

    let newPredictions: any[] = [];
    
    if (timestampsNeeded.length > 0) {
      // Step 3: Batch invoke the standard predictor for missing timestamps
      const batchStartTime = Date.now();
      
      // Process in batches to avoid overwhelming the predictor
      const batches = Math.ceil(timestampsNeeded.length / BATCH_SIZE);
      
      for (let batchIdx = 0; batchIdx < batches; batchIdx++) {
        const batchStart = batchIdx * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, timestampsNeeded.length);
        const batchTimestamps = timestampsNeeded.slice(batchStart, batchEnd);
        
        console.log(`Processing batch ${batchIdx + 1}/${batches} (${batchTimestamps.length} timestamps)`);
        
        // Call the standard predictor
        const { data: predData, error: predError } = await supabase.functions.invoke('aeso-price-predictor', {
          body: { 
            horizon: `${batchTimestamps.length}h`,
            startTime: batchTimestamps[0].toISOString()
          }
        });

        if (predError) {
          console.error(`Batch ${batchIdx + 1} error:`, predError);
          continue;
        }

        if (predData?.success && predData.predictions) {
          newPredictions = newPredictions.concat(predData.predictions);
        }
      }

      const batchDuration = Date.now() - batchStartTime;
      console.log(`✅ Batch generation complete: ${newPredictions.length} predictions in ${batchDuration}ms`);
    }

    // Step 4: Combine cached and new predictions, ensuring exactly horizonHours predictions
    const allPredictions = [
      ...cachedPredictions.map(p => ({
        timestamp: p.target_timestamp,
        horizonHours: p.horizon_hours,
        price: p.predicted_price,
        confidenceLower: p.confidence_lower || 0,
        confidenceUpper: p.confidence_upper || 0,
        confidenceScore: p.confidence_score || 0.75,
        features: p.features_used || {},
        cached: true
      })),
      ...newPredictions.map((p: any) => ({ ...p, cached: false }))
    ]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(0, horizonHours); // Hard limit to requested hours

    // Step 5: Performance metrics
    const totalDuration = Date.now() - startTime;
    const avgPredictionTime = timestampsNeeded.length > 0 ? totalDuration / timestampsNeeded.length : 0;
    const cacheHitRate = (cacheHitCount / horizonHours * 100).toFixed(1);

    const performanceMetrics = {
      total_duration_ms: totalDuration,
      cache_hit_count: cacheHitCount,
      cache_miss_count: timestampsNeeded.length,
      cache_hit_rate_percent: parseFloat(cacheHitRate),
      new_predictions_generated: newPredictions.length,
      total_predictions_returned: allPredictions.length,
      avg_prediction_time_ms: parseFloat(avgPredictionTime.toFixed(2)),
      batch_size: BATCH_SIZE,
      cache_ttl_minutes: CACHE_TTL_MINUTES
    };

    console.log('📈 Performance Metrics:', performanceMetrics);

    // Step 6: Log performance to tracking table
    await supabase
      .from('aeso_prediction_performance')
      .insert({
        request_timestamp: now.toISOString(),
        horizon_hours: horizonHours,
        cache_hit_count: cacheHitCount,
        cache_miss_count: timestampsNeeded.length,
        total_duration_ms: totalDuration,
        predictions_generated: newPredictions.length,
        cache_hit_rate: parseFloat(cacheHitRate),
        metadata: {
          force_refresh: forceRefresh,
          batches_processed: Math.ceil(timestampsNeeded.length / BATCH_SIZE),
          batch_size: BATCH_SIZE
        }
      });

    return new Response(JSON.stringify({
      success: true,
      predictions: allPredictions,
      performance: performanceMetrics,
      optimization: {
        cache_enabled: !forceRefresh,
        cache_ttl_minutes: CACHE_TTL_MINUTES,
        batch_processing: true,
        batch_size: BATCH_SIZE
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Optimized predictor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
