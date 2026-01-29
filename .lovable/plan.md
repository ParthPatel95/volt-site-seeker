
# Plan: Enhanced Demolition Scanning with Excel-Like Layout & Live Metal Pricing

## Overview

Enhance the demolition/scrap metal scanning feature with:
1. **Excel-like spreadsheet layout** showing all detected metal types with values
2. **Live metal pricing integration** from a pricing API
3. **Enhanced weight estimation** with dimensional inputs and material formulas
4. **Expanded metal type detection** including specific steel grades

---

## Current State

| Feature | Status |
|---------|--------|
| Metal type detection | Basic (copper, aluminum, steel, brass, stainless, iron, mixed) |
| Weight estimation | AI visual estimation only |
| Pricing | Static hardcoded prices in `demolition.types.ts` |
| Results display | Card-based individual items |
| Steel grades | Generic (HMS 1&2, Structural Steel only) |

---

## Proposed Enhancements

### 1. Excel-Like Scrap Metal Spreadsheet Component

Create a new `ScrapMetalSpreadsheet.tsx` component that displays all scanned items in a sortable, editable table format:

```text
+--------------------------------------------------------------------------------------------------+
| SCRAP METAL BREAKDOWN                                                            [Export CSV]   |
+--------------------------------------------------------------------------------------------------+
| Item               | Metal Type | Grade      | Weight | Unit | Price/lb | Total Value | Status |
|--------------------|------------|------------|--------|------|----------|-------------|--------|
| Copper Pipe Bundle | Copper     | #2 Copper  | 45     | lbs  | $3.40    | $153.00     | [Edit] |
| HVAC Unit          | Mixed      | Steel/Copper| 280   | lbs  | -        | $85.00      | [Edit] |
| I-Beam Section     | Steel      | Structural | 1,200  | lbs  | $0.14    | $168.00     | [Edit] |
| Cast Iron Radiator | Iron       | Cast Iron  | 350    | lbs  | $0.09    | $31.50      | [Edit] |
| Electrical Wire    | Copper     | Insulated  | 120    | lbs  | $1.85    | $222.00     | [Edit] |
+--------------------|------------|------------|--------|------|----------|-------------|--------+
| TOTALS                                       | 1,995  | lbs  |          | $659.50     |        |
+--------------------------------------------------------------------------------------------------+

[ ] Include labor costs     Margin: [15%]     QUOTED AMOUNT: $758.43
```

Features:
- Inline editing of weight, grade, and price
- Sortable columns (by metal type, value, weight)
- Row actions: Edit, Delete, Override price
- Running totals at bottom
- Export to CSV/PDF
- Margin calculator for quotes

### 2. Live Metal Pricing Integration

Create a new edge function and hook to fetch live scrap metal prices:

