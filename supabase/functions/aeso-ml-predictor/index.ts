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
    const requestBody = await req.json();
    const { 
      features, 
      historicalData, 
      trainingData,
      predictionData,
      mode = 'predict' 
    } = requestBody;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🤖 ML Predictor Mode: ${mode}`);

    if (mode === 'train') {
      // Training mode: Analyze patterns and return feature insights
      console.log(`Analyzing ${historicalData?.length || 0} historical records...`);
      
      const systemPrompt = `You are an expert electricity price forecasting model for the Alberta (AESO) market.
Analyze the historical data patterns to extract key price drivers and relationships.

Key factors in electricity pricing:
- Time patterns (hour, day, season)
- Supply-demand balance (demand vs generation)
- Renewable generation (wind/solar reduces prices)
- Temperature extremes (increase demand)
- Price momentum and volatility
- Market regimes (normal, elevated, spike)`;

      const userPrompt = `Analyze this AESO electricity market data and identify the top 5 price prediction patterns:

Sample data (last 20 records):
${JSON.stringify(historicalData.slice(-20), null, 2)}

Statistics:
- Total records: ${historicalData.length}
- Avg price: $${(historicalData.reduce((sum: number, d: any) => sum + d.pool_price, 0) / historicalData.length).toFixed(2)}/MWh
- Price range: $${Math.min(...historicalData.map((d: any) => d.pool_price)).toFixed(2)} - $${Math.max(...historicalData.map((d: any) => d.pool_price)).toFixed(2)}/MWh`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              name: 'analyze_price_patterns',
              description: 'Extract key price prediction patterns from historical data',
              parameters: {
                type: 'object',
                properties: {
                  patterns: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        pattern: { type: 'string' },
                        importance: { type: 'number' },
                        description: { type: 'string' }
                      },
                      required: ['pattern', 'importance', 'description']
                    }
                  },
                  confidence: { type: 'number' }
                },
                required: ['patterns', 'confidence']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'analyze_price_patterns' } }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.' 
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            error: 'Payment required. Please add credits to your Lovable AI workspace.' 
          }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0].message.tool_calls?.[0];
      const analysis = toolCall ? JSON.parse(toolCall.function.arguments) : null;

      console.log('✅ Pattern analysis complete:', analysis);

      return new Response(JSON.stringify({
        success: true,
        analysis,
        model: 'gemini-2.5-flash'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (mode === 'validate') {
      // Validate mode: Generate predictions for multiple data points
      console.log(`Generating predictions for ${predictionData?.length || 0} validation records...`);
      
      if (!predictionData || predictionData.length === 0) {
        throw new Error('predictionData is required for validate mode');
      }

      // Batch predictions for efficiency - process in chunks of 20
      const predictions = [];
      const chunkSize = 20;
      
      for (let i = 0; i < predictionData.length; i += chunkSize) {
        const chunk = predictionData.slice(i, i + chunkSize);
        
        const systemPrompt = `You are an expert electricity price forecasting model for the Alberta (AESO) market.
Predict pool prices in $/MWh for each provided record. Return predictions as an array.`;

        const recordsText = chunk.map((record, idx) => `
Record ${idx + 1}:
- Time: Hour ${record.hour_of_day}, Day ${record.day_of_week}, Month ${record.month}
- Demand: ${record.ail_mw?.toFixed(0)} MW
- Wind Gen: ${record.generation_wind?.toFixed(0)} MW
- Price lags: 1h=$${record.price_lag_1h?.toFixed(2)}, 24h=$${record.price_lag_24h?.toFixed(2)}
- Renewable: ${record.renewable_penetration?.toFixed(1)}%`).join('\n');

        const userPrompt = `Predict pool price for these ${chunk.length} records:\n${recordsText}`;

        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                  name: 'predict_prices',
                  description: 'Predict electricity pool prices for multiple records',
                  parameters: {
                    type: 'object',
                    properties: {
                      predictions: {
                        type: 'array',
                        items: { type: 'number' },
                        description: 'Array of predicted prices in $/MWh'
                      }
                    },
                    required: ['predictions']
                  }
                }
              }],
              tool_choice: { type: 'function', function: { name: 'predict_prices' } }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const toolCall = data.choices[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              const args = JSON.parse(toolCall.function.arguments);
              predictions.push(...(args.predictions || []));
            } else {
              // Fill with nulls if prediction failed
              predictions.push(...Array(chunk.length).fill(null));
            }
          } else {
            predictions.push(...Array(chunk.length).fill(null));
          }
        } catch (error) {
          console.error('Batch prediction error:', error);
          predictions.push(...Array(chunk.length).fill(null));
        }
      }

      console.log(`✅ Generated ${predictions.filter(p => p !== null).length}/${predictions.length} predictions`);
      
      return new Response(JSON.stringify({
        success: true,
        predictions,
        model: 'gemini-2.5-flash'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // Prediction mode: Generate price prediction
      console.log('Making prediction with features:', features);

      const systemPrompt = `You are an expert electricity price forecasting model for the Alberta (AESO) market.
