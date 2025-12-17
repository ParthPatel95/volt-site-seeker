import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIAnalysis {
  predicted_prices: { hour: number; price: number; confidence: number; reasoning: string }[];
  market_regime: 'stable' | 'volatile' | 'spike_risk' | 'low';
  key_drivers: string[];
  risk_factors: string[];
  recommendation: string;
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🤖 Starting AI-Powered AESO Price Prediction...');
    const now = new Date();

    // ========== FETCH COMPREHENSIVE MARKET DATA ==========
    // Get last 7 days of data for context (168 hours)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const { data: historicalData, error: histError } = await supabase
      .from('aeso_training_data')
      .select('timestamp, pool_price, ail_mw, generation_wind, generation_solar, generation_gas, generation_coal, generation_hydro, temperature_calgary, temperature_edmonton, price_lag_1h, price_lag_24h, price_rolling_avg_24h, price_rolling_std_24h, renewable_penetration, reserve_margin_percent')
      .gte('timestamp', sevenDaysAgo.toISOString())
      .not('pool_price', 'is', null)
      .order('timestamp', { ascending: false })
      .limit(168);

    if (histError || !historicalData || historicalData.length === 0) {
      throw new Error(`Failed to fetch historical data: ${histError?.message}`);
    }

    // Reverse to chronological order
    const sortedData = historicalData.reverse();
    console.log(`📊 Loaded ${sortedData.length} hours of historical data`);

    // Calculate market statistics
    const prices = sortedData.map(d => d.pool_price).filter(p => p != null);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const stdDev = Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length);
    
    // Recent trends (last 24 hours vs prior 24 hours)
    const last24h = prices.slice(-24);
    const prior24h = prices.slice(-48, -24);
    const last24hAvg = last24h.reduce((a, b) => a + b, 0) / last24h.length;
    const prior24hAvg = prior24h.length > 0 ? prior24h.reduce((a, b) => a + b, 0) / prior24h.length : last24hAvg;
    const priceChange24h = ((last24hAvg - prior24hAvg) / prior24hAvg * 100).toFixed(1);

    // Get current conditions
    const latest = sortedData[sortedData.length - 1];
    const currentHour = new Date(latest.timestamp).getHours();
    const currentDayOfWeek = new Date(latest.timestamp).getDay();
    
    // Calculate hourly patterns
    const hourlyPatterns: Record<number, number[]> = {};
    for (const record of sortedData) {
      const hour = new Date(record.timestamp).getHours();
      if (!hourlyPatterns[hour]) hourlyPatterns[hour] = [];
      hourlyPatterns[hour].push(record.pool_price);
    }
    const avgByHour = Object.fromEntries(
      Object.entries(hourlyPatterns).map(([h, prices]) => [
        h, 
        Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100
      ])
    );

    // Fetch recent model performance for context
    const { data: modelPerf } = await supabase
      .from('aeso_model_performance')
      .select('mae, smape, r_squared, model_version')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // ========== BUILD AI PROMPT WITH COMPREHENSIVE CONTEXT ==========
    const systemPrompt = `You are an expert energy market analyst specializing in Alberta Electric System Operator (AESO) pool price forecasting. You have deep knowledge of:
- Alberta's electricity market dynamics (real-time pricing, merit order dispatch)
- Weather impacts on demand (heating/cooling) and supply (wind/solar)
- Seasonal patterns (winter peak demand, summer volatility)
- Day-of-week patterns (weekday vs weekend consumption)
- Renewable generation variability
- Gas price correlations

Your predictions should be precise, well-reasoned, and account for market fundamentals.`;

    const userPrompt = `Analyze the following AESO market data and provide price predictions for the next 24 hours.

## Current Market Conditions (${now.toISOString()})
- **Current Price**: $${latest.pool_price?.toFixed(2)}/MWh
- **Current Demand**: ${latest.ail_mw?.toLocaleString()} MW
- **Wind Generation**: ${latest.generation_wind?.toLocaleString()} MW (${latest.renewable_penetration ? (latest.renewable_penetration * 100).toFixed(1) : 'N/A'}% of supply)
- **Solar Generation**: ${latest.generation_solar?.toLocaleString()} MW
- **Gas Generation**: ${latest.generation_gas?.toLocaleString()} MW
- **Temperature Calgary**: ${latest.temperature_calgary}°C
- **Temperature Edmonton**: ${latest.temperature_edmonton}°C
- **Reserve Margin**: ${latest.reserve_margin_percent?.toFixed(1)}%

## Recent Price Statistics (Last 7 Days)
- **Average**: $${avgPrice.toFixed(2)}/MWh
- **Min**: $${minPrice.toFixed(2)}/MWh
- **Max**: $${maxPrice.toFixed(2)}/MWh
- **Std Dev**: $${stdDev.toFixed(2)}
- **24h Trend**: ${Number(priceChange24h) > 0 ? '+' : ''}${priceChange24h}%
- **Last 24h Avg**: $${last24hAvg.toFixed(2)}/MWh

## Historical Hourly Averages (7-day)
${Object.entries(avgByHour).sort((a, b) => Number(a[0]) - Number(b[0])).map(([h, p]) => `Hour ${h}: $${p}/MWh`).join('\n')}

## Recent Price Sequence (Last 24 Hours)
${last24h.map((p, i) => `${String(i).padStart(2, '0')}h ago: $${p.toFixed(2)}`).join(', ')}

## Current Model Performance
- MAE: $${modelPerf?.mae?.toFixed(2) || 'N/A'}
- sMAPE: ${modelPerf?.smape?.toFixed(2) || 'N/A'}%

Based on this data, provide predictions using the forecast_prices function.`;

    // ========== CALL LOVABLE AI WITH STRUCTURED OUTPUT ==========
    console.log('🧠 Calling Lovable AI for intelligent analysis...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'forecast_prices',
            description: 'Provide structured price forecasts for the next 24 hours',
            parameters: {
              type: 'object',
              properties: {
                predictions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      hours_ahead: { type: 'number', description: 'Hours from now (1, 6, 12, 24)' },
                      predicted_price: { type: 'number', description: 'Predicted pool price in $/MWh' },
                      confidence: { type: 'number', description: 'Confidence level 0-100' },
                      reasoning: { type: 'string', description: 'Brief explanation for this prediction' }
                    },
                    required: ['hours_ahead', 'predicted_price', 'confidence', 'reasoning'],
                    additionalProperties: false
                  }
                },
                market_regime: {
                  type: 'string',
                  enum: ['stable', 'volatile', 'spike_risk', 'low'],
                  description: 'Current market regime assessment'
                },
                key_drivers: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Top 3 factors driving price'
                },
                risk_factors: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Key risks that could affect forecast'
                },
                recommendation: {
                  type: 'string',
                  description: 'Brief trading/operational recommendation'
                }
              },
              required: ['predictions', 'market_regime', 'key_drivers', 'risk_factors', 'recommendation'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'forecast_prices' } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted. Please add funds.');
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('✅ AI response received');

    // Parse the tool call response
    let aiAnalysis: AIAnalysis;
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function.name !== 'forecast_prices') {
        throw new Error('Invalid AI response format');
      }
      aiAnalysis = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI prediction');
    }

    console.log(`🎯 AI Market Regime: ${aiAnalysis.market_regime}`);
    console.log(`📊 AI Predictions: ${aiAnalysis.predictions.length} forecasts`);

    // ========== CALCULATE CONFIDENCE INTERVALS AND STORE PREDICTIONS ==========
    const predictions = aiAnalysis.predictions.map(pred => {
      const horizonHours = pred.hours_ahead;
      const targetTime = new Date(now.getTime() + horizonHours * 60 * 60 * 1000);
      
      // Calculate confidence intervals based on AI confidence and historical volatility
      const confidenceFactor = pred.confidence / 100;
      const horizonDecay = 1 + (horizonHours / 24) * 0.5;
      const intervalWidth = stdDev * 1.5 * horizonDecay * (2 - confidenceFactor);
      
      return {
        prediction_timestamp: now.toISOString(),
        target_timestamp: targetTime.toISOString(),
        predicted_price: Math.round(pred.predicted_price * 100) / 100,
        confidence_lower: Math.max(0, Math.round((pred.predicted_price - intervalWidth) * 100) / 100),
        confidence_upper: Math.round((pred.predicted_price + intervalWidth) * 100) / 100,
        confidence_score: pred.confidence / 100,
        horizon_hours: horizonHours,
        model_version: 'ai-gemini-v1',
        features_used: {
          ai_reasoning: pred.reasoning,
          market_regime: aiAnalysis.market_regime,
          key_drivers: aiAnalysis.key_drivers,
          risk_factors: aiAnalysis.risk_factors,
          recommendation: aiAnalysis.recommendation,
          ai_confidence: pred.confidence,
          historical_avg: avgPrice,
          historical_std: stdDev,
          context_hours: sortedData.length
        }
      };
    });

    // Store predictions
    const { data: insertedPreds, error: insertError } = await supabase
      .from('aeso_price_predictions')
      .insert(predictions)
      .select();

    if (insertError) {
      console.error('Error storing predictions:', insertError);
      throw insertError;
    }

    console.log(`✅ Stored ${predictions.length} AI predictions`);

    // ========== RETURN COMPREHENSIVE RESPONSE ==========
    return new Response(JSON.stringify({
      success: true,
      predictions: insertedPreds,
      analysis: {
        market_regime: aiAnalysis.market_regime,
        key_drivers: aiAnalysis.key_drivers,
        risk_factors: aiAnalysis.risk_factors,
        recommendation: aiAnalysis.recommendation
      },
      market_context: {
        current_price: latest.pool_price,
        avg_7d: avgPrice,
        volatility: stdDev,
        trend_24h: priceChange24h,
        data_points: sortedData.length
      },
      model_version: 'ai-gemini-v1',
      generated_at: now.toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ AI Prediction Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'AI prediction failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
