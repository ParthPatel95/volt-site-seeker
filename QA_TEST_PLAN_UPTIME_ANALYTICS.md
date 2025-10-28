# QA Test Plan: Uptime Analytics Time Period Fix

## Issue Summary
The uptime analytics calculations were showing results for only 30 days regardless of the selected analysis period (90, 180, or 365 days).

## Root Cause
The `calculateUptimeOptimization()` function was hardcoded to use either `monthlyData` (30 days) or `yearlyData` (365 days), completely ignoring the custom period data being fetched for 90 and 180 day periods.

## Changes Made

### 1. **Hook Enhancement** (`src/hooks/useAESOHistoricalPricing.tsx`)
- Added `customPeriodData` state variable
- Added `loadingCustomPeriod` loading state
- Added `fetchCustomPeriodData(daysInPeriod)` function to fetch custom date ranges
- Returns custom period data in hook exports

### 2. **Component Updates** (`src/components/aeso/AESOHistoricalPricing.tsx`)
- Import `customPeriodData` and `loadingCustomPeriod` from hook
- Added `useEffect` to fetch custom data when `timePeriod` changes
- Updated `calculateUptimeOptimization()` to prioritize data sources:
  - **30 days**: Use `monthlyData` (pre-loaded)
  - **90/180 days**: Use `customPeriodData` (fetched on demand)
  - **365 days**: Use `yearlyData` (pre-loaded) or `customPeriodData` as fallback
- Added loading indicator on Analysis Period selector
- Added comprehensive QA logging throughout data flow

### 3. **Visual Feedback**
- Loading indicator appears next to "Analysis Period" label while fetching data
- Analysis Period dropdown disabled during data fetch
- Button shows "Loading data..." state

## QA Test Procedure

### Test 1: 30-Day Period (Should Use Pre-Loaded Monthly Data)
1. Navigate to AESO Market Hub > Historical tab > Uptime Analytics
2. Set "Analysis Period" to "Last 30 days"
3. Click "Calculate Uptime Optimized"
4. **Expected Console Output:**
   ```
   [QA] Time period changed to: 30 days
   [QA] Manual "Calculate Uptime Optimized" button clicked
   [QA] Current time period: 30 days
   === UPTIME OPTIMIZATION ANALYSIS (REAL AESO DATA) ===
   Days in period requested: 30
   Using data source: monthlyData (30 days)
   ```
5. **Expected Results:**
   - Total Hours should be ~36 (5% of 720 hours)
   - Downtime percentage should be ~5.0%
   - Calculations based on 30 days (720 hours)

### Test 2: 90-Day Period (Should Fetch Custom Data)
1. Change "Analysis Period" to "Last 90 days"
2. **Watch for:**
   - Loading indicator: "(Loading data...)" appears briefly
   - Dropdown becomes disabled during fetch
3. Wait for data to load (should see toast notification)
4. Click "Calculate Uptime Optimized"
5. **Expected Console Output:**
   ```
   [QA] Time period changed to: 90 days
   Fetching custom period data for 90 days...
   Custom period data loaded: [~2160] data points
   [QA] Manual "Calculate Uptime Optimized" button clicked
   [QA] Current time period: 90 days
   === UPTIME OPTIMIZATION ANALYSIS (REAL AESO DATA) ===
   Days in period requested: 90
   Using data source: customPeriodData (90 days)
   Raw hourly data points available: ~2160
   ```
6. **Expected Results:**
   - Total Hours should be ~108 (5% of 2160 hours)
   - Downtime percentage should be ~5.0%
   - Calculations based on 90 days (2160 hours)

### Test 3: 180-Day Period (Should Fetch Custom Data)
1. Change "Analysis Period" to "Last 180 days"
2. **Watch for:**
   - Loading indicator appears
   - Data fetch notification
3. Wait for data to load
4. Click "Calculate Uptime Optimized"
5. **Expected Console Output:**
   ```
   [QA] Time period changed to: 180 days
   Fetching custom period data for 180 days...
   Custom period data loaded: [~4320] data points
   === UPTIME OPTIMIZATION ANALYSIS (REAL AESO DATA) ===
   Days in period requested: 180
   Using data source: customPeriodData (180 days)
   Raw hourly data points available: ~4320
   ```
6. **Expected Results:**
   - Total Hours should be ~216 (5% of 4320 hours)
   - Downtime percentage should be ~5.0%
   - Calculations based on 180 days (4320 hours)
   - **Energy savings should be ~3x higher than 30-day results**
   - **Shutdown events should be ~3x-6x more than 30-day results**

### Test 4: 365-Day Period (Should Use Yearly Data)
1. Change "Analysis Period" to "Last year"
2. Click "Calculate Uptime Optimized"
3. **Expected Console Output:**
   ```
   === UPTIME OPTIMIZATION ANALYSIS (REAL AESO DATA) ===
   Days in period requested: 365
   Using data source: customPeriodData (365 days)
   Raw hourly data points available: ~8760
   ```
4. **Expected Results:**
   - Total Hours should be ~438 (5% of 8760 hours)
   - Downtime percentage should be ~5.0%
   - Calculations based on 365 days (8760 hours)

### Test 5: Uptime Percentage Change
1. Set to "Last 180 days"
2. Click "Calculate Uptime Optimized" - note the results
3. Change "Target Uptime (%)" from 95 to 90
4. Click "Calculate Uptime Optimized" again
5. **Expected:**
   - Should use same 180-day data (no re-fetch needed)
   - Total Hours should double (~216 → ~432)
   - More shutdown events
   - Higher savings

### Test 6: Auto-Recalculation
1. Set to "Last 90 days" and calculate
2. Change to "Last 180 days"
3. **Expected:**
   - Data loads automatically
   - If analysis was already run, it should auto-update (check console for "[QA] Auto-recalculating")

## Verification Checklist

- [ ] 30-day period shows ~36 shutdown hours (5% of 720)
- [ ] 90-day period shows ~108 shutdown hours (5% of 2160)
- [ ] 180-day period shows ~216 shutdown hours (5% of 4320)
- [ ] 365-day period shows ~438 shutdown hours (5% of 8760)
- [ ] Loading indicator appears when changing periods
- [ ] Console logs show correct data source being used
- [ ] Energy savings scale proportionally with time period
- [ ] Downtime percentage remains consistent (~5% for 95% uptime)
- [ ] Changing uptime % re-calculates without re-fetching data
- [ ] Toast notifications appear on successful data load
- [ ] No console errors during any operations

## Key Metrics to Verify

For **95% uptime target**:

| Period | Expected Total Hours | Expected Data Points | Downtime % |
|--------|---------------------|---------------------|-----------|
| 30 days | ~36 | ~720 | ~5.0% |
| 90 days | ~108 | ~2160 | ~5.0% |
| 180 days | ~216 | ~4320 | ~5.0% |
| 365 days | ~438 | ~8760 | ~5.0% |

## Common Issues to Watch For

1. **Zero hours**: Indicates data not loaded
2. **Same results across periods**: Old bug - not using custom data
3. **Missing loading indicator**: State not updating
4. **Console errors**: API call failures
5. **Incorrect downtime %**: Math calculation error

## Success Criteria

✅ All periods show proportionally scaled results
✅ Loading states work correctly
✅ Console logs confirm correct data source usage
✅ No errors in console
✅ Toast notifications appear
✅ Downtime percentage consistent across all periods
