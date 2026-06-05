## Goal

Add a "No Curtailment / 24×7 AI Hosting" operating mode to the Power Model so users can analyze costs assuming 99.99% uptime — no 12CP avoidance and no energy-price curtailment. Then tighten the results UI so each number appears once with a clear label and an accurate definition.

## 1. New operating mode: "24×7 AI Hosting (no curtailment)"

### Configuration UI (`PowerModelAnalyzer.tsx`)

Add a top-level **Operating Mode** selector in the Facility Parameters card with three choices:

- **24×7 AI Hosting** — 99.99% uptime, no curtailment (NEW, default for AI workloads)
- **12CP Priority** — current behavior, always avoid monthly system peak
- **Cost Optimized** — current behavior, dollar-value scored curtailment

When **24×7 AI Hosting** is selected:
- Hide / disable: `targetUptimePercent`, `12CP Avoidance Window`, `12CP Forecast Success %`, `Curtailment Strategy` (they don't apply).
- Force `targetUptimePercent = 99.99`, `peakAvoidanceSuccessRate = 0` so the model pays the full Bulk Coincident Demand charge every month.
- Show an info note: "AI/HPC clients require continuous power. This mode assumes zero curtailment and pays the full 12CP transmission demand charge."

### Calculator (`usePowerModelCalculator.ts`)

Extend `CurtailmentStrategy` union to `'12cp-priority' | 'cost-optimized' | 'none'`.

When `curtailmentStrategy === 'none'`:
- Skip both curtailment passes — `finalRunning = records`, `curtailedHours = 0`.
- Force `bulkCoincidentDemand = bulkCoincidentRate * cap` (no success-rate discount).
- Skip `curtailmentSavings`, `overContractCredits`, `shutdownLog` (all zero / empty).
- Fixed-price mode still uses the fixed energy price for `poolEnergyTotal`, but with no curtailment over-contract credits are not earned (we ignore them in this mode to match real PPA take-or-pay behavior).

### Strategy Comparison

`PowerModelStrategyComparison` and `PowerModelChargeBreakdown` need a "no curtailment" baseline column when this mode is active so users can see the cost of running 24×7 vs the optimized scenarios.

## 2. Clean up the numbers shown

Currently the Results dashboard repeats several values across the hero cards, the stat ribbon, and the breakdown table. Audit and consolidate:

### Duplicates to remove

| Currently shown in | Number | Action |
|---|---|---|
| Hero card "All-in Rate" + Stat ribbon "Breakeven" + Breakeven card | Breakeven CA$/MWh appears 3× | Keep once in hero only (or stat ribbon when hosting rate is set); remove from ribbon when hero already shows it |
| Hero "Total Annual Cost" sub + Stat ribbon "Consumption" | MWh consumed shown twice | Keep only in Consumption stat |
| All-in Rate hero + breakdown table footer | Total ¢/kWh shown twice | Keep both but label one "Hero KPI" vs detailed "All-in Total"; ensure they match to 2 dp (fix any rounding drift) |
| Stat ribbon "Curtailed" hours + breakdown "Downtime Budget Allocation" | Same number shown twice | Remove from stat ribbon when budget block is rendered below |
| Curtailment Savings + Over-Contract Credits | Both shown only when `fixedPriceCAD > 0` — keep but add explanatory tooltip distinguishing the two |

### Labels & explanations to add (info tooltips)

Every KPI gets a `<HelpCircle>` tooltip with the exact formula:

- **Total Annual Cost** — "Sum of all 12 monthly invoices: DTS transmission + Energy (pool or fixed) + FortisAlberta distribution + GST. Includes the full 12CP charge weighted by forecast-success %."
- **All-in Rate** — "Total Annual Cost ÷ Total kWh consumed (after curtailment). In 24×7 mode this is over full nameplate kWh."
- **Net Margin** — "Annual hosting revenue (Hosting Rate × kWh delivered) − Total Annual Cost."
- **Breakeven Pool Price** — "Pool price above which marginal cost of running exceeds hosting revenue. Curtail when pool > this."
- **Uptime** — "Running hours ÷ Total hours. In 24×7 mode = 100%."
- **Curtailed Hours** — "Hours shut down for 12CP avoidance + price optimization. Zero in 24×7 mode."
- **Over-Contract Credits** — "Fixed-price PPA only. When pool > contract price, you sell back surplus and earn (pool − contract) × capacity per running hour."
- **Curtail Savings** — "Energy cost avoided by shutting down during high-price hours, valued at the energy rate you would have paid."

### Accuracy fixes

- The All-in Rate cards round `avgPerKwhCAD * 100` to 2 dp but the breakdown table sums component cents that round independently — replace the breakdown total with `annual.avgPerKwhCAD * 100` (single source of truth) so they always match.
- `totalCentsPerKwh - energyCentsPerKwh` for "Adders" can go negative when `totalPoolEnergy` includes the fixed-price contract energy on a curtailed dataset. Clamp at 0 and recompute energy share from `poolEnergy` only over running hours.
- `effectivePerKwhCAD` is currently computed only when `totalKWh > 0` but the hero card guards on `annual.totalOverContractCredits > 0` — also guard against `effectivePerKwhCAD <= 0` to avoid showing −cent values for short test windows.

## Files touched

- `src/hooks/usePowerModelCalculator.ts` — extend strategy union, add `'none'` branch, force-full 12CP charge.
- `src/components/aeso/PowerModelAnalyzer.tsx` — Operating Mode selector, hide irrelevant inputs in 24×7 mode, info banner.
- `src/components/aeso/PowerModelSummaryCards.tsx` — remove duplicates, add tooltips, fix rounding source.
- `src/components/aeso/PowerModelChargeBreakdown.tsx` — single-source `All-in Total`, conditionally show "no curtailment" baseline.
- `src/components/aeso/PowerModelStrategyComparison.tsx` — add `24×7 No Curtailment` baseline column.
- `src/constants/app-version.ts` — bump to invalidate cache.

## Open questions

1. In 24×7 mode, should I keep "Over-Contract Credits" available for **fixed-price PPA** customers? Real take-or-pay PPAs still let you settle the spread without curtailing. **Default in plan: yes, keep credits in 24×7 fixed mode** (they're a market-settled payment, not a curtailment).
2. Should I make 24×7 the **default mode** for new sessions, or leave 12CP Priority as the default and let users opt in?
