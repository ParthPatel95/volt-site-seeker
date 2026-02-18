

# AESO Market Hub: Next-Level Analytics Upgrade

## Gap Analysis: Reference Tool vs Our Hub

| Reference Feature | Our Status | Gap |
|---|---|---|
| Dashboard | Have (Market Overview) | No gap |
| Monthly Analysis | Have (Power Model Cost Analysis) | No gap |
| Itemized Bill | Have (PowerModelChargeBreakdown) | No gap |
| Hourly Prices | Have (HourlyPriceExplorer) | No gap |
| PPA vs Pool | Have (PPAvsPoolAnalyzer) | No gap |
| 12CP Demand | Have (TwelveCPAnalyticsTab) | No gap |
| Data Explorer | Have (DataExplorerPanel) | No gap |
| Ancillary Data | Have (AncillaryServicesAnalytics) | No gap |
| **AESO Programs** | Education page only, not in Hub | **MISSING from Hub** |
| Correlations | Have (CorrelationMatrix + WeatherDrivers) | No gap |
| **Strategy Sim** | Widget only (dashboard-widgets), not in Hub | **MISSING from Hub** |
| Live Market | Have (Market Overview) | No gap |
| **Notifications** | Have Telegram alerts, not unified | **MISSING unified panel** |
| AI Analyst | Have (PowerModelAIAnalysis) | No gap |
| Settings | Have | No gap |

All core analytics modules from the reference tool have been added. Three features remain missing from the Hub, and the existing analytics modules need visual and depth upgrades to match investor-grade standards.

---

## Part 1: Add 3 Missing Modules

### 1A. AESO Programs Panel (New sub-tab in Analytics)

A reference card for AESO grid participation programs that miners can earn revenue from. Data sourced from official AESO tariff documents and stored program definitions.

**Content:**
- **Operating Reserve (OR)**: Explanation, qualification criteria, estimated revenue ($/MW/month), participation requirements
- **Demand Response (DR)**: Load curtailment incentive programs, typical response windows, payout structure
- **Ancillary Services Market**: Spinning reserve, supplemental reserve qualification for large industrial loads
- **Rate DTS Rider F**: Interruptible service rate benefits and eligibility
- Each program card shows: eligibility badge (Qualified/Not Qualified based on facility capacity), estimated annual value, link to official AESO document

### 1B. Strategy Simulator (New sub-tab in Analytics)

Promote the existing `OperatingStrategySimulator` widget from dashboard-widgets into a full standalone tab. Enhance it with:

- **Multi-strategy comparison**: Peak-only, Off-peak, Smart (price-responsive), Continuous, Custom threshold
- **Interactive threshold slider**: Set a price ceiling and see how many hours you'd operate and at what average cost
- **Monte Carlo simulation**: Using historical price distribution, simulate 1000 random years to show expected profit distribution (P10, P50, P90 outcomes)
- **Scenario matrix**: Grid showing annual profit/loss at different capacity levels x different strategies
- All calculations use real `aeso_training_data` hourly records

### 1C. Notifications Center (New sub-tab in Analytics or Settings)

Consolidate the existing Telegram alert configuration into a visible "Notifications" section:

- Show existing Telegram alert rules with status (active/paused)
- Recent alert history with timestamps and trigger values
- Quick-add common alert templates (Price spike > $200, Demand > 11,000 MW, Negative price detected)
- This is mostly a reorganization of the existing `TelegramAlertSettings`, `TelegramAlertRules`, and `TelegramAlertHistory` components into a unified panel

---

## Part 2: Visual and Analytical Depth Upgrades

### 2A. Hourly Price Explorer Enhancements

Current state: basic line chart with stats bar. Upgrade to:

- **Price duration curve**: Sort all hourly prices descending and plot as a stepped line showing "X% of hours were below $Y" -- this is the standard utility industry visualization
- **Day-of-week heatmap**: 7 rows (Mon-Sun) x 24 columns (hours), showing average price by time slot with green-to-red color scale
- **Volatility band chart**: Replace static P10/P90 badges with a shaded band area chart showing the price envelope over time
- **Spike event table**: Below the chart, a table listing each spike event (consecutive hours above threshold) with start time, duration, peak price, and estimated cost impact

### 2B. Data Explorer Enhancements

Current state: basic scatter/line/histogram with stats. Upgrade to:

- **Regression line overlay**: Draw the trend line on scatter plots using the already-calculated slope/intercept
- **Residual analysis**: Show a residual plot below the main chart (actual - predicted) to identify non-linear patterns
- **Multi-variable view**: Allow plotting a third variable as bubble size (Z-axis) on scatter plots
- **Data quality indicators**: Show null-rate percentage for each selected field with a small badge
- **Quick presets**: One-click buttons for common analyses: "Price vs Demand", "Price vs Temperature", "Price vs Wind", "Price vs Gas"

