

# Power Model Enhancement Plan

## Current State Assessment

The Power Model is a comprehensive cost analyzer with 15+ charge components, 9 analytics sub-tabs, and detailed curtailment logic. However, the UI/UX has several issues:

1. **Top section is overwhelming** -- 3 input cards + collapsible tariff editor sit above results with no visual flow guidance
2. **9 analytics sub-tabs are too many** -- users must click through Charts, Revenue, Sensitivity, AI Analysis, Shutdown Log, Shutdown Analytics, Assumptions, Rate Guide, Data Sources
3. **Summary cards use a 7-column grid** that collapses poorly on mobile and shows up to 9 cards in a wall
4. **No "load data" onboarding** -- new users see empty inputs with no guidance on what to do first
5. **Editable Rates section always shows** even when collapsed -- takes visual space before results
6. **No weather/temperature correlation** despite having 34,225 records with temperature data (100% coverage)
7. **No gas price correlation** despite having 33,100 records with AECO gas prices

## Available Real Data for New Analytics

From `aeso_training_data` (34,225 records, June 2022 - present):

| Field | Coverage | Can Use? |
|---|---|---|
| pool_price, ail_mw | 100% | Already used |
| temperature_edmonton/calgary | 100% (34,225) | NEW - temperature-cost correlation |
| wind_speed | 100% (34,225) | NEW - wind impact on prices |
| gas_price_aeco | 97% (33,100) | NEW - gas price vs pool price driver |
| grid_stress_score | 13% (4,357) | Limited but usable for recent data |
| generation_gas/wind/solar | 13% (4,560) | Limited to Nov 2025+ |

## Enhancement Plan

### 1. Reorganize the Page Layout into a Clear Flow

**Problem**: Inputs, tariff editor, and results all stack vertically with no visual hierarchy.

**Fix**: Restructure into a 2-phase flow:

```text
PHASE 1: "Configuration" (collapsible panel, auto-collapses after data loads)
  Row 1: [Facility Params] [Revenue Params] [Data Source]
  Row 2: [Editable Rates - collapsed by default]

PHASE 2: "Results" (appears after data loads)
  Section A: KPI Dashboard (redesigned summary cards)
  Section B: Strategy & Cost Analysis (tabs consolidated)
  Section C: Deep Analytics (tabs consolidated)
```

Move the Editable Rates into a collapsible section INSIDE the Configuration panel instead of a separate section. After data loads, auto-scroll to results and visually minimize the config panel.

### 2. Redesign Summary Cards (KPI Dashboard)

**Problem**: Up to 9 cards in a `xl:grid-cols-7` grid -- visually noisy and poor mobile layout.

**Fix**: Redesign into 2 rows with clear hierarchy:

```text
Row 1: "Cost KPIs" (3 large cards)
  [Total Annual Cost + USD] [All-in Rate ¢/kWh] [Net Margin + %]

Row 2: "Operational KPIs" (4 compact cards)  
  [Consumption GWh] [Uptime %] [Curtailed Hours] [Breakeven Price]
```

- Large cards get a bigger font and more padding
- Operational cards stay compact
- Revenue and Curtailment Savings cards only appear when relevant (hosting rate set / fixed price mode)
- Grid: `grid-cols-1 sm:grid-cols-3` for Row 1, `grid-cols-2 sm:grid-cols-4` for Row 2

### 3. Consolidate 9 Analytics Tabs into 5

**Problem**: 9 tabs is too many -- several are related (Shutdown Log + Shutdown Analytics) or low-priority (Data Sources, Rate Guide).

**Fix**:

| New Tab | Contains |
|---|---|
| Cost Analysis | Charts (Monthly Cost Trend, Pie, Price Distribution) + Cost Progression table |
| Revenue & Sensitivity | Revenue Analysis + Sensitivity table (side by side on desktop) |
| Curtailment | Shutdown Analytics charts + Shutdown Log table (combined into one view) |
| Weather & Drivers | NEW -- Temperature-cost correlation, Wind impact, Gas price analysis |
| Reference | Assumptions + Rate Guide + Data Sources (combined into one collapsible view) |

AI Analysis gets promoted OUT of tabs into a persistent floating button/section since it's a cross-cutting feature.

### 4. NEW: Weather & Price Driver Analytics Tab (from real data)

All calculations use the 34,225 real records. No fake data.

**4a. Temperature-Cost Heatmap**

Cross-reference hourly temperature (Edmonton) with pool prices to show how temperature drives energy costs:

```typescript
// Group hours by temperature bucket and calculate avg pool price
const tempBuckets = [-30, -20, -10, 0, 10, 20, 30];
// For each bucket: { tempRange, avgPoolPrice, hours, avgDemandMW }
```

Visualization: Bar chart with temperature ranges on X-axis, average pool price on Y-axis. Color-coded by price severity. Shows the well-known pattern: extreme cold = high prices.

**4b. Wind Speed vs Pool Price Scatter**

Plot wind_speed vs pool_price to show how wind generation suppresses prices:

```typescript
// Sample hourly data points (downsample to ~500 for performance)
// Show trend line: higher wind = lower prices
```

Visualization: Scatter plot with wind speed on X, pool price on Y, with a trend line.

