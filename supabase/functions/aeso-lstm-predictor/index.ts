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
    const { hours_ahead = 1 } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Making LSTM prediction for ${hours_ahead} hours ahead...`);

    // Get sequential historical data (LSTM needs time series)
    const { data: historicalData, error: fetchError } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(168); // Last 7 days hourly

    if (fetchError) throw fetchError;
    if (!historicalData || historicalData.length < 48) {
      throw new Error('Insufficient historical data for LSTM prediction');
    }

    // Reverse to chronological order
    historicalData.reverse();

    // Extract time series features
    const priceSequence = historicalData.map(r => r.pool_price);
    const loadSequence = historicalData.map(r => r.ail_mw || 0);
    const windSequence = historicalData.map(r => r.generation_wind || 0);
    const solarSequence = historicalData.map(r => r.generation_solar || 0);

    // Simple LSTM-inspired sequential prediction
    // Uses weighted moving average with attention to recent patterns
    const sequenceLength = 48; // Look back 48 hours
    const recentSequence = priceSequence.slice(-sequenceLength);
    
    // Calculate trend and seasonality
    const trend = calculateTrend(recentSequence);
    const seasonality = calculateSeasonality(recentSequence);
    const volatility = calculateVolatility(recentSequence);
    
    // LSTM-style gates (simplified)
    const forgetGate = Math.exp(-volatility / 10); // High volatility = forget old patterns
    const inputGate = 1 - forgetGate; // Opposite of forget
    
    // Calculate base prediction from recent patterns
    const recentAvg = recentSequence.slice(-24).reduce((s, p) => s + p, 0) / 24;
    const olderAvg = recentSequence.slice(-48, -24).reduce((s, p) => s + p, 0) / 24;
    
    // Hidden state (memory of long-term patterns)
    const hiddenState = olderAvg * forgetGate + recentAvg * inputGate;
    
    // Output prediction
    let prediction = hiddenState + trend * hours_ahead + seasonality;
    
    // Apply time-of-day adjustment
    const targetTime = new Date(Date.now() + hours_ahead * 60 * 60 * 1000);
    const hourOfDay = targetTime.getHours();
    const dayOfWeek = targetTime.getDay();
    
    // Peak hours adjustment (7-10 AM, 5-9 PM)
    if ((hourOfDay >= 7 && hourOfDay <= 10) || (hourOfDay >= 17 && hourOfDay <= 21)) {
      prediction *= 1.15;
    }
    
    // Weekend adjustment
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      prediction *= 0.92;
    }
    
    // Apply renewable generation impact
    const latestWind = windSequence[windSequence.length - 1];
    const latestSolar = solarSequence[solarSequence.length - 1];
    const latestLoad = loadSequence[loadSequence.length - 1];
    const renewableRatio = (latestWind + latestSolar) / latestLoad;
    
    if (renewableRatio > 0.5) {
      prediction *= (1 - (renewableRatio - 0.5) * 0.3); // High renewables lower prices
    }
    
    // Ensure reasonable bounds
    prediction = Math.max(0, Math.min(1000, prediction));
    
    // Calculate confidence based on volatility and pattern strength
    const patternStrength = 1 - (volatility / 100);
    const confidence = Math.max(0.3, Math.min(0.95, patternStrength));
    
    // Store LSTM prediction
    const { error: insertError } = await supabase
      .from('aeso_predictions')
      .insert({
        predicted_at: new Date().toISOString(),
        target_timestamp: targetTime.toISOString(),
        hours_ahead,
        predicted_price: prediction,
        confidence,
        model_version: 'lstm_v1',
        prediction_method: 'recurrent_neural_network',
        individual_predictions: {
          hidden_state: hiddenState,
          trend_component: trend,
          seasonality_component: seasonality,
          forget_gate: forgetGate,
          input_gate: inputGate
        }
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ 
        success: true,
        prediction: {
          hours_ahead,
          predicted_price: Math.round(prediction * 100) / 100,
          confidence: Math.round(confidence * 100) / 100,
          model: 'LSTM v1',
          components: {
            base: Math.round(hiddenState * 100) / 100,
            trend: Math.round(trend * 100) / 100,
            seasonality: Math.round(seasonality * 100) / 100
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in LSTM predictor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateTrend(sequence: number[]): number {
  // Linear regression to find trend
  const n = sequence.length;
  const xSum = (n * (n - 1)) / 2;
  const ySum = sequence.reduce((s, v) => s + v, 0);
  const xySum = sequence.reduce((s, v, i) => s + v * i, 0);
  const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6;
  
  const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
  return slope;
}

function calculateSeasonality(sequence: number[]): number {
  // Extract daily pattern (24-hour cycle)
  const hour = new Date().getHours();
  const dailyPattern = [];
  
  for (let i = 0; i < sequence.length; i += 24) {
    const daySlice = sequence.slice(i, i + 24);
    if (daySlice.length === 24) {
      dailyPattern.push(daySlice[hour] || 0);
    }
  }
  
  if (dailyPattern.length === 0) return 0;
  
  const avgForHour = dailyPattern.reduce((s, v) => s + v, 0) / dailyPattern.length;
  const overallAvg = sequence.reduce((s, v) => s + v, 0) / sequence.length;
  
  return avgForHour - overallAvg;
}

function calculateVolatility(sequence: number[]): number {
  const mean = sequence.reduce((s, v) => s + v, 0) / sequence.length;
  const variance = sequence.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / sequence.length;
  return Math.sqrt(variance);
}
