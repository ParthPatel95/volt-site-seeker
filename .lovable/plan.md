
# Plan: Enhance Inventory Scanning for Demolition & Scrap Metal Estimation

## Overview

Transform the existing AI-powered inventory scanning feature into a comprehensive **Demolition & Scrap Valuation Tool** that helps demolition companies accurately estimate scrap metal values, salvage equipment pricing, and generate professional quotes for clients.

---

## Current Capabilities (What Exists)

| Feature | Current State |
|---------|--------------|
| **AI Image Analysis** | Identifies items, brands, condition, and retail market value |
| **Multi-Item Detection** | Can scan multiple items in one photo |
| **Value Estimation** | Provides low/high estimates based on retail pricing |
| **Condition Assessment** | New, Good, Fair, Poor ratings |
| **Categories** | Construction tools, electrical, plumbing, materials |

### Gaps for Demolition Use Case

1. **No weight/tonnage estimation** - Critical for scrap metal pricing
2. **No metal type detection** - Copper, aluminum, steel, brass have vastly different values
3. **No scrap vs. salvage distinction** - Some equipment has resale value, not just scrap
4. **No live metal pricing integration** - Prices fluctuate daily
5. **No hazardous material flags** - Asbestos, lead paint considerations
6. **No demolition-specific categories** - HVAC units, structural steel, wire harnesses

---

## Proposed Enhancements

### 1. New Demolition-Specific Analysis Types

```text
Extended AIAnalysisResult {
  ...existing fields...
  
  // NEW: Scrap Metal Analysis
  scrapAnalysis?: {
    metalType: 'copper' | 'aluminum' | 'steel' | 'brass' | 'stainless' | 'iron' | 'mixed' | 'unknown';
    metalGrade: string;           // e.g., "#1 Copper", "Cast Aluminum", "HMS 1&2"
    estimatedWeight: {
      value: number;
      unit: 'lbs' | 'kg' | 'tons';
      confidence: 'high' | 'medium' | 'low';
    };
    scrapValue: {
      pricePerUnit: number;       // Current spot price per lb/kg
      totalValue: number;
      priceSource: string;        // "Market Average" or API source
      lastUpdated: string;
    };
    recyclabilityScore: number;   // 0-100 (higher = easier to recycle)
  };
  
  // NEW: Salvage Assessment
  salvageAssessment?: {
    isSalvageable: boolean;       // Can be resold vs. scrap only
    resaleValue: {
      lowEstimate: number;
      highEstimate: number;
      confidence: 'high' | 'medium' | 'low';
    };
    recommendedDisposition: 'resell' | 'scrap' | 'hazmat-disposal';
    refurbishmentPotential: 'high' | 'medium' | 'low' | 'none';
    demandLevel: 'high' | 'medium' | 'low';
  };
  
  // NEW: Hazardous Material Flags
  hazmatFlags?: {
    hasAsbestos: boolean;
    hasLeadPaint: boolean;
    hasPCBs: boolean;
    hasRefrigerants: boolean;
    otherHazards: string[];
    disposalNotes: string;
  };
  
  // NEW: Demolition Metadata
  demolitionDetails?: {
    removalComplexity: 'simple' | 'moderate' | 'complex';
    laborHoursEstimate: number;
    equipmentNeeded: string[];
    accessibilityNotes: string;
  };
}
```

### 2. Enhanced AI Prompt for Demolition Analysis

Update the edge function system prompt to include demolition-specific expertise:

```text
DEMOLITION & SCRAP METAL EXPERTISE:

You are also an expert in demolition salvage and scrap metal valuation with deep knowledge of:

METAL IDENTIFICATION:
- Copper: Bare bright (#1), #2 copper, insulated wire, copper pipe
- Aluminum: Cast, sheet, extrusion, cans, litho sheets
- Steel: Structural, HMS 1&2, shredder steel, tin/cans
- Brass: Red brass, yellow brass, mixed brass
- Stainless Steel: 304, 316, mixed stainless
- Iron: Cast iron, ductile iron, wrought iron

WEIGHT ESTIMATION GUIDELINES:
- Copper wire: ~2-3 lbs per foot of 4/0 gauge
- Steel I-beams: ~25-50 lbs per linear foot (varies by size)
- Cast iron radiators: ~75-150 lbs per section
- Aluminum windows: ~1-3 lbs per square foot
- HVAC units: ~100-400 lbs depending on tonnage
- Electric motors: Weight varies by HP rating

SCRAP PRICING REFERENCE (per lb, subject to market):
- Bare bright copper: $3.50-4.50/lb
- #2 copper: $3.00-3.80/lb
- Insulated copper wire: $1.50-2.50/lb (depends on recovery %)
- Clean aluminum: $0.80-1.10/lb
- Cast aluminum: $0.50-0.75/lb
- Steel/iron: $0.08-0.15/lb
- Brass: $2.00-2.80/lb
- Stainless steel: $0.50-0.80/lb

SALVAGE VS SCRAP DECISION:
- Working HVAC units: Salvage value $200-2000+
- Working motors: Salvage value 2-5x scrap value
- Vintage fixtures: Potential architectural salvage
- Industrial equipment: Check secondary market first
```

