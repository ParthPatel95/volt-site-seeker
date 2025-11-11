import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictionRecord {
  prediction_timestamp: string;
  target_timestamp: string;
  predicted_price: number;
  confidence_lower: number;
  confidence_upper: number;
  horizon_hours: number;
  model_version: string;
  features_used: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🚀 Starting AESO price prediction generation...');
    console.log(`⏰ Current time: ${new Date().toISOString()}`);

    // Get the latest model performance data
    const { data: modelPerf, error: perfError } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (perfError || !modelPerf || modelPerf.length === 0) {
      throw new Error('No trained model found. Please train a model first.');
    }

    const latestModel = modelPerf[0];
    console.log(`📊 Using model version: ${latestModel.model_version}`);

    // Get the latest training data with features
    const { data: trainingData, error: trainingError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(168); // Last 7 days for context

    if (trainingError || !trainingData || trainingData.length === 0) {
      throw new Error('No training data available for predictions');
    }

    console.log(`📈 Retrieved ${trainingData.length} historical data points`);

    // Calculate baseline prediction using recent averages and patterns
    const recentPrices = trainingData.slice(0, 24).map(d => d.pool_price);
    const avgPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    
    // Get hour-of-day patterns
    const hourPatterns = new Map<number, number[]>();
    trainingData.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      if (!hourPatterns.has(hour)) {
        hourPatterns.set(hour, []);
      }
      hourPatterns.get(hour)!.push(d.pool_price);
    });

    // Generate predictions for next 24 hours
    const predictions: PredictionRecord[] = [];
    const now = new Date();
    const horizons = [1, 6, 12, 24];

    for (const horizon of horizons) {
      const targetTime = new Date(now.getTime() + horizon * 60 * 60 * 1000);
      const targetHour = targetTime.getHours();
      
      console.log(`🎯 Generating prediction for ${horizon}h ahead - Target: ${targetTime.toISOString()}, Prediction made at: ${now.toISOString()}`);
      
      // Get hour-specific average
      const hourPrices = hourPatterns.get(targetHour) || [avgPrice];
      const hourAvg = hourPrices.reduce((sum, p) => sum + p, 0) / hourPrices.length;
      
      // Adjust based on recent trend
      const recentTrend = (recentPrices[0] - recentPrices[recentPrices.length - 1]) / recentPrices.length;
      const trendAdjustment = recentTrend * horizon;
      
      // Calculate predicted price
      const predictedPrice = Math.max(0, hourAvg + trendAdjustment);
      
      // Calculate confidence interval (±20% of predicted price, bounded by historical range)
      const stdDev = Math.sqrt(
        hourPrices.reduce((sum, p) => sum + Math.pow(p - hourAvg, 2), 0) / hourPrices.length
      );
      const confidenceLower = Math.max(0, predictedPrice - stdDev * 1.5);
      const confidenceUpper = predictedPrice + stdDev * 1.5;

      predictions.push({
        prediction_timestamp: now.toISOString(),
        target_timestamp: targetTime.toISOString(),
        predicted_price: Math.round(predictedPrice * 100) / 100,
        confidence_lower: Math.round(confidenceLower * 100) / 100,
        confidence_upper: Math.round(confidenceUpper * 100) / 100,
        horizon_hours: horizon,
        model_version: latestModel.model_version,
        features_used: {
          avg_price: Math.round(avgPrice * 100) / 100,
          hour_of_day: targetHour,
          trend_adjustment: Math.round(trendAdjustment * 100) / 100,
        }
      });
    }

    // Insert predictions into database
    const { data: insertedPreds, error: insertError } = await supabase
      .from('aeso_price_predictions')
      .insert(predictions)
      .select();

    if (insertError) {
      console.error('❌ Error inserting predictions:', insertError);
      throw insertError;
    }

    console.log(`✅ Generated ${predictions.length} predictions successfully`);

    // Immediately validate predictions against recent actual prices from training data
    console.log('🔍 Validating predictions against available actual prices...');
    
    const validationRecords = [];
    for (const pred of insertedPreds || []) {
      // Find actual price close to the target timestamp
      const { data: actualData } = await supabase
        .from('aeso_training_data')
        .select('pool_price, timestamp')
        .gte('timestamp', new Date(new Date(pred.target_timestamp).getTime() - 30 * 60 * 1000).toISOString())
        .lte('timestamp', new Date(new Date(pred.target_timestamp).getTime() + 30 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true })
        .limit(1);

      if (actualData && actualData.length > 0) {
        const actual = actualData[0];
        const absoluteError = Math.abs(actual.pool_price - pred.predicted_price);
        const percentError = (absoluteError / actual.pool_price) * 100;
        const withinConfidence = actual.pool_price >= pred.confidence_lower && 
                                 actual.pool_price <= pred.confidence_upper;

        validationRecords.push({
          prediction_id: pred.id,
          target_timestamp: pred.target_timestamp,
          predicted_price: pred.predicted_price,
          actual_price: actual.pool_price,
          absolute_error: absoluteError,
          percent_error: percentError,
          horizon_hours: pred.horizon_hours,
          model_version: pred.model_version,
          within_confidence: withinConfidence,
          validated_at: new Date().toISOString()
        });
      }
    }

    // Insert validation records if any were created
    if (validationRecords.length > 0) {
      const { error: validationError } = await supabase
        .from('aeso_prediction_accuracy')
        .insert(validationRecords);

      if (validationError) {
        console.error('⚠️ Error inserting validation records:', validationError);
      } else {
        console.log(`✅ Validated ${validationRecords.length} predictions against actual prices`);
      }
    } else {
      console.log('ℹ️ No matching actual prices found for immediate validation');
    }

    return new Response(
      JSON.stringify({
        success: true,
        predictions: insertedPreds,
        model_version: latestModel.model_version,
        count: predictions.length,
        validated_count: validationRecords.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Prediction generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate predictions'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