**4c. Gas Price (AECO) vs Pool Price Correlation**

Since gas generation sets the marginal price most hours, show how AECO gas prices drive pool prices:

```typescript
// Monthly average gas_price_aeco vs monthly average pool_price
// Calculate Pearson correlation coefficient
```

Visualization: Dual-axis line chart showing monthly gas price vs pool price trends.

**4d. Seasonal Cost Profile**

From the hourly data already loaded, calculate average cost by hour-of-day and month to show when energy is cheapest/most expensive:

```typescript
// Group by hour_of_day: avg pool price per hour
// Group by month: avg pool price per month
// Identify optimal operating windows
```

Visualization: Heatmap-style grid (hours x months) showing price intensity.

### 5. Enhanced Data Loading UX

**Problem**: "Load from Database" button with just a year input -- no feedback on what data exists.

**Fix**:
- Add a small data availability indicator showing record counts per year (query on mount)
- After loading, show a compact "Data Summary" badge: "8,760 hours loaded | Jun 2024 - May 2025 | Avg Pool: $52/MWh"
- Auto-load 2025 data on first visit (most relevant year)
- Add loading skeleton animation during fetch

### 6. Promote AI Analysis

**Problem**: Buried as tab 4 of 9 -- users often don't discover it.

**Fix**: Move the "Generate Analysis" button into the KPI Dashboard header area (top right). When clicked, the analysis renders in a slide-out panel or an expandable section below the KPIs, not buried in a tab.

### 7. Mobile Responsiveness Fixes

- Summary cards: `grid-cols-1` on mobile (not trying to fit 7 columns)
- Monthly table: Horizontal scroll with sticky first column (already implemented but ensure sticky works)
- Analytics tabs: `overflow-x-auto flex` instead of `flex-wrap` for tab triggers
- Input cards: Stack to single column on mobile (already `lg:grid-cols-3`)
- Charts: Responsive heights using container queries

## Technical Details

### Files to Modify

| File | Changes |
|---|---|
| `src/components/aeso/PowerModelAnalyzer.tsx` | Restructure layout into Config/Results phases. Consolidate tabs from 9 to 5. Move AI button to header. Add auto-collapse for config after data load. |
| `src/components/aeso/PowerModelSummaryCards.tsx` | Redesign into 2-row hierarchy (3 large + 4 compact). Better mobile grid. |
| `src/components/aeso/PowerModelCharts.tsx` | Merge Cost Progression content into this component for the "Cost Analysis" tab. |
| `src/components/aeso/PowerModelShutdownAnalytics.tsx` | Merge Shutdown Log into this component as a collapsible table below the charts. |
| `src/components/aeso/PowerModelAIAnalysis.tsx` | Extract the "Generate" button for header placement. Make analysis content work in an expandable panel. |

### Files to Create

| File | Purpose |
|---|---|
| `src/components/aeso/PowerModelWeatherDrivers.tsx` | NEW tab: Temperature heatmap, wind scatter, gas price correlation, seasonal profile. All from real `aeso_training_data`. |
| `src/components/aeso/PowerModelReference.tsx` | Combined view: Assumptions + Rate Guide + Data Sources (all collapsible). |

### Files to Delete (merged into others)

| File | Reason |
|---|---|
| `src/components/aeso/PowerModelDataSources.tsx` | Merged into PowerModelReference |
| `src/components/aeso/PowerModelRateExplainer.tsx` | Merged into PowerModelReference |

### Data Fetching for Weather Analytics

The Weather & Drivers tab needs additional fields from `aeso_training_data` beyond what the Power Model currently loads (which only fetches `timestamp`, `pool_price`, `ail_mw`). 

Add an expanded query that fetches `temperature_edmonton`, `wind_speed`, and `gas_price_aeco` alongside the existing fields. This runs only when the Weather tab is selected (lazy load) to avoid slowing initial page load.

```typescript
// Lazy fetch for weather correlation data
const loadWeatherData = async () => {
  const { data } = await supabase
    .from('aeso_training_data')
    .select('timestamp, pool_price, ail_mw, temperature_edmonton, wind_speed, gas_price_aeco')
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .not('ail_mw', 'is', null)
    .order('timestamp', { ascending: true });
  // ... batch pagination same as existing
};
```

### Correlation Calculations (all from real data)

```typescript
// Temperature buckets
const tempBuckets = [-35,-25,-15,-5,5,15,25,35];
const tempAnalysis = tempBuckets.map((min, i) => {
  const max = tempBuckets[i+1] ?? Infinity;
  const matching = data.filter(d => d.temperature_edmonton >= min && d.temperature_edmonton < max);
  return {
    range: `${min} to ${max}°C`,
    avgPrice: matching.reduce((s,d) => s + d.pool_price, 0) / matching.length,
    hours: matching.length,
    avgDemand: matching.reduce((s,d) => s + d.ail_mw, 0) / matching.length,
  };
});

// Pearson correlation for gas vs pool
const gasPoolCorrelation = pearsonR(
  monthlyData.map(m => m.avgGasPrice),
  monthlyData.map(m => m.avgPoolPrice)
);
```

All analytics use only verified data from the `aeso_training_data` table with 100% coverage for temperature and wind, and 97% coverage for gas prices. No synthetic or fake data is introduced.

