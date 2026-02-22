
# Add Over-Contract Credits and Effective Price for Fixed Price Mode

## What This Does

When you have a fixed contract price and the pool price spikes above your contracted rate, every hour you curtail during those spikes earns you a "credit" -- the difference between the pool price and your fixed rate. This plan adds tracking of those credits and shows a final "effective energy price" after subtracting all savings.

## Example
- Fixed contract: $52/MWh
- Pool price spikes to $200/MWh, you curtail for 1 hour at 25 MW
- Credit earned: ($200 - $52) x 25 = $3,700 for that hour
- This credit reduces your effective all-in energy cost

## Changes

### 1. Calculator Hook (`src/hooks/usePowerModelCalculator.ts`)

**Add `overContractCredit` field to `ShutdownRecord`:**
- For each curtailed hour in fixed-price mode: `max(0, poolPrice - fixedPriceCAD) * capacityMW`
- This captures the spread between what you would have paid at pool vs your contract rate

**Add `overContractCredits` to `MonthlyResult`:**
- Sum of all over-contract credits for curtailed hours in that month

**Add to `AnnualSummary`:**
- `totalOverContractCredits` -- annual sum of all credits
- `effectivePerKwhCAD` -- `(totalAmountDue - totalOverContractCredits) / totalKWh`
- `effectivePerKwhUSD` -- same converted to USD

### 2. Summary Cards (`src/components/aeso/PowerModelSummaryCards.tsx`)

**Update the All-in Rate card (fixed-price mode only):**
- Below the current all-in rate, add a line showing "After Credits: X.XX cents/kWh" in green
- Show the total over-contract credits in the stat ribbon as a new StatItem

**Add new stat ribbon item:**
- Icon: green dollar sign
- Label: "Over-Contract Credits"
- Value: total credits amount
- Sub: "X hours above $52/MWh"

### 3. Charge Breakdown (`src/components/aeso/PowerModelChargeBreakdown.tsx`)

**Add "Over-Contract Credit" column** (fixed-price mode only, next to existing Curtail Savings):
- Per-month credit amounts in green
- Annual total in footer

**Add "Effective Rate" row** to the All-in Rate Breakdown section:
- Shows the all-in rate minus credits per kWh
- Highlighted in green with a downward arrow indicator

### 4. No other files modified

The revenue analysis, AI analysis, PPA analyzer, and other components remain untouched. The new fields are additive -- nothing existing breaks.

## Technical Details

### New fields in `MonthlyResult`:
```
overContractCredits: number  // Sum of max(0, poolPrice - fixedPriceCAD) * cap for curtailed hours
```

### New fields in `AnnualSummary`:
```
totalOverContractCredits: number
effectivePerKwhCAD: number   // (totalAmountDue - totalOverContractCredits) / totalKWh
effectivePerKwhUSD: number
```

### Credit calculation per curtailed hour:
```
overContractCredit = max(0, poolPrice - fixedPriceCAD) * contractedCapacityMW
```

### Effective price calculation:
```
effectivePerKwhCAD = (totalAmountDue - totalOverContractCredits) / totalKWh
```

This only applies when `fixedPriceCAD > 0`. In floating mode, these fields are all zero and the UI elements are hidden.
