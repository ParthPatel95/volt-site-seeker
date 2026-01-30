

# Plan: Expand Metal Ticker with Steel, Zinc, and More Metals

## Overview

Expand the Live Metal Prices ticker to showcase all valuable metals available from the Metals-API, including steel variants, zinc, tin, lead, brass, bronze, and other specialty metals. The ticker will be reorganized into more granular categories for better user understanding.

---

## Available Metals from API

Based on the Metals-API symbols list, here are the metals we can add:

| Symbol | Metal | Unit | Category | Notes |
|--------|-------|------|----------|-------|
| **New - Steel/Scrap** |
| `STEEL-HR` | Steel HRC (Hot Rolled Coil) | Per Troy Ounce | Steel | LME FOB China |
| `STEEL-RE` | Steel Rebar | Per Troy Ounce | Steel | LME FOB Turkey |
| `STEEL-SC` | Steel Scrap | Per Troy Ounce | Steel | LME CFR Turkey |
| **New - Base Metals** |
| `ZNC` | Zinc | Per Troy Ounce | Industrial | GLOBAL |
| `TIN` | Tin | Per Ounce | Industrial | GLOBAL |
| `LEAD` | Lead | Per Ounce | Industrial | GLOBAL |
| **New - Alloys** |
| `BRASS` | Brass | Per Troy Ounce | Alloy | Copper-Zinc alloy |
| `BRONZE` | Bronze | Per Troy Ounce | Alloy | Copper-Tin alloy |
| **New - Specialty** |
| `TITANIUM` | Titanium | Per Ounce | Specialty | High-value |
| `MG` | Magnesium | Per Troy Ounce | Specialty | Light metal |
| `TUNGSTEN` | Tungsten | Per Troy Ounce | Specialty | Heavy metal |
| `LCO` | Cobalt | Per Troy Ounce | Battery | EV batteries |
| `LITHIUM` | Lithium | Per Ounce | Battery | EV batteries |
| **Existing - Precious** |
| `XAU` | Gold | Per Troy Ounce | Precious | Active |
| `XAG` | Silver | Per Ounce | Precious | Active |
| `XPT` | Platinum | Per Ounce | Precious | Active |
| `XPD` | Palladium | Per Ounce | Precious | Active |
| **Existing - Industrial** |
| `XCU` | Copper | Per Ounce | Industrial | Active |
| `ALU` | Aluminum | Per Troy Ounce | Industrial | Active |
| `NI` | Nickel | Per Ounce | Industrial | Active |
| `IRON` | Iron Ore | Per Ounce | Industrial | Active |

---

## New Category Structure

Reorganize the ticker into 5 clear categories:

```text
+------------------------------------------------------------------------+
| LIVE METAL PRICES                                    [Live] [Refresh]  |
+------------------------------------------------------------------------+
| Precious  | Gold    Silver   Platinum  Palladium                       |
|           | $2,347  $27.45   $967      $1,012                          |
+------------------------------------------------------------------------+
| Steel     | HRC      Rebar    Scrap                                    |
|           | $0.18    $0.16    $0.12                                    |
+------------------------------------------------------------------------+
| Industrial| Copper   Aluminum  Zinc     Tin      Lead    Nickel  Iron  |
|           | $4.52    $1.15     $1.25    $14.50   $0.95   $8.00   $0.06 |
+------------------------------------------------------------------------+
| Alloys    | Brass    Bronze                                            |
|           | $2.40    $2.20                                             |
+------------------------------------------------------------------------+
| Specialty | Titanium  Tungsten  Magnesium  Cobalt   Lithium            |
|           | $12.00    $18.50    $1.80      $15.00   $8.50              |
+------------------------------------------------------------------------+
```

---

## Files to Modify

### 1. Edge Function: `supabase/functions/scrap-metal-pricing/index.ts`

Update the `get-all-metals` action to fetch all new symbols:

```typescript
// New symbol groups
const PRECIOUS_SYMBOLS = 'XAU,XAG,XPT,XPD';
const STEEL_SYMBOLS = 'STEEL-HR,STEEL-RE,STEEL-SC';
const INDUSTRIAL_SYMBOLS = 'XCU,ALU,ZNC,TIN,LEAD,NI,IRON';
const ALLOY_SYMBOLS = 'BRASS,BRONZE';
const SPECIALTY_SYMBOLS = 'TITANIUM,MG,TUNGSTEN,LCO,LITHIUM';
```

Add proper unit conversions for each metal type.

### 2. Hook: `src/components/inventory/hooks/useAllMetalPrices.ts`

Expand the `METAL_CONFIGS` array with new metals and categories:

```typescript
type MetalCategory = 'precious' | 'steel' | 'industrial' | 'alloy' | 'specialty';

const METAL_CONFIGS = [
  // Precious (existing)
  { symbol: 'XAU', name: 'Gold', shortName: 'Gold', key: 'gold', unit: 'oz', category: 'precious' },
  // ... existing precious
  
  // Steel (NEW)
  { symbol: 'STEEL-HR', name: 'Steel HRC', shortName: 'HRC', key: 'steelHrc', unit: 'oz', category: 'steel' },
  { symbol: 'STEEL-RE', name: 'Steel Rebar', shortName: 'Rebar', key: 'steelRebar', unit: 'oz', category: 'steel' },
  { symbol: 'STEEL-SC', name: 'Steel Scrap', shortName: 'Scrap', key: 'steelScrap', unit: 'oz', category: 'steel' },
  
  // Industrial (expanded)
  { symbol: 'ZNC', name: 'Zinc', shortName: 'Zinc', key: 'zinc', unit: 'oz', category: 'industrial' },
  { symbol: 'TIN', name: 'Tin', shortName: 'Tin', key: 'tin', unit: 'oz', category: 'industrial' },
  { symbol: 'LEAD', name: 'Lead', shortName: 'Lead', key: 'lead', unit: 'oz', category: 'industrial' },
  
  // Alloys (NEW)
  { symbol: 'BRASS', name: 'Brass', shortName: 'Brass', key: 'brass', unit: 'oz', category: 'alloy' },
  { symbol: 'BRONZE', name: 'Bronze', shortName: 'Bronze', key: 'bronze', unit: 'oz', category: 'alloy' },
  
  // Specialty (NEW)
  { symbol: 'TITANIUM', name: 'Titanium', shortName: 'Titanium', key: 'titanium', unit: 'oz', category: 'specialty' },
  { symbol: 'TUNGSTEN', name: 'Tungsten', shortName: 'Tungsten', key: 'tungsten', unit: 'oz', category: 'specialty' },
  { symbol: 'LCO', name: 'Cobalt', shortName: 'Cobalt', key: 'cobalt', unit: 'oz', category: 'specialty' },
  { symbol: 'LITHIUM', name: 'Lithium', shortName: 'Lithium', key: 'lithium', unit: 'oz', category: 'specialty' },
];
```

### 3. Component: `src/components/inventory/components/MetalsMarketTicker.tsx`

Update to support 5 categories with proper styling:

```typescript
type MetalCategory = 'precious' | 'steel' | 'industrial' | 'alloy' | 'specialty';

const CATEGORY_CONFIG = {
  precious: { 
    icon: '✨', 
    label: 'Precious', 
    gradient: 'from-amber-500/20 to-amber-500/5' 
  },
  steel: { 
    icon: '🏗️', 
    label: 'Steel', 
    gradient: 'from-slate-600/20 to-slate-600/5' 
  },
  industrial: { 
    icon: '⚙️', 
    label: 'Industrial', 
    gradient: 'from-slate-500/20 to-slate-500/5' 
  },
  alloy: { 
    icon: '🔗', 
    label: 'Alloys', 
    gradient: 'from-orange-500/20 to-orange-500/5' 
  },
  specialty: { 
    icon: '💎', 
    label: 'Specialty', 
    gradient: 'from-purple-500/20 to-purple-500/5' 
  },
};
```

---

## Default Fallback Prices

Add realistic default prices for new metals (used when API unavailable):

| Metal | Default Price | Unit |
|-------|---------------|------|
| Steel HRC | $0.018 | /oz |
| Steel Rebar | $0.016 | /oz |
| Steel Scrap | $0.012 | /oz |
| Zinc | $0.095 | /oz |
| Tin | $0.95 | /oz |
| Lead | $0.068 | /oz |
| Brass | $0.16 | /oz |
| Bronze | $0.15 | /oz |
| Titanium | $0.38 | /oz |
| Tungsten | $1.20 | /oz |
| Magnesium | $0.12 | /oz |
| Cobalt | $1.05 | /oz |
| Lithium | $0.55 | /oz |

---

## API Call Budget Impact

Since we're just adding more symbols to existing API calls:
- **Before**: 1 call for precious + 1 call for industrial = 2 calls
- **After**: 5 calls (one per category) = 5 calls per refresh

But with 24-hour caching, this stays well within the 2,500/month limit:
- 5 calls/day x 30 days = 150 calls/month for ticker alone
- Plus existing market intelligence = ~210 calls
- **Total**: ~360 calls/month (14% of limit)

---

## Implementation Steps

1. **Update Edge Function**
   - Add new symbol constants
   - Create separate fetch calls for each category (API may limit symbols per request)
   - Add proper unit conversions for steel/specialty metals
   - Update default prices object

2. **Update Hook**
   - Expand `METAL_CONFIGS` with all new metals
   - Update `SpotPrices` interface
   - Add new `MetalCategory` type

3. **Update Ticker Component**
   - Add new category configurations
   - Update category styling/icons
   - Ensure horizontal scroll works for all categories

4. **Update MarketIntelligence Hook**
   - Add symbol mappings for new metals in trend/volatility detection

---

## Visual Preview

```text
+------------------------------------------------------------------------+
| Live Metal Prices                           [Live] Updated 2m ago [↻]  |
+------------------------------------------------------------------------+

✨ PRECIOUS
+--------+--------+----------+-----------+
| Gold   | Silver | Platinum | Palladium |
| $2,347 | $27.45 | $967     | $1,012    |
| +0.8%  | -1.2%  | +0.3%    | -2.1%     |
+--------+--------+----------+-----------+

🏗️ STEEL  
+----------+--------+--------+
| HRC      | Rebar  | Scrap  |
| $580/ton | $520   | $380   |
| +1.2%    | -0.5%  | +0.8%  |
+----------+--------+--------+

⚙️ INDUSTRIAL
+--------+----------+------+------+------+--------+------+
| Copper | Aluminum | Zinc | Tin  | Lead | Nickel | Iron |
| $4.52  | $1.15    | $1.25| $14  | $0.95| $8.00  | $0.06|
+--------+----------+------+------+------+--------+------+

🔗 ALLOYS
+--------+--------+
| Brass  | Bronze |
| $2.40  | $2.20  |
+--------+--------+

💎 SPECIALTY
+----------+----------+------+--------+
| Titanium | Tungsten | MG   | Cobalt |
| $12.00   | $18.50   | $1.80| $15.00 |
+----------+----------+------+--------+
```

---

## Summary

| Change | Impact |
|--------|--------|
| Add 13 new metals | Comprehensive market coverage |
| 5 category groups | Better organization |
| Steel prices visible | Key for demolition/scrap valuation |
| Alloy tracking | Brass/Bronze for mixed metals |
| Specialty metals | High-value recovery opportunities |
| API calls | +3 calls/day (still well under budget) |

