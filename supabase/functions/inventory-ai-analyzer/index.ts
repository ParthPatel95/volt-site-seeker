import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedText {
  modelNumber?: string;
  serialNumber?: string;
  barcode?: string;
  otherText?: string[];
}

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
  extractedText?: ExtractedText;
  identificationConfidence: 'high' | 'medium' | 'low';
}

interface MultiItemResult {
  items: AnalysisResult[];
  totalItemsDetected: number;
}

// Enhanced system prompt with expert knowledge and methodology
const SYSTEM_PROMPT = `You are an expert inventory analyst and product appraiser with 20+ years of experience in construction, electrical, plumbing, and industrial equipment.

You have encyclopedic knowledge of:
- Construction tools and equipment (DeWalt, Milwaukee, Makita, Bosch, Hilti, Ridgid, etc.)
- Electrical supplies and components (wire, outlets, panels, breakers)
- Plumbing materials and fittings (pipes, valves, fixtures)
- Building materials (lumber, fasteners, adhesives)
- Industrial equipment and machinery
- PPE and safety equipment
- General merchandise and consumer products

ANALYSIS METHODOLOGY - Follow these steps carefully:
1. SCAN the entire image systematically from left to right, top to bottom
2. IDENTIFY each distinct item visible - distinguish items from shadows/reflections
3. LOOK for text, labels, model numbers, barcodes, packaging, brand logos
4. READ any visible text carefully for product identification
5. ASSESS condition by examining for scratches, wear, rust, dents, damage
6. COUNT items carefully - count only distinct physical items
7. ESTIMATE value based on current retail prices and condition depreciation

PRICING REFERENCE POINTS (% of retail price):
- New/Sealed: 100% of retail
- Like-new (minimal use, no visible wear): 70-85% of retail
- Good (light wear, fully functional): 50-70% of retail
- Fair (visible wear, cosmetic damage, still functional): 30-50% of retail
- Poor (heavy wear, may need repair): 10-30% of retail

COMMON PRODUCT REFERENCE PRICES (USD):
- DeWalt 20V Max Drill/Driver Kit: $99-149 new
- Milwaukee M18 FUEL Impact Driver: $129-179 new
- Makita 18V LXT Drill: $99-159 new
- Bosch 12V Max Drill: $79-119 new
- Stanley FatMax Tape Measure 25ft: $20-30 new
- Klein Tools Pliers Set: $40-80 new
- Romex 12/2 Wire 250ft: $150-200 per box
- Standard hard hat (3M, MSA): $15-35 new
- Safety glasses: $10-25 new
- Work gloves (pair): $10-30 new

IMPORTANT GUIDELINES:
- Be CONSERVATIVE with valuations - prefer underestimate over overestimate
- If you cannot clearly identify an item, indicate this with low confidence
- Look for wear patterns: scratched housings, worn rubber, faded labels
- Consider packaging: boxed items are typically worth more than loose items
- Factor in completeness: missing accessories/parts reduce value significantly`;

// System prompt for multi-item detection
const MULTI_ITEM_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

MULTI-ITEM DETECTION MODE:
When analyzing images with MULTIPLE DIFFERENT items:
1. Identify and catalog EACH DISTINCT item type separately
2. Group identical items together (e.g., 3 identical drills = 1 entry with quantity 3)
3. List different item types as separate entries
4. Be thorough - scan the entire image for all visible items
5. For each item type, provide complete analysis including value estimation

