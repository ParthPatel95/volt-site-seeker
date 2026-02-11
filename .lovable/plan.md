

# Power Model Cost Analyzer - AESO Market Hub Feature

## Overview

Build a new "Power Model" tab in the AESO Market Hub that replicates the full Rate DTS cost calculation methodology from the uploaded Excel spreadsheet. This feature will model total energy costs for a 45MW facility using real AESO pool price data, complete Rate DTS tariff structures, 12CP curtailment strategy, and breakeven price logic.

## Data Verification: Rate DTS Tariff Rates

The uploaded spreadsheet uses rates from **AUC Decision 29606-D01-2024** (AESO ISO Tariff 2025). Here is the comparison with the current codebase and verification status:

### Rates in the Spreadsheet (to be implemented)

| Rate Component | Section | Spreadsheet Value | Current Codebase | Status |
|---|---|---|---|---|
| Coincident Metered Demand | (1)(a) | $10,927/MW/month | Not modeled | NEW - needs verification against 2026 tariff |
| Bulk System Energy | (1)(b) | $1.23/MWh | Not modeled | NEW |
| Regional Billing Capacity | (2)(a) | $2,945/MW/month | Not modeled | NEW |
| Regional Metered Energy | (2)(b) | $0.93/MWh | Not modeled | NEW |
| POD Substation | (3)(a) | $15,304/month | Not modeled | NEW |
| POD First 7.5 MW | (3)(b) | $5,037/MW/month | Not modeled | NEW |
| POD Next 9.5 MW | (3)(c) | $2,987/MW/month | Not modeled | NEW |
| POD Next 23 MW | (3)(d) | $2,000/MW/month | Not modeled | NEW |
| POD Remaining MW | (3)(e) | $1,231/MW/month | Not modeled | NEW |
| Operating Reserve | (4) | 12.44% of Pool Price | Not modeled | NEW |
| TCR | (5) | $0.265/MWh | Not modeled | NEW (variable, AESO monthly supplement) |
| Voltage Control | (6) | $0.07/MWh | Not modeled | NEW |
| System Support | (7) | $52/MW/month | Not modeled | NEW |
| Rider F (Balancing Pool) | Rider | $1.30/MWh | Not modeled | NEW |
| Retailer Fee | Fee | $0.25/MWh | Not modeled | NEW |
| FortisAlberta Demand Charge | Rate 65 | $7.52/kW/month | $7.52/kW/month | MATCHES |
| FortisAlberta Distribution | Rate 65 | 0.2704 cents/kWh | 0.2704 cents/kWh | MATCHES |
| GST | Tax | 5% | 5% | MATCHES |

### Key Insight
The current codebase uses a simplified 5-component model (energy, demand, distribution, transmission, riders). The spreadsheet reveals the actual Rate DTS has **15+ distinct charge components** with tiered POD structures, operating reserve as a percentage of pool price, and separate bulk/regional system charges. This is a significant upgrade in accuracy.

## Implementation Plan

### Step 1: Update Tariff Constants

**File: `src/constants/tariff-rates.ts`**

Add the complete Rate DTS 2025 tariff structure as a new constant block, preserving the existing simplified rates for backward compatibility:

```
AESO_RATE_DTS_2025 = {
  bulkSystem: { coincidentDemand: 10927, meteredEnergy: 1.23 },
  regionalSystem: { billingCapacity: 2945, meteredEnergy: 0.93 },
  pointOfDelivery: {
    substation: 15304,
    tiers: [
      { label: 'First 7.5 MW', rate: 5037, mw: 7.5 },
      { label: 'Next 9.5 MW', rate: 2987, mw: 9.5 },
      { label: 'Next 23 MW', rate: 2000, mw: 23 },
      { label: 'Remaining', rate: 1231, mw: Infinity },
    ]
  },
  operatingReserve: { ratePercent: 12.44 },
  tcr: { meteredEnergy: 0.265 },
  voltageControl: { meteredEnergy: 0.07 },
  systemSupport: { highestDemand: 52 },
  riderF: { meteredEnergy: 1.30 },
  retailerFee: { meteredEnergy: 0.25 },
  gst: 0.05,
  sourceDecision: 'AUC Decision 29606-D01-2024',
  effectiveDate: '2025-01-01',
}
```

### Step 2: Create Power Model Calculator Hook

**New file: `src/hooks/usePowerModelCalculator.ts`**

A client-side calculation engine that:
- Takes facility parameters (capacity MW, substation fraction, 12CP avoidance hours, breakeven price, hosting rate)
- Takes hourly pool price + AIL data (from uploaded spreadsheet or from `aeso_training_data` table)
- Applies the full Rate DTS cost methodology per the spreadsheet logic:
  - Ranks hours by AIL demand to identify 12CP curtailment windows
  - Flags hours exceeding breakeven pool price for economic curtailment
  - Calculates running vs curtailed hours
  - Computes all 15+ charge components per month
  - Produces monthly and annual summaries

