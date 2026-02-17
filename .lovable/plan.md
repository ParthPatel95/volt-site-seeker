
# Fix AESO Hub UI Overlapping & UX Issues

## Problem
The TradingViewChart toolbar buttons (zoom controls, time ranges, indicators, oscillators) are overlapping and getting cut off because the new sidebar reduces available horizontal space. The screenshot shows "Indicators" and "Oscillators" text truncating into each other.

## Fix Strategy

### 1. TradingViewChart Toolbar Overflow Fix (`src/components/aeso/TradingViewChart.tsx`)

The toolbar at lines 1026-1438 needs restructuring to prevent overlap:

- **Wrap the toolbar into two rows on medium screens**: Move the left-side controls into a `flex-wrap` container so items flow to a second line when space is tight, instead of overlapping
- **Hide "Indicators" and "Oscillators" text labels at `lg` breakpoint** (instead of only at `xl`): Since the sidebar takes 240px, the `xl:hidden` breakpoint for the "More" dropdown needs to change to `lg:hidden`, and the individual buttons should show at `xl` instead of `lg`
- **Reduce the breakpoint threshold**: Change the desktop-only indicator/oscillator/alert buttons from `hidden xl:flex` to `hidden 2xl:flex`, and change the mobile "More" dropdown from `flex xl:hidden` to `flex 2xl:hidden`. This ensures the combined dropdown is used whenever space is tight
- **Add `flex-wrap` to the main toolbar container** so items can flow to a second row gracefully instead of overlapping
- **Ensure `min-w-0` and `overflow-hidden`** on text containers to prevent text bleed

### 2. LiveConnectionStatus Responsive Fix (`src/components/aeso/LiveConnectionStatus.tsx`)

- Add `flex-wrap` to the main container so on narrow widths the refresh button wraps below instead of overlapping the status text
- Add `min-w-0` to text containers

### 3. MarketDataTab Grid Spacing (`src/components/aeso-hub/tabs/MarketDataTab.tsx`)

- No major issues found; the tab structure looks clean with proper responsive grid classes

### 4. Other Tabs Audit

All other tabs (PowerModel, Generation, Forecast, Predictions, Datacenter, Historical, Analytics Export, Dashboards, Telegram Alerts, Outages) delegate to dedicated components and have proper `space-y-4 sm:space-y-6` wrappers. No overlapping issues found in their tab wrappers.

## Technical Details

### TradingViewChart.tsx Changes (lines 1026-1438)

1. **Line 1027**: Change the toolbar container from `overflow-x-auto scrollbar-hide` to `flex-wrap gap-y-2` so items wrap instead of scroll/overlap

2. **Line 1082-1120 (Zoom controls group)**: Keep as-is, these are compact enough

3. **Line 1144 (Desktop indicators/oscillators)**: Change `hidden xl:flex` to `hidden 2xl:flex` so these individual buttons only show on very wide screens

4. **Line 1267 (Mobile/tablet "More" dropdown)**: Change `flex xl:hidden` to `flex 2xl:hidden` so the combined dropdown is used on all screens except ultra-wide

5. **Line 1032 (OHLC display)**: The OHLC bar already hides on smaller screens (`hidden lg:flex`), which is fine

6. **Line 1122-1141 (Chart type toggle)**: Change `hidden lg:flex` to `hidden xl:flex` to hide earlier and prevent cramping

### LiveConnectionStatus.tsx Changes

- Line 72: Add `flex-wrap` to the outer container
- Ensure gap classes handle wrapping gracefully

### Summary of File Changes

| File | Change |
|------|--------|
| `src/components/aeso/TradingViewChart.tsx` | Adjust breakpoints for toolbar items, add flex-wrap, fix overflow |
| `src/components/aeso/LiveConnectionStatus.tsx` | Add flex-wrap for narrow layouts |

These are targeted CSS/className changes only -- no logic or data flow modifications.
