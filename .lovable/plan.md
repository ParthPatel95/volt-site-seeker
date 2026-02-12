

# Add Fixed Price Contract & Curtailment Savings Calculator

## Overview

Add a "Fixed Price" input so users can set their contracted energy price. During curtailed hours, calculate savings as: **(Pool Price - Fixed Price) x MW** per curtailed hour. This shows how much money the facility saves (or could earn by selling back) when it shuts down during expensive hours.

## Changes

### 1. `src/hooks/usePowerModelCalculator.ts` -- Add fixed price to data model

- Add `fixedPriceCAD: number` to `FacilityParams` (default: 0, meaning disabled)
- Add `curtailmentSavings: number` to `MonthlyResult` (sum of per-hour savings for that month)
- Add `curtailmentSavings: number` to `AnnualSummary`
- Add `curtailmentSavings: number` to `ShutdownRecord` (per-hour: `(poolPrice - fixedPrice) * cap`)
- In the curtailment loop, for each curtailed hour where `poolPrice > fixedPriceCAD`, calculate savings: `(poolPrice - fixedPriceCAD) * cap`
- Accumulate monthly and annual totals
- When `fixedPriceCAD` is 0 or not set, savings default to 0 (feature is effectively off)

### 2. `src/components/aeso/PowerModelAnalyzer.tsx` -- Add Fixed Price input

- Add a new input field in the **Revenue Parameters** card: "Fixed Contract Price (CAD/MWh)"
- Default to 0 (disabled state)
- When set to a positive value, the savings calculation activates
- Add a small helper text: "Set your contracted energy rate to calculate curtailment savings"

### 3. `src/components/aeso/PowerModelSummaryCards.tsx` -- Show total savings

- Add a new summary card: "Curtailment Savings" showing the annual total savings from curtailed hours
- Only visible when fixed price is set (greater than 0)
- Show as a green/positive value with a dollar sign

### 4. `src/components/aeso/PowerModelChargeBreakdown.tsx` -- Show monthly savings

- Add a "Curtailment Savings" column to the monthly breakdown table
- Shows per-month savings from curtailed hours
- Highlight months with highest savings

### 5. `src/components/aeso/PowerModelShutdownLog.tsx` -- Show per-hour savings

- Add a "Savings" column to the shutdown log table showing `(poolPrice - fixedPrice) * MW` for each curtailed hour
- Only show column when fixed price is set

## Math Example

For a 45MW facility with a fixed price of CA$80/MWh:
- Hour curtailed at pool price $350/MWh: savings = ($350 - $80) x 45 = **$12,150**
- Hour curtailed at pool price $50/MWh: savings = ($50 - $80) x 45 = **-$1,350** (loss -- ran when it was cheaper than contract)
- Net savings = sum of all curtailed hours

## Technical Details

Key calculation in the curtailment loop:

```typescript
// For each curtailed hour:
const curtailmentSaving = (rec.poolPrice - params.fixedPriceCAD) * cap;
// Positive = saved money by not buying expensive power
// Negative = missed opportunity (pool was cheaper than contract)
```

The savings represent: "If we had a fixed-price contract at X $/MWh, how much do we save by curtailing during hours when pool price exceeds our contract price?"

## Files to Modify

1. `src/hooks/usePowerModelCalculator.ts` -- Core savings calculation
2. `src/components/aeso/PowerModelAnalyzer.tsx` -- Fixed price input
3. `src/components/aeso/PowerModelSummaryCards.tsx` -- Annual savings card
4. `src/components/aeso/PowerModelChargeBreakdown.tsx` -- Monthly savings column
5. `src/components/aeso/PowerModelShutdownLog.tsx` -- Per-hour savings column

