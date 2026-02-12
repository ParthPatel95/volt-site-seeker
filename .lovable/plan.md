

# Reduce Effective Energy Cost by Optimizing Curtailment Priority

## Problem

At 95% uptime, the downtime budget is ~37 hours/month. 12CP avoidance consumes 35 of those hours, leaving only 2 hours for price-based curtailment. The facility runs through nearly all high-price hours, resulting in a 7c+/kWh blended cost.

## Root Cause (Not a Bug)

This is a budget allocation problem, not a calculation error. The current system gives 12CP absolute priority, which is correct for avoiding demand charges, but it means expensive energy hours (e.g., $200-500/MWh spikes) pass through uncurtailed.

## Solution: Smart Budget Allocation with Cost Optimization

### Change 1: Cost-Optimized Curtailment Mode (`usePowerModelCalculator.ts`)

Instead of giving 12CP blanket priority, compare the **dollar value** of each curtailment decision:

- A 12CP hour avoids ~$11,131/MW/month in demand charges (spread across 35 hours = ~$318/hour for 1MW, or ~$14,310/hour for 45MW)
- A $400/MWh price spike costs 45MW x $400 = $18,000/hour to run through

The optimizer should:
1. Score every candidate hour by its savings value (12CP savings OR price-above-breakeven savings)
2. Sort all candidates by value descending
3. Take the top N hours where N = downtime budget
4. This way, a $500/MWh spike beats a low-risk 12CP hour

Add a `curtailmentStrategy` parameter to `FacilityParams`:
- `'12cp-priority'` (current behavior, default)
- `'cost-optimized'` (new: picks whichever saves more money per hour)

### Change 2: Add Strategy Selector to UI (`PowerModelAnalyzer.tsx`)

Add a toggle/select next to the uptime slider:
- "12CP Priority" -- always avoid peaks first (safer for demand charges)
- "Cost Optimized" -- maximize total savings (may skip some low-risk 12CP hours to avoid expensive energy hours)

Include a tooltip explaining the tradeoff.

### Change 3: Show Budget Allocation Transparency (`PowerModelChargeBreakdown.tsx`)

Add a "Downtime Budget" summary card showing:
- Total budget: 37 hours
- Used by 12CP: 35 hours
- Used by Price: 2 hours
- Potential savings missed: sum of (price - breakeven) for all high-price hours NOT curtailed

This makes it immediately clear why costs are high and what the tradeoff is.

### Change 4: Sensitivity Preview

Add a small table showing estimated per-kWh cost at different uptime levels:
| Uptime | Price Hours Cut | Est. per kWh |
|--------|----------------|-------------|
| 95%    | 2              | 7.2c        |
| 90%    | ~38            | 5.8c        |
| 85%    | ~75            | 4.9c        |

This helps the user make an informed decision about the uptime-vs-cost tradeoff.

## Technical Details

### `usePowerModelCalculator.ts` Changes

Add `curtailmentStrategy` to `FacilityParams` interface (default: `'12cp-priority'`).

For `'cost-optimized'` mode, replace the two-step curtailment with a unified scoring approach:

```typescript
// Score every hour for potential curtailment
const candidates = records.map(rec => {
  const is12CP = top12CPSet.has(`${rec.date}-${rec.he}`);
  const isExpensive = rec.poolPrice > breakeven;
  
  // 12CP value: monthly demand charge / avoidance hours
  const twelveCPValue = is12CP ? (bulkCoincidentRate * cap / params.twelveCP_AvoidanceHours) : 0;
  // Price value: cost of running minus breakeven
  const priceValue = isExpensive ? (rec.poolPrice - breakeven) * cap : 0;
  
  return { rec, value: Math.max(twelveCPValue, priceValue), is12CP, isExpensive };
})
.filter(c => c.value > 0)
.sort((a, b) => b.value - a.value);

// Take top N by value
const curtailCount = Math.min(candidates.length, maxDowntimeHours);
const curtailed = candidates.slice(0, curtailCount);
```

### `PowerModelAnalyzer.tsx` Changes

- Add a `Select` dropdown for curtailment strategy below the uptime slider
- Pass strategy to the calculator hook

### `PowerModelChargeBreakdown.tsx` Changes

- Add "Downtime Budget Allocation" card with visual bar showing 12CP vs Price split
- Add "Missed Savings" metric showing cost of high-price hours the facility ran through
- Add uptime sensitivity mini-table

## Files to Modify

1. `src/hooks/usePowerModelCalculator.ts` -- Add cost-optimized curtailment mode
2. `src/components/aeso/PowerModelAnalyzer.tsx` -- Add strategy selector UI
3. `src/components/aeso/PowerModelChargeBreakdown.tsx` -- Add budget transparency and sensitivity preview

