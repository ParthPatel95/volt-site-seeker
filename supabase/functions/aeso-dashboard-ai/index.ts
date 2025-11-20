import { serve } from "../_shared/imports.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an AI assistant helping users create AESO energy market dashboard widgets. 

Available data sources:
- historical_pricing: Historical pool prices
- price_predictions: AI-predicted future prices
- generation_mix: Energy generation by type (coal, gas, wind, solar, hydro)
- operating_reserve: Operating reserve metrics
- interchange: Import/export data
- natural_gas: Natural gas prices
- model_performance: AI model accuracy metrics
- market_regimes: Market condition classifications
- weather_forecasts: Weather prediction data
- enhanced_features: Advanced market features
- prediction_accuracy: Prediction error analysis
- training_data: Model training dataset metrics

Available widget types:
- stat_card: Single value with trend
- line_chart: Time series line chart
- bar_chart: Bar chart
- area_chart: Area chart
- pie_chart: Pie/donut chart
- gauge: Progress gauge
- table: Data table

Time ranges: 24hours, 30days, 12months

When a user requests widgets, respond with:
1. A friendly confirmation message
2. A JSON array of widget configurations

Example response format:
{
  "message": "I've created 2 widgets for you: a line chart showing price predictions and a stat card for current prices.",
  "widgets": [
    {
      "widget_type": "line_chart",
      "widget_config": { "title": "24h Price Predictions" },
      "data_source": "price_predictions",
      "data_filters": { "timeRange": "24hours", "metrics": ["predicted_price"], "aggregation": "hourly" },
      "w": 6,
      "h": 4
    }
  ]
}

Be helpful and suggest relevant visualizations based on user requests.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "create_widgets",
              description: "Create dashboard widgets based on user requirements",
              parameters: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    description: "Friendly confirmation message to the user"
                  },
                  widgets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        widget_type: {
                          type: "string",
                          enum: ["stat_card", "line_chart", "bar_chart", "area_chart", "pie_chart", "gauge", "table"]
                        },
                        widget_config: {
                          type: "object",
                          properties: {
                            title: { type: "string" }
                          },
                          required: ["title"]
                        },
                        data_source: {
                          type: "string",
                          enum: ["historical_pricing", "price_predictions", "generation_mix", "operating_reserve", "interchange", "natural_gas", "model_performance", "market_regimes", "weather_forecasts", "enhanced_features", "prediction_accuracy", "training_data"]
                        },
                        data_filters: {
                          type: "object",
                          properties: {
                            timeRange: { type: "string", enum: ["24hours", "30days", "12months"] },
                            metrics: { type: "array", items: { type: "string" } },
                            aggregation: { type: "string", enum: ["hourly", "daily", "monthly"] }
                          }
                        },
                        w: { type: "number", description: "Width in grid units (1-12)" },
                        h: { type: "number", description: "Height in grid units" }
                      },
                      required: ["widget_type", "widget_config", "data_source", "data_filters", "w", "h"]
                    }
                  }
                },
                required: ["message", "widgets"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_widgets" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    console.log('AI response:', JSON.stringify(result, null, 2));

    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(args), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        message: result.choices?.[0]?.message?.content || "I can help you create widgets. What would you like to visualize?",
        widgets: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in aeso-dashboard-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "Sorry, I encountered an error. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
