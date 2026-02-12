

# Fix Uptime Floor Enforcement in Power Model Calculator

## Problem

The target uptime (e.g., 95%) is treated as a **ceiling** (maximum), not a **floor** (minimum). The current 3-pass algorithm:

1. Pass 1: Removes ALL 35 12CP avoidance hours per month (~4.8% of 730 hours)
2. Pass 2: Removes ALL hours where pool price exceeds breakeven (often 50-80+ hours)
3. Pass 3: Only removes MORE hours if running hours still exceed the 95% cap

Since Pass 1 + Pass 2 already remove ~12% of hours, Pass 3 never activates (uptime is already below 95%). The result: ~88% annual uptime despite a 95% target.

## Solution: Budget-Based Curtailment

Replace the 3-pass system with a **total downtime budget** approach where 12CP gets priority and price curtailment fills the remainder:

```text
Monthly downtime budget = totalHours x (1 - targetUptime / 100)
Example: 730 hours x 5% = 36.5 hours max downtime

Step 1: Allocate 12CP hours (priority)
  - If 12CP hours (35) <= budget (36): use all 35, remaining budget = 1
  - If 12CP hours > budget: cap 12CP to budget, remaining = 0

Step 2: Fill remaining budget with price curtailment
  - Sort non-12CP hours by price descending
  - Curtail only the top N hours where N = remaining budget
  - Hours below breakeven but within budget are NOT curtailed

Step 3: No "UptimeCap" pass needed -- budget is already enforced
```

This guarantees monthly uptime never drops below the target (within rounding).

## File Changes

### 1. `src/hooks/usePowerModelCalculator.ts` (core fix)

Rewrite the curtailment logic inside the monthly loop (lines 182-234):

- Calculate `maxDowntimeHours = Math.floor(totalHours * (1 - targetUptime / 100))`
- Pass 1 (12CP): Take top demand hours, but cap at `maxDowntimeHours`
- Pass 2 (Price): From remaining running hours, sort by price descending, curtail only up to `remainingBudget = maxDowntimeHours - 12cpCurtailed`
- Remove Pass 3 entirely (no longer needed)
- Keep the overlap tracking: if a 12CP hour is also above breakeven, label as '12CP+Price' but count against 12CP budget
- `curtailedUptimeCap` will always be 0 now (budget prevents overrun)

### 2. `src/components/aeso/PowerModelChargeBreakdown.tsx` (UI update)

- Change the explanation banner text from "maximum ceiling" to "guaranteed minimum"
- Update tooltip copy: uptime target is now enforced as a floor, not a ceiling
- Keep color-coded badges (they still make sense for at-target vs slightly-above)
- Update Curtailment Analysis tooltip to explain budget-based approach

### 3. `src/constants/tariff-rates.ts` (optional tuning)

- No changes to rates needed
- The `twelveCP_AvoidanceHours: 35` default is fine -- it fits within a 5% budget (36.5 hours for a 730-hour month)
- For months with fewer hours (e.g., February at 672 hours), the budget is 33.6 hours, so 12CP will be auto-capped to 33

## Math Verification

With the fix applied, for a 95% uptime target:

| Month | Total Hours | Max Downtime | 12CP Budget | Price Budget | Guaranteed Uptime |
|-------|-------------|-------------|-------------|-------------|-------------------|
| Jan   | 744         | 37          | 35          | 2           | 95.0%             |
| Feb   | 672         | 33          | 33 (capped) | 0           | 95.1%             |
| Mar   | 743         | 37          | 35          | 2           | 95.0%             |
| Apr   | 720         | 36          | 35          | 1           | 95.0%             |
| Jul   | 744         | 37          | 35          | 2           | 95.0%             |
| Nov   | 721         | 36          | 35          | 1           | 95.0%             |

Annual average: ~95.0% (vs current ~88%)

## Technical Details

The key code change in the monthly loop:

```typescript
// NEW: Budget-based curtailment
const totalHours = records.length;
const maxDowntimeHours = Math.floor(totalHours * (1 - targetUptime / 100));
let budgetRemaining = maxDowntimeHours;

// Step 1: 12CP (priority) - cap to budget
const sorted12CP = [...records].sort((a, b) => b.ailMW - a.ailMW);
const twelveCP_limit = Math.min(params.twelveCP_AvoidanceHours, budgetRemaining);
const top12CPHours = new Set(
  sorted12CP.slice(0, twelveCP_limit).map(r => `${r.date}-${r.he}`)
);

// ... process 12CP curtailments, decrement budgetRemaining

// Step 2: Price curtailment with remaining budget
const candidatesForPrice = runningAfterPass1
  .filter(r => r.poolPrice > breakeven)
  .sort((a, b) => b.poolPrice - a.poolPrice);
const priceCurtailCount = Math.min(candidatesForPrice.length, budgetRemaining);

// ... curtail only priceCurtailCount hours
```

No changes needed to the annual summary calculation -- it already averages monthly uptimes correctly. With each month now at ~95%, the annual will also show ~95%.

