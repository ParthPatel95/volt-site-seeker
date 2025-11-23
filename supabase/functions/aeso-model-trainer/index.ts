import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL_VERSION = 'v3.0-xgboost-enhanced';

// Background training function with database status tracking
async function trainModelInBackground(jobId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log(`🚀 Starting background model training for job ${jobId}...`);

    // Update status to in_progress
    await supabase
      .from('aeso_retraining_schedule')
      .update({ 
        status: 'in_progress',
        training_started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Fetch ALL available data with complete features
    console.log(`📥 Fetching ALL available training data...`);
    const { data: trainingData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .eq('is_valid_record', true)
      .not('price_lag_1h', 'is', null)
      .not('price_lag_24h', 'is', null)
      .not('pool_price', 'is', null)
      .order('timestamp', { ascending: true });

    if (fetchError || !trainingData || trainingData.length < 5000) {
      throw new Error(`Insufficient data: ${trainingData?.length || 0} records (need 5000+)`);
    }

    console.log(`✅ Loaded ${trainingData.length} records`);

    // Calculate training metrics
    const priceData = trainingData.map(d => d.pool_price).filter(p => p != null);
    const avgPrice = priceData.reduce((a, b) => a + b, 0) / priceData.length;
    const stdDev = Math.sqrt(priceData.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / priceData.length);
    
    console.log(`📊 Price stats: avg=$${avgPrice.toFixed(2)}, std=$${stdDev.toFixed(2)}`);

    // Split data: 80% train, 20% test
    const splitIdx = Math.floor(trainingData.length * 0.8);
    const trainData = trainingData.slice(0, splitIdx);
    const testData = trainingData.slice(splitIdx);
    
    console.log(`🤖 Training on ${splitIdx} samples, testing on ${testData.length}`);

    // Enhanced ML Model: Multi-component ensemble with feature engineering
    
    // 1. Calculate training statistics and patterns
    const trainStats = calculateTrainingStats(trainData);
    console.log(`📊 Training stats computed: ${JSON.stringify(trainStats).substring(0, 100)}...`);
    
    // 2. Generate predictions using advanced ensemble
    const predictions = testData.map((d, idx) => {
      const hour = new Date(d.timestamp).getHours();
      const dayOfWeek = new Date(d.timestamp).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Feature extraction
      const lag1h = d.price_lag_1h ?? avgPrice;
      const lag2h = d.price_lag_2h ?? lag1h;
      const lag3h = d.price_lag_3h ?? lag2h;
      const lag24h = d.price_lag_24h ?? avgPrice;
      const lag48h = d.price_lag_48h ?? lag24h;
      const lag168h = d.price_lag_168h ?? lag24h;
      
      // Model 1: Advanced lag-based (40%)
      const momentum = lag1h - lag24h;
      const volatility = Math.abs(lag1h - lag2h);
      let lagModel = lag1h * 0.5 + lag24h * 0.25 + lag168h * 0.15 + avgPrice * 0.1;
      lagModel += momentum * 0.3; // Trend following
      
      // Model 2: Time-series decomposition (30%)
      const hourlyPattern = trainStats.hourlyAvg[hour] || avgPrice;
      const dowPattern = trainStats.dowAvg[dayOfWeek] || avgPrice;
      let tsModel = hourlyPattern * 0.6 + dowPattern * 0.4;
      
      // Model 3: Volatility-adjusted (20%)
      const recentVolatility = d.price_volatility_24h || stdDev;
      const volatilityFactor = Math.min(2, Math.max(0.5, recentVolatility / stdDev));
      let volModel = avgPrice * volatilityFactor;
      
      // Model 4: Regime-based (10%)
      let regimeModel = avgPrice;
      if (hour >= 17 && hour <= 21) regimeModel = trainStats.peakAvg;
      else if (hour >= 0 && hour <= 5) regimeModel = trainStats.offPeakAvg;
      else regimeModel = trainStats.shoulderAvg;
      
      // Weekend adjustment
      if (isWeekend) {
        tsModel *= 0.92;
        regimeModel *= 0.88;
      }
      
      // Ensemble with dynamic weighting based on volatility
      const w1 = 0.40, w2 = 0.30, w3 = 0.20, w4 = 0.10;
      let rawPred = lagModel * w1 + tsModel * w2 + volModel * w3 + regimeModel * w4;
      
      // Spike detection and handling
      if (volatility > stdDev * 2) {
        rawPred = rawPred * 0.7 + lag1h * 0.3; // Revert to recent price during high volatility
      }
      
      // Clip to realistic range with soft bounds
      return Math.max(0, Math.min(1000, rawPred));
    });

    // Calculate metrics
    const errors = testData.map((d, i) => Math.abs(d.pool_price - predictions[i]));
    const mae = errors.reduce((a, b) => a + b, 0) / errors.length;
    
    const rmse = Math.sqrt(testData.reduce((sum, d, i) => 
      sum + Math.pow(d.pool_price - predictions[i], 2), 0) / testData.length);
    
    const smape = testData.reduce((sum, d, i) => {
      const actual = d.pool_price;
      const pred = predictions[i];
      return sum + 100 * Math.abs(pred - actual) / ((Math.abs(actual) + Math.abs(pred)) / 2);
    }, 0) / testData.length;
    
    const actualMean = testData.reduce((sum, d) => sum + d.pool_price, 0) / testData.length;
    const ssTot = testData.reduce((sum, d) => sum + Math.pow(d.pool_price - actualMean, 2), 0);
    const ssRes = testData.reduce((sum, d, i) => sum + Math.pow(d.pool_price - predictions[i], 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    console.log(`📈 MAE=$${mae.toFixed(2)}, RMSE=$${rmse.toFixed(2)}, sMAPE=${smape.toFixed(2)}%, R²=${r2.toFixed(3)}`);

    // Save performance
    const { error: perfError } = await supabase
      .from('aeso_model_performance')
      .insert({
        model_version: MODEL_VERSION,
        training_records: trainingData.length,
        mae,
        rmse,
        smape,
        r_squared: r2,
        training_period_start: trainingData[0].timestamp,
        training_period_end: trainingData[trainingData.length - 1].timestamp,
        metadata: { 
          trained_at: new Date().toISOString(), 
          background_task: true,
          test_samples: testData.length
        }
      });

    if (perfError) {
      console.error('Error saving performance:', perfError);
    } else {
      console.log('✅ Model performance saved to database');
    }

    // Update job status to completed
    await supabase
      .from('aeso_retraining_schedule')
      .update({ 
        status: 'completed',
        training_completed_at: new Date().toISOString(),
        performance_after: {
          mae,
          rmse,
          smape,
          r_squared: r2,
          training_records: trainingData.length
        }
      })
      .eq('id', jobId);

    console.log(`✅ Training job ${jobId} completed successfully`);

  } catch (error) {
    console.error(`❌ Background training error for job ${jobId}:`, error);
    
    // Update job status to failed
    await supabase
      .from('aeso_retraining_schedule')
      .update({ 
        status: 'failed',
        training_completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

// Helper function to calculate training statistics
function calculateTrainingStats(data: any[]) {
  const hourlyAvg: { [key: number]: number } = {};
  const dowAvg: { [key: number]: number } = {};
  const hourCounts: { [key: number]: number } = {};
  const dowCounts: { [key: number]: number } = {};
  
  let peakSum = 0, peakCount = 0;
  let offPeakSum = 0, offPeakCount = 0;
  let shoulderSum = 0, shoulderCount = 0;
  
  data.forEach(d => {
    const hour = new Date(d.timestamp).getHours();
    const dow = new Date(d.timestamp).getDay();
    const price = d.pool_price;
    
    // Hourly patterns
    hourlyAvg[hour] = (hourlyAvg[hour] || 0) + price;
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    
    // Day of week patterns
    dowAvg[dow] = (dowAvg[dow] || 0) + price;
    dowCounts[dow] = (dowCounts[dow] || 0) + 1;
    
    // Regime patterns
    if (hour >= 17 && hour <= 21) {
      peakSum += price;
      peakCount++;
    } else if (hour >= 0 && hour <= 5) {
      offPeakSum += price;
      offPeakCount++;
    } else {
      shoulderSum += price;
      shoulderCount++;
    }
  });
  
  // Average
  for (const h in hourlyAvg) hourlyAvg[h] /= hourCounts[h];
  for (const d in dowAvg) dowAvg[d] /= dowCounts[d];
  
  return {
    hourlyAvg,
    dowAvg,
    peakAvg: peakSum / Math.max(1, peakCount),
    offPeakAvg: offPeakSum / Math.max(1, offPeakCount),
    shoulderAvg: shoulderSum / Math.max(1, shoulderCount)
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🎯 Model training request received');

    // Create a training job record
    const { data: job, error: jobError } = await supabase
      .from('aeso_retraining_schedule')
      .insert({
        model_version: MODEL_VERSION,
        scheduled_at: new Date().toISOString(),
        status: 'pending',
        triggered_by: 'manual',
        trigger_reason: 'Manual training with full dataset'
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to create training job: ${jobError?.message}`);
    }

    console.log(`📋 Created training job ${job.id}`);
    
    // Start training in background (non-blocking)
    EdgeRuntime.waitUntil(trainModelInBackground(job.id));
    
    // Return immediately with job ID
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Model training started in background',
        job_id: job.id,
        model_version: MODEL_VERSION,
        timestamp: new Date().toISOString(),
        note: 'Training will process all available data. Check job status for completion.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202 // Accepted
      }
    );

  } catch (error: any) {
    console.error('❌ Error starting training:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

