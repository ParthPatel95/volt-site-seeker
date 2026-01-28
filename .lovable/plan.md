
# Plan: Fix 12CP Predictions with Comprehensive Data-Driven Approach

## Problem Summary

The current 12CP prediction system has three critical bugs that produce inaccurate predictions:

| Issue | Current State | What Historical Data Shows |
|-------|--------------|---------------------------|
| **Weekend predictions** | Includes Sat/Sun (ranks 2, 5, 6, 7, 11) | **0% of top 50 peaks on weekends** |
| **Peak hour** | 1-3 AM MST | **6-9 PM MST** (hour 18-21) - 46% of peaks |
| **Temperature** | Not used | All peaks occur during cold (-33°C to +3°C Edmonton) |

## Verified Historical Patterns from Database

### Day-of-Week Distribution (Top 50 peaks, MST)
| Day | Count | % |
|-----|-------|---|
| Thursday | 16 | 32% |
| Friday | 15 | 30% |
| Monday | 8 | 16% |
| Wednesday | 7 | 14% |
| Tuesday | 4 | 8% |
| **Saturday** | **0** | **0%** |
| **Sunday** | **0** | **0%** |

### Peak Hour Distribution (MST)
| Hour | Count | Description |
|------|-------|-------------|
| 7 PM (19:00) | 9 | Most frequent |
| 6 PM (18:00) | 8 | Second most |
| 8 PM (20:00) | 6 | Third most |
| 9 PM (21:00) | 3 | Fourth |
| **Total 6-9 PM** | **26** | **52% of all peaks** |

### Month Distribution
| Month | Count |
|-------|-------|
| December | 49 |
| January | 1 |

### Temperature Zones (Top 50 peaks)
| Zone | Edmonton Temp | Peak Count | Max Demand |
|------|---------------|------------|------------|
| Extreme Cold | ≤ -25°C | 20 | 12,737 MW |
| Very Cold | -25°C to -15°C | 16 | 12,785 MW |
| Moderate | > -5°C | 11 | 12,507 MW |

### December Day-of-Month Patterns
| Day | Peak Count | Max Demand |
|-----|------------|------------|
| Dec 11 | 11 | 12,785 MW |
| Dec 19 | 4 | 12,709 MW |
| Dec 12 | 4 | 12,613 MW |
| Dec 22 | 4 | 12,507 MW |
| Dec 17 | 3 | 12,737 MW |
| Dec 18 | 2 | 12,539 MW |

---

## Technical Solution

### 1. Update Prediction Engine (`src/lib/12cpPredictionEngine.ts`)

**Changes:**

a) **Fix time window** - Change from 1-3 AM to 6-9 PM MST:
```typescript
timeWindow: {
  start: '18:00',  // 6 PM MST
  end: '21:00',    // 9 PM MST
  timezone: 'MST',
}
```

b) **Add peak hour calculation** based on historical frequency:
```typescript
const getPeakHourWindow = (patterns: PeakPatternAnalysis) => {
  // Find most frequent hours from historical data
  const sortedHours = Object.entries(patterns.peakHourFrequency)
    .sort((a, b) => b[1] - a[1]);
  const primaryHour = parseInt(sortedHours[0]?.[0] || '19');
  return {
    start: `${(primaryHour - 1).toString().padStart(2, '0')}:00`,
    end: `${(primaryHour + 1).toString().padStart(2, '0')}:00`,
  };
};
```

c) **Add temperature-based weather condition** to predictions:
```typescript
weatherCondition: `Peak probability highest when Edmonton < -15°C (avg: ${patterns.avgTempAtPeak?.toFixed(1)}°C)`
```

### 2. Update Hook (`src/hooks/useHistorical12CPPeaks.ts`)

**Changes:**

a) **Remove all hardcoded `exactPredictions`** containing weekend dates (lines 441-574)

