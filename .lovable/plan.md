
# AESO Market Hub -- Feature-by-Feature UI/UX Enhancement

## Current Issues Identified

1. **Market Overview is extremely long** -- 12+ sections stacked vertically with no visual hierarchy or grouping
2. **Redundant data display** -- QuickStatsBar, MarketPulse, MarketIntelligencePanel, System Load card, and the Operating Reserve/Interchange/Energy Storage cards all show overlapping data (reserve margin, interties, renewable %, demand)
3. **No section anchoring or quick navigation** -- users must scroll endlessly to reach data
4. **Alerts and Outages panels use hardcoded light-mode colors** (e.g., `bg-red-50`, `bg-yellow-50`) that break in dark mode
5. **Forecast panel has a fixed 400px chart height** -- wastes space on mobile, too short on desktop
6. **Generation Mix bar has no interactive tooltip** -- just a static colored bar
7. **Mining Economics Card** is sandwiched between unrelated sections (Hero cards above, QuickStatsBar below)
8. **PriceTicker** `overflow-x-auto scrollbar-hide` causes content to be hidden on smaller screens without any indication
9. **AnalyticsTab and SettingsTab** are bare-bones with no headers or page context
10. **MarketIntelligencePanel has 5-column TabsList** that cramps on mobile

---

## Enhancement Plan by Section

### 1. Market Overview Tab -- Section Grouping & Deduplication

**Problem**: 12+ loose sections create a wall of cards. QuickStatsBar, MarketPulse, MarketIntelligencePanel, System Load card, and the 3 bottom cards (Reserve/Interchange/Storage) all duplicate the same metrics.

**Fix**: Group into 3 clear zones with section headers, remove redundant components:

```
Zone 1: "Price & Status" (sticky-ish top area)
  - LiveConnectionStatus (compact, single line)
  - PriceTicker (stays as the stock-ticker-style banner)
  - HeroPriceCard + MarketPulse side-by-side (already in grid)

Zone 2: "Market Intelligence"  
  - QuickStatsBar (keep as the single compact stats ribbon)
  - Generation Mix (inline bar -- keep)
  - MiningEconomicsCard (move here, next to gen mix)
  - TradingViewChart (the main analytical chart)

Zone 3: "Grid & Forecasts"
  - MarketIntelligencePanel (the tabbed grid/supply/weather/analytics panel)
  - Wind/Solar Forecast (AESOForecastPanel)
  - Historical Averages
  - Outages (collapsible, stays at bottom)
```

**Remove**: The standalone "System Load & Demand" card (lines 217-269 of MarketDataTab) -- its data is already shown in QuickStatsBar (demand) and MarketPulse (reserve margin). Also remove the 3-column Operating Reserve/Interchange/Energy Storage grid (lines 291-406) -- this data is already in MarketIntelligencePanel's "Interties" and "Grid Health" tabs.

This eliminates ~180 lines of redundant UI and shortens the scroll by ~40%.

### 2. Section Headers with Anchor Navigation

Add lightweight section dividers between the 3 zones:

```tsx
<div className="flex items-center gap-2 pt-4">
  <div className="h-px flex-1 bg-border" />
  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
    Market Intelligence
  </span>
  <div className="h-px flex-1 bg-border" />
</div>
```

This gives users visual landmarks while scrolling.

### 3. PriceTicker -- Mobile Responsiveness

**Problem**: On mobile with sidebar, the H/L/Avg stats and sparkline are hidden (`hidden md:flex`, `hidden sm:block`) but there's no indication more data exists.

