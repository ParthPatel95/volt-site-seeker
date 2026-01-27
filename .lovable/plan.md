
# Plan: Fix Historical 12CP Peak Data - Use Complete Database Records

## Problem Identified

The current implementation only shows **1,000 records** instead of the full **33,263 records** because Supabase JavaScript client has a default row limit of 1,000.

**Current incorrect data showing:**
- All-Time Peak: 11,183 MW (WRONG)
- Winter Avg Peak: 0 MW (WRONG)
- No 2026 data (WRONG)
- Only 1,000 records fetched

**Actual verified data in database:**
| Year | Peak Demand | Peak Date/Time | Day | Price |
|------|-------------|----------------|-----|-------|
| 2025 | **12,785 MW** | Dec 12, 2025 02:00 | Friday | $44.20 |
| 2024 | **12,384 MW** | Jan 12, 2024 00:00 | Friday | $225.27 |
| 2023 | **11,572 MW** | Feb 23, 2023 01:00 | Thursday | $152.48 |
| 2022 | **12,193 MW** | Dec 22, 2022 00:00 | Thursday | $242.81 |
| 2026 (YTD) | **12,291 MW** | Jan 23, 2026 02:00 | Friday | $55.80 |

---

## Solution: Use Database Aggregation Instead of Client-Side Processing

Instead of fetching 33,000+ hourly records and processing client-side (which hits the 1,000 row limit), we will:

1. **Fetch pre-aggregated data using RPC functions or direct SQL-like queries**
2. **Use multiple targeted queries** to get exactly what we need:
   - Monthly peaks (one per month)
   - Yearly peaks (one per year)
   - Top 12 all-time peaks
   - Summary statistics

---

## Technical Changes

### 1. Update `useHistorical12CPPeaks.ts` Hook

**Problem:** Current approach fetches all 33,000+ records:
```typescript
const { data, error } = await supabase
  .from('aeso_training_data')
  .select('timestamp, pool_price, hour_of_day, ail_mw, day_of_week')
  .gte('timestamp', startDate.toISOString())
  // Returns only 1,000 records due to default limit
```

**Solution:** Use multiple targeted queries with proper ordering and limits:

```typescript
// Query 1: Get monthly peaks (aggregated - max 48 rows for 4 years)
// Group by year-month and get max demand record for each

// Query 2: Get top 12 all-time peaks
const { data: top12 } = await supabase
  .from('aeso_training_data')
  .select('timestamp, pool_price, hour_of_day, ail_mw')
  .not('ail_mw', 'is', null)
  .order('ail_mw', { ascending: false })
  .limit(50); // Get top 50, deduplicate for unique hours

// Query 3: Get yearly max peaks (one per year)
// Similar approach with ordering

// Query 4: Get summary stats
const { data: stats } = await supabase
  .from('aeso_training_data')
  .select('ail_mw')
  .not('ail_mw', 'is', null)
  .order('ail_mw', { ascending: false })
  .limit(1); // Just get the max
```

### 2. New Query Strategy

**Approach A: Multiple Targeted Queries**
Instead of one massive query, use several small focused queries:

1. **Top 12 All-Time Peaks Query** (~50 rows, sorted by demand):
```sql
SELECT timestamp, pool_price, hour_of_day, ail_mw
FROM aeso_training_data 
WHERE ail_mw IS NOT NULL
ORDER BY ail_mw DESC
LIMIT 50
```

2. **Monthly Peaks Query** - Fetch one record per month by iterating or using window functions via RPC

3. **Yearly Peaks Query** - Get highest demand per year (~5 rows)

4. **Statistics Query** - Get min, max, counts for winter/summer months

### 3. Add Server-Side Aggregation (Preferred)

Create database function or use existing RPC to aggregate data on the server:

```sql
-- Get monthly peaks (one row per month with highest demand)
WITH monthly_peaks AS (
  SELECT 
    DATE_TRUNC('month', timestamp) as month,
    MAX(ail_mw) as peak_demand,
    (ARRAY_AGG(timestamp ORDER BY ail_mw DESC))[1] as peak_timestamp,
    (ARRAY_AGG(pool_price ORDER BY ail_mw DESC))[1] as price_at_peak,
    (ARRAY_AGG(hour_of_day ORDER BY ail_mw DESC))[1] as peak_hour
  FROM aeso_training_data 
  WHERE ail_mw IS NOT NULL
  GROUP BY DATE_TRUNC('month', timestamp)
)
SELECT * FROM monthly_peaks ORDER BY month DESC
```

This returns ~48 rows (4 years x 12 months) instead of 33,000.

---

## Data Display Improvements

### Yearly Peaks Tab - Show Exact 12CP Data Per Year

For each year (2022, 2023, 2024, 2025, 2026), display:

**2025 - 12 Monthly Peaks:**
| Month | Peak Date/Time | Demand (MW) | Price | Hour |
|-------|---------------|-------------|-------|------|
| December | Dec 12, 02:00 | **12,785** | $44.20 | 2 AM |
| February | Feb 4, 01:00 | 12,211 | $65.15 | 1 AM |
| January | Jan 4, 00:00 | 12,142 | $26.55 | 12 AM |
| August | Aug 27, 23:00 | 12,005 | $16.22 | 11 PM |
| November | Nov 29, 02:00 | 11,973 | $20.46 | 2 AM |
| July | Jul 2, 22:00 | 11,894 | $45.86 | 10 PM |
| ... | ... | ... | ... | ... |

**2024 - 12 Monthly Peaks:**
| Month | Peak Date/Time | Demand (MW) | Price | Hour |
|-------|---------------|-------------|-------|------|
| January | Jan 12, 00:00 | **12,384** | $225.27 | 12 AM |
| December | Dec 19, 00:00 | 12,241 | $39.83 | 12 AM |
| July | Jul 22, 22:00 | 12,221 | $23.22 | 10 PM |
| ... | ... | ... | ... | ... |

### Top 12 All-Time Peaks Tab

Show actual verified peaks:
| Rank | Date/Time | Demand | Price | Day | Hour |
|------|-----------|--------|-------|-----|------|
| #1 | Dec 12, 2025 02:00 | **12,785 MW** | $44.20 | Fri | 2 AM |
| #2 | Dec 12, 2025 01:00 | 12,741 MW | $43.65 | Fri | 1 AM |
| #3 | Dec 18, 2025 02:00 | 12,737 MW | $22.08 | Thu | 2 AM |
| ... | ... | ... | ... | ... | ... |

### Predictions Tab

Use verified historical patterns to predict 2026/2027:
- All top 12 peaks occurred in December
- Peak hours: 0-3 AM (100% of top peaks)
- Days of week: Friday, Saturday, Thursday most common

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useHistorical12CPPeaks.ts` | Refactor to use multiple targeted queries instead of fetching all records |
| `src/components/aeso/HistoricalPeakDemandViewer.tsx` | Add year-by-year 12CP display with all 12 monthly peaks per year |

---

## Summary of Key Fixes

1. **Fix 1,000 record limit** - Use targeted queries with proper limits instead of fetching all data
2. **Show correct all-time peak** - 12,785 MW (not 11,183 MW)
3. **Show 2026 YTD data** - 12,291 MW on Jan 23, 2026
4. **Display yearly 12CP breakdowns** - All 12 monthly peaks for each year
5. **Show winter average correctly** - Calculate from proper dataset
6. **Verify predictions** - Base on actual historical patterns from complete data
