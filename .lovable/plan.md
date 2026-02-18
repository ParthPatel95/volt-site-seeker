

# AI Cost Intelligence: Visual & Analytical Upgrade

## Current State

The AI Cost Intelligence section is text-only: it sends Power Model data to Gemini, parses the markdown response, and renders it as styled cards with regex-extracted stat pills. There are zero charts or computed visualizations.

## Upgrade: Add 5 Data-Driven Visual Panels

All visualizations are computed client-side from the `monthly`, `annual`, `params`, and `breakeven` props already available. No new API calls needed.

### 1. Cost Waterfall Chart (Recharts BarChart)
A horizontal waterfall showing how costs build up from Energy -> Operating Reserve -> DTS (Bulk + Regional + POD) -> Fortis -> GST -> Total. Each bar segment shows the absolute dollar value and percentage of total. This gives an instant visual answer to "where is the money going?"

### 2. Monthly Rate Trend with Breakeven Line (ComposedChart)
- Line: monthly all-in rate (cents/kWh) over time
- Area: shaded band between min and max cost months
- ReferenceLine: breakeven price and hosting rate as horizontal markers
- Shows at a glance which months are profitable vs unprofitable

### 3. Cost Component Donut with Drill-Down Stats
A donut chart splitting DTS vs Energy vs Fortis vs GST, with center text showing the all-in rate. Below it, a mini stat grid showing each component's per-kWh contribution (already available from `annual` totals).

### 4. Efficiency Scorecard (Gauge-style visual)
Four horizontal progress bars:
- **Uptime Efficiency**: actual vs target uptime %
- **12CP Avoidance**: estimated DTS savings from 12CP curtailment
- **Price Curtailment ROI**: cost avoided per curtailed hour
- **Rate vs Benchmark**: all-in rate compared to typical Alberta industrial rates (Rate 11 ~6c, Rate 63 ~8c, Rate 65 ~9c)

### 5. Risk Heatmap (Month x Metric)
A small 12-column grid (one per month) with 3 rows (Pool Price Volatility, Cost Intensity, Curtailment Pressure), color-coded green/yellow/red based on thresholds. Provides instant pattern recognition for seasonal risk.

## Layout Change

The current structure:
```
[Header + Regenerate Button]
[Quick Stats Pills]
[Executive Summary Hero]
[2-Column Insight Cards Grid]
[Recommendation Banner]
[Disclaimer]
```

New structure:
```
[Header + Regenerate Button]
[Quick Stats Pills]  
[Cost Waterfall + Monthly Rate Trend]  <-- NEW: 2-column chart row
[Cost Donut + Efficiency Scorecard]    <-- NEW: 2-column visual row
[Risk Heatmap]                         <-- NEW: full-width
[Executive Summary Hero]               <-- existing AI text
[2-Column Insight Cards Grid]          <-- existing AI text
[Recommendation Banner]                <-- existing
[Disclaimer]
```

The visual panels render immediately from data (no AI call needed), while the AI text sections still require the Generate button.

## Technical Details

### File Modified: `src/components/aeso/PowerModelAIAnalysis.tsx`

Changes:
- Add 5 new visual sub-components rendered above the AI text sections
- These use `monthly`, `annual`, `params`, and `breakeven` props (already available)
- Charts use `recharts` (already installed): `BarChart`, `ComposedChart`, `PieChart`, `ResponsiveContainer`
- Efficiency scorecard uses the existing `Progress` UI component
- Risk heatmap is a simple CSS grid with conditional background colors
- All visuals render when `annual` is available (no AI call dependency)
- The AI text sections remain unchanged and still require clicking "Generate"

### Edge Function Modified: `supabase/functions/dashboard-ai-assistant/index.ts`

Enhance the prompt to request more specific, quantitative analysis:
- Add current AESO pool price context (from the monthly data averages)
- Ask AI to reference specific tariff line items and their impact
- Request seasonal pattern analysis tied to the monthly data
- Add a "Benchmark Comparison" section to the prompt requesting comparison against Rate 11, 63, 65 benchmarks with specific numbers

No new files created. No new dependencies.
