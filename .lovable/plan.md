

# Power Model Enhancement: Advanced Analytics & Data Source Transparency

## Overview

Enhance the Power Model Cost Analyzer with rich visualizations, deeper analytics, and explicit data source attribution for every metric — ensuring investor-grade transparency.

## New Analytics to Add

### 1. Monthly Cost Trend Chart (Recharts)
A stacked area/bar chart showing the monthly breakdown of DTS Charges vs Energy Charges vs FortisAlberta Charges vs GST over the year. This gives an immediate visual of cost seasonality — winter months (high pool prices, 12CP risk) vs summer months (lower costs).

**Data source**: All values computed from `aeso_training_data` table (pool_price, ail_mw) or uploaded CSV.

### 2. Cost Component Pie/Donut Chart
Annual cost breakdown by category: Bulk System, Regional System, POD Charges, Operating Reserve, Pool Energy, Rider F, FortisAlberta, GST. Shows which charge components dominate total cost.

**Data source**: Calculated from AESO Rate DTS 2025 tariff constants (AUC Decision 29606-D01-2024).

### 3. Curtailment Efficiency Chart
A monthly bar chart showing Running Hours vs 12CP Curtailed vs Price Curtailed vs Overlap hours. Visualizes how effective the curtailment strategy is across the year.

**Data source**: AIL-ranked demand hours from `aeso_training_data`; breakeven price derived from tariff constants.

### 4. Pool Price Distribution Histogram
Shows the distribution of hourly pool prices during running hours, with a vertical line marking the breakeven price. Helps visualize how often the facility would curtail due to price.

**Data source**: Hourly pool prices from `aeso_training_data` or uploaded CSV.

### 5. Sensitivity Analysis Table
Shows how total annual cost changes when key parameters vary:
- Capacity: +/- 5 MW
- Hosting Rate: +/- $0.01 USD/kWh
- Exchange Rate: +/- 5%
- 12CP Window: +/- 10 hours

**Data source**: Parametric re-calculation using the existing calculator engine with varied inputs.

### 6. Revenue vs Cost Comparison
A monthly bar chart comparing hosting revenue (MWh x hosting rate) against total energy cost, showing net margin per month and identifying months where operations may be unprofitable.

**Data source**: Hosting rate from user input; energy costs from calculator; pool prices from `aeso_training_data`.

### 7. Data Source Attribution Footer
A dedicated panel at the bottom listing every data source used, with badges:
- **Pool Price & AIL**: `aeso_training_data` table (33,635+ verified records, June 2022 - present) or user-uploaded CSV
- **Rate DTS Tariffs**: AUC Decision 29606-D01-2024, AESO ISO Tariff 2025 (verified Feb 2026)
- **FortisAlberta Rate 65**: July 2025 Rate Schedule (verified Feb 2026)
- **Operating Reserve (12.44%)**: AESO estimate — actual settled monthly
- **TCR ($0.265/MWh)**: AESO estimate — variable monthly supplement
- **Exchange Rate**: User-provided input (default 0.7334 CAD/USD)

## Technical Implementation

### New Files

| File | Purpose |
|---|---|
| `src/components/aeso/PowerModelCharts.tsx` | All 4 Recharts visualizations (cost trend, pie, curtailment, pool price histogram) |
| `src/components/aeso/PowerModelSensitivity.tsx` | Sensitivity analysis table with parameterized re-runs |
| `src/components/aeso/PowerModelRevenueAnalysis.tsx` | Revenue vs cost comparison chart and net margin table |
| `src/components/aeso/PowerModelDataSources.tsx` | Data source attribution footer with badges and links |

### Modified Files

| File | Changes |
|---|---|
| `src/components/aeso/PowerModelAnalyzer.tsx` | Import and render all new components below the existing results; add tab navigation for Charts / Sensitivity / Data Sources sections |
| `src/hooks/usePowerModelCalculator.ts` | Export additional computed fields: monthly hosting revenue, net margin, pool price min/max/median per month; add helper for sensitivity re-calculation |
| `src/components/aeso/PowerModelSummaryCards.tsx` | Add 2 new cards: "Annual Hosting Revenue" and "Net Margin" with profit/loss color coding |

### Chart Details (using Recharts — already installed)

**Monthly Cost Trend** — `ComposedChart` with stacked bars for DTS/Energy/Fortis and a line for total cost, X-axis = month names.

**Cost Pie Chart** — `PieChart` with labeled segments, custom tooltip showing $ amount and % of total.

**Curtailment Stacked Bar** — `BarChart` with 3 stacked segments (12CP, Price, Overlap) per month, plus a line showing uptime %.

**Pool Price Histogram** — `BarChart` with price bins ($0-25, $25-50, ..., $200+), count of hours per bin, and a `ReferenceLine` at breakeven price.

**Revenue vs Cost** — `BarChart` with side-by-side bars (Revenue green, Cost red) per month, plus a line for net margin.

### Sensitivity Analysis Logic

The sensitivity table will call the existing calculator logic with modified params (no new API calls needed). It will display a grid:

| Parameter | -10% | -5% | Base | +5% | +10% | Impact |
|---|---|---|---|---|---|---|
| Capacity (MW) | ... | ... | 45 | ... | ... | $/MW change |
| Hosting Rate | ... | ... | 0.07 | ... | ... | $/0.01 change |
| Exchange Rate | ... | ... | 0.7334 | ... | ... | per 1% change |
| 12CP Window | ... | ... | 35 hrs | ... | ... | per 5 hrs change |

### Data Source Attribution

Each chart and table will include a small footer or badge indicating its data source. The main Data Sources panel will list:

- Pool Price / AIL demand data — source and record count
- Each Rate DTS component — AUC Decision number, effective date, verification date
- FortisAlberta rates — schedule document, effective date
- Estimated vs verified badges for variable charges (Operating Reserve, TCR)
- Links to official AESO and FortisAlberta tariff documents

## Summary of Additions

- **4 new interactive charts** (cost trends, cost breakdown pie, curtailment efficiency, pool price distribution)
- **Revenue vs Cost analysis** with monthly net margin
- **Sensitivity analysis** showing cost impact of parameter changes
- **2 new summary cards** (hosting revenue, net margin)
- **Comprehensive data source attribution** with verification badges and direct links to official tariff documents
- All analytics use data already available in the calculator — no new API calls or edge functions needed

