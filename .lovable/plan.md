

# Plan: Fix Duplicate Peaks in 12CP Data

## Problem Identified

The database contains **1,688 duplicate hour entries** with **1,711 extra rows**. These are caused by multiple data imports creating separate records for the same hour (timestamps differ by only seconds, e.g., `2026-01-23 02:00:17.52` and `2026-01-23 02:00:19.287`).

**Current incorrect display (2026 top 12):**
| Rank | Date | Hour | Demand |
|------|------|------|--------|
| #1 | Jan 22, 2026 | 2 AM | 12,291 MW |
| #2 | Jan 22, 2026 | 2 AM | 12,291 MW ← DUPLICATE |
| #3 | Jan 22, 2026 | 3 AM | 12,250 MW |

**Should be (verified from database):**
| Rank | Date | Hour | Demand | Price | Day |
|------|------|------|--------|-------|-----|
| #1 | Jan 23, 2026 | 2 AM | 12,291 MW | $55.80 | Friday |
| #2 | Jan 23, 2026 | 3 AM | 12,250 MW | $53.52 | Friday |
| #3 | Jan 24, 2026 | 2 AM | 12,238 MW | $57.61 | Saturday |
| #4 | Jan 6, 2026 | 2 AM | 12,238 MW | $695.34 | Tuesday |
| #5 | Jan 9, 2026 | 2 AM | 12,218 MW | $12.23 | Friday |
| #6 | Jan 23, 2026 | 7 PM | 12,155 MW | $52.38 | Friday |
| #7 | Jan 5, 2026 | 2 AM | 12,153 MW | $76.78 | Monday |
| #8 | Jan 23, 2026 | 4 AM | 12,149 MW | $60.19 | Friday |
| #9 | Jan 23, 2026 | 6 PM | 12,135 MW | $67.32 | Friday |
| #10 | Jan 23, 2026 | 5 PM | 12,129 MW | $99.54 | Friday |
| #11 | Jan 24, 2026 | 12 AM | 12,128 MW | $63.40 | Saturday |
| #12 | Jan 24, 2026 | 1 AM | 12,128 MW | $63.40 | Saturday |

---

## Root Cause

All 4 database functions rank rows using `ROW_NUMBER()` on raw data without first deduplicating by unique hour:

```sql
-- Current (broken): ranks all rows including duplicates
ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM timestamp) ORDER BY ail_mw DESC)
FROM aeso_training_data
```

---

## Solution

Update all 4 database functions to first deduplicate by date+hour, then rank:

```sql
-- Fixed: First dedupe, then rank
WITH deduplicated AS (
  SELECT 
    DATE(timestamp) as date,
    hour_of_day,
    MAX(ail_mw) as ail_mw,
    MAX(pool_price) as pool_price,
    MIN(timestamp) as timestamp
  FROM aeso_training_data
  WHERE ail_mw IS NOT NULL
  GROUP BY DATE(timestamp), hour_of_day
)
SELECT ... FROM deduplicated
ORDER BY ail_mw DESC
```

---

## Technical Changes

### 1. Create New Migration

Update all 4 database functions with deduplication logic:

**Function 1: `get_yearly_top12_peaks()`**
```sql
CREATE OR REPLACE FUNCTION public.get_yearly_top12_peaks()
RETURNS TABLE (...)
AS $$
BEGIN
  RETURN QUERY
  WITH deduplicated AS (
    SELECT 
      EXTRACT(YEAR FROM timestamp)::integer as year,
      DATE(timestamp) as date,
      hour_of_day,
      MAX(ail_mw) as ail_mw,
      MAX(pool_price) as pool_price,
      MIN(timestamp) as timestamp
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM timestamp)::integer, DATE(timestamp), hour_of_day
  ),
  ranked_peaks AS (
    SELECT 
      year as yr,
      timestamp as ts,
      ail_mw,
      pool_price,
      hour_of_day,
      EXTRACT(DOW FROM timestamp)::integer as dow,
      ROW_NUMBER() OVER (PARTITION BY year ORDER BY ail_mw DESC) as rn
    FROM deduplicated
  )
  SELECT yr, rn::integer, ts, ail_mw, pool_price, hour_of_day, dow
  FROM ranked_peaks
  WHERE rn <= 12
  ORDER BY yr DESC, rn ASC;
END;
$$;
```

**Function 2: `get_top_peak_demands()`**
```sql
CREATE OR REPLACE FUNCTION get_top_peak_demands(limit_count integer DEFAULT 50)
RETURNS TABLE (...)
AS $$
BEGIN
  RETURN QUERY
  WITH deduplicated AS (
    SELECT 
      DATE(timestamp) as date,
      hour_of_day,
      MAX(ail_mw) as ail_mw,
      MAX(pool_price) as pool_price,
      MIN(timestamp) as timestamp
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
    GROUP BY DATE(timestamp), hour_of_day
  )
  SELECT timestamp, ail_mw, pool_price, hour_of_day,
         EXTRACT(DOW FROM timestamp)::integer
  FROM deduplicated
  ORDER BY ail_mw DESC NULLS LAST
  LIMIT limit_count;
END;
$$;
```

**Function 3: `get_monthly_peak_demands()`**
```sql
CREATE OR REPLACE FUNCTION get_monthly_peak_demands(...)
-- Add deduplication CTE before ranking by month
```

**Function 4: `get_yearly_peak_demands()`**
```sql
CREATE OR REPLACE FUNCTION get_yearly_peak_demands()
-- Add deduplication CTE before ranking by year
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/[new].sql` | Create migration to update all 4 database functions with deduplication |

---

## Verification After Fix

**2026 Top 12 will show unique peaks:**
- #1: Jan 23, 2026 2 AM - 12,291 MW (Friday)
- #2: Jan 23, 2026 3 AM - 12,250 MW (Friday)
- #3: Jan 24, 2026 2 AM - 12,238 MW (Saturday)
- #4: Jan 6, 2026 2 AM - 12,238 MW (Tuesday)
- #5-12: All unique date+hour combinations

**All-Time Top 12 will show:**
- #1: Dec 12, 2025 2 AM - 12,785 MW (Friday)
- #2: Dec 12, 2025 1 AM - 12,741 MW (Friday)
- #3: Dec 18, 2025 2 AM - 12,737 MW (Thursday)
- ... (all unique)

---

## Summary

| Before | After |
|--------|-------|
| Same hour appears multiple times | Each hour appears once |
| 2026 shows duplicate Jan 23 2AM entries | 2026 shows 12 unique peak hours |
| All-time peaks may have duplicates | All unique date+hour combinations |
| 1,711 extra duplicate rows counted | Proper deduplication in SQL |

