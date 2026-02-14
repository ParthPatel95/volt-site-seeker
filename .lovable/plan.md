

# Add Energy Pricing Mode Toggle and Per-kWh Charge Breakdown

## Overview

Replace the current "Fixed Contract Price" number input with an explicit **Fixed / Floating toggle**, and add a detailed per-kWh charge breakdown card so users can see exactly what sits on top of the base energy price.

## Changes

### 1. Add Pricing Mode Toggle (UI) -- `PowerModelAnalyzer.tsx`

Replace the current fixed price input (lines 204-208) with:
- A **radio group or select** with two options: "Floating (Pool Price)" and "Fixed Contract"
- When "Fixed Contract" is selected, show the price input field for entering the rate (e.g., $52/MWh)
- When "Floating" is selected, hide the price input and set `fixedPriceCAD` to 0
- Add a clear label/badge showing which mode is active (e.g., green "Floating" or blue "Fixed @ $52/MWh")

### 2. Fix Curtailment Sorting Bug -- `usePowerModelCalculator.ts`

**Current bug (lines 240-243):** In fixed-price mode, the sort compares `fixedPriceCAD` vs `fixedPriceCAD` for every hour -- they're all equal, so the sort is meaningless and curtails random hours.

**Fix:** When in fixed-price mode, sort remaining hours by **pool price descending**. This way the facility curtails during the highest pool-price hours. Even though the facility pays the fixed rate regardless, this is the correct optimization because:
- It avoids running during the most volatile/risky hours
- It provides meaningful reporting on pool exposure avoided

```typescript
const priceCandidates = [...runningAfter12CP].sort((a, b) => {
  return b.poolPrice - a.poolPrice; // Always sort by pool price
});
```

### 3. Add Per-kWh Charge Breakdown Card -- New `PowerModelChargeBreakdown.tsx`

Create a new component that displays each cost component as cents/kWh, calculated from the annual totals:

| Component | cents/kWh |
|-----------|-----------|
| Energy Price (Fixed or Avg Pool) | X.XX |
| Operating Reserve (12.5%) | X.XX |
| FortisAlberta Demand | X.XX |
| Regional Billing Capacity | X.XX |
| POD Charges (Substation + Tiered) | X.XX |
| Fortis Distribution | X.XX |
| Bulk Metered Energy | X.XX |
| Regional Metered Energy | X.XX |
| Rider F | X.XX |
| Retailer Fee | X.XX |
| Other (TCR + Voltage + System Support) | X.XX |
| GST (5%) | X.XX |
| **All-in Total** | **X.XX** |

Each row includes a proportional bar showing relative contribution. The energy line will show "Fixed Contract" or "Avg Pool" badge.

### 4. Expose Component-Level Totals in AnnualSummary -- `usePowerModelCalculator.ts`

Add these fields to `AnnualSummary` so the breakdown card can display them:
- `totalPoolEnergy`, `totalOperatingReserve`, `totalRetailerFee`, `totalRiderF`
- `totalBulkMeteredEnergy`, `totalRegionalBillingCapacity`, `totalRegionalMeteredEnergy`
- `totalPodCharges`, `totalFortisDemand`, `totalFortisDistribution`
- `totalTCR`, `totalVoltageControl`, `totalSystemSupport`

These are already computed per-month; just sum them into the annual object.

### 5. Update Summary Cards Sub-text -- `PowerModelSummaryCards.tsx`

Update the "All-in Rate" card to show: `Energy: X.XX cents + Adders: X.XX cents` so the split is immediately visible.

## Files to Modify

1. **`src/hooks/usePowerModelCalculator.ts`** -- Fix sort bug, add component totals to AnnualSummary
2. **`src/components/aeso/PowerModelAnalyzer.tsx`** -- Add Fixed/Floating toggle UI, integrate breakdown card
3. **`src/components/aeso/PowerModelChargeBreakdown.tsx`** -- New component for per-kWh waterfall breakdown
4. **`src/components/aeso/PowerModelSummaryCards.tsx`** -- Update All-in Rate sub-text