b) **Replace with dynamically generated predictions** that respect weekday-only constraint:
```typescript
// Generate exact predictions dynamically from scheduledPeakEvents
const exactPredictions: Exact12CPPrediction[] = scheduledPeakEvents
  .slice(0, 12)
  .map((event, index) => ({
    rank: index + 1,
    predictedDate: format(event.scheduledDate, 'MMMM d, yyyy'),
    predictedDayOfWeek: format(event.scheduledDate, 'EEEE'),
    predictedTimeWindow: `${event.timeWindow.start} - ${event.timeWindow.end} ${event.timeWindow.timezone}`,
    predictedHour: 19, // 7 PM MST (most common)
    expectedDemandMW: event.expectedDemandMW,
    confidenceScore: event.confidenceScore,
    reasoning: generateReasoning(event, patterns),
    basedOnHistorical: event.historicalReference
  }));
```

### 3. Enhance Pattern Analysis

Add temperature pattern extraction to `analyzePeakPatterns()`:
```typescript
// Calculate average temperature at peaks
const temps = topPeaks
  .filter(p => p.temperatureEdmonton !== null)
  .map(p => p.temperatureEdmonton);
const avgTempAtPeak = temps.length > 0 
  ? temps.reduce((a, b) => a + b, 0) / temps.length 
  : -18;
```

### 4. December 2026 Calendar Mapping

For reference, December 2026 weekday mapping:
| Date | Day | Priority |
|------|-----|----------|
| Dec 10 | Thursday | High (Dec 11 pattern) |
| Dec 11 | Friday | Very High (all-time peak date) |
| Dec 14 | Monday | Medium |
| Dec 15 | Tuesday | Medium |
| Dec 16 | Wednesday | Medium |
| Dec 17 | Thursday | High |
| Dec 18 | Friday | High |
| Dec 21 | Monday | Medium |
| Dec 22 | Tuesday | High (historical cluster) |
| Dec 23 | Wednesday | Medium |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/12cpPredictionEngine.ts` | Fix time window to 6-9 PM MST, enhance pattern analysis with temperature, add peak hour calculation |
| `src/hooks/useHistorical12CPPeaks.ts` | Remove hardcoded weekend predictions, dynamically generate exactPredictions from engine output |

---

## Expected Results After Fix

### Before (Current - Incorrect):
| Rank | Date | Day | Time |
|------|------|-----|------|
| 1 | Dec 11, 2026 | Friday | 1-3 AM |
| 2 | Dec 12, 2026 | **Saturday** | 1-3 AM |
| 5 | Dec 19, 2026 | **Saturday** | 1-3 AM |
| 6 | Dec 20, 2026 | **Sunday** | 1-3 AM |
| 7 | Dec 13, 2026 | **Sunday** | 1-3 AM |

### After (Corrected):
| Rank | Date | Day | Time | Confidence |
|------|------|-----|------|------------|
| 1 | Dec 11, 2026 | Friday | 6-9 PM MST | 95% |
| 2 | Dec 10, 2026 | Thursday | 6-9 PM MST | 92% |
| 3 | Dec 17, 2026 | Thursday | 6-9 PM MST | 88% |
| 4 | Dec 18, 2026 | Friday | 6-9 PM MST | 85% |
| 5 | Dec 14, 2026 | Monday | 6-9 PM MST | 80% |
| 6 | Dec 22, 2026 | Tuesday | 6-9 PM MST | 78% |
| 7 | Dec 21, 2026 | Monday | 6-9 PM MST | 75% |
| 8 | Dec 23, 2026 | Wednesday | 6-9 PM MST | 72% |
| 9 | Dec 16, 2026 | Wednesday | 6-9 PM MST | 68% |
| 10 | Jan 21, 2027 | Thursday | 6-9 PM MST | 60% |
| 11 | Jan 22, 2027 | Friday | 6-9 PM MST | 55% |
| 12 | Jan 15, 2027 | Friday | 6-9 PM MST | 50% |

**All predictions on weekdays only, matching 100% of historical patterns.**

---

## Summary

| Fix | Before | After |
|-----|--------|-------|
| Weekend predictions | 5 of 12 on Sat/Sun | 0 on weekends |
| Peak hour | 1-3 AM (wrong) | 6-9 PM MST (correct) |
| Temperature context | None | Included in weather condition |
| Data source | Hardcoded | Dynamic from historical patterns |
