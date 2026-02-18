

# Adding Reference Tool Analytics to AESO Market Hub

## What the Reference Tool Has (and What We're Missing)

Based on the reference AESO Power Model tool's navigation structure (Dashboard, Monthly Analysis, Itemized Bill, Hourly Prices, PPA vs Pool, 12CP Demand, Data Explorer, Ancillary Data, AESO Programs, Correlations, Strategy Sim, Live Market, AI Analyst), here is the gap analysis against our current hub:

| Reference Feature | Our Status | Action |
|---|---|---|
| Dashboard (KPI summary) | Have (Market Overview tab) | No change |
| Monthly Analysis | Have (Power Model Cost Analysis tab) | No change |
| Itemized Bill | Have (PowerModelChargeBreakdown) | No change |
| Hourly Prices | Partial (Price Distribution chart only) | **NEW: Add dedicated Hourly Price Explorer** |
| PPA vs Pool | Missing from Market Hub (exists in education section only) | **NEW: Add PPA vs Pool Analyzer** |
| 12CP Demand | Have (TwelveCPAnalyticsTab) | No change |
| Data Explorer | Missing | **NEW: Add Interactive Data Explorer** |
| Ancillary Data | Missing | **NEW: Add Ancillary Services Analytics** |
| Correlations | Partial (Weather & Drivers tab has temp/wind/gas) | **ENHANCE: Add more correlation types** |
| Strategy Sim | Partial (StrategyComparison exists but basic) | **ENHANCE: Add interactive strategy simulator** |
| Live Market | Have (Market Overview tab) | No change |
| AI Analyst | Have (PowerModelAIAnalysis) | No change |

## Plan: 5 New Analytics Modules

All modules use ONLY real data from `aeso_training_data` (34,225+ records) and live AESO API data. No fake data.

### 1. Hourly Price Explorer (New Tab in Analytics)

An interactive time-series viewer for hourly pool prices with zoom, range selection, and statistical overlays.

**Data source**: `aeso_training_data` table -- `timestamp`, `pool_price`, `ail_mw` fields (100% coverage).

**Features**:
- Interactive line chart of hourly pool prices for the selected date range (default: last 30 days)
- Date range picker (day, week, month, quarter, year, custom)
- Statistical overlays: 24h rolling average line, P10/P90 bands as shaded area
- Price spike detection: highlight hours above user-defined threshold (default: $200/MWh) with red markers
- Summary stats bar: Min, Max, Mean, Median, Std Dev, Spike Count, Hours Below Zero
- Hour-of-day average profile: bar chart showing average price by hour (0-23) for the selected period
- Exportable as CSV

**Where it lives**: New sub-tab "Hourly Prices" inside the Analytics tab of the AESO Hub (alongside existing Historical Pricing).

### 2. PPA vs Pool Comparison Analyzer (New Tab in Power Model)

Lets users compare a hypothetical PPA (Power Purchase Agreement) fixed price against actual pool exposure using real hourly data.

**Data source**: Already-loaded `hourlyData` in the Power Model (from `aeso_training_data`).

**Features**:
- PPA price input slider ($30-$150/MWh, default: $65)
- Monthly comparison chart: side-by-side bars showing PPA cost vs actual pool cost per month
- Cumulative cost curve: two lines (PPA vs Pool) showing running total over the year
- Settlement calculation: for each hour, `settlement = poolPrice - ppaPrice`. Positive = PPA saves money, negative = pool was cheaper
- Monthly settlement waterfall chart showing net gains/losses
- Summary KPIs: Annual PPA Cost, Annual Pool Cost, Net Difference, % of Hours PPA Wins, Worst Month Exposure
- Breakeven PPA rate calculator: find the exact PPA price where total cost equals pool cost

**Where it lives**: New tab "PPA vs Pool" added to the Power Model's analytics tabs (alongside Cost Analysis, Revenue & Sensitivity, etc.).

### 3. Interactive Data Explorer (New Tab in Analytics)

A flexible query builder for exploring the raw `aeso_training_data` dataset with charting.

**Data source**: `aeso_training_data` -- all available columns with 100% coverage: `pool_price`, `ail_mw`, `temperature_edmonton`, `temperature_calgary`, `wind_speed`, `cloud_cover`, `gas_price_aeco`.

**Features**:
- Axis selector: pick any two numeric fields for X and Y axes from a dropdown (pool_price, ail_mw, temperature_edmonton, wind_speed, gas_price_aeco, etc.)
- Chart type toggle: Scatter plot, Line chart, or Histogram
- Date range filter
- Aggregation toggle: Raw hourly, Daily average, Weekly average, Monthly average
- Auto-calculated statistics panel: Pearson correlation, R-squared, trend line equation
- Color-by selector: color data points by season, month, hour-of-day, or price regime
- Data table below the chart showing the raw/aggregated records with sorting and filtering
- Limit to 2,000 sampled points for scatter plots (random sampling) to maintain performance