**Edge Function: `scrap-metal-pricing/index.ts`**
- Fetches prices from metalpriceapi.com or metals-api.com
- Caches results for 1 hour (scrap prices don't change rapidly)
- Fallback to hardcoded defaults if API unavailable
- Returns prices for all common scrap grades

**Hook: `useScrapMetalPricing.ts`**
```typescript
interface ScrapMetalPrices {
  copper: { barebrightperLb: number; number2perLb: number; insulatedperLb: number };
  aluminum: { sheetperLb: number; castperLb: number; extrusionperLb: number };
  steel: { hms1perLb: number; structuralperLb: number; sheetperLb: number };
  brass: { yellowperLb: number; redperLb: number };
  stainless: { ss304perLb: number; ss316perLb: number };
  iron: { castperLb: number };
  lastUpdated: string;
  source: 'live' | 'cached' | 'default';
}
```

**Live Price Indicator Badge**
- Green dot: Live prices (fetched within 1 hour)
- Yellow dot: Cached prices (1-24 hours old)
- Gray dot: Default/fallback prices

### 3. Enhanced Weight Estimation System

Add dimensional input fields for more accurate weight estimation:

**Weight Calculator Component: `WeightEstimator.tsx`**

```text
+-------------------------------------------------------+
| WEIGHT ESTIMATION                                      |
|-------------------------------------------------------|
| Material: [Copper Pipe v]                             |
|                                                       |
| ○ Visual AI Estimate: 45 lbs (Medium confidence)      |
|                                                       |
| ● Calculate from Dimensions:                          |
|   Pipe Diameter: [1.5] inches                         |
|   Length: [50] feet                                   |
|   Wall Thickness: [0.065] inches (Type L)             |
|                                                       |
|   Calculated Weight: 52.4 lbs                         |
|                                                       |
| [Override Weight: ______ lbs]                         |
+-------------------------------------------------------+
```

**Weight Formulas by Material Type:**

| Material | Formula | Reference |
|----------|---------|-----------|
| Copper Pipe | (OD - wall) * wall * 0.3225 * length * 12 | lbs per foot |
| Steel I-Beam | Standard tables by size (W8x10 = 10 lb/ft) | AISC tables |
| Steel Plate | length x width x thickness x 0.2833 | lbs/cu in |
| Aluminum Sheet | length x width x thickness x 0.0975 | lbs/cu in |
| Cast Iron | volume x 0.26 lb/cu in | density |
| Brass | volume x 0.3 lb/cu in | density |

### 4. Expanded Steel Type Detection

Update the AI prompt with more granular steel grades:

**New Steel Categories:**
- **Carbon Steel**: A36, 1018, 1045
- **Structural**: W-shapes (I-beams), C-channels, angles, tubes
- **Stainless**: 304, 316, 410, 17-4
- **Alloy**: 4140, 4340
- **Tool Steel**: D2, O1, H13
- **Galvanized**: Hot-dipped, electro-galvanized
- **Weathering Steel**: Cor-Ten A, Cor-Ten B

**Updated Type Definition:**
```typescript
type SteelGrade = 
  | 'HMS 1' | 'HMS 2' | 'Shred Steel'
  | 'Structural' | 'Plate' | 'Sheet' | 'Rebar'
  | 'Galvanized' | 'Stainless 304' | 'Stainless 316'
  | 'Cast Steel' | 'Tool Steel';
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/inventory/components/ScrapMetalSpreadsheet.tsx` | Excel-like table component |
| `src/components/inventory/components/WeightEstimator.tsx` | Dimensional weight calculator |
| `src/components/inventory/components/LivePriceIndicator.tsx` | Price source badge/indicator |
| `src/components/inventory/hooks/useScrapMetalPricing.ts` | Hook to fetch/cache live prices |
| `supabase/functions/scrap-metal-pricing/index.ts` | Edge function for price API |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/inventory/types/demolition.types.ts` | Add expanded steel grades, weight estimation types |
| `src/components/inventory/components/InventoryAIResults.tsx` | Add spreadsheet view toggle for demolition mode |
| `src/components/inventory/components/DemolitionQuoteGenerator.tsx` | Integrate live pricing and spreadsheet data |
| `supabase/functions/inventory-ai-analyzer/index.ts` | Update AI prompt with more steel grades |

---

## Technical Implementation Details

### Live Pricing API Strategy

**Option 1: MetalPriceAPI (Recommended)**
- Provides copper, aluminum, steel, iron spot prices
- Free tier: 100 requests/month
- Prices are commodity-level (need to apply scrap discounts)

**Conversion Formula:**
```typescript
// Scrap prices are typically 60-85% of spot commodity price
const scrapMultipliers = {
  copper: { barebrigt: 0.85, number2: 0.75, insulated: 0.45 },
  aluminum: { clean: 0.70, cast: 0.55 },
  steel: { hms: 0.65, structural: 0.70 },
};

const scrapPrice = spotPrice * scrapMultipliers[metal][grade];
```

**Option 2: Static Regional Averages (Fallback)**
- Maintain a table of regional scrap prices updated weekly
- No API dependency
- User can manually override prices per workspace

### Weight Estimation Flow

```text
1. AI Visual Estimate
   ├── Low confidence → Prompt for dimensions
   ├── Medium confidence → Show both estimates
   └── High confidence → Use AI estimate

2. User Input Dimensions (optional)
   ├── Material type selected
   ├── Dimension fields shown
   └── Calculated weight displayed

3. Manual Override (always available)
   └── User enters exact weight
```

### Spreadsheet Component Architecture

```text
ScrapMetalSpreadsheet
├── SpreadsheetHeader (sortable columns)
├── SpreadsheetRow[] (editable cells)
│   ├── MetalTypeCell (dropdown)
│   ├── GradeCell (dropdown based on type)
│   ├── WeightCell (number input)
│   ├── PriceCell (auto-calculated, overridable)
│   └── ActionCell (edit, delete, calculator)
├── SpreadsheetFooter (totals, grand total)
└── QuoteControls (margin, labor, export)
```

---

## User Experience Flow

```text
1. User enables Demolition Mode and scans items
2. AI analyzes and returns scrap analysis data
3. Results shown in BOTH:
   - Card view (existing) for quick overview
   - Spreadsheet view (new) for detailed editing
4. User can toggle between views
5. In spreadsheet view:
   - Adjust weights using estimator
   - See live price indicators
   - Edit grades/types inline
   - View running totals
6. Generate quote from spreadsheet data
```

---

## Database Changes

No schema changes required. Existing columns in `inventory_items` already support:
- `metal_type`, `metal_grade`
- `estimated_weight`, `weight_unit`
- `scrap_price_per_unit`

---

## Summary of Enhancements

| Feature | Enhancement |
|---------|-------------|
| **Display** | Excel-like spreadsheet with sortable/editable columns |
| **Pricing** | Live API integration with fallback to cached/static |
| **Weight** | Dimensional calculator + AI estimate + manual override |
| **Steel Types** | Expanded from 2 to 12+ grades |
| **Export** | CSV/PDF export from spreadsheet |
| **Quotes** | Margin calculator integrated with spreadsheet |
