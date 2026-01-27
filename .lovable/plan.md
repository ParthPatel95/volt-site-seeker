

# Plan: Enhance 12CP & Reserves Feature with Real Demand-Based Data

## Overview

This plan addresses critical issues with the current 12CP feature and adds new capabilities:

1. **Fix core issue**: 12CP is currently based on **price** but should be based on **demand (AIL/MW)**
2. **Use only real data**: All calculations will use actual `aeso_training_data` records (no mock data)
3. **Add historical peak viewer**: See highest demand peaks for 1, 2, or 4-year periods
4. **Correct math formulas**: Implement proper 12CP transmission cost calculation based on AESO methodology

---

## Current Problems Identified

### Problem 1: 12CP Logic Uses Price Instead of Demand
The current `use12CPSavingsAnalytics.ts` hook calculates risk based on **price**:
```text
// WRONG: Risk calculated from price
riskScore = avgPriceAtHour > annualAvgPrice * 1.5 ? 90 : ...
```

12CP should be based on **demand (ail_mw)** because AESO determines the peak hour by finding the hour with the **highest provincial demand**, not highest price.

### Problem 2: Peak Hour Detection Uses Price
Current logic finds the "peak hour" by looking for the hour with the highest average price per month, but 12CP peaks are the hours with highest **demand**.

### Problem 3: Missing Historical Peak Demand Viewer
No ability to view actual historical 12CP peaks across multiple years.

### Problem 4: Incorrect Transmission Cost Formula
Current formula applies transmission cost per MWh across all operating hours. The correct 12CP calculation should be:
- Your share of transmission = (Your load during 12 peaks / Total system peaks) x Transmission revenue requirement

---

## Database Data Available

Verified real data in `aeso_training_data`:
- **Date range**: June 2022 - January 2026 (3.5+ years)
- **Total records with demand**: 33,259 hourly records
- **Key column**: `ail_mw` (Alberta Internal Load - the demand metric)
- **Peak demand recorded**: 12,785 MW (December 2025)

---

## Technical Changes

### 1. Update `use12CPSavingsAnalytics.ts`

**Change peak detection from price-based to demand-based:**

```text
// CURRENT (WRONG): Finding peak hour by price
const hourlyPrices: { [hour: number]: number[] } = {};
rows.forEach(r => {
  hourlyPrices[hour].push(r.pool_price || 0);
});
// Peak hour = hour with highest average PRICE

// NEW (CORRECT): Finding peak hour by demand
const hourlyDemands: { [hour: number]: number[] } = {};
rows.forEach(r => {
  hourlyDemands[hour].push(r.ail_mw || 0);
});
// Peak hour = hour with highest average DEMAND
```

**Update risk scoring to use demand:**

```text
// CURRENT (WRONG): Risk based on price
riskScore = avgPriceAtHour > annualAvgPrice * 1.5 ? 90 : ...

// NEW (CORRECT): Risk based on demand threshold
// System peak threshold ~11,500 MW based on historical data
riskScore = avgDemandAtHour > 11500 ? 90 : avgDemandAtHour > 11000 ? 70 : ...
```

**Add new interface for real 12CP peak data:**

```text
interface Monthly12CPPeak {
  month: string;           // e.g., "2025-12"
  monthLabel: string;      // e.g., "Dec 25"
  peakTimestamp: string;   // ISO timestamp of actual peak
  peakDemandMW: number;    // Actual AIL at peak (e.g., 12785)
  peakHour: number;        // Hour of day (0-23)
  priceAtPeak: number;     // Pool price during the peak hour
  dayOfWeek: string;       // e.g., "Friday"
}
```

### 2. Create New Hook: `useHistorical12CPPeaks.ts`

**Purpose:** Fetch and display the actual 12CP peaks for 1, 2, or 4 year ranges.

**Key functions:**
- `fetchHistoricalPeaks(years: 1 | 2 | 4)`: Query database for monthly peak demand
- `getAnnualPeakSummary(year: number)`: Get all 12 peaks for a specific year
- `calculateHistoricalTrends()`: Analyze peak timing patterns across years

**Database query logic:**
```text
WITH monthly_peaks AS (
  SELECT 
    DATE_TRUNC('month', timestamp) as month,
    timestamp as peak_timestamp,
    ail_mw as peak_demand_mw,
    pool_price as price_at_peak,
    hour_of_day,
    ROW_NUMBER() OVER (
      PARTITION BY DATE_TRUNC('month', timestamp) 
      ORDER BY ail_mw DESC
    ) as rn
  FROM aeso_training_data 
  WHERE ail_mw IS NOT NULL
    AND timestamp >= [start_date]
)
SELECT * FROM monthly_peaks WHERE rn = 1
```

### 3. Update `TwelveCPSavingsSimulator.tsx`

**Changes:**
- Update labels from "Peak Hour Price" to "Peak Hour Demand"
- Show demand in MW units, not price in $/MWh
- Add data source indicator: "Live from AESO Training Data"
- Display date range of data used

**New section: Historical Peak Demand Table**
- Dropdown: "View peaks for: [Last 1 Year] [Last 2 Years] [Last 4 Years]"
- Table columns: Month, Peak Date/Time, Demand (MW), Price at Peak, Hour

### 4. Update `PeakHourRiskAnalysis.tsx`

