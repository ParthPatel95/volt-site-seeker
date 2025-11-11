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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      market = 'aeso', 
      advisoryType = 'trading_strategy',
      userContext = {},
      predictions = []
    } = await req.json();
    
    console.log('🤖 Phase 10: AI Trading Advisor');
    console.log('Advisory type:', advisoryType);
    console.log('Market:', market);

    // Fetch recent predictions if not provided
    let predictionData = predictions;
    if (predictionData.length === 0) {
      const { data: recentPreds } = await supabase
        .from('aeso_price_predictions')
        .select('*')
        .gte('target_timestamp', new Date().toISOString())
        .order('target_timestamp', { ascending: true })
        .limit(24);
      
      predictionData = recentPreds || [];
    }

    // Fetch recent model performance
    const { data: modelPerf } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('evaluation_date', { ascending: false })
      .limit(1)
      .single();

    // Fetch recent explanations for context
    const { data: recentExplanations } = await supabase
      .from('aeso_prediction_explanations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    // Build context for AI
    const predictionSummary = analyzePredictions(predictionData);
    const systemPrompt = buildSystemPrompt(advisoryType, market);
    const userPrompt = buildUserPrompt(advisoryType, predictionSummary, modelPerf, recentExplanations, userContext);

    console.log('Calling Lovable AI Gateway...');

    // Call Lovable AI with structured output
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
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
            name: 'generate_trading_advisory',
            description: 'Generate comprehensive trading recommendations and strategies',
            parameters: {
              type: 'object',
              properties: {
                summary: { type: 'string', description: 'Brief market summary (2-3 sentences)' },
                outlook: { 
                  type: 'string', 
                  enum: ['bullish', 'bearish', 'neutral', 'volatile'],
                  description: 'Market outlook for the next 24 hours'
                },
                confidence: { 
                  type: 'number', 
                  minimum: 0, 
                  maximum: 1,
                  description: 'Confidence in recommendations (0-1)'
                },
                key_insights: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Top 3-5 key insights from the analysis'
                },
                trading_recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      action: { type: 'string', enum: ['buy', 'sell', 'hold', 'hedge'] },
                      timing: { type: 'string', description: 'When to execute (e.g., "6-8 AM", "Peak hours")' },
                      rationale: { type: 'string', description: 'Why this action is recommended' },
                      risk_level: { type: 'string', enum: ['low', 'medium', 'high'] }
                    },
                    required: ['action', 'timing', 'rationale', 'risk_level']
                  },
                  minItems: 2,
                  maxItems: 5
                },
                price_targets: {
                  type: 'object',
                  properties: {
                    optimal_buy_below: { type: 'number' },
                    optimal_sell_above: { type: 'number' },
                    stop_loss: { type: 'number' },
                    take_profit: { type: 'number' }
                  },
                  required: ['optimal_buy_below', 'optimal_sell_above']
                },
                risk_assessment: {
                  type: 'object',
                  properties: {
                    volatility_level: { type: 'string', enum: ['low', 'moderate', 'high', 'extreme'] },
                    spike_probability: { type: 'number', minimum: 0, maximum: 1 },
                    major_risks: { type: 'array', items: { type: 'string' } },
                    mitigation_strategies: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['volatility_level', 'spike_probability', 'major_risks']
                },
                opportunities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', description: 'Type of opportunity (e.g., "Arbitrage", "Load shifting")' },
                      window: { type: 'string', description: 'Time window for the opportunity' },
                      potential_savings: { type: 'string', description: 'Estimated savings or profit' },
                      description: { type: 'string' }
                    },
                    required: ['type', 'window', 'description']
                  }
                }
              },
              required: ['summary', 'outlook', 'confidence', 'key_insights', 'trading_recommendations', 'risk_assessment'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_trading_advisory' } }
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('AI service rate limit exceeded. Please try again in a moment.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service credits depleted. Please add credits to continue.');
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to generate AI advisory');
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract structured advisory from tool call
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_trading_advisory') {
      throw new Error('Invalid AI response format');
    }

    const advisory = JSON.parse(toolCall.function.arguments);

    // Store advisory for future reference
    await supabase
      .from('ai_trading_advisories')
      .insert({
        market: market,
        advisory_type: advisoryType,
        outlook: advisory.outlook,
        confidence: advisory.confidence,
        summary: advisory.summary,
        recommendations: advisory.trading_recommendations,
        risk_assessment: advisory.risk_assessment,
        opportunities: advisory.opportunities || [],
        key_insights: advisory.key_insights,
        price_targets: advisory.price_targets || null,
        model_performance_snapshot: modelPerf ? {
          mae: modelPerf.mae,
          r_squared: modelPerf.r_squared
        } : null,
        predictions_analyzed: predictionData.length
      });

    return new Response(JSON.stringify({
      success: true,
      advisory: advisory,
      metadata: {
        market: market,
        advisory_type: advisoryType,
        predictions_analyzed: predictionData.length,
        model_confidence: modelPerf?.r_squared || null,
        generated_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Trading Advisor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function analyzePredictions(predictions: any[]): any {
  if (predictions.length === 0) return { avg: 0, min: 0, max: 0, trend: 'stable' };

  const prices = predictions.map(p => p.predicted_price || p.price);
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  // Calculate trend
  const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
  const secondHalf = prices.slice(Math.floor(prices.length / 2));
  const avgFirst = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;
  
  let trend = 'stable';
  const change = ((avgSecond - avgFirst) / avgFirst) * 100;
  if (change > 10) trend = 'rising';
  else if (change < -10) trend = 'falling';
  
  // Calculate volatility
  const stdDev = Math.sqrt(
    prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length
  );
  const volatility = (stdDev / avg) * 100;

  return {
    avg: parseFloat(avg.toFixed(2)),
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    trend,
    volatility: parseFloat(volatility.toFixed(2)),
    priceRange: parseFloat((max - min).toFixed(2)),
    predictions: predictions.slice(0, 24).map(p => ({
      timestamp: p.target_timestamp || p.timestamp,
      price: p.predicted_price || p.price,
      confidence: p.confidence_score || 0.8
    }))
  };
}

function buildSystemPrompt(advisoryType: string, market: string): string {
  return `You are an expert energy trading advisor specializing in ${market.toUpperCase()} market analysis. Your role is to provide actionable, data-driven trading recommendations based on AI-predicted electricity prices.

Key responsibilities:
- Analyze price predictions and market conditions to identify opportunities
- Provide specific trading recommendations with clear timing and rationale
- Assess risks including volatility, price spikes, and market uncertainties
- Identify arbitrage opportunities, optimal trading windows, and hedging strategies
- Consider factors like demand patterns, renewable generation, weather impacts, and grid conditions

Communication style:
- Be concise but comprehensive
- Use specific numbers and timeframes
- Highlight both opportunities and risks
- Provide actionable recommendations that traders can execute immediately`;
}

function buildUserPrompt(
  advisoryType: string,
  predictionSummary: any,
  modelPerf: any,
  explanations: any[],
  userContext: any
): string {
  const currentTime = new Date().toISOString();
  
  let prompt = `Generate a ${advisoryType} advisory for energy trading based on the following data:\n\n`;
  
  prompt += `**Current Time**: ${currentTime}\n\n`;
  
  prompt += `**Price Predictions Summary (Next 24 Hours)**:\n`;
  prompt += `- Average Price: $${predictionSummary.avg}/MWh\n`;
  prompt += `- Price Range: $${predictionSummary.min} - $${predictionSummary.max}/MWh\n`;
  prompt += `- Trend: ${predictionSummary.trend}\n`;
  prompt += `- Volatility: ${predictionSummary.volatility}%\n`;
  prompt += `- Price Spread: $${predictionSummary.priceRange}/MWh\n\n`;
  
  if (modelPerf) {
    prompt += `**Model Performance**:\n`;
    prompt += `- Mean Absolute Error: $${modelPerf.mae}/MWh\n`;
    prompt += `- R² Score: ${modelPerf.r_squared?.toFixed(3)}\n`;
    prompt += `- Prediction Confidence: ${modelPerf.r_squared > 0.8 ? 'High' : modelPerf.r_squared > 0.6 ? 'Moderate' : 'Low'}\n\n`;
  }
  
  if (explanations && explanations.length > 0) {
    prompt += `**Recent Key Drivers**:\n`;
    explanations.slice(0, 2).forEach((exp, idx) => {
      const drivers = exp.key_drivers || {};
      prompt += `${idx + 1}. Increasing factors: ${(drivers.price_increasing_factors || []).join(', ')}\n`;
      prompt += `   Decreasing factors: ${(drivers.price_decreasing_factors || []).join(', ')}\n`;
    });
    prompt += '\n';
  }
  
  if (predictionSummary.predictions && predictionSummary.predictions.length > 0) {
    prompt += `**Hourly Price Forecast (First 12 Hours)**:\n`;
    predictionSummary.predictions.slice(0, 12).forEach((p: any, idx: number) => {
      const hour = new Date(p.timestamp).getHours();
      prompt += `Hour ${idx + 1} (${hour}:00): $${p.price}/MWh\n`;
    });
    prompt += '\n';
  }
  
  if (userContext.tradingGoal) {
    prompt += `**User Trading Goal**: ${userContext.tradingGoal}\n\n`;
  }
  
  if (userContext.riskTolerance) {
    prompt += `**Risk Tolerance**: ${userContext.riskTolerance}\n\n`;
  }
  
  prompt += `Provide comprehensive trading recommendations including specific entry/exit points, risk mitigation strategies, and opportunities for the next 24 hours.`;
  
  return prompt;
}