**Where it lives**: New sub-tab "Data Explorer" inside the Analytics tab of the AESO Hub.

### 4. Ancillary Services Analytics (New Section in Market Overview or Analytics)

Visualize operating reserve, intertie flows, and grid reliability metrics from real AESO data.

**Data source**: `aeso_training_data` columns with ~12% coverage (Nov 2025+): `operating_reserve`, `spinning_reserve_mw`, `supplemental_reserve_mw`, `intertie_bc_flow`, `intertie_sask_flow`, `intertie_montana_flow`, `reserve_margin_percent`, `grid_stress_score`. Also uses live data from the `energy-data-integration` edge function.

**Features**:
- Operating Reserve trend chart (line chart over time)
- Intertie flow breakdown: stacked area chart showing BC, Saskatchewan, and Montana flows
- Reserve margin distribution histogram
- Grid stress score timeline (where data exists)
- Summary KPIs: Avg Reserve Margin, Peak Stress Score, Net Import/Export totals
- Data availability badge showing coverage percentage since this data is only ~12% complete

**Where it lives**: New sub-tab "Ancillary & Grid" inside the Analytics tab. Shows a coverage warning banner for fields with limited data.

### 5. Enhanced Correlations Dashboard (Enhance Existing Weather & Drivers Tab)

Expand the existing Weather & Drivers tab in the Power Model with additional correlation pairs and a multi-variable analysis.

**Data source**: `aeso_training_data` -- same fields already used in `PowerModelWeatherDrivers.tsx` plus `cloud_cover`, `solar_irradiance`, `renewable_penetration`.

**New additions**:
- Demand vs Price correlation scatter with color gradient
- Renewable penetration vs price correlation (where data exists)
- Multi-variable correlation matrix heatmap: a grid showing Pearson r values between all key variables (pool_price, ail_mw, temperature, wind_speed, gas_price_aeco)
- Time-lagged correlation: show how price_lag_1h, price_lag_24h correlate with current price (auto-correlation analysis)
- Key insight: "Which variable is the strongest price predictor?" -- ranked by absolute correlation coefficient

## Technical Implementation

### New Files to Create

| File | Purpose |
|---|---|
| `src/components/aeso/HourlyPriceExplorer.tsx` | Hourly price time-series viewer with zoom, spike detection, hour-of-day profile |
| `src/components/aeso/PPAvsPoolAnalyzer.tsx` | PPA comparison tool with settlement waterfall, cumulative curves, breakeven finder |
| `src/components/aeso/DataExplorerPanel.tsx` | Interactive X/Y axis selector with scatter/line/histogram, auto-stats, color-by |
| `src/components/aeso/AncillaryServicesAnalytics.tsx` | Reserve, intertie, grid stress visualizations with coverage badges |
| `src/components/aeso/CorrelationMatrix.tsx` | Multi-variable correlation heatmap grid component |

### Files to Modify

| File | Changes |
|---|---|
| `src/components/aeso-hub/tabs/AnalyticsTab.tsx` | Add 3 new sub-tabs: "Hourly Prices", "Data Explorer", "Ancillary & Grid" as collapsible sections or sub-tab navigation |
| `src/components/aeso/PowerModelAnalyzer.tsx` | Add "PPA vs Pool" as 6th analytics tab, pass hourlyData and params |
| `src/components/aeso/PowerModelWeatherDrivers.tsx` | Add correlation matrix heatmap section, demand vs price scatter, auto-correlation analysis |

### Data Fetching Strategy

- **Hourly Price Explorer**: Fetches from `aeso_training_data` with date range filter, paginated in 1000-row batches (same pattern as existing Power Model loader)
- **PPA vs Pool**: Uses already-loaded `hourlyData` from Power Model -- no new queries
- **Data Explorer**: Fetches from `aeso_training_data` with user-selected columns and date range, sampled to 2000 rows max using `ORDER BY RANDOM() LIMIT 2000` pattern for scatter plots
- **Ancillary Services**: Fetches from `aeso_training_data` filtering for `NOT NULL` on reserve/intertie columns (which limits to ~12% of records from Nov 2025+), plus live data from existing `energy-data-integration` edge function
- **Correlation Matrix**: Computed client-side from already-loaded weather data in the Weather & Drivers tab

### Performance Considerations

- Scatter plots cap at 2,000 data points via random sampling to prevent browser lag
- Line charts use daily/weekly aggregation for ranges > 90 days
- Correlation matrix calculations are memoized with `useMemo`
- Data Explorer queries are lazy-loaded only when the tab is active
- Ancillary data includes a prominent coverage badge since it only has ~12% of records

