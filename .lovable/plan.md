
# Plan: Add Weather Data to 12CP Events in Yearly Tab

## Overview
Add weather conditions (temperature, wind speed, cloud cover) beside each 12CP peak event in the Yearly tab to enable deeper analysis of the correlation between weather and peak demand.

## Verified Weather Data Available (Sample from Database)

The database already contains weather data for every peak event:

| Date | Hour | Demand | Calgary Temp | Edmonton Temp | Wind | Cloud |
|------|------|--------|--------------|---------------|------|-------|
| Dec 12, 2025 | 2 AM | 12,785 MW | -13.5°C | -19.2°C | 12.5 km/h | 30% |
| Dec 18, 2025 | 2 AM | 12,737 MW | -15.3°C | -28.6°C | 8.3 km/h | 100% |
| Dec 20, 2025 | 2 AM | 12,709 MW | -19.5°C | -28.6°C | 9.2 km/h | 100% |
| Dec 13, 2025 | 2 AM | 12,613 MW | -17.7°C | -30.7°C | 13.7 km/h | 100% |

**Key insight confirmed**: Major peaks correlate with Edmonton temperatures below -19°C

---

## Technical Changes

### 1. Update Database Function

Modify `get_yearly_top12_peaks()` to include weather columns:

```sql
CREATE OR REPLACE FUNCTION public.get_yearly_top12_peaks()
RETURNS TABLE (
  year integer,
  rank integer,
  peak_timestamp timestamp with time zone,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer,
  -- NEW weather columns:
  temp_calgary numeric,
  temp_edmonton numeric,
  wind_speed numeric,
  cloud_cover numeric
)
```

The deduplication CTE will include `MAX()` aggregates for weather columns alongside demand data.

### 2. Update TypeScript Interfaces

Add weather fields to `YearlyTop12Peak` interface in `useHistorical12CPPeaks.ts`:

```typescript
export interface YearlyTop12Peak {
  // ... existing fields
  temperatureCalgary: number | null;
  temperatureEdmonton: number | null;
  windSpeed: number | null;
  cloudCover: number | null;
}
```

### 3. Update Yearly Tab UI

Expand the yearly peaks table to show weather conditions:

```text
+-----------------------------------------------------------------------------------+
| 2025 - Top 12 Peak Demand Hours                                                   |
| Peak Range: 12,613 - 12,785 MW                                                   |
+-----------------------------------------------------------------------------------+
| #  | Date/Time              | Demand    | Price   | Weather Conditions           |
|----|------------------------|-----------|---------|------------------------------|
| 🏆 | Dec 12, 2025 2 AM MST  | 12,785 MW | $44.20  | 🌡️ -13°C/-19°C  💨 13 km/h  |
| #2 | Dec 12, 2025 1 AM MST  | 12,741 MW | $43.65  | 🌡️ -13°C/-19°C  💨 13 km/h  |
| #3 | Dec 18, 2025 2 AM MST  | 12,737 MW | $22.08  | 🌡️ -15°C/-29°C  ☁️ 100%     |
| #4 | Dec 20, 2025 2 AM MST  | 12,709 MW | $39.83  | 🌡️ -20°C/-29°C  ☁️ 100%     |
+-----------------------------------------------------------------------------------+
```

**UI Elements for Weather:**
- Temperature shown as "Calgary/Edmonton" format with snowflake icon for cold
- Wind speed indicator with appropriate icon
- Cloud cover badge (☀️ clear, ⛅ partly cloudy, ☁️ overcast)
- Temperature color coding: blue for cold (<-10°C), purple for extreme cold (<-20°C)

### 4. Add Weather Summary Card Per Year

Include a weather analysis summary in each year accordion:

```text
+----------------------------------------------+
| 2025 Weather Patterns at Peak Demand         |
| Avg Temp: -17°C Calgary / -25°C Edmonton     |
| Cold Events: 11 of 12 peaks below -15°C      |
| Most Extreme: -31°C Edmonton (Dec 13)        |
+----------------------------------------------+
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/[new].sql` | Update `get_yearly_top12_peaks()` to return weather columns |
| `src/integrations/supabase/types.ts` | Update RPC return type |
| `src/hooks/useHistorical12CPPeaks.ts` | Add weather fields to `YearlyTop12Peak` interface, process weather data |
| `src/components/aeso/HistoricalPeakDemandViewer.tsx` | Display weather columns in yearly table, add weather summary section |

---

## Data Flow

```text
Database (aeso_training_data)
    ↓
get_yearly_top12_peaks() RPC (with weather columns)
    ↓
Returns ~60 rows with demand + weather
    ↓
Hook maps to YearlyTop12Peak interface
    ↓
UI displays weather icons/values per peak
```

---

## Visual Design

**Temperature Display:**
- Format: `−13°C / −19°C` (Calgary / Edmonton)
- Color: Blue text for cold, purple for extreme cold
- Icon: ❄️ for temps below -15°C

**Wind Display:**
- Format: `12.5 km/h`
- Icon: 💨 or wind icon from Lucide

**Cloud Cover Display:**
- 0-30%: ☀️ Clear
- 31-70%: ⛅ Partly Cloudy
- 71-100%: ☁️ Overcast

**Table Column Layout:**
| Rank | Date/Time | Demand | Price | Temp (C/E) | Wind | Cloud |
|------|-----------|--------|-------|------------|------|-------|

---

## Summary

| Before | After |
|--------|-------|
| Only demand and price shown | Weather context for each peak |
| No temperature correlation visible | Clear temp-demand relationship shown |
| Missing wind data | Wind speed at each peak visible |
| No weather summary | Year-level weather pattern summary |
