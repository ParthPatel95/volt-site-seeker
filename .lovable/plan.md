
# Add Target Uptime Control with Shutdown Hour Analytics

## What's Changing

Currently, the Power Model's uptime is a **byproduct** of 12CP avoidance and economic curtailment (price > breakeven). There is no way to set a target uptime like 95%. This enhancement adds:

1. **Target Uptime % input** (default 95%) -- enforces a maximum uptime by curtailing additional high-price hours if the natural uptime exceeds the target
2. **Shutdown Hours Log** -- a detailed, sortable table of every curtailed hour showing date, time, pool price, AIL demand, and the reason for shutdown (12CP / Price / Uptime Cap)
3. **Shutdown Analytics Dashboard** -- new visualizations showing shutdown patterns (by hour of day, by month, by reason, savings from shutdowns)

## How Uptime Enforcement Works

After the existing 12CP and price-based curtailment, if the remaining running hours still exceed the target uptime %, the model removes additional hours starting with the **most expensive** remaining hours until the target is reached. This maximizes cost savings from downtime.

```text
For each month:
  1. Remove 12CP avoidance hours (top AIL demand hours)
  2. Remove price curtailment hours (pool price > breakeven)
  3. Calculate current uptime %
  4. If uptime % > target:
       Sort remaining running hours by price (descending)
       Remove highest-price hours until uptime <= target
       Tag these as "Uptime Cap" curtailment
```

## Files to Create

| File | Purpose |
|---|---|
| `src/components/aeso/PowerModelShutdownLog.tsx` | Detailed table of every curtailed hour with date, HE, pool price, AIL, reason (12CP / Price / Uptime Cap), and cost avoided. Includes search/filter, export, and summary stats. |
| `src/components/aeso/PowerModelShutdownAnalytics.tsx` | Visual analytics: shutdown hours by time-of-day heatmap, monthly shutdown breakdown by reason, cumulative savings chart, and price distribution of shutdown vs. running hours. |

## Files to Modify

| File | Change |
|---|---|
| `src/hooks/usePowerModelCalculator.ts` | Add `targetUptimePercent` to `FacilityParams`. Add uptime-cap curtailment logic after 12CP/price. Return new `curtailedUptimeCap` count per month and a `shutdownLog` array with per-hour details (date, HE, price, AIL, reason). |
| `src/components/aeso/PowerModelAnalyzer.tsx` | Add Target Uptime % input field in Facility Parameters card. Add "Shutdown Log" and "Shutdown Analytics" tabs. Pass shutdown data to new components. |
| `src/components/aeso/PowerModelSummaryCards.tsx` | Add a "Curtailed Hours" summary card showing total shutdown hours and savings estimate. |
| `src/components/aeso/PowerModelChargeBreakdown.tsx` | Add "Uptime Cap" column to the Curtailment Analysis table. |
| `src/components/aeso/PowerModelCharts.tsx` | Add "Uptime Cap" bars to the existing Curtailment Efficiency chart. |

## Technical Details

### New Types (in usePowerModelCalculator.ts)

```text
ShutdownRecord {
  date: string          -- ISO date
  he: number            -- Hour Ending (1-24)
  poolPrice: number     -- $/MWh at that hour
  ailMW: number         -- Alberta Internal Load
  reason: '12CP' | 'Price' | 'UptimeCap' | '12CP+Price'
  costAvoided: number   -- estimated savings from not running
}

MonthlyResult (extended) {
  + curtailedUptimeCap: number   -- hours curtailed to hit target
}

FacilityParams (extended) {
  + targetUptimePercent: number  -- default 95
}
```

### Shutdown Log Component

- Paginated table (50 rows/page) with columns: Date, Hour, Pool Price, AIL (MW), Reason, Est. Cost Avoided
- Color-coded reason badges: red for 12CP, amber for Price, blue for Uptime Cap
- Filter by reason type and month
- Summary row showing totals
- All data from real AESO `aeso_training_data` records -- zero mock data

### Shutdown Analytics Component

Four charts in a 2x2 grid:
1. **Shutdown by Hour of Day** -- bar chart showing which hours get curtailed most (expect peaks at HE 18-21 for 12CP)
2. **Monthly Shutdown Breakdown** -- stacked bar by reason (12CP / Price / Uptime Cap)
3. **Price Distribution: Running vs Shutdown** -- overlapping histogram comparing pool prices during running vs shutdown hours
4. **Cumulative Cost Avoided** -- line chart showing running total of estimated savings from all curtailment types

### Data Integrity
- All shutdown hours derived from real `aeso_training_data` records
- Pool prices and AIL values are the actual historical values for each curtailed hour
- "Cost Avoided" = (poolPrice - breakeven) * capacity for price-based shutdowns; demand charge savings for 12CP shutdowns
- No synthetic or estimated shutdown data
