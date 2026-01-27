
# Plan: Show Top 12 Peaks Per Year in Yearly Tab

## Problem
The current Yearly tab only displays **1 peak per year** (the single highest). The user wants to see the **12 highest demand peaks for each year** - this is the actual 12CP (12 Coincident Peak) methodology used for transmission cost allocation.

## Verified Data Available
Based on the database query, here's what the 12CP looks like for each year:

**2025 - Top 12 Peaks:**
| Rank | Date/Time | Demand | Price |
|------|-----------|--------|-------|
| #1 | Dec 12, 02:00 | 12,785 MW | $44.20 |
| #2 | Dec 12, 02:00 | 12,785 MW | $44.20 |
| #3 | Dec 12, 01:00 | 12,741 MW | $43.65 |
| #4 | Dec 12, 01:00 | 12,741 MW | $43.65 |
| #5 | Dec 18, 02:00 | 12,737 MW | $22.08 |
| ... and 7 more peaks |

**2024 - Top 12 Peaks:**
| Rank | Date/Time | Demand | Price |
|------|-----------|--------|-------|
| #1 | Jan 12, 00:00 | 12,384 MW | $225.27 |
| #2 | Jan 12, 01:00 | 12,259 MW | $320.51 |
| #3 | Dec 19, 00:00 | 12,241 MW | $39.83 |
| #4 | Jul 22, 22:00 | 12,221 MW | $23.22 |
| ... and 8 more peaks |

---

## Technical Changes

### 1. Create New Database Function
Add a new RPC function `get_yearly_top12_peaks` that returns the top 12 peaks per year:

```sql
CREATE OR REPLACE FUNCTION public.get_yearly_top12_peaks()
RETURNS TABLE (
  year integer,
  rank integer,
  peak_timestamp timestamp with time zone,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_peaks AS (
    SELECT 
      EXTRACT(YEAR FROM timestamp)::integer as yr,
      timestamp as ts,
      ail_mw,
      pool_price,
      hour_of_day,
      EXTRACT(DOW FROM timestamp)::integer as dow,
      ROW_NUMBER() OVER (
        PARTITION BY EXTRACT(YEAR FROM timestamp) 
        ORDER BY ail_mw DESC NULLS LAST
      ) as rn
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
  )
  SELECT 
    yr,
    rn::integer,
    ts,
    ail_mw,
    pool_price,
    hour_of_day,
    dow
  FROM ranked_peaks
  WHERE rn <= 12
  ORDER BY yr DESC, rn ASC;
END;
$$;
```

### 2. Update `useHistorical12CPPeaks.ts` Hook

**Add new interface:**
```typescript
export interface YearlyTop12Peak {
  year: number;
  rank: number;
  timestamp: string;
  demandMW: number;
  priceAtPeak: number;
  hour: number;
  dayOfWeek: string;
  monthName: string;
  dayOfMonth: number;
}

// Group by year
export interface YearlyTop12Data {
  year: number;
  peaks: YearlyTop12Peak[];
  yearMaxDemand: number;
  yearMinOf12: number;
}
```

**Update fetch function:**
- Call new RPC `get_yearly_top12_peaks()`
- Group results by year
- Add to `HistoricalPeaksData` interface

### 3. Update `HistoricalPeakDemandViewer.tsx` - Yearly Tab

Replace the current single-row-per-year table with an **expandable year-by-year display**:

```text
+------------------------------------------------------------------+
| 2025 - Top 12 Peak Demand Hours                     [Expand/Collapse]
|   Peak Range: 12,598 MW - 12,785 MW
+------------------------------------------------------------------+
| # | Date/Time            | Demand    | Price     | Hour    | Day |
|---|----------------------|-----------|-----------|---------|-----|
| 1 | Dec 12, 2025 02:00   | 12,785 MW | $44.20    | 2 AM    | Fri |
| 2 | Dec 12, 2025 01:00   | 12,741 MW | $43.65    | 1 AM    | Fri |
| 3 | Dec 18, 2025 02:00   | 12,737 MW | $22.08    | 2 AM    | Thu |
| 4 | Dec 20, 2025 02:00   | 12,709 MW | $39.83    | 2 AM    | Sat |
| 5 | Dec 12, 2025 03:00   | 12,615 MW | $42.95    | 3 AM    | Fri |
| 6 | Dec 13, 2025 02:00   | 12,613 MW | $54.00    | 2 AM    | Sat |
| ... (showing all 12 peaks)
+------------------------------------------------------------------+

| 2024 - Top 12 Peak Demand Hours                     [Expand/Collapse]
|   Peak Range: 12,159 MW - 12,384 MW
+------------------------------------------------------------------+
| ... (12 peaks for 2024)
+------------------------------------------------------------------+

| 2023 - Top 12 Peak Demand Hours                     [Expand/Collapse]
+------------------------------------------------------------------+
| ... (12 peaks for 2023)
+------------------------------------------------------------------+
```

**UI Features:**
- Each year is a collapsible card/accordion section
- Shows the year's peak range (min-max of 12 peaks)
- Full table with all 12 peaks including rank, date/time, demand, price, hour, day
- Color coding: #1 peak highlighted in gold, #2-3 in silver/bronze
- Year-over-year comparison section showing how 12CP evolved

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/[new].sql` | Add `get_yearly_top12_peaks()` function |
| `src/integrations/supabase/types.ts` | Add RPC type definition |
| `src/hooks/useHistorical12CPPeaks.ts` | Add `YearlyTop12Peak` interface, call new RPC, process data |
| `src/components/aeso/HistoricalPeakDemandViewer.tsx` | Replace Yearly tab with expandable 12-peak-per-year display |

---

## Data Flow

```text
Database (33,000+ records)
    ↓
get_yearly_top12_peaks() RPC
    ↓
Returns ~60 rows (12 peaks × 5 years)
    ↓
Hook groups by year
    ↓
UI displays expandable year sections
    with all 12 peaks per year
```

---

## Summary

| Current | After Fix |
|---------|-----------|
| 1 peak per year | 12 peaks per year |
| Single row table | Expandable year sections |
| No peak ranking | Ranked #1-12 with color coding |
| Missing context | Shows peak range, patterns per year |
