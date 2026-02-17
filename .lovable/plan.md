

# Power Model: AI Intelligence, Cost Analysis & Curtailment -- Complete Redesign

## What's Changing

Three major sections are getting a full visual and analytical overhaul:

1. **AI Cost Intelligence** -- from plain stacked cards to an executive briefing dashboard
2. **Cost Analysis Tab** (Monthly Cost Summary + Charts) -- from basic charts to a rich analytical suite
3. **Curtailment Analysis Tab** -- from separate analytics + log to a unified curtailment command center

---

## Section 1: AI Cost Intelligence Redesign

### Current Problems
- Insight cards are plain left-bordered boxes with tiny text
- All sections look identical regardless of importance
- No visual hierarchy between summary vs details
- Loading state is basic
- No quick-glance takeaways

### New Design

**Executive Summary Hero**: The first parsed section ("Executive Summary") gets promoted to a prominent hero card with a gradient background, larger text, and a key metric callout extracted from the analysis.

**Insight Grid**: Remaining sections render in a 2-column grid (desktop) with distinct visual treatments:
- **Cost Drivers** (amber): Numbered list with impact severity bars
- **Optimization** (green): Checklist-style with estimated savings where mentioned  
- **Risk Factors** (red): Warning-style cards with severity indicators
- **Recommendations** (primary): Full-width banner at the bottom with action items

**Quick Stats Bar**: Above the AI sections, extract and display 3-4 key numbers mentioned in the analysis (e.g., "All-in: 8.8c/kWh", "Margin: 23%", "Peak Month: January") as compact metric pills.

**Loading Animation**: Replace the simple spinner with a multi-step progress indicator showing analysis stages ("Reading cost data...", "Analyzing patterns...", "Generating insights...").

### New Analytics in AI Section
- **Key Finding Highlights**: Parse bold text from AI response and display as standalone callout badges
- **Confidence Indicator**: Show how many months of data the AI analyzed with a quality badge

---

## Section 2: Cost Analysis Tab -- Complete Overhaul

### Current Problems
- Monthly Cost Trend chart is functional but plain
- Pie chart labels overlap on smaller screens
- Curtailment Efficiency chart buried here instead of Curtailment tab
- No profitability heatmap
- No month-over-month delta analysis
- Pool Price Distribution is basic histogram

### New Layout

```
Row 1: Cost Overview KPIs (4 compact cards)
  [Avg Monthly Cost] [Most Expensive Month] [Cheapest Month] [Cost Volatility]

Row 2: Monthly Cost Trend (full width, enhanced)
  - Stacked area chart (not bars) for smoother visual
  - Hover crosshair with full breakdown tooltip
  - Month-over-month % change labels on the total line

Row 3: Two-column grid
  Left: Annual Breakdown Donut (improved)
    - Horizontal legend below instead of label lines
    - Percentage bars next to each component name
    - Center shows total with "CAD / USD" toggle
  Right: Monthly Cost Heatmap (NEW)
    - 12-column grid showing cost intensity by month
    - Color scale from green (low cost) to red (high cost)
    - Shows actual $/MWh value in each cell

Row 4: Pool Price Distribution (enhanced)
  - Color-coded bars: green below breakeven, red above
  - Cumulative % overlay line (duration curve style)
  - Summary: "X% of hours below breakeven"
  - Percentile markers (P50, P75, P90, P99)

Row 5: Profitability Heatmap (NEW) -- only if hosting rate set
  - 24 rows (hours) x 12 columns (months)
  - Cell color: green = profitable hour, red = unprofitable
  - Intensity based on margin magnitude
  - Row/column averages shown as summary bars
  - Identifies optimal operating windows
```

### New Analytics (all from real loaded data)
- **Month-over-Month Deltas**: Calculate % change in total cost between consecutive months with up/down arrows
- **Cost Volatility Score**: Standard deviation of monthly costs divided by mean, displayed as Low/Medium/High
- **Profitability Heatmap**: Using hourly pool prices and hosting rate to calculate profit/loss per hour-of-day per month
- **Price Percentiles**: P50, P75, P90, P95, P99 of pool prices prominently displayed
- **Hours Below Breakeven**: Count and percentage of hours where pool price was below breakeven threshold

---

## Section 3: Curtailment Analysis -- Unified Command Center

### Current Problems
- Shutdown Analytics and Shutdown Log are two separate sub-components
- KPI cards at top are plain and identical
- Charts are all the same visual style (basic bar charts)
- No timeline/calendar visualization
- No "what-if" threshold analysis
- Cumulative savings chart is disconnected from context

### New Unified Layout

