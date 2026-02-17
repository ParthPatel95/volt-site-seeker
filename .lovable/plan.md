

# Fix: Prevent Features From Disappearing During Edits

## Root Cause Analysis

After auditing every line of routing, navigation, and tab rendering, the code is **currently correct**. The recurring disappearance of Inventory and Power Model is caused by **file rewrite truncation** -- when large files are edited, the "keep existing code" shorthand silently drops sections.

The highest-risk file is `AESOMarketComprehensive.tsx` at **848 lines** with 11 conditional tab blocks. When any edit touches this file, tab blocks (like Power Model at line 775) can be accidentally omitted.

## Solution: Decompose the Monolithic File

Split `AESOMarketComprehensive.tsx` into smaller, isolated files so that editing one tab's content **cannot affect another tab**.

### New File Structure

```
src/components/aeso-hub/
  AESOMarketHub.tsx          (~80 lines - shell with nav + tab routing)
  tabs/
    MarketDataTab.tsx         (lines 305-772 extracted)
    PowerModelTab.tsx         (~5 lines - just renders PowerModelAnalyzer)
    TelegramAlertsTab.tsx     (~5 lines - just renders TelegramAlertSettings)
    PredictionsTab.tsx        (extracted)
    DatacenterTab.tsx         (extracted)
    HistoricalTab.tsx         (extracted)
    AnalyticsExportTab.tsx    (extracted)
    GenerationTab.tsx         (extracted)
    ForecastTab.tsx           (extracted)
    OutagesAlertsTab.tsx      (extracted)
    CustomDashboardsTab.tsx   (extracted)
```

### How This Prevents the Bug

1. **Each tab is its own file** -- editing PowerModelChargeBreakdown.tsx can never touch Inventory routes or other tabs
2. **The hub shell is ~80 lines** -- small enough to never need "keep existing code" truncation
3. **VoltScout.tsx routes stay untouched** -- tab decomposition happens inside the AESO hub only
4. **No functional changes** -- exact same UI, just reorganized files

### Technical Details

**Step 1: Create tab wrapper components** (11 new small files)

Each tab file exports a single component that wraps its content. Example for PowerModelTab:

```typescript
// src/components/aeso-hub/tabs/PowerModelTab.tsx
import { PowerModelAnalyzer } from '@/components/aeso/PowerModelAnalyzer';

export function PowerModelTab() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PowerModelAnalyzer />
    </div>
  );
}
```

**Step 2: Create the new hub shell** (`AESOMarketHub.tsx`)

This file contains:
- All the hook calls (useOptimizedDashboard, useAESOEnhancedData, etc.)
- The header and navigation bar
- A simple switch/conditional that renders the active tab component
- Props passed down to tabs that need market data

**Step 3: Update `AESOMarketComprehensive.tsx`**

Replace the 848-line monolith with a re-export from the new hub:

```typescript
// src/components/AESOMarketComprehensive.tsx
export { AESOMarketHub as AESOMarketComprehensive } from './aeso-hub/AESOMarketHub';
```

This keeps all existing imports in VoltScout.tsx and App.tsx working without changes.

### Files to Create
- `src/components/aeso-hub/AESOMarketHub.tsx`
- `src/components/aeso-hub/tabs/MarketDataTab.tsx`
- `src/components/aeso-hub/tabs/PowerModelTab.tsx`
- `src/components/aeso-hub/tabs/TelegramAlertsTab.tsx`
- `src/components/aeso-hub/tabs/PredictionsTab.tsx`
- `src/components/aeso-hub/tabs/DatacenterTab.tsx`
- `src/components/aeso-hub/tabs/HistoricalTab.tsx`
- `src/components/aeso-hub/tabs/AnalyticsExportTab.tsx`
- `src/components/aeso-hub/tabs/GenerationTab.tsx`
- `src/components/aeso-hub/tabs/ForecastTab.tsx`
- `src/components/aeso-hub/tabs/OutagesAlertsTab.tsx`
- `src/components/aeso-hub/tabs/CustomDashboardsTab.tsx`

### Files to Modify
- `src/components/AESOMarketComprehensive.tsx` (replace with re-export)

### Files NOT Modified (preserving stability)
- `src/pages/VoltScout.tsx` -- zero changes, all routes stay intact
- `src/components/Sidebar.tsx` -- zero changes
- `src/components/aeso/PowerModelAnalyzer.tsx` -- zero changes

