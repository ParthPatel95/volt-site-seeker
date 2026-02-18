

# Analytics Tab UI/UX Cleanup

## Problem

The current Analytics tab is cluttered and confusing:
- 7 sub-tabs wrapping onto two rows on smaller screens
- The "Historical Pricing" tab loads a massive component (`AESOHistoricalPricing` - 2,369 lines) that has its OWN nested tabs (Overview, Uptime Analytics, Curtailment, 12CP & Reserves, Weather, Shared Reports), creating tabs-within-tabs confusion
- No visual grouping or hierarchy - all 7 items feel equally weighted
- The "Custom Dashboards" link and "Data Coverage" collapsible at the bottom add more visual noise

## Solution: Group into 3 Sections with Clear Visual Hierarchy

Replace the 7-tab flat navigation with a **3-category grouped layout** using section cards:

```text
+--------------------------------------------------+
| Analytics                                         |
| Pricing, exploration, strategy, and grid tools    |
+--------------------------------------------------+

| [Pricing & Markets]  [Tools & Exploration]  [Operations] |

--- When "Pricing & Markets" is active: ---
  - Historical Pricing (full AESOHistoricalPricing component)
  - Hourly Price Explorer

--- When "Tools & Exploration" is active: ---
  - Data Explorer
  - Ancillary & Grid

--- When "Operations" is active: ---
  - AESO Programs
  - Strategy Simulator
  - Notifications
```

## Specific Changes

### 1. Restructure `AnalyticsTab.tsx`
- Replace 7-tab `TabsList` with 3 clean category tabs: **Pricing & Markets**, **Tools & Exploration**, **Operations**
- Each category tab renders its child modules directly (no nested tab confusion)
- Within categories that have 2+ modules, use clean card-based sections with headers (not nested tabs)
- Move "Custom Dashboards" link into a subtle button in the header area
- Move "Data Coverage" into a small badge/link rather than a collapsible at the bottom

### 2. Visual Improvements
- Category tabs get icons and clear labels with proper spacing (not cramped `text-xs`)
- Each module within a category is separated by a subtle divider or card boundary
- Consistent section headers: icon + title + description for each module
- Remove the wrapping/overflow issue by having only 3 tabs instead of 7

### 3. Tab Labels and Icons
- **Pricing & Markets** (DollarSign icon): Historical Pricing, Hourly Prices
- **Tools & Exploration** (Search icon): Data Explorer, Ancillary & Grid
- **Operations** (Settings/Zap icon): AESO Programs, Strategy Sim, Notifications

## Technical Details

### File Modified: `src/components/aeso-hub/tabs/AnalyticsTab.tsx`

The component will be rewritten to:
- Use 3 top-level tabs instead of 7
- Render multiple components per tab with section dividers
- Add a collapsible toggle within multi-module tabs so users can expand/collapse individual sections
- Use `text-sm` instead of `text-xs` for tab labels for better readability
- Add a utility row (Custom Dashboards link + Data Coverage badge) in the header

No other files need modification - all child components remain unchanged.