**Fix**:
- Keep sparkline hidden on mobile (it's tiny and not useful at that size)
- Move H/L/Avg into a second row on mobile using `flex-wrap`:
  - Line 125: Change container to `flex flex-wrap items-center justify-between gap-2 py-2.5 px-4`
  - Line 178: Change `hidden md:flex` to `flex` and wrap in a `w-full sm:w-auto` container so it appears as a second row on mobile

### 4. Generation Mix -- Add Tooltip on Hover

**Problem**: The stacked bar has no interactivity -- users can't see exact MW values.

**Fix**: Wrap each bar segment in a Tooltip showing "{label}: {value} MW ({pct}%)". Use Radix Tooltip since this is a custom div, not a Recharts chart.

### 5. MiningEconomicsCard -- Dark Mode Fix

**Problem**: Minor -- the card itself is fine, but ensure all sub-badges use `dark:` variants properly.

**Fix**: Already uses `dark:` prefixes correctly. No changes needed.

### 6. MarketIntelligencePanel -- Responsive Tabs

**Problem**: 5-column TabsList (`grid-cols-5`) cramps on mobile especially with sidebar.

**Fix**:
- Change from `grid grid-cols-5` to `flex overflow-x-auto` with `flex-shrink-0` on each trigger
- This allows horizontal scrolling on narrow screens instead of text truncation

### 7. AESOAlertsPanel -- Dark Mode Colors

**Problem**: Uses hardcoded `bg-red-50`, `bg-yellow-50`, `bg-blue-50` (light-only colors).

**Fix**: Add dark mode variants:
- `bg-red-50 dark:bg-red-950/30` 
- `border-l-red-500` stays (works in both modes)
- Alert statistics grid: add `dark:bg-red-950/30`, `dark:text-red-400` etc.

### 8. AESOOutagesPanel -- Dark Mode Colors

**Problem**: Same issue -- `bg-gradient-to-br from-red-50 to-red-100 border-red-200` is light-only.

**Fix**: Add dark variants to all 4 overview cards and the chart cards.

### 9. AESOForecastPanel -- Responsive Chart Height

**Problem**: Fixed `height={400}` on the chart regardless of screen size.

**Fix**: Change to a responsive approach:
- Mobile: `height={250}`
- Desktop: `height={350}`
- Use a simple ternary with `useIsMobile()` or use CSS: wrap in a `h-[250px] sm:h-[350px]` container

### 10. AnalyticsTab -- Add Page Header & Better Layout

**Problem**: Bare wrapper -- no title, no context for the user.

**Fix**: Add a header section:
```tsx
<div className="space-y-1 mb-6">
  <h2 className="text-2xl font-bold">Analytics</h2>
  <p className="text-muted-foreground">Historical pricing, data exports, and custom dashboards</p>
</div>
```

Also improve the "Custom Dashboards" card to be more visually prominent with an icon and better spacing on mobile (stack button below text on small screens).

### 11. SettingsTab -- Add Page Header & Structure

**Problem**: Just renders `<TelegramAlertSettings />` with no context.

**Fix**: Add header and wrap in a max-width container for readability:
```tsx
<div className="space-y-1 mb-6">
  <h2 className="text-2xl font-bold">Settings</h2>
  <p className="text-muted-foreground">Configure alerts and notification preferences</p>
</div>
<div className="max-w-2xl">
  <TelegramAlertSettings />
</div>
```

### 12. PredictionsTab -- Responsive Tab Layout

**Problem**: The 2-column TabsList works but the "Training & Management" text can truncate.

**Fix**: Add `text-xs sm:text-sm` to the tab triggers so text scales down on mobile.

---

## Technical Summary

| File | Changes |
|---|---|
| `src/components/aeso-hub/tabs/MarketDataTab.tsx` | Remove System Load card + Reserve/Interchange/Storage grid (~180 lines). Add section dividers. Reorder: Mining Economics after Gen Mix. Add Tooltip to gen bar segments. |
| `src/components/aeso/PriceTicker.tsx` | Make H/L/Avg visible on mobile as wrapped second row |
| `src/components/aeso/MarketIntelligencePanel.tsx` | Change TabsList from `grid grid-cols-5` to `flex overflow-x-auto` |
| `src/components/intelligence/AESOAlertsPanel.tsx` | Add `dark:` color variants to all hardcoded light-mode backgrounds |
| `src/components/intelligence/AESOOutagesPanel.tsx` | Add `dark:` color variants to all overview cards and chart containers |
| `src/components/intelligence/AESOForecastPanel.tsx` | Responsive chart height (250px mobile, 350px desktop) |
| `src/components/aeso-hub/tabs/AnalyticsTab.tsx` | Add page header, improve dashboard card, responsive button |
| `src/components/aeso-hub/tabs/SettingsTab.tsx` | Add page header, max-width container |
| `src/components/aeso-hub/tabs/PredictionsTab.tsx` | Responsive text sizing on tab triggers |

No new files created. No data logic changes. All changes are CSS/layout/responsiveness only.