### 3. New UI Components

#### A. Scrap Metal Results Card

Display scrap-specific analysis with metal type, weight, and current market pricing.

```text
+------------------------------------------------------------------+
| 🔩 SCRAP ANALYSIS                                                 |
|------------------------------------------------------------------|
| Metal Type: #2 Copper (Insulated Wire)                           |
| Estimated Weight: 45 lbs (±5 lbs)          [Medium Confidence]   |
|                                                                   |
| CURRENT PRICING (as of Jan 29, 2025)                             |
| ├── Price/lb: $3.25 - $3.65                                      |
| ├── Gross Value: $146.25 - $164.25                               |
| └── After Processing: $110 - $130 (75% recovery rate)            |
|                                                                   |
| ♻️ Recyclability: 95/100 (Excellent)                              |
+------------------------------------------------------------------+
```

#### B. Salvage vs. Scrap Recommendation

Help operators decide whether to resell equipment or scrap it.

```text
+------------------------------------------------------------------+
| 💡 DISPOSITION RECOMMENDATION                                     |
|------------------------------------------------------------------|
| Item: Carrier 5-Ton Commercial HVAC Unit                         |
| Condition: Fair (Operational, cosmetic wear)                     |
|                                                                   |
| ┌─ SALVAGE (Recommended) ─┐   ┌─ SCRAP ─────────────┐            |
| │ Resale: $800 - $1,200   │   │ Metal value: $85    │            |
| │ Demand: High            │   │ (350 lbs mixed)     │            |
| │ Refurb potential: Good  │   │                     │            |
| └─────────────────────────┘   └─────────────────────┘            |
|                                                                   |
| [Add as Salvage] [Add as Scrap] [Generate Quote]                 |
+------------------------------------------------------------------+
```

#### C. Hazmat Warning Banner

Alert operators to potential hazardous materials.

```text
+------------------------------------------------------------------+
| ⚠️ HAZMAT ALERT                                                   |
|------------------------------------------------------------------|
| This item may contain:                                           |
| • Refrigerants (R-22 HCFC) - Requires certified recovery         |
| • Potential PCBs in capacitor (pre-1979 manufacturing)           |
|                                                                   |
| Disposal Notes: Contact licensed HVAC contractor for refrigerant |
| recovery before scrapping. EPA regulations apply.                |
+------------------------------------------------------------------+
```

### 4. Database Schema Extensions

Add new columns to support demolition-specific data:

```sql
ALTER TABLE inventory_items ADD COLUMN metal_type TEXT;
ALTER TABLE inventory_items ADD COLUMN metal_grade TEXT;
ALTER TABLE inventory_items ADD COLUMN estimated_weight DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN weight_unit TEXT DEFAULT 'lbs';
ALTER TABLE inventory_items ADD COLUMN scrap_price_per_unit DECIMAL(10,4);
ALTER TABLE inventory_items ADD COLUMN is_salvageable BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN salvage_value DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN has_hazmat_flags BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN hazmat_details JSONB;
ALTER TABLE inventory_items ADD COLUMN removal_complexity TEXT;
ALTER TABLE inventory_items ADD COLUMN labor_hours_estimate DECIMAL(5,2);
```

### 5. Workspace Mode: Demolition/Scrap

Add workspace type to enable specialized analysis:

```sql
ALTER TABLE inventory_workspaces 
ADD COLUMN workspace_type TEXT DEFAULT 'general' 
CHECK (workspace_type IN ('general', 'demolition', 'construction', 'warehouse'));
```

When workspace type is "demolition", automatically:
- Enable scrap metal analysis in AI prompts
- Show demolition-specific UI components
- Add scrap metal categories by default
- Display weight and metal type columns in item lists

