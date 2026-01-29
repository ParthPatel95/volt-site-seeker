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

interface ScrapAnalysis {
  metalType: 'copper' | 'aluminum' | 'steel' | 'brass' | 'stainless' | 'iron' | 'mixed' | 'unknown';
  metalGrade: string;
  estimatedWeight: {
    value: number;
    unit: 'lbs' | 'kg' | 'tons';
    confidence: 'high' | 'medium' | 'low';
  };
  scrapValue: {
    pricePerUnit: number;
    totalValue: number;
    priceSource: string;
    lastUpdated: string;
  };
  recyclabilityScore: number;
}

interface SalvageAssessment {
  isSalvageable: boolean;
  resaleValue: {
    lowEstimate: number;
    highEstimate: number;
    confidence: 'high' | 'medium' | 'low';
  };
  recommendedDisposition: 'resell' | 'scrap' | 'hazmat-disposal';
  refurbishmentPotential: 'high' | 'medium' | 'low' | 'none';
  demandLevel: 'high' | 'medium' | 'low';
}

interface HazmatFlags {
  hasAsbestos: boolean;
  hasLeadPaint: boolean;
  hasPCBs: boolean;
  hasRefrigerants: boolean;
  otherHazards: string[];
  disposalNotes: string;
}

interface DemolitionDetails {
  removalComplexity: 'simple' | 'moderate' | 'complex';
  laborHoursEstimate: number;
  equipmentNeeded: string[];
  accessibilityNotes: string;
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
  // Demolition-specific fields
  scrapAnalysis?: ScrapAnalysis;
  salvageAssessment?: SalvageAssessment;
  hazmatFlags?: HazmatFlags;
  demolitionDetails?: DemolitionDetails;
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

// Demolition-specific system prompt addition
const DEMOLITION_PROMPT_ADDITION = `

DEMOLITION & SCRAP METAL EXPERTISE:

You are also an expert in demolition salvage and scrap metal valuation with deep knowledge of:

METAL IDENTIFICATION:
- Copper: Bare bright (#1), #2 copper, insulated wire, copper pipe, copper tubing
- Aluminum: Cast, sheet, extrusion, cans, litho sheets, radiators, siding
- Steel: Structural, HMS 1&2, shredder steel, tin/cans, rebar
- Brass: Red brass, yellow brass, mixed brass, valves, fittings
- Stainless Steel: 304, 316, mixed stainless, sinks, appliances
- Iron: Cast iron, ductile iron, wrought iron, radiators, pipes

WEIGHT ESTIMATION GUIDELINES:
- Copper wire 4/0 gauge: ~2-3 lbs per foot
- Copper pipe 1": ~0.65 lbs per foot
- Steel I-beams W8x10: ~10 lbs per linear foot
- Steel I-beams W12x26: ~26 lbs per linear foot
- Cast iron radiators: ~75-150 lbs per section (10-section = 750-1500 lbs)
- Aluminum windows: ~1-3 lbs per square foot
- HVAC units: ~100-400 lbs depending on tonnage (1 ton ≈ 150 lbs)
- Electric motors: ~5-8 lbs per HP for small, ~4-6 lbs per HP for large
- Car batteries: ~30-50 lbs each
- Steel drums (55 gal): ~40 lbs empty

SCRAP PRICING REFERENCE (per lb, subject to market fluctuations):
- Bare bright copper (#1): $3.50-4.50/lb
- #2 copper: $3.00-3.80/lb
- Insulated copper wire: $1.50-2.50/lb (depends on recovery %)
- Clean aluminum sheet: $0.80-1.10/lb
- Cast aluminum: $0.50-0.75/lb
- Aluminum extrusion: $0.60-0.85/lb
- Steel/iron HMS 1&2: $0.08-0.15/lb
- Structural steel: $0.10-0.18/lb
- Yellow brass: $2.00-2.80/lb
- Red brass: $2.20-3.00/lb
- 304 Stainless: $0.50-0.80/lb
- 316 Stainless: $0.70-1.00/lb
- Cast iron: $0.06-0.12/lb

SALVAGE VS SCRAP DECISION CRITERIA:
- Working HVAC units: Salvage value $200-2000+ depending on tonnage and age
- Working motors: Salvage value typically 2-5x scrap value
- Vintage fixtures: Potential architectural salvage premium 3-10x scrap
- Industrial equipment: Check secondary market - often worth 10-50x scrap
- Electrical panels: Working panels $50-500 salvage vs $5-20 scrap
- Copper pipe in good condition: May be worth more as plumbing salvage

HAZARDOUS MATERIAL IDENTIFICATION:
- Asbestos: Pre-1980 insulation, floor tiles, roofing, pipe wrap, cement board
- Lead paint: Pre-1978 painted surfaces, especially doors/windows
- PCBs: Pre-1979 electrical equipment (transformers, capacitors, ballasts)
- Refrigerants: HVAC systems, refrigeration units (R-22, R-410A, etc.)
- Mercury: Old thermostats, fluorescent bulbs, switches
- Batteries: Lead-acid, lithium, nickel-cadmium

REMOVAL COMPLEXITY ASSESSMENT:
- Simple: Loose items, easily accessible, no special equipment
- Moderate: Bolted/fastened items, moderate height, basic tools needed
- Complex: Welded structures, hazmat concerns, heavy equipment required`;

// System prompt for multi-item detection
const MULTI_ITEM_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

MULTI-ITEM DETECTION MODE - CRITICAL INSTRUCTIONS:
You MUST identify and catalog EVERY DISTINCT item type visible in the image as SEPARATE entries.

RULES:
1. Each DIFFERENT item type MUST be its own entry in the items array
2. Identical items get grouped (e.g., 3 identical DeWalt drills = 1 entry with quantity: 3)
3. DIFFERENT items MUST be separate (e.g., 1 DeWalt drill + 1 Milwaukee impact = 2 entries)
4. Scan the ENTIRE image - top to bottom, left to right
5. Include items in the background, on shelves, and partially visible
6. Even if you're uncertain about an item, include it with low confidence
7. NEVER return just 1 item if multiple distinct items are visible
8. Count EVERY different product type, brand, or model as a separate entry`;

// Single item analysis tool (standard mode)
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
  }
};

// Demolition mode single item tool
const DEMOLITION_SINGLE_ITEM_TOOL = {
  type: "function",
  function: {
    name: "analyze_demolition_item",
    description: "Return structured analysis of a demolition/scrap item including metal type, weight, and scrap value",
    parameters: {
      type: "object",
      properties: {
        item: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the item" },
            description: { type: "string", description: "Detailed description" },
            brand: { type: "string" },
            model: { type: "string" },
            suggestedSku: { type: "string" }
          },
          required: ["name", "description"]
        },
        quantity: {
          type: "object",
          properties: {
            count: { type: "number" },
            unit: { type: "string" },
            confidence: { type: "string", enum: ["high", "medium", "low"] }
          },
          required: ["count", "unit", "confidence"]
        },
        condition: { type: "string", enum: ["new", "good", "fair", "poor"] },
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
        identificationConfidence: { type: "string", enum: ["high", "medium", "low"] },
        scrapAnalysis: {
          type: "object",
          description: "Scrap metal analysis for recyclable materials",
          properties: {
            metalType: { type: "string", enum: ["copper", "aluminum", "steel", "brass", "stainless", "iron", "mixed", "unknown"] },
            metalGrade: { type: "string", description: "Specific grade (e.g., '#1 Copper', 'Cast Aluminum', 'HMS 1&2')" },
            estimatedWeight: {
              type: "object",
              properties: {
                value: { type: "number" },
                unit: { type: "string", enum: ["lbs", "kg", "tons"] },
                confidence: { type: "string", enum: ["high", "medium", "low"] }
              },
              required: ["value", "unit", "confidence"]
            },
            scrapValue: {
              type: "object",
              properties: {
                pricePerUnit: { type: "number", description: "Price per pound/kg" },
                totalValue: { type: "number" },
                priceSource: { type: "string", default: "Market Average" },
                lastUpdated: { type: "string", description: "Date in YYYY-MM-DD format" }
              },
              required: ["pricePerUnit", "totalValue", "priceSource", "lastUpdated"]
            },
            recyclabilityScore: { type: "number", description: "0-100 score for ease of recycling" }
          },
          required: ["metalType", "metalGrade", "estimatedWeight", "scrapValue", "recyclabilityScore"]
        },
        salvageAssessment: {
          type: "object",
          description: "Assessment of resale/salvage potential",
          properties: {
            isSalvageable: { type: "boolean" },
            resaleValue: {
              type: "object",
              properties: {
                lowEstimate: { type: "number" },
                highEstimate: { type: "number" },
                confidence: { type: "string", enum: ["high", "medium", "low"] }
              },
              required: ["lowEstimate", "highEstimate", "confidence"]
            },
            recommendedDisposition: { type: "string", enum: ["resell", "scrap", "hazmat-disposal"] },
            refurbishmentPotential: { type: "string", enum: ["high", "medium", "low", "none"] },
            demandLevel: { type: "string", enum: ["high", "medium", "low"] }
          },
          required: ["isSalvageable", "resaleValue", "recommendedDisposition", "refurbishmentPotential", "demandLevel"]
        },
        hazmatFlags: {
          type: "object",
          description: "Hazardous material warnings",
          properties: {
            hasAsbestos: { type: "boolean", default: false },
            hasLeadPaint: { type: "boolean", default: false },
            hasPCBs: { type: "boolean", default: false },
            hasRefrigerants: { type: "boolean", default: false },
            otherHazards: { type: "array", items: { type: "string" } },
            disposalNotes: { type: "string" }
          },
          required: ["hasAsbestos", "hasLeadPaint", "hasPCBs", "hasRefrigerants", "otherHazards", "disposalNotes"]
        },
        demolitionDetails: {
          type: "object",
          description: "Removal and labor estimates",
          properties: {
            removalComplexity: { type: "string", enum: ["simple", "moderate", "complex"] },
            laborHoursEstimate: { type: "number" },
            equipmentNeeded: { type: "array", items: { type: "string" } },
            accessibilityNotes: { type: "string" }
          },
          required: ["removalComplexity", "laborHoursEstimate", "equipmentNeeded", "accessibilityNotes"]
        }
      },
      required: ["item", "quantity", "condition", "category", "marketValue", "identificationConfidence", "scrapAnalysis", "salvageAssessment", "hazmatFlags", "demolitionDetails"]
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
                  name: { type: "string" },
                  description: { type: "string" },
                  brand: { type: "string" },
                  model: { type: "string" },
                  suggestedSku: { type: "string" }
                },
                required: ["name", "description"]
              },
              quantity: {
                type: "object",
                properties: {
                  count: { type: "number" },
                  unit: { type: "string" },
                  confidence: { type: "string", enum: ["high", "medium", "low"] }
                },
                required: ["count", "unit", "confidence"]
              },
              condition: { type: "string", enum: ["new", "good", "fair", "poor"] },
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
              identificationConfidence: { type: "string", enum: ["high", "medium", "low"] }
            },
            required: ["item", "quantity", "condition", "category", "marketValue", "identificationConfidence"]
          }
        },
        totalItemsDetected: {
          type: "number",
          description: "Total count of all individual items detected"
        }
      },
      required: ["items", "totalItemsDetected"]
    }
  }
};

// Demolition multi-item tool
const DEMOLITION_MULTI_ITEM_TOOL = {
  type: "function",
  function: {
    name: "analyze_multiple_demolition_items",
    description: "Return structured analysis of multiple demolition/scrap items including metal types and scrap values",
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  brand: { type: "string" },
                  model: { type: "string" },
                  suggestedSku: { type: "string" }
                },
                required: ["name", "description"]
              },
              quantity: {
                type: "object",
                properties: {
                  count: { type: "number" },
                  unit: { type: "string" },
                  confidence: { type: "string", enum: ["high", "medium", "low"] }
                },
                required: ["count", "unit", "confidence"]
              },
              condition: { type: "string", enum: ["new", "good", "fair", "poor"] },
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
                  currency: { type: "string" },
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
              identificationConfidence: { type: "string", enum: ["high", "medium", "low"] },
              scrapAnalysis: {
                type: "object",
                properties: {
                  metalType: { type: "string", enum: ["copper", "aluminum", "steel", "brass", "stainless", "iron", "mixed", "unknown"] },
                  metalGrade: { type: "string" },
                  estimatedWeight: {
                    type: "object",
                    properties: {
                      value: { type: "number" },
                      unit: { type: "string", enum: ["lbs", "kg", "tons"] },
                      confidence: { type: "string", enum: ["high", "medium", "low"] }
                    },
                    required: ["value", "unit", "confidence"]
                  },
                  scrapValue: {
                    type: "object",
                    properties: {
                      pricePerUnit: { type: "number" },
                      totalValue: { type: "number" },
                      priceSource: { type: "string" },
                      lastUpdated: { type: "string" }
                    },
                    required: ["pricePerUnit", "totalValue", "priceSource", "lastUpdated"]
                  },
                  recyclabilityScore: { type: "number" }
                },
                required: ["metalType", "metalGrade", "estimatedWeight", "scrapValue", "recyclabilityScore"]
              },
              salvageAssessment: {
                type: "object",
                properties: {
                  isSalvageable: { type: "boolean" },
                  resaleValue: {
                    type: "object",
                    properties: {
                      lowEstimate: { type: "number" },
                      highEstimate: { type: "number" },
                      confidence: { type: "string", enum: ["high", "medium", "low"] }
                    },
                    required: ["lowEstimate", "highEstimate", "confidence"]
                  },
                  recommendedDisposition: { type: "string", enum: ["resell", "scrap", "hazmat-disposal"] },
                  refurbishmentPotential: { type: "string", enum: ["high", "medium", "low", "none"] },
                  demandLevel: { type: "string", enum: ["high", "medium", "low"] }
                },
                required: ["isSalvageable", "resaleValue", "recommendedDisposition", "refurbishmentPotential", "demandLevel"]
              },
              hazmatFlags: {
                type: "object",
                properties: {
                  hasAsbestos: { type: "boolean" },
                  hasLeadPaint: { type: "boolean" },
                  hasPCBs: { type: "boolean" },
                  hasRefrigerants: { type: "boolean" },
                  otherHazards: { type: "array", items: { type: "string" } },
                  disposalNotes: { type: "string" }
                },
                required: ["hasAsbestos", "hasLeadPaint", "hasPCBs", "hasRefrigerants", "otherHazards", "disposalNotes"]
              },
              demolitionDetails: {
                type: "object",
                properties: {
                  removalComplexity: { type: "string", enum: ["simple", "moderate", "complex"] },
                  laborHoursEstimate: { type: "number" },
                  equipmentNeeded: { type: "array", items: { type: "string" } },
                  accessibilityNotes: { type: "string" }
                },
                required: ["removalComplexity", "laborHoursEstimate", "equipmentNeeded", "accessibilityNotes"]
              }
            },
            required: ["item", "quantity", "condition", "category", "marketValue", "identificationConfidence", "scrapAnalysis", "salvageAssessment", "hazmatFlags", "demolitionDetails"]
          }
        },
        totalItemsDetected: { type: "number" }
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
    const { 
      images, 
      imageBase64, 
      existingCategories, 
      detectMultipleItems = false,
      demolitionMode = false  // NEW: Enable demolition/scrap analysis
    } = await req.json();

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
    let systemPrompt: string;
    let tool: typeof SINGLE_ITEM_TOOL;
    let toolName: string;

    if (demolitionMode) {
      // Demolition mode
      systemPrompt = detectMultipleItems 
        ? SYSTEM_PROMPT + DEMOLITION_PROMPT_ADDITION + "\n\n" + MULTI_ITEM_SYSTEM_PROMPT.split(SYSTEM_PROMPT)[1]
        : SYSTEM_PROMPT + DEMOLITION_PROMPT_ADDITION;
      tool = detectMultipleItems ? DEMOLITION_MULTI_ITEM_TOOL : DEMOLITION_SINGLE_ITEM_TOOL;
      toolName = detectMultipleItems ? "analyze_multiple_demolition_items" : "analyze_demolition_item";
    } else {
      // Standard mode
      systemPrompt = detectMultipleItems ? MULTI_ITEM_SYSTEM_PROMPT : SYSTEM_PROMPT;
      tool = detectMultipleItems ? MULTI_ITEM_TOOL : SINGLE_ITEM_TOOL;
      toolName = detectMultipleItems ? "analyze_multiple_inventory_items" : "analyze_inventory_item";
    }

    // Build user prompt based on mode
    let userPrompt: string;
    
    if (demolitionMode) {
      userPrompt = detectMultipleItems
        ? `${imageCountText}

Analyze this image in DEMOLITION/SCRAP MODE and identify ALL DIFFERENT item types visible. ${categoryContext}

For EACH distinct item type found, provide:
1. IDENTIFICATION: What is this item? Include brand and model if visible.
2. QUANTITY: How many of this specific item type are visible?
3. CONDITION: Assess the visible condition (new/good/fair/poor).
4. CATEGORY: What category does this belong to?
5. MARKET VALUE: Estimate retail market value per unit.
6. SCRAP ANALYSIS: Identify metal type, grade, estimate weight, calculate scrap value using current market prices.
7. SALVAGE ASSESSMENT: Can this be resold as salvage? Estimate resale value vs scrap value.
8. HAZMAT FLAGS: Check for asbestos, lead paint, PCBs, refrigerants, or other hazardous materials.
9. REMOVAL DETAILS: Assess removal complexity, labor hours, and equipment needed.

Use the current date (${new Date().toISOString().split('T')[0]}) for lastUpdated fields.
Be thorough - identify every distinct item visible in the image.`
        : `${imageCountText}

Analyze this image in DEMOLITION/SCRAP MODE. ${categoryContext}

Provide comprehensive analysis including:
1. IDENTIFICATION: What is this item? Include brand and model if visible.
2. QUANTITY: How many individual items are visible?
3. CONDITION: Assess the visible condition (new/good/fair/poor).
4. CATEGORY: What category does this belong to?
5. MARKET VALUE: Estimate retail market value per unit.
6. SCRAP ANALYSIS:
   - Identify the primary metal type (copper, aluminum, steel, brass, stainless, iron, mixed)
   - Determine the grade (e.g., "#1 Copper", "Cast Aluminum", "HMS 1&2")
   - Estimate weight based on visual dimensions and material density
   - Calculate scrap value using current market prices
   - Rate recyclability (0-100)
7. SALVAGE ASSESSMENT:
   - Can this item be resold as working/refurbished equipment?
   - Estimate resale value if salvageable
   - Compare salvage vs scrap value to recommend disposition
   - Assess refurbishment potential and market demand
8. HAZMAT FLAGS:
   - Check for potential asbestos (insulation, tiles, etc.)
   - Check for lead paint (pre-1978 items)
   - Check for PCBs (pre-1979 electrical equipment)
   - Check for refrigerants (HVAC, refrigeration)
   - Note any other hazards and disposal requirements
9. REMOVAL DETAILS:
   - Assess removal complexity (simple/moderate/complex)
   - Estimate labor hours required
   - List equipment needed for safe removal
   - Note any accessibility concerns

Use the current date (${new Date().toISOString().split('T')[0]}) for lastUpdated fields.
Be thorough but conservative with weight and value estimates.`;
    } else {
      // Standard prompts (unchanged from original)
      userPrompt = detectMultipleItems
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
4. CATEGORY: What category does this belong to?
5. MARKET VALUE: Estimate the current market value per unit.
6. EXTRACTED TEXT: Note any visible model numbers, serial numbers, barcodes, or other text.
7. IDENTIFICATION CONFIDENCE: Rate how confident you are in the item identification.

Be thorough but conservative with estimates. If uncertain about anything, indicate so.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
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
    if (!toolCall || !toolCall.function.name.includes(demolitionMode ? "demolition" : "inventory")) {
      throw new Error("Unexpected AI response format");
    }

    const parsedResult = JSON.parse(toolCall.function.arguments);

    // Debug logging
    console.log('AI Analysis Response:', JSON.stringify({
      detectMultipleItems,
      demolitionMode,
      toolName,
      itemCount: parsedResult.items?.length || 1,
      totalDetected: parsedResult.totalItemsDetected,
      hasItemsArray: !!parsedResult.items
    }));

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
        JSON.stringify({ success: true, multipleItems: true, results: multiResult, demolitionMode }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Single item response
      const analysisResult: AnalysisResult = parsedResult;
      
      // Ensure identificationConfidence exists
      if (!analysisResult.identificationConfidence) {
        analysisResult.identificationConfidence = analysisResult.quantity.confidence;
      }

      return new Response(
        JSON.stringify({ success: true, analysis: analysisResult, demolitionMode }),
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
