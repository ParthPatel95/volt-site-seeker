

# Enhanced Power Model: Editable Variables, AI Analysis, and Full Assumptions

## Overview

Transform the Power Model from a partially-editable calculator into a fully transparent, investor-grade financial tool where every variable can be adjusted, every assumption is documented, and AI provides actionable cost optimization insights.

## Current State

The Power Model currently has:
- **5 editable parameters**: Contracted Capacity, Substation Fraction, 12CP Avoidance Hours, Hosting Rate, Exchange Rate
- **15+ tariff rates hardcoded** in `tariff-rates.ts` (not user-editable)
- **No AI analysis** of costs or optimization recommendations
- **No explicit assumptions section** explaining the model's basis
- Charts, revenue analysis, sensitivity, and data sources tabs exist

## What's Changing

### 1. Make ALL Variables Editable

Expand the input panel from 5 fields to a comprehensive editable form organized into collapsible sections:

**Facility Parameters** (existing, keep):
- Contracted Capacity (MW)
- Substation Fraction
- 12CP Avoidance Window (hrs/month)

**Revenue Parameters** (existing, keep):
- Hosting Rate (USD/kWh)
- CAD/USD Exchange Rate

**AESO Rate DTS Charges** (NEW -- currently hardcoded):
- Bulk System Coincident Demand ($/MW/month) -- default: $11,164
- Bulk Metered Energy ($/MWh) -- default: $1.23
- Regional Billing Capacity ($/MW/month) -- default: $2,945
- Regional Metered Energy ($/MWh) -- default: $0.93
- POD Substation ($/month) -- default: $15,304
- POD Tier 1-4 rates (editable per tier)
- Operating Reserve (%) -- default: 12.44%
- TCR ($/MWh) -- default: $0.265
- Voltage Control ($/MWh) -- default: $0.07
- System Support ($/MW/month) -- default: $52
- Rider F ($/MWh) -- default: $1.30
- Retailer Fee ($/MWh) -- default: $0.25
- GST (%) -- default: 5%

**FortisAlberta Rate 65** (NEW -- currently hardcoded):
- Demand Charge ($/kW/month) -- default: $7.52
- Volumetric Delivery (cents/kWh) -- default: 0.2704

Each field will have a "Reset to Default" option and show the source badge (Verified/Estimate) inline.

### 2. AI Cost Analysis Section (NEW)

Add a new "AI Analysis" tab that calls the Lovable AI gateway (via a new or existing edge function) to provide:

- **Current Cost Summary**: Plain-language explanation of where money is going
- **Optimization Recommendations**: Specific, actionable ways to reduce costs (e.g., "Increasing 12CP avoidance from 35 to 50 hours/month could save $X/year based on current demand patterns")
- **Risk Assessment**: What happens if pool prices spike, exchange rate moves, or demand patterns shift
- **Comparison Context**: How the all-in rate compares to typical Alberta industrial rates

The AI will receive the full calculated results (monthly breakdown, annual summary, all parameters, breakeven price) as context, ensuring recommendations are grounded in the actual numbers -- no mock data.

### 3. Assumptions Panel (NEW)

A dedicated collapsible card that lists every assumption in the model:

- Tariff source and effective dates (AUC Decision 29606-D01-2024)
- What "12CP avoidance" means and how it zeroes out coincident demand charges
- Operating Reserve and TCR are estimates (actual rates vary monthly)
- Pool price data source (aeso_training_data, 33,635+ records)
- Breakeven calculation methodology
- Linear scaling assumptions in sensitivity analysis
- GST rate assumption
- Exchange rate is user-input, not live
- Each assumption tagged as "Verified", "Estimate", or "User Input"

## Technical Plan

### Files to Create

| File | Purpose |
|---|---|
| `src/components/aeso/PowerModelEditableRates.tsx` | Collapsible form for all AESO + Fortis tariff rates with reset-to-default buttons |
| `src/components/aeso/PowerModelAIAnalysis.tsx` | AI analysis tab: sends model output to edge function, displays streaming response with cost insights and optimization recommendations |
| `src/components/aeso/PowerModelAssumptions.tsx` | Assumptions panel listing every model input, its source, status (Verified/Estimate/User Input), and effective date |

### Files to Modify

| File | Change |
|---|---|
| `src/hooks/usePowerModelCalculator.ts` | Expand `FacilityParams` to include all tariff rates as optional overrides (fallback to defaults from `tariff-rates.ts`). Calculator reads from params instead of importing constants directly. |
| `src/components/aeso/PowerModelAnalyzer.tsx` | Add state for tariff overrides, wire up `PowerModelEditableRates`, add "AI Analysis" and "Assumptions" tabs, pass expanded params to calculator |
| `src/constants/tariff-rates.ts` | No changes needed -- remains the source of truth for defaults |
| `supabase/functions/dashboard-ai-assistant/index.ts` | Add a `power-model-analysis` action branch that accepts model results and returns structured cost analysis and optimization recommendations using the Lovable AI gateway |

### Architecture

The calculator hook (`usePowerModelCalculator`) will accept an expanded params object:

```text
FacilityParams (existing 5 fields)
  +
TariffOverrides (new, all optional)
  - bulkCoincidentDemand?: number
  - bulkMeteredEnergy?: number
  - regionalBillingCapacity?: number
  - regionalMeteredEnergy?: number
  - podSubstation?: number
  - podTiers?: { rate: number; mw: number }[]
  - operatingReservePercent?: number
  - tcrMeteredEnergy?: number
  - voltageControlMeteredEnergy?: number
  - systemSupportHighestDemand?: number
  - riderFMeteredEnergy?: number
  - retailerFeeMeteredEnergy?: number
  - gstRate?: number
  - fortisDemandChargeKwMonth?: number
  - fortisVolumetricCentsKwh?: number
```

When an override is provided, the calculator uses it. When not provided, it falls back to the constant from `tariff-rates.ts`. This preserves backward compatibility and ensures defaults are always sourced from verified tariff documents.

### AI Analysis Flow

1. User clicks "Generate AI Analysis" button
2. Frontend sends the full `annual` summary, `monthly` breakdown, `params` (including any overrides), and `breakeven` to the `dashboard-ai-assistant` edge function with action type `power-model-analysis`
3. Edge function constructs a detailed system prompt with all the numbers and calls Lovable AI (google/gemini-3-flash-preview)
4. Response streams back with sections: Cost Summary, Top 3 Optimization Opportunities, Risk Factors, Rate Comparison
5. Displayed in a formatted card with markdown rendering

### Data Integrity

- All default values come from verified `tariff-rates.ts` constants (AUC Decision 29606-D01-2024, FortisAlberta July 2025)
- Pool price data comes from `aeso_training_data` (33,635+ verified records)
- "Estimate" badges remain on Operating Reserve (12.44%) and TCR ($0.265/MWh)
- AI analysis explicitly states it is based on the user's input parameters and historical data, not predictions
- No mock/synthetic data anywhere in the pipeline