### Step 3: Create Power Model Data Parser

**New file: `src/lib/power-model-parser.ts`**

Parse uploaded Excel/CSV files matching the spreadsheet format. Extract:
- Hourly rows: Date, HE, Pool Price, AIL, and calculated fields
- Input parameters from Page 1
- Monthly summary data

Also support generating the model from `aeso_training_data` database records when no file is uploaded.

### Step 4: Create Power Model UI Components

**New file: `src/components/aeso/PowerModelAnalyzer.tsx`**

Main component with sections:

1. **Input Parameters Panel** - Editable facility parameters matching spreadsheet Page 1:
   - Contracted Capacity (MW), Substation Fraction
   - 12CP Avoidance Window (hours/month)
   - Hosting Rate (USD/kWh), CAD/USD Exchange Rate
   - All Rate DTS charges (pre-filled from constants, editable)

2. **Data Source Selector** - Choose between:
   - Upload Excel/CSV (parse the power model spreadsheet)
   - Use live database (pull from `aeso_training_data` for a selected year)

3. **Monthly Cost Breakdown Table** - Replicating the spreadsheet "CHARGES" section:
   - Connection charges (Sections 1-3, 6-7)
   - Energy charges (Pool, Retailer Fee, Rider F, Operating Reserve)
   - Total before GST, GST, Total Amount Due
   - Per-kWh CAD and USD rates

4. **Annual Summary Dashboard** - Replicating Page 13:
   - Monthly cards showing Hours, Running Hours, Uptime %, MWh, kWh
   - DTS charges, Energy charges, Pre-GST, Total
   - Per-kWh rates in CAD and USD
   - Annual totals row

5. **Breakeven Analysis Panel**:
   - Shows marginal cost stack (excl pool)
   - Operating reserve multiplier
   - Calculated breakeven pool price
   - Hours above/below breakeven per month

6. **Curtailment Summary** - Per month:
   - Total hours, Running hours, Curtailed hours
   - 12CP window curtailments vs Price-based curtailments vs Overlap
   - Uptime percentage

7. **Rate Source Badges** - Each rate displays its source (AUC Decision number) with verification date

**New file: `src/components/aeso/PowerModelSummaryCards.tsx`**

Annual summary cards with key metrics:
- Total annual cost (CAD/USD)
- Average all-in rate (cents/kWh, $/MWh)
- Total MWh consumed
- Average uptime %
- Average pool price (running hours only)

**New file: `src/components/aeso/PowerModelChargeBreakdown.tsx`**

Detailed monthly charge breakdown table matching the spreadsheet's right-side panel format.

### Step 5: Add Navigation Tab

**File: `src/components/AESOMarketComprehensive.tsx`**

Add a new navigation item and tab content:
```
{ id: 'power-model', label: 'Power Model', icon: Calculator, priority: 3 }
```

Wire it to render `<PowerModelAnalyzer />` in the corresponding `TabsContent`.

### Step 6: Verify Rates Against AESO 2026 Tariff

The Rate DTS effective 2026-01-01 PDF is available from AESO. The implementation will:
- Default to 2025 rates from the spreadsheet (verified against AUC Decision 29606-D01-2024)
- Add a note indicating the 2026 Rate DTS may have updated values
- Allow all rates to be user-editable so they can input the latest tariff values
- Include a link to the AESO Rate DTS page for users to verify current rates

## Files to Create

| File | Purpose |
|---|---|
| `src/hooks/usePowerModelCalculator.ts` | Full Rate DTS cost calculation engine |
| `src/lib/power-model-parser.ts` | Excel/CSV parser for power model spreadsheets |
| `src/components/aeso/PowerModelAnalyzer.tsx` | Main Power Model tab UI |
| `src/components/aeso/PowerModelSummaryCards.tsx` | Annual summary dashboard cards |
| `src/components/aeso/PowerModelChargeBreakdown.tsx` | Monthly charge breakdown table |

## Files to Modify

| File | Changes |
|---|---|
| `src/constants/tariff-rates.ts` | Add complete Rate DTS 2025 tariff structure |
| `src/components/AESOMarketComprehensive.tsx` | Add Power Model navigation item and tab |

## Key Design Decisions

- **Client-side calculations**: All math runs in-browser using the same formulas as the spreadsheet. No edge function needed since the data is either uploaded or already in the database.
- **Spreadsheet parity**: The output tables will match the Excel format exactly so users can cross-verify totals.
- **Editable rates**: All tariff inputs are editable, allowing users to model different rate scenarios or update to newer tariff schedules.
- **Dual data source**: Supports both file upload (for the exact spreadsheet data) and database-driven modeling (for years with `aeso_training_data` coverage).