```
Row 1: Curtailment Scorecard (redesigned KPIs)
  [Total Saved -- large hero] [Efficiency Score -- $/hr] [Hours Curtailed] [Avg Price Avoided]
  - Hero card for Total Saved with gradient background
  - Efficiency Score shows how effective curtailment is ($/hour)
  - Visual comparison bar: "Curtailed X% of hours, saved Y% of potential cost"

Row 2: Interactive Curtailment Timeline (NEW)
  - Horizontal calendar strip showing each day of the year
  - Color-coded dots: red=12CP, amber=Price, blue=UptimeCap, purple=overlap
  - Hover shows the hours curtailed that day and savings
  - Scroll horizontally through months
  - Identifies clusters and patterns visually

Row 3: Two-column analytics grid
  Left: Shutdown by Hour (enhanced)
    - Radial/clock-face chart showing 24 hours
    - Hour segments colored by curtailment density
    - Peak curtailment hours highlighted
  Right: Monthly Breakdown (enhanced)  
    - Stacked bar with percentage labels
    - Running total savings line overlay

Row 4: Two-column grid
  Left: Price Distribution During Shutdowns (enhanced)
    - Shows where curtailed hours fell on the price spectrum
    - Overlay with "savings captured" area fill
  Right: Cumulative Savings Curve (enhanced)
    - Area chart with gradient fill
    - Monthly savings rate annotation
    - Projected annual savings extrapolation line

Row 5: Optimal Curtailment Threshold Finder (NEW)
  - Line chart: X-axis = price threshold ($/MWh), Y-axis = annual cost at that threshold
  - Marks current breakeven point
  - Shows the mathematically optimal threshold
  - Below: "If you raised/lowered your threshold by $X, you'd save/lose $Y"
  - Calculated from actual hourly data

Row 6: Shutdown Log (collapsible, enhanced)
  - Collapsed by default with summary: "438 curtailed hours across 12 months"
  - Expandable with all existing filters and pagination
  - Enhanced with row highlighting for highest-savings hours
  - Top 10 most valuable curtailed hours highlighted
```

### New Analytics
- **Curtailment Efficiency Score**: Total savings / Total curtailed hours -- measures $/hour effectiveness
- **Curtailment Calendar Timeline**: Visual daily timeline showing when shutdowns occurred
- **Optimal Threshold Finder**: Sweep through price thresholds ($0-$500) and calculate total annual cost at each, find the minimum -- uses all loaded hourly data
- **Top 10 Most Valuable Hours**: Highlight the 10 curtailed hours that saved the most money
- **Curtailment Cluster Detection**: Identify consecutive curtailed hours (events) and their total impact

---

## Technical Implementation

### Files to Modify

| File | Changes |
|---|---|
| `PowerModelAIAnalysis.tsx` | Full rewrite: Executive summary hero card, 2-col insight grid, quick stats extraction, multi-step loading animation, confidence badge |
| `PowerModelCharts.tsx` | Full rewrite: Cost overview KPIs row, stacked area trend, improved donut with horizontal legend, monthly cost heatmap, enhanced price distribution with color-coding and percentiles, profitability heatmap |
| `PowerModelShutdownAnalytics.tsx` | Full rewrite: Hero savings card, curtailment timeline calendar, radial hour chart, optimal threshold finder, collapsible log with top-10 highlights |
| `PowerModelAnalyzer.tsx` | Minor: pass hourlyData and params to ShutdownAnalytics for threshold analysis, merge ShutdownLog into ShutdownAnalytics (remove separate render) |
| `PowerModelShutdownLog.tsx` | No changes to file itself, but it gets rendered INSIDE ShutdownAnalytics as a collapsible section instead of separately in the Analyzer |

### Data Dependencies (all from existing loaded data)

All new analytics use the already-loaded `hourlyData` (HourlyRecord[]), `monthly` (MonthlyResult[]), `shutdownLog` (ShutdownRecord[]), and `annual` (AnnualSummary). No new database queries needed.

**Profitability Heatmap Calculation:**
```typescript
// Group hourly records by month (0-11) and hour (0-23)
// For each cell: avgPoolPrice from those hours
// Profit = hostingRateCAD_per_MWh - avgPoolPrice
// Color intensity = abs(profit) normalized
```

**Optimal Threshold Calculation:**
```typescript
// For thresholds from $0 to $500 in $5 steps:
//   Count hours above threshold (curtailed)
//   Running hours = total - curtailed
//   Energy cost = sum of pool prices for running hours * capacity
//   Add fixed charges (DTS, Fortis) prorated by running hours
//   Plot total cost vs threshold
//   Find minimum
```

**Curtailment Calendar:**
```typescript
// Group shutdownLog by date
// For each date: count hours, sum savings, list reasons
// Render as a horizontal strip of 365 day cells
```

### Responsive Behavior
- All grid layouts collapse to single column on mobile
- Heatmaps become horizontally scrollable on mobile  
- Calendar timeline becomes vertically scrollable on mobile
- Charts reduce to 200px height on small screens
- Collapsible sections start collapsed on mobile