Example: If you see 2 DeWalt drills, 1 Milwaukee impact driver, and 5 boxes of screws:
- Entry 1: DeWalt drill (quantity: 2)
- Entry 2: Milwaukee impact driver (quantity: 1)
- Entry 3: Screw boxes (quantity: 5)`;

// Single item analysis tool
const SINGLE_ITEM_TOOL = {
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
            description: { type: "string", description: "Detailed description of the item including notable features" },
            brand: { type: "string", description: "Brand name if identifiable" },
            model: { type: "string", description: "Model number/name if identifiable" },
            suggestedSku: { type: "string", description: "Suggested SKU pattern based on brand/model" }
          },
          required: ["name", "description"]
        },
        quantity: {
          type: "object",
          properties: {
            count: { type: "number", description: "Number of items visible" },
            unit: { type: "string", description: "Unit of measurement (units, pieces, boxes, kg, etc.)" },
            confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence in the count accuracy" }
          },
          required: ["count", "unit", "confidence"]
        },
        condition: {
          type: "string",
          enum: ["new", "good", "fair", "poor"],
          description: "Condition assessment based on visible wear and damage"
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
            confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence in the price estimate" },
            notes: { type: "string", description: "Additional notes about the valuation methodology" },
            isUsed: { type: "boolean", description: "Whether the item appears used vs new" }
          },
          required: ["lowEstimate", "highEstimate", "currency", "confidence", "isUsed"]
        },
        extractedText: {
          type: "object",
          properties: {
            modelNumber: { type: "string", description: "Model number if visible on the item" },
            serialNumber: { type: "string", description: "Serial number if visible" },
            barcode: { type: "string", description: "Barcode value if visible and readable" },
            otherText: { 
              type: "array", 
              items: { type: "string" },
              description: "Other relevant text visible on the item"
            }
          }
        },
        identificationConfidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Overall confidence in item identification accuracy"
        }
      },
      required: ["item", "quantity", "condition", "category", "marketValue", "identificationConfidence"]
    }
  }
};

// Multi-item analysis tool
const MULTI_ITEM_TOOL = {
  type: "function",
  function: {
    name: "analyze_multiple_inventory_items",
    description: "Return structured analysis of multiple different inventory items in the image",
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Array of distinct item types found in the image",
          items: {
            type: "object",
            properties: {
              item: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Name of the item" },
                  description: { type: "string", description: "Detailed description" },
                  brand: { type: "string", description: "Brand name if identifiable" },
                  model: { type: "string", description: "Model number/name if identifiable" },
                  suggestedSku: { type: "string", description: "Suggested SKU pattern" }
                },
                required: ["name", "description"]
              },
              quantity: {
                type: "object",
                properties: {
                  count: { type: "number", description: "Number of this item type visible" },
                  unit: { type: "string", description: "Unit of measurement" },
                  confidence: { type: "string", enum: ["high", "medium", "low"] }
                },
                required: ["count", "unit", "confidence"]
              },
              condition: {
                type: "string",
                enum: ["new", "good", "fair", "poor"]
              },
              category: {
                type: "object",
                properties: {
                  suggested: { type: "string" },
                  alternatives: { type: "array", items: { type: "string" } }
                },
                required: ["suggested", "alternatives"]
              },
              marketValue: {
                type: "object",
                properties: {
                  lowEstimate: { type: "number" },
                  highEstimate: { type: "number" },
                  currency: { type: "string", default: "USD" },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },
                  notes: { type: "string" },
                  isUsed: { type: "boolean" }
                },
                required: ["lowEstimate", "highEstimate", "currency", "confidence", "isUsed"]
              },
              extractedText: {
                type: "object",
                properties: {
                  modelNumber: { type: "string" },
                  serialNumber: { type: "string" },
                  barcode: { type: "string" },
                  otherText: { type: "array", items: { type: "string" } }
                }
              },
              identificationConfidence: {
                type: "string",
                enum: ["high", "medium", "low"]
              }
            },
            required: ["item", "quantity", "condition", "category", "marketValue", "identificationConfidence"]
          }
        },
        totalItemsDetected: {
          type: "number",
          description: "Total count of all individual items detected (sum of all quantities)"
        }
      },
      required: ["items", "totalItemsDetected"]
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, imageBase64, existingCategories, detectMultipleItems = false } = await req.json();

    // Support both single image (imageBase64) and multiple images (images array)
    const imageArray: string[] = images || (imageBase64 ? [imageBase64] : []);
    
    if (imageArray.length === 0) {
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

    // Build image content array for multi-image support
    const imageContent = imageArray.map((img: string) => ({
      type: "image_url",
      image_url: {
        url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`
      }
    }));

    const imageCountText = imageArray.length > 1 
      ? `I'm providing ${imageArray.length} photos of the same item(s) from different angles for better accuracy.`
      : '';

    // Choose system prompt and tool based on mode
    const systemPrompt = detectMultipleItems ? MULTI_ITEM_SYSTEM_PROMPT : SYSTEM_PROMPT;
    const tool = detectMultipleItems ? MULTI_ITEM_TOOL : SINGLE_ITEM_TOOL;
    const toolName = detectMultipleItems ? "analyze_multiple_inventory_items" : "analyze_inventory_item";

    const userPrompt = detectMultipleItems
      ? `${imageCountText}

Analyze this image and identify ALL DIFFERENT item types visible. ${categoryContext}

For EACH distinct item type found, provide:
1. IDENTIFICATION: What is this item? Include brand and model if visible.
2. QUANTITY: How many of this specific item type are visible?
3. CONDITION: Assess the visible condition (new/good/fair/poor).
4. CATEGORY: What category does this belong to?
5. MARKET VALUE: Estimate the current market value per unit.
6. EXTRACTED TEXT: Note any visible model numbers, serial numbers, barcodes.
7. IDENTIFICATION CONFIDENCE: Rate how confident you are.

List each different item type as a separate entry. Group identical items together.
Be thorough - identify every distinct item visible in the image.`
      : `${imageCountText}

Analyze this image and extract inventory information. ${categoryContext}

Provide comprehensive analysis including:
1. IDENTIFICATION: What is this item? Include brand and model if visible. Read any text/labels.
2. QUANTITY: How many individual items are visible? What unit of measurement is appropriate?
3. CONDITION: Assess the visible condition (new/good/fair/poor) based on wear, scratches, damage.
4. CATEGORY: What category does this belong to? (e.g., Power Tools, Hand Tools, Electrical, Plumbing, Materials, PPE, Equipment)
5. MARKET VALUE: Estimate the current market value per unit.
   - Provide low and high estimates in USD
   - Consider if items appear new or used
   - Include your confidence level
6. EXTRACTED TEXT: Note any visible model numbers, serial numbers, barcodes, or other text.
7. IDENTIFICATION CONFIDENCE: Rate how confident you are in the item identification.

Be thorough but conservative with estimates. If uncertain about anything, indicate so.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              ...imageContent
            ]
          }
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: toolName } }
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
    if (!toolCall || toolCall.function.name !== toolName) {
      throw new Error("Unexpected AI response format");
    }

    const parsedResult = JSON.parse(toolCall.function.arguments);

    if (detectMultipleItems) {
      // Multi-item response
      const multiResult: MultiItemResult = {
        items: parsedResult.items.map((item: AnalysisResult) => ({
          ...item,
          identificationConfidence: item.identificationConfidence || item.quantity.confidence
        })),
        totalItemsDetected: parsedResult.totalItemsDetected
      };

      return new Response(
        JSON.stringify({ success: true, multipleItems: true, results: multiResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Single item response (backward compatible)
      const analysisResult: AnalysisResult = parsedResult;
      
      // Ensure identificationConfidence exists
      if (!analysisResult.identificationConfidence) {
        analysisResult.identificationConfidence = analysisResult.quantity.confidence;
      }

      return new Response(
        JSON.stringify({ success: true, analysis: analysisResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error in inventory-ai-analyzer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
