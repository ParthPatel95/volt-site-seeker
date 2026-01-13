import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisResult {
  item: {
    name: string;
    description: string;
    brand?: string;
    model?: string;
    suggestedSku?: string;
  };
  quantity: {
    count: number;
    unit: string;
    confidence: 'high' | 'medium' | 'low';
  };
  condition: 'new' | 'good' | 'fair' | 'poor';
  category: {
    suggested: string;
    alternatives: string[];
  };
  marketValue: {
    lowEstimate: number;
    highEstimate: number;
    currency: string;
    confidence: 'high' | 'medium' | 'low';
    notes?: string;
    isUsed: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, existingCategories } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const categoryContext = existingCategories?.length > 0 
      ? `The user has these existing categories: ${existingCategories.join(', ')}. Try to match to one of these if appropriate.`
      : '';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert inventory analyst with deep knowledge of products, equipment, construction materials, tools, and market values. Your job is to analyze images of items and provide accurate identification, quantity counting, condition assessment, and market value estimation.

Be precise and conservative with value estimates. If you're uncertain about something, indicate so with lower confidence levels. Focus on practical inventory management needs.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and extract inventory information. ${categoryContext}

Provide detailed analysis including:
1. IDENTIFICATION: What is this item? Include brand and model if visible.
2. QUANTITY: How many individual items are visible? What unit of measurement is appropriate?
3. CONDITION: Assess the visible condition (new/good/fair/poor).
4. CATEGORY: What category does this belong to? (e.g., Power Tools, Hand Tools, Electrical, Plumbing, Materials, PPE, Equipment)
5. MARKET VALUE: Estimate the current market value per unit.
   - Provide low and high estimates
   - Consider if items appear new or used
   - Include your confidence level

Be conservative with estimates. If uncertain, say so.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_inventory_item",
              description: "Return structured analysis of the inventory item in the image",
              parameters: {
                type: "object",
                properties: {
                  item: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Name of the item" },
                      description: { type: "string", description: "Brief description of the item" },
                      brand: { type: "string", description: "Brand name if identifiable" },
                      model: { type: "string", description: "Model number/name if identifiable" },
                      suggestedSku: { type: "string", description: "Suggested SKU pattern" }
                    },
                    required: ["name", "description"]
                  },
                  quantity: {
                    type: "object",
                    properties: {
                      count: { type: "number", description: "Number of items visible" },
                      unit: { type: "string", description: "Unit of measurement (units, pieces, boxes, kg, etc.)" },
                      confidence: { type: "string", enum: ["high", "medium", "low"] }
                    },
                    required: ["count", "unit", "confidence"]
                  },
                  condition: {
                    type: "string",
                    enum: ["new", "good", "fair", "poor"],
                    description: "Condition of the item"
                  },
                  category: {
                    type: "object",
                    properties: {
                      suggested: { type: "string", description: "Primary category suggestion" },
                      alternatives: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "Alternative category options"
                      }
                    },
                    required: ["suggested", "alternatives"]
                  },
                  marketValue: {
                    type: "object",
                    properties: {
                      lowEstimate: { type: "number", description: "Low end of estimated value per unit in USD" },
                      highEstimate: { type: "number", description: "High end of estimated value per unit in USD" },
                      currency: { type: "string", default: "USD" },
                      confidence: { type: "string", enum: ["high", "medium", "low"] },
                      notes: { type: "string", description: "Additional notes about the valuation" },
                      isUsed: { type: "boolean", description: "Whether the item appears used" }
                    },
                    required: ["lowEstimate", "highEstimate", "currency", "confidence", "isUsed"]
                  }
                },
                required: ["item", "quantity", "condition", "category", "marketValue"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_inventory_item" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "analyze_inventory_item") {
      throw new Error("Unexpected AI response format");
    }

    const analysisResult: AnalysisResult = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in inventory-ai-analyzer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
