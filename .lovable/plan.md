
# Restructure Cost Progression: Scenario-Based Rate Comparison

## Problem

Two issues with the current Cost Progression table:

1. **Missing 12CP Demand Charge**: Line 341 in the calculator hardcodes `bulkCoincidentDemand = 0`, meaning the $11,131/MW/month 12CP charge is never shown. For 45MW, that is **$6.01M/year** or ~1.61 cents/kWh that is invisible. The current table shows the "optimized" rate as if 12CP avoidance already happened, without showing what it would cost WITHOUT it.

2. **Wrong framing**: The table currently stacks cost components (Energy, +OR, +Transmission...). The user wants a **scenario comparison**: "here is your all-in price with no optimization, then with 12CP avoidance, then with OR, etc." -- showing how each program REDUCES the effective rate.

## Verified Rate 65 Numbers (from tariff-rates.ts constants)

All numbers come from `AESO_RATE_DTS_2026` and `FORTISALBERTA_RATE_65_2026`:

| Component | Rate | Source |
|-----------|------|--------|
| Bulk Coincident Demand (12CP) | $11,131/MW/month | AUC Decision 30427-D01-2025 |
| Bulk Metered Energy | $1.23/MWh | AESO Rate DTS 2026 |
| Regional Billing Capacity | $2,936/MW/month | AESO Rate DTS 2026 |
| Regional Metered Energy | $0.93/MWh | AESO Rate DTS 2026 |
| POD Substation | $15,258/month | AESO Rate DTS 2026 |
| POD Tiers | $5,022-$1,227/MW/month (tiered) | AESO Rate DTS 2026 |
| Operating Reserve | 12.50% of pool price | AESO Rate DTS 2026 |
| TCR | $0.265/MWh | AESO Rate DTS 2026 |
| Voltage Control | $0.07/MWh | AESO Rate DTS 2026 |
| System Support | $52/MW/month | AESO Rate DTS 2026 |
| Rider F | $1.26/MWh | AESO Rate DTS 2026 |
| Retailer Fee | $0.25/MWh | AESO Rate DTS 2026 |
| Fortis Demand | $7.52/kW/month | FortisAlberta Rate 65 (July 2025) |
| Fortis Distribution | 0.2704 cents/kWh | FortisAlberta Rate 65 (July 2025) |
| GST | 5% | Federal |

## New Design: Scenario-Based Rate Table

Replace the cumulative buildup with a **scenario comparison** showing how each program reduces the rate:

```
| Scenario                          | cents/kWh (CAD) | cents/kWh (USD) | Annual (CAD)  | Annual (USD)  | Savings   |
|----------------------------------|-----------------|-----------------|---------------|---------------|-----------|
| Base All-in Rate (no optimization) | 7.40           | 5.43            | CA$30.0M      | US$22.0M      | --        |
| With 12CP Avoidance              | 5.79           | 4.25            | CA$23.5M      | US$17.2M      | -CA$6.5M  |
| With Price Curtailment           | 7.20           | 5.28            | CA$29.2M      | US$21.4M      | -CA$0.8M  |
| With 12CP + Price Curtailment    | 5.59           | 4.10            | CA$22.7M      | US$16.6M      | -CA$7.3M  |
```

Each row is a complete all-in rate under that scenario, not a stacked component.

## Changes

### 1. Update Calculator (`usePowerModelCalculator.ts`)

Add a `totalBulkCoincidentDemand` field to `AnnualSummary` that shows what the 12CP demand charge WOULD be if NOT avoided:

```typescript
// Calculate the FULL 12CP charge (what you'd pay without avoidance)
const fullBulkCoincidentDemand = cap * bulkCoincidentRate;
```

This gets summed into annual totals so the progression component can compute the "base rate" scenario. Currently line 341 sets `bulkCoincidentDemand = 0` -- we keep that for the actual cost calculation (since the model assumes avoidance) but expose the full charge amount for comparison.

### 2. Restructure `PowerModelCostProgression.tsx`

Replace the cumulative buildup table with scenario rows:

- **Row 1 - "Base Rate (No Optimization)"**: Current all-in rate + full 12CP demand charge (the charge that would apply without avoidance). This is the "worst case" -- what you'd pay with no curtailment programs.
- **Row 2 - "With 12CP Avoidance"**: Current all-in rate without the 12CP charge but before price curtailment savings. Shows the impact of participating in the 12CP program.
- **Row 3 - "With Price Curtailment"**: Base rate minus price curtailment savings (but including 12CP charge). Shows the impact of price-based shutdowns alone.
- **Row 4 - "With 12CP + Price Curtailment"**: The fully optimized rate. This is the current `totalAmountDue`.

Each row shows: cents/kWh (CAD), cents/kWh (USD), Annual (CAD), Annual (USD), and a Savings column showing the delta from the base rate.

### 3. Keep the Existing Per-kWh Breakdown (`PowerModelChargeBreakdown.tsx`)

The granular per-kWh breakdown (Energy, OR, Fortis Demand, etc.) stays as-is below the scenario table -- it shows WHERE the money goes. The new scenario table shows HOW optimization reduces the total.

### 4. Update AnnualSummary Type

Add these fields:
- `totalBulkCoincidentDemandFull`: The full 12CP charge that would apply without avoidance ($11,131/MW/month * capacity)
- `totalPriceCurtailmentSavings`: The energy cost avoided by price-based shutdowns

## Files to Modify

1. **`src/hooks/usePowerModelCalculator.ts`** -- Add `totalBulkCoincidentDemandFull` and `totalPriceCurtailmentSavings` to AnnualSummary; calculate full 12CP charge per month
2. **`src/components/aeso/PowerModelCostProgression.tsx`** -- Replace cumulative buildup with scenario comparison table showing Base, With 12CP, With Price Curtailment, With Both
