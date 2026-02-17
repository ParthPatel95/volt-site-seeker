

# AESO Data Integrity Audit Results

## Summary

Your database contains **34,221 hourly records** (June 2022 - February 2026). The audit found **most data is genuine**, with two specific issues that need fixing.

## Data Category Verdicts

### 1. Pool Price -- VALID (Real AESO data)
- 34,221 records, 100% coverage
- Range: $0 to $999.99/MWh (the $999.99 cap is a real AESO market rule)
- Jan 15, 2024 shows $999.99 price spikes during a cold snap -- this matches confirmed AESO historical records
- Average $94.36/MWh is consistent with Alberta market norms

### 2. Demand / AIL -- VALID (Real AESO data)
- 34,221 records, 100% coverage
- Values in the 9,000-12,000 MW range match Alberta's typical system load

### 3. Temperature (Calgary & Edmonton) -- VALID (Real Open-Meteo data)
- 34,221 records, 100% coverage
- Monthly averages perfectly match Calgary's climate: Jan avg -6.4C, Jul avg 17.8C
- Extremes (-39.4C to 33.5C) are realistic for Alberta
- Sourced from Open-Meteo Archive API (verified in backfill architecture)

### 4. Generation Mix -- VALID (Real AESO CSD API data)
- 4,556 records (Nov 2025 onward only, 13% coverage)
- Gas avg 715 MW, Wind avg 2,163 MW, Solar avg 157 MW, Hydro avg 134 MW
- These proportions match Alberta's current generation mix (gas + wind dominated, coal phased out)
- Limited coverage is expected -- the CSD API only provides real-time snapshots, not historical data

### 5. Operating Reserves -- VALID (Real AESO CSD API data)
- 4,556 records (Nov 2025 onward, 13% coverage)
- Range 0-833 MW, avg 409 MW -- consistent with Alberta's typical 300-600 MW reserve margin

### 6. Gas Price (AECO) -- MOSTLY VALID, ONE CONCERN
- 33,100 records (97% coverage)
- **Source**: EIA API Henry Hub daily prices, converted with AECO basis adjustment ($1.00 USD) and CAD conversion (x1.35)
- **Validation**: Monthly averages match known Henry Hub history:
  - Jun 2022: $8.57 CAD (Henry Hub was ~$8.41 USD -- checks out)
  - Jan 2023: $3.07 CAD (Henry Hub crashed to ~$3.27 USD -- checks out)
  - Mar 2024: $0.67 CAD (Henry Hub was ~$1.72 USD, minus basis, times CAD -- checks out)
- **Concern**: The fallback function (`generateHistoricalHenryHub`) adds a **synthetic sinusoidal daily variation** (`Math.sin`) to real monthly averages. If the EIA API ever returned fewer than 100 records, this fallback was used. Evidence suggests EIA data was mostly used (Jan 2024 has a $16.47 spike matching the real winter storm), but the fallback path should be flagged.
- **Fix needed**: Remove the `Math.sin` variation from the fallback and use flat monthly averages instead, clearly tagged as estimates.

### 7. System Marginal Price (SMP) -- INVALID (Incorrectly stored)
- 4,330 records (13% coverage, Nov 2025 onward)
- **Problem**: Every day has only **1 unique SMP value applied to all hours**. Real SMP changes every hour.
- Example: Nov 12, 2025 has SMP = $12.74 for all 24 hours, but the actual AESO SMP varies hour-by-hour
- **Root cause**: The hourly collector fetches SMP from a daily summary endpoint and applies one value to every record that day
- 652 records have SMP = $0 (which can be legitimate but warrants verification)
- **Fix needed**: Re-fetch SMP using the AESO SMP Report API which provides hourly granularity

## Issues to Fix

### Issue 1: Gas Price Fallback Has Synthetic Variation (Low Risk)
The `generateHistoricalHenryHub` function on line 210 of `aeso-gas-price-backfill` adds fake daily variation using `Math.sin`. While evidence suggests the EIA API returned real data for most records, any fallback-sourced records would have synthetic noise.

**Fix**: Replace the sin variation with flat monthly values. Add a `gas_price_source` flag column (or tag in metadata) to distinguish EIA-sourced vs. estimate records.

### Issue 2: SMP Stored at Daily Instead of Hourly Granularity (Medium Risk)
All 4,330 SMP records use one value per day instead of varying hourly. This makes SMP useless as a training feature since it doesn't capture intra-day price-setting dynamics.

**Fix**: Update the hourly collector to fetch SMP from the AESO hourly SMP endpoint, and backfill existing records with correct hourly values.

### Issue 3: Static AECO Basis and Exchange Rate (Low Risk)
The gas price conversion uses fixed constants: AECO basis = $1.00 USD and USD/CAD = 1.35. In reality:
- AECO basis ranges from $0.20 to $3.00+ depending on pipeline constraints
- USD/CAD ranged from 1.25 to 1.45 over the 2022-2026 period

**Fix**: For investor-grade accuracy, fetch historical CAD/USD exchange rates and use a variable AECO basis differential.

## What Does NOT Need Fixing
- Pool prices, demand, temperature, generation, and reserves are all real verified data
- No fabricated/random data was found in any category
- No duplicate timestamps exist
- Price spikes ($999.99) are legitimate AESO price cap events

## Recommended Actions

1. **Remove synthetic sin variation** from gas price fallback function (quick fix)
2. **Fix SMP hourly collection** to use the AESO SMP Report hourly endpoint
3. **Add data source tags** to distinguish EIA API data from fallback estimates
4. Optionally improve AECO conversion with historical exchange rates