### 6. Quote Generation Feature

New component for generating client quotes:

```text
+------------------------------------------------------------------+
| 📋 DEMOLITION QUOTE GENERATOR                                     |
|------------------------------------------------------------------|
| Project: 123 Main Street Warehouse Demolition                    |
|                                                                   |
| SCRAP METAL SUMMARY                                              |
| ├── Copper (various): 850 lbs → $2,720 - $3,230                  |
| ├── Aluminum: 2,400 lbs → $1,920 - $2,640                        |
| ├── Steel/Iron: 45,000 lbs → $3,600 - $6,750                     |
| └── Brass: 120 lbs → $240 - $336                                 |
|                                                                   |
| SALVAGE ITEMS                                                    |
| ├── HVAC Units (3): $2,400 - $3,600                              |
| ├── Industrial Motors (5): $1,200 - $1,800                       |
| └── Electrical Panels (2): $300 - $500                           |
|                                                                   |
| ESTIMATED TOTAL RECOVERY: $12,380 - $18,856                      |
|                                                                   |
| [Download PDF Quote] [Email to Client] [Print]                   |
+------------------------------------------------------------------+
```

---

## Implementation Summary

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/inventory/types/demolition.types.ts` | New types for scrap/salvage analysis |
| `src/components/inventory/components/ScrapMetalResults.tsx` | Display scrap analysis |
| `src/components/inventory/components/SalvageAssessment.tsx` | Salvage vs. scrap recommendation |
| `src/components/inventory/components/HazmatWarning.tsx` | Hazardous material alerts |
| `src/components/inventory/components/DemolitionQuoteGenerator.tsx` | Quote generation UI |
| `src/components/inventory/hooks/useScrapPricing.ts` | Fetch/cache scrap metal prices |
| `supabase/functions/scrap-metal-pricing/index.ts` | Edge function for pricing API |

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/inventory-ai-analyzer/index.ts` | Add demolition analysis prompts and tool definitions |
| `src/components/inventory/hooks/useInventoryAIAnalysis.ts` | Extend result types for scrap/salvage data |
| `src/components/inventory/components/InventoryAIResults.tsx` | Add scrap metal display sections |
| `src/components/inventory/components/InventorySmartCapture.tsx` | Add "Demolition Mode" toggle |
| `src/components/inventory/components/InventoryItemCard.tsx` | Show weight/metal type in card |
| `src/components/inventory/components/InventoryDashboard.tsx` | Add scrap value summary |
| `src/components/inventory/types/inventory.types.ts` | Extend types with demolition fields |
| `src/components/inventory/components/CreateWorkspaceDialog.tsx` | Add workspace type selector |
| `supabase/migrations/` | Add new columns for demolition data |

---

## Technical Details

### Scrap Pricing Integration Options

1. **MetalpriceAPI.com** - Real-time precious/industrial metals pricing
2. **Static Reference Table** - Updated monthly with regional averages
3. **Hybrid Approach** (Recommended):
   - Default to curated reference prices in the AI prompt
   - Optional API integration for live pricing (premium feature)
   - Allow manual price overrides per workspace

### Weight Estimation Approach

The AI will estimate weights using visual cues and reference data:
- Count visible items and estimate dimensions
- Apply standard weight-per-unit formulas
- Adjust for material density (copper = 0.321 lb/in^3, aluminum = 0.098 lb/in^3)
- Provide confidence level based on visibility and item familiarity

### Multi-Photo Accuracy

Encourage users to take multiple angles to improve:
- Metal type identification (look for rust patterns, surface finish)
- Weight estimation (better dimension assessment)
- Condition evaluation (check all sides for damage)
- Text extraction (labels, manufacturer stamps)

---

## Summary

| Enhancement | Description |
|-------------|-------------|
| **Metal Type Detection** | AI identifies copper, aluminum, steel, brass, stainless, iron |
| **Weight Estimation** | Visual estimation with confidence levels |
| **Scrap Pricing** | Current market prices per pound with total values |
| **Salvage Assessment** | Recommend resell vs. scrap with value comparison |
| **Hazmat Alerts** | Flag asbestos, lead, refrigerants, PCBs |
| **Removal Complexity** | Labor hours and equipment estimates |
| **Quote Generator** | Professional PDF quotes for clients |
| **Workspace Type** | "Demolition" mode enables specialized features |