### 2C. Ancillary Services Enhancements

Current state: basic line charts for reserves and interties. Upgrade to:

- **Net import/export summary**: Large KPI showing whether Alberta was net importer or exporter for the period, with trend arrow
- **Intertie utilization gauge**: For each intertie (BC, SK, MT), show a gauge of how close flows were to capacity limits
- **Reserve adequacy timeline**: Color-coded timeline where green = adequate reserves, yellow = tight, red = below requirement
- **Correlation with price**: Side-by-side mini chart showing reserve margin vs pool price to demonstrate the inverse relationship

### 2D. PPA vs Pool Analyzer Enhancements

Current state: basic bar comparisons and cumulative curves. Upgrade to:

- **Risk-adjusted comparison**: Show Value-at-Risk (VaR) for pool exposure vs fixed PPA -- "In the worst 5% of months, pool exposure cost $X more than PPA"
- **Optimal PPA range finder**: Instead of single breakeven, show a chart with PPA price on X-axis and probability of beating pool on Y-axis, marking the 50/50 crossover and the 80% confidence zone
- **Hedge ratio slider**: Allow partial hedging (e.g., 60% PPA + 40% pool) and show blended cost outcomes
- **Export comparison report**: Button to export the PPA analysis as a formatted summary for investor presentations

### 2E. Correlation Dashboard Enhancements

Current state: heatmap grid + scatter charts. Upgrade to:

- **Time-lagged correlations**: Show how price correlates with demand/temperature at different lag windows (1h, 6h, 12h, 24h) to identify leading indicators
- **Rolling correlation chart**: Plot how the correlation between price and demand changes over time (rolling 30-day window) to show seasonal relationship shifts
- **Feature importance ranking**: Bar chart ranking all variables by absolute correlation strength with price, making it instantly clear which drivers matter most

---

## Part 3: Global UX Improvements

### 3A. Analytics Tab Navigation Overhaul

The Analytics tab currently has 4 sub-tabs. With the new modules, it needs restructuring:

```
Analytics Tab Sub-Navigation:
  [Historical Pricing] [Hourly Prices] [Data Explorer] [Ancillary & Grid] [AESO Programs] [Strategy Sim] [Notifications]
```

Group into two rows or use a scrollable pill-based navigation with category headers.

### 3B. Chart Consistency

Standardize across all chart components:
- Unified tooltip format: dark background, consistent number formatting, always show units
- Consistent color palette: use the existing COLORS object from PowerModelCharts across all modules
- All charts get a "fullscreen" expand button for detailed viewing
- Add CSV export button to every chart/table

### 3C. Loading States

Replace basic spinners with skeleton loading patterns:
- KPI cards show shimmer placeholders
- Charts show a faded grid pattern while loading
- Tables show row placeholders with pulse animation

---

## Technical Implementation

### New Files

| File | Purpose |
|---|---|
| `src/components/aeso/AESOProgramsPanel.tsx` | Grid programs reference with eligibility badges and revenue estimates |
| `src/components/aeso/StrategySimulator.tsx` | Enhanced strategy sim with threshold slider, scenario matrix, Monte Carlo |
| `src/components/aeso/NotificationsPanel.tsx` | Unified alert management combining existing Telegram components |

### Files to Modify

| File | Changes |
|---|---|
| `AnalyticsTab.tsx` | Add 3 new sub-tabs (AESO Programs, Strategy Sim, Notifications), reorganize navigation |
| `HourlyPriceExplorer.tsx` | Add price duration curve, day-of-week heatmap, volatility bands, spike event table |
| `DataExplorerPanel.tsx` | Add regression line overlay, residual plot, quick presets, data quality badges |
| `AncillaryServicesAnalytics.tsx` | Add net import/export KPI, utilization gauges, reserve adequacy timeline, price correlation |
| `PPAvsPoolAnalyzer.tsx` | Add VaR analysis, optimal PPA range chart, hedge ratio slider |
| `PowerModelWeatherDrivers.tsx` | Add time-lagged correlations, rolling correlation chart, feature importance ranking |

### Data Sources

All enhancements use existing data from `aeso_training_data` (34,261+ records) and live AESO API calls. No new database tables or API integrations required.

- Strategy Simulator: queries `aeso_training_data` for hourly prices (same pattern as OperatingStrategySimulator)
- AESO Programs: static reference data from official tariff documents (no API needed)
- Notifications: uses existing `TelegramAlertSettings`/`TelegramAlertRules`/`TelegramAlertHistory` components
- All new analytics (duration curves, heatmaps, VaR) computed client-side from already-loaded data
