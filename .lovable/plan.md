
# Plan: Fix 12CP Prediction Engine to Exclude Weekend Events

## Problem Identified

The 12CP prediction engine incorrectly includes **Saturday** as a priority day for peak predictions, even though historical data conclusively shows **zero weekend peaks in the top 50**.

### Verified Historical Day-of-Week Distribution (Top 50 Peaks, MST):
| Day | Peak Count | Percentage |
|-----|------------|------------|
| Thursday | 16 | 32% |
| Friday | 15 | 30% |
| Monday | 8 | 16% |
| Wednesday | 7 | 14% |
| Tuesday | 4 | 8% |
| **Saturday** | **0** | **0%** |
| **Sunday** | **0** | **0%** |

### Issues Found

1. **Wrong priority days in prediction engine**: Line 183 of `12cpPredictionEngine.ts` includes `'Saturday'`:
   ```typescript
   const priorityDays = ['Friday', 'Thursday', 'Saturday']; // BUG: Saturday should not be here
   ```

2. **UTC timezone used in pattern analysis**: The `analyzePeakPatterns()` function uses `new Date()` without MST conversion, corrupting the day-of-week frequency analysis.

3. **UTC data fed to prediction engine**: In `useHistorical12CPPeaks.ts`, the hook passes UTC-based `dayOfWeek` values to the prediction engine instead of MST-corrected values.

---

## Technical Solution

### 1. Update Priority Days (Remove Weekend)

In `src/lib/12cpPredictionEngine.ts`, change priority days to exclude weekends:

```typescript
// Before:
const priorityDays = ['Friday', 'Thursday', 'Saturday'];

// After:
const priorityDays = ['Thursday', 'Friday', 'Monday', 'Wednesday', 'Tuesday'];
```

Order reflects historical frequency: Thu (32%) > Fri (30%) > Mon (16%) > Wed (14%) > Tue (8%).

### 2. Add MST Conversion to Pattern Analysis

Update `analyzePeakPatterns()` to use MST timezone when extracting day-of-week:

```typescript
const parseToMST = (utcTimestamp: string) => {
  const utc = new Date(utcTimestamp);
  const mstMs = utc.getTime() - (7 * 60 * 60 * 1000);
  const mst = new Date(mstMs);
  return {
    dayOfWeek: mst.getUTCDay(),
    month: mst.getUTCMonth() + 1,
    dayOfMonth: mst.getUTCDate(),
    hour: mst.getUTCHours()
  };
};

// In analyzePeakPatterns():
topPeaks.forEach((peak) => {
  const mst = parseToMST(peak.timestamp);
  const dayOfWeek = getDayName(mst.year, mst.month - 1, mst.dayOfMonth);
  // ... use MST-derived values for frequency analysis
});
```

### 3. Update Hook to Pass MST-Corrected Data

In `useHistorical12CPPeaks.ts`, update the data transformation at lines 623-636:

```typescript
const scheduledPeakEvents = generateImprovedPredictions(yearlyTop12Data, topPeaksData.slice(0, 50).map((record: any, index: number) => {
  const mst = parseToMST(record.peak_timestamp); // Use MST
  return {
    rank: index + 1,
    timestamp: record.peak_timestamp,
    demandMW: Math.round(record.peak_demand_mw || 0),
    priceAtPeak: Math.round((record.price_at_peak || 0) * 100) / 100,
    hour: mst.hour,  // MST hour
    dayOfWeek: dayNames[mst.dayOfWeek],  // MST day name
    month: mst.month + 1,
    year: mst.year,
    monthName: monthNames[mst.month]
  };
}));
```

### 4. Update Confidence Scoring

Adjust confidence calculation to penalize weekends (in case any slip through):

```typescript
// In calculateConfidence():
// Add weekend penalty
if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
  base -= 40; // Strong penalty for weekends
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/12cpPredictionEngine.ts` | Remove Saturday from priority days, add MST conversion, add weekend penalty in confidence scoring |
| `src/hooks/useHistorical12CPPeaks.ts` | Pass MST-corrected day-of-week data to prediction engine |

---

## Expected Results After Fix

**Current (Incorrect):**
| Rank | Predicted Date | Day |
|------|----------------|-----|
| #1 | Dec 11, 2026 | Friday |
| #2 | Dec 12, 2026 | **Saturday** ← WRONG |
| #3 | Dec 17, 2026 | Thursday |

**After Fix (Correct):**
| Rank | Predicted Date | Day |
|------|----------------|-----|
| #1 | Dec 10, 2026 | Thursday |
| #2 | Dec 11, 2026 | Friday |
| #3 | Dec 17, 2026 | Thursday |
| #4 | Dec 18, 2026 | Friday |
| ... | ... | (Weekdays only) |

All 12 predicted peaks will fall on weekdays (Thu/Fri/Mon/Wed/Tue), matching the historical pattern where **100% of top peaks occur on weekdays**.

---

## Summary

| Issue | Fix |
|-------|-----|
| Saturday in priority days | Remove, use Thu > Fri > Mon > Wed > Tue |
| UTC timezone in pattern analysis | Add MST conversion utility |
| UTC data passed to predictions | Use MST-corrected values |
| No weekend penalty | Add -40 confidence penalty for weekends |
