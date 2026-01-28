

# Plan: Fix Timezone Display in 12CP Data

## Problem Identified

The 12CP peaks display shows mixed timezone data:
- Dates are converted from UTC to local browser timezone (variable)
- Hours are stored as UTC (showing "1 AM" when actual MST is "6 PM")  
- Day of week comes from UTC date (Saturday for Jan 24 UTC, but Jan 23 MST is Friday)

**Example from screenshot:**
| Displayed | Should Be (MST) |
|-----------|-----------------|
| January 23, 2026 1 AM Sat | January 23, 2026 6 PM Fri |
| January 23, 2026 12 AM Sat | January 23, 2026 5 PM Fri |

## Root Cause

1. Database `hour_of_day` stores UTC hours, not MST hours
2. JavaScript `new Date()` converts to browser local time (inconsistent)
3. Database `day_of_week` is calculated from UTC timestamp

## Solution

### Option A: Display Correction in UI (Recommended)
Convert all times to MST explicitly in the TypeScript code:

```typescript
// In useHistorical12CPPeaks.ts
const getMSTDate = (utcTimestamp: string) => {
  const date = new Date(utcTimestamp);
  // MST is UTC-7 (or UTC-6 during DST)
  const mstOffset = -7 * 60; // minutes
  const localOffset = date.getTimezoneOffset();
  const diffMinutes = mstOffset - (-localOffset);
  return new Date(date.getTime() + diffMinutes * 60 * 1000);
};
```

### Option B: Fix at Database Level
Update the database functions to return MST-converted timestamps and recalculate `day_of_week` based on MST.

---

## Technical Changes

### 1. Update Hook: `useHistorical12CPPeaks.ts`

Add MST timezone conversion utility:

```typescript
// Convert UTC timestamp to MST date components
const parseToMST = (utcTimestamp: string) => {
  const utc = new Date(utcTimestamp);
  // MST = UTC - 7 hours
  const mstMs = utc.getTime() - (7 * 60 * 60 * 1000);
  const mst = new Date(mstMs);
  return {
    date: mst,
    hour: mst.getUTCHours(),
    dayOfWeek: mst.getUTCDay(),
    dayOfMonth: mst.getUTCDate(),
    month: mst.getUTCMonth()
  };
};
```

Update peak processing (line ~319-335):

```typescript
yearlyTop12RawData.forEach((row: any) => {
  const mst = parseToMST(row.peak_timestamp);
  const peak: YearlyTop12Peak = {
    year: row.year,
    rank: row.rank,
    timestamp: row.peak_timestamp,
    demandMW: Math.round(row.peak_demand_mw || 0),
    priceAtPeak: Math.round((row.price_at_peak || 0) * 100) / 100,
    hour: mst.hour,  // Use MST hour
    dayOfWeek: dayNames[mst.dayOfWeek],  // Use MST day
    monthName: fullMonthNames[mst.month],  // Use MST month
    dayOfMonth: mst.dayOfMonth,  // Use MST day of month
    // Weather data...
  };
});
```

### 2. Update Database Functions (Alternative)

If we want consistent server-side conversion:

```sql
-- In get_yearly_top12_peaks()
SELECT 
  EXTRACT(HOUR FROM (timestamp AT TIME ZONE 'America/Edmonton')) as peak_hour,
  EXTRACT(DOW FROM (timestamp AT TIME ZONE 'America/Edmonton')) as day_of_week,
  (timestamp AT TIME ZONE 'America/Edmonton')::date as peak_date
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useHistorical12CPPeaks.ts` | Add MST conversion utility, update all peak processing to use MST dates/hours |
| (Optional) `supabase/migrations/[new].sql` | Update DB functions to return MST-based values |

---

## Expected Result After Fix

| Rank | Date (MST) | Hour (MST) | Day | Demand |
|------|------------|------------|-----|--------|
| #11 | January 23, 2026 | 5 PM | Friday | 12,128 MW |
| #12 | January 23, 2026 | 6 PM | Friday | 12,128 MW |

All times will correctly reflect Mountain Standard Time (Alberta local time), matching how AESO reports data and how grid operators understand peak hours.

---

## Weather Data Status

**CONFIRMED ACCURATE** - The weather data displayed (-5.8°C/-9.3°C Calgary/Edmonton, 9 km/h wind) matches the database records exactly. No changes needed for weather display.