**Changes:**
- Risk score based on demand percentile, not price
- Show "Avg Demand at Hour" instead of "Avg Price at Peak"
- Update seasonal insights to show demand patterns

**New demand-based risk scoring:**
```text
const getHourlyDemandRisk = (avgDemand: number, maxHistorical: number) => {
  const percentile = avgDemand / maxHistorical;
  if (percentile >= 0.95) return 90;  // Top 5% = Very High
  if (percentile >= 0.90) return 70;  // Top 10% = High
  if (percentile >= 0.80) return 50;  // Top 20% = Moderate
  if (percentile >= 0.70) return 30;  // Top 30% = Low-Moderate
  return 10;                           // Below 70% = Safe
}
```

### 5. Create `HistoricalPeakDemandViewer.tsx` Component

**New component for Peak Hour Risk tab or new sub-tab:**

Features:
- Time range selector: 1 Year | 2 Years | 4 Years
- Table showing each month's peak with:
  - Date/time of peak
  - Demand in MW
  - Pool price during peak
  - Hour of day
  - Comparison to annual average
- Visual chart: Monthly peak demands over time
- Key statistics: Highest peak ever, average peak demand, trend indicator

### 6. Fix Transmission Cost Formula

**Current formula (simplified/incorrect):**
```text
transmissionCost = facilityMW × TRANSMISSION_ADDER × 8760
```

**Corrected formula (per AESO methodology):**
```text
// Your 12CP contribution = Sum of your loads during 12 monthly peaks
// If you avoid ALL peaks, your 12CP contribution = 0
// If you operate at full capacity during all peaks:
//   12CP contribution = facilityMW × 12 (months)
// Your share = 12CP contribution / Total system peaks × ~$2.3B

// Simplified for calculator:
annualTransmissionCost = facilityMW × 1000 × 12 × transmissionRatePerKW
// Where transmissionRatePerKW ≈ $7.11/kW/month for Rate 65

// Alternative (current approach is acceptable for estimation):
// $11.73/MWh × MWh consumed, reduced proportionally by peaks avoided
transmissionSavingsPerPeak = (totalTransmissionCost / 12) × 1  // ~8.33% per peak
```

---

## Files to Create/Modify

### New Files
1. `src/hooks/useHistorical12CPPeaks.ts` - Fetch real historical 12CP peaks
2. `src/components/aeso/HistoricalPeakDemandViewer.tsx` - Historical peak viewer UI

### Modified Files
1. `src/hooks/use12CPSavingsAnalytics.ts` - Fix demand-based logic
2. `src/components/aeso/TwelveCPSavingsSimulator.tsx` - Update labels, add historical viewer
3. `src/components/aeso/PeakHourRiskAnalysis.tsx` - Demand-based risk scoring
4. `src/components/aeso/TwelveCPAnalyticsTab.tsx` - Integrate historical viewer

---

## Data Source Indicators

All components will display clear data source badges:
- "Live from AESO" badge on real-time reserves
- "AESO Historical Data (Jun 2022 - Present)" on historical analysis
- Date range of data used in each calculation
- Record count to show data coverage

---

## UI/UX Changes

### Historical Peak Viewer (New Feature)
```text
┌─────────────────────────────────────────────────────────────────┐
│ 📊 Historical 12CP Peak Demand                                  │
│                                                                 │
│  View Range: [1 Year ▼] [2 Years] [4 Years]                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Month      │ Peak Date/Time      │ Demand   │ Price  │ Hour ││
│  │────────────┼─────────────────────┼──────────┼────────┼──────││
│  │ Dec 2025   │ Dec 12, 2025 02:00  │ 12,785MW │ $44.20 │ 2 AM ││
│  │ Jan 2026   │ Jan 23, 2026 02:00  │ 12,291MW │ $55.80 │ 2 AM ││
│  │ Feb 2025   │ Feb 04, 2025 01:00  │ 12,211MW │ $65.15 │ 1 AM ││
│  │ ...        │ ...                 │ ...      │ ...    │ ...  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Key Statistics:                                                │
│  • All-Time Peak: 12,785 MW (Dec 12, 2025)                     │
│  • Avg Monthly Peak: 11,542 MW                                 │
│  • Most Common Peak Hour: 5-6 PM (Winter), 2-3 PM (Summer)     │
│                                                                 │
│  📈 [View Peak Trend Chart]                                     │
│                                                                 │
│  ⓘ Data: AESO Historical (Jun 2022 - Present) | 33,259 records │
└─────────────────────────────────────────────────────────────────┘
```

---

## Testing Verification

After implementation, verify:
1. Peak hours shown are based on demand, not price
2. All displayed peaks match actual database records
3. No mock/placeholder data in any component
4. Math formulas produce realistic savings estimates
5. Historical viewer correctly shows 1/2/4 year data ranges
6. Data source badges display correctly

---

## Summary of Key Fixes

| Issue | Current | Fixed |
|-------|---------|-------|
| Peak detection | Based on price | Based on demand (ail_mw) |
| Risk scoring | Price thresholds | Demand percentiles |
| Peak hour display | "Peak Hour Price" | "Peak Hour Demand" |
| Units shown | $/MWh only | MW (demand) + $/MWh (price) |
| Historical view | None | 1/2/4 year peak history |
| Data source | Not shown | Clear badges with date ranges |

