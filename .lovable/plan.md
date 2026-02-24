

# Comprehensive Enhancements for Energization Timeline & Mining Economics

## Tool 1: Energization Timeline Planner

### Enhancement 1A: Capacity Sensitivity Analysis Chart
Add a Recharts line chart showing how Total Capital-at-Risk scales across capacity levels (10 MW to 200 MW in 10 MW steps). Three lines: Upfront Fees, Refundable Security, and Total. Helps investors instantly see the capital curve and identify optimal facility sizing. Uses existing `calculateMonthlyDTS()` and fee formulas -- no new data sources needed.

### Enhancement 1B: Cash Flow Waterfall Chart
A horizontal waterfall chart (Recharts BarChart) showing the step-by-step build-up of capital requirements: Cluster Preliminary -> Cluster Detailed -> Pool Participation -> DTS Security -> Energy Security -> First Month DTS -> Total. Each bar segment colored differently (non-refundable in amber, refundable in blue, ongoing in green). Makes the financial picture immediately visual for investor decks.

### Enhancement 1C: Timeline Gantt Chart (Visual)
Replace the current horizontal stage bar with a proper horizontal Gantt-style chart using Recharts. Each stage rendered as a colored horizontal bar proportional to its duration, with the target energization date marked as a vertical line. When a target date is set, the bars are positioned on a real calendar axis. When no date is set, bars show relative week durations.

### Enhancement 1D: DTS Cost Breakdown Donut Chart
Add a Recharts PieChart/donut showing the proportional breakdown of monthly DTS charges (Bulk Demand, Regional, POD, Operating Reserve, etc.). Investors can instantly see which cost components dominate.

### Enhancement 1E: Annual Cost Projection Table
A 5-year projection table showing Year 1 through Year 5 costs, including: annual DTS charges, annual energy market trading charges, annual pool participation fee, and cumulative total. Uses existing constants -- no assumptions beyond applying current rates forward with a clear disclaimer.

### Enhancement 1F: DFO Comparison Bar Chart
Add a grouped bar chart to the existing DFO Comparison section showing all 4 DFOs side-by-side with stacked bars (Demand, Delivery, Riders) plus a separate bar for total all-in cost. Much more visual than the current card-only layout.

---

## Tool 2: Mining Hash Optimizer

### Enhancement 2A: Profitability Heatmap (Month x Hour)
Replace the current simplified hourly bar chart with a true Month x Hour-of-Day heatmap grid (Recharts or custom SVG). Each cell colored from red (loss) through white (break-even) to green (profit). The existing `heatmapMap` data is already computed but only aggregated by hour -- expand it to render the full 2D grid. This is the single most requested visualization in mining analytics.

### Enhancement 2B: Price Duration Curve
A line chart showing historical AESO pool prices sorted from lowest to highest, with a horizontal line at the break-even price. The intersection point shows what percentage of hours are below break-even (profitable). This is a standard energy market analytics view and reuses existing `historicalData`.

### Enhancement 2C: Cumulative Profit Chart
A time-series area chart showing cumulative net profit over the backtest period. X-axis: months. Y-axis: cumulative USD. Shows the profit trajectory and whether returns are accelerating or decelerating. Uses existing `monthlyResults` data.

### Enhancement 2D: Sensitivity Analysis -- Break-Even vs BTC Price
A line chart showing how the break-even AESO pool price changes across a range of BTC prices ($50K to $200K in $10K steps). Uses the existing break-even formula with BTC price as the variable. Helps answer "if BTC drops to $X, what energy price do I need?"

### Enhancement 2E: Efficiency Comparison Table
An expanded ASIC comparison showing all miners from `ASIC_SPECS` with calculated metrics for the current BTC conditions: break-even price, daily BTC per MW, daily revenue per MW, and energy cost ratio. Helps users compare miners beyond just J/TH.

### Enhancement 2F: Seasonal Pattern Analysis
Summary cards showing backtest results broken down by season (Winter: Nov-Feb, Summer: Jun-Aug, Shoulder: Mar-May/Sep-Oct). Shows average pool price, profitability %, and optimal strategy per season. Uses existing backtest data grouped differently.

---

## Technical Implementation

### Files Modified:

1. **`src/components/aeso/EnergizationTimeline.tsx`**
   - Add `CapacitySensitivityChart` sub-component (Recharts LineChart)
   - Add `CashFlowWaterfall` sub-component (Recharts BarChart)
   - Add `GanttTimeline` sub-component (Recharts BarChart horizontal)
   - Add `DTSBreakdownDonut` sub-component (Recharts PieChart)
   - Add `AnnualProjectionTable` sub-component (Table)
   - Add `DFOComparisonChart` to existing DFOComparisonSection
   - Integrate all new sections into the main layout

2. **`src/components/aeso/MiningHashOptimizer.tsx`**
   - Add `ProfitabilityHeatmap` sub-component (custom grid using divs)
   - Add `PriceDurationCurve` sub-component (Recharts LineChart)
   - Add `CumulativeProfitChart` sub-component (Recharts AreaChart)
   - Add `BreakEvenSensitivity` sub-component (Recharts LineChart)
   - Add `ASICComparisonTable` sub-component (Table)
   - Add `SeasonalAnalysis` sub-component (Card grid)
   - Expand `backtestResults` to include heatmap 2D data and seasonal grouping

### Data Sources:
All enhancements use **existing data** already in the codebase:
- Energization: `AESO_ISO_FEES`, `AESO_RATE_DTS_2026`, `DFO_DISTRIBUTION_RATES`, `calculateMonthlyDTS()`
- Mining: `historicalData` from `aeso_training_data`, `useBitcoinNetworkStats()`, `ASIC_SPECS`, `AESO_TARIFF_2026`
- No new API calls, no new database queries, no new edge functions
- No fabricated or estimated data -- all calculations derived from verified constants

### Chart Library:
All charts use Recharts (already installed). The heatmap uses a custom CSS grid of colored divs since Recharts doesn't have a native heatmap -- this is a common pattern and keeps dependencies minimal.