Use the provided features to predict the pool price in $/MWh.

Key relationships:
- High demand + low wind = higher prices
- Peak hours (7-9am, 5-9pm) = higher prices  
- Low wind generation = higher prices (more gas/coal needed)
- Price lag features show recent trends
- Temperature extremes increase demand
- Weekend/overnight = lower prices`;

      const userPrompt = `Predict the AESO pool price given these features:

Current Conditions:
- Hour: ${features.hour_of_day}
- Day of week: ${features.day_of_week} (0=Mon, 6=Sun)
- Month: ${features.month}
- Demand (AIL): ${features.ail_mw?.toFixed(0)} MW
- Wind Generation: ${features.generation_wind?.toFixed(0)} MW
- Temperature: ${features.temperature_avg?.toFixed(1)}°C

Price History:
- Price lag 1h: $${features.price_lag_1h?.toFixed(2)}/MWh
- Price lag 24h: $${features.price_lag_24h?.toFixed(2)}/MWh
- Price lag 48h: $${features.price_lag_48h?.toFixed(2)}/MWh
- Rolling avg 24h: $${features.price_rolling_avg_24h?.toFixed(2)}/MWh

Market Dynamics:
- Net demand: ${features.net_demand?.toFixed(0)} MW
- Renewable penetration: ${features.renewable_penetration?.toFixed(1)}%
- Supply cushion: ${features.supply_cushion?.toFixed(0)} MW
- Price/Demand ratio: $${features.price_demand_ratio?.toFixed(4)}/MW

Volatility & Stress:
- Price volatility 3h: $${features.price_volatility_3h?.toFixed(2)}/MWh
- Price volatility 12h: $${features.price_volatility_12h?.toFixed(2)}/MWh
- Market stress score: ${features.market_stress_score?.toFixed(1)}/100
- Spike probability: ${features.price_spike_probability?.toFixed(1)}%

Advanced Indicators:
- Price acceleration: $${features.price_acceleration?.toFixed(2)}/MWh²
- Volatility trend: ${features.volatility_trend?.toFixed(1)}%
- Demand forecast error: ${features.demand_forecast_error?.toFixed(0)} MW

Recent Historical Context:
${historicalData ? `Last 5 hours prices: ${historicalData.slice(-5).map((d: any) => `$${d.pool_price.toFixed(2)}`).join(', ')}` : 'Not available'}`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              name: 'predict_price',
              description: 'Predict electricity pool price based on market features',
              parameters: {
                type: 'object',
                properties: {
                  predicted_price: { 
                    type: 'number',
                    description: 'Predicted price in $/MWh'
                  },
                  confidence: { 
                    type: 'number',
                    description: 'Confidence level (0-1)'
                  },
                  reasoning: {
                    type: 'string',
                    description: 'Brief explanation of prediction'
                  }
                },
                required: ['predicted_price', 'confidence', 'reasoning']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'predict_price' } }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.' 
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ 
            error: 'Payment required. Please add credits to your Lovable AI workspace.' 
          }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0].message.tool_calls?.[0];
      const prediction = toolCall ? JSON.parse(toolCall.function.arguments) : null;

      console.log('✅ Prediction:', prediction);

      return new Response(JSON.stringify({
        success: true,
        predicted_price: prediction.predicted_price,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning,
        model: 'gemini-2.5-flash'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error: any) {
    console.error('ML Predictor error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
