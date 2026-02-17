

# Plan: Fill Missing AESO Historical Data

## The Problem

Your database has 34,221 hourly records but 3 major data categories are nearly empty for the Jun 2022 - Oct 2025 period (86% of your data):

| Missing Data | Records Missing | Impact |
|---|---|---|
| Generation breakdown (gas, wind, solar, hydro, coal) | 29,665 | Cannot train accurate price models without knowing fuel mix |
| Reserves, intertie flows, outages | 29,665 | Missing grid stress indicators |
| Natural gas price (AECO hub) | 34,221 | Gas price is the #1 driver of Alberta electricity prices |
| System marginal price | 29,891 | Missing key market microstructure signal |

## Data Sources Available

### 1. AESO Historical Generation CSVs (FREE - no API needed)
AESO publishes bulk CSV downloads with hourly metered generation volumes per unit from 2001-2025:
- `Hourly Metered Volumes and Pool Price and AIL - 2020 to 2025`
- `Hourly Metered Volumes and Pool Price and AIL - 2010 to 2019`

These contain per-unit generation which can be aggregated by fuel type (gas, wind, solar, hydro, coal). This fills the **29,665 missing generation records**.

You already have a `GenerationDataUploader` component and `aeso-generation-upload` edge function for this -- we just need to download the CSVs and upload them.

### 2. AESO CSD API (already configured -- real-time only)
The Current Supply Demand API only returns current snapshots, not historical data. This is why generation data only exists from Nov 2025 onward (when the hourly collector started). No fix needed here -- it's working correctly for ongoing collection.

### 3. Natural Gas Prices -- New Scraper Needed
AECO natural gas hub prices are not available from AESO. Sources to scrape/fetch:
- **US EIA API** (you already have `EIA_API_KEY`): Has Henry Hub prices, can proxy for AECO with a basis differential
- **Alberta Gas Reference Price**: Published monthly by the Alberta government
- **NGX/ICE settlement prices**: Requires paid subscription

### 4. AESO System Marginal Price API (already configured)
The SMP Report API endpoint exists at `https://api.aeso.ca/report/v1/smp` -- the backfill function just needs to call it for historical periods.

## Implementation Plan

### Step 1: Build an AESO CSV Backfill Edge Function
Create a new edge function `aeso-generation-csv-backfill` that:
- Fetches the AESO historical generation CSVs from their public data request page (Firecrawl or direct URL)
- Parses the CSV (per-unit hourly generation)
- Aggregates units by fuel type (gas, wind, solar, hydro, coal, other) per hour
- Upserts aggregated totals into `aeso_training_data` matching on timestamp
- Processes in batches to stay within edge function timeout limits

### Step 2: Build a Gas Price Backfill using EIA API
Create `aeso-gas-price-backfill` edge function that:
- Calls EIA API for Henry Hub natural gas daily prices (2022-2026)
- Applies an AECO basis adjustment (typically Henry Hub minus $0.50-1.50 USD)
- Converts to CAD using a historical exchange rate lookup
- Updates `gas_price_aeco` column for all 34,221 records

### Step 3: Build SMP Historical Backfill
Extend the existing `aeso-comprehensive-backfill` function with a new `smp` phase that:
- Calls AESO SMP Report API for each month (Jun 2022 - Oct 2025)
- Extracts hourly system marginal price values
- Updates `system_marginal_price` and `smp_pool_price_spread` columns

### Step 4: Calculate Derived Reserve/Intertie Estimates
For the 29,665 records missing reserves and intertie data, create a calculation step that:
- Estimates operating reserves from the relationship between demand, generation, and price (well-established correlations)
- Marks these as estimated vs. real data with a flag column
- Does NOT fabricate data -- uses statistical relationships from the 4,556 records where we have real reserve data

### Step 5: Add a Data Coverage Dashboard Widget
Add a small status card to the AESO Market Hub showing:
- Total records and date range
- Per-column fill percentage
- One-click buttons to trigger each backfill phase

## Technical Details

### New Files to Create
- `supabase/functions/aeso-generation-csv-backfill/index.ts` -- Fetches and processes AESO historical generation CSVs
- `supabase/functions/aeso-gas-price-backfill/index.ts` -- EIA API gas price fetcher with AECO conversion
- `src/components/aeso/DataCoverageStatus.tsx` -- Dashboard widget showing data gaps

### Files to Modify
- `supabase/functions/aeso-comprehensive-backfill/index.ts` -- Add `smp` phase for System Marginal Price backfill
- `src/components/aeso-hub/tabs/MarketDataTab.tsx` -- Add DataCoverageStatus widget

### Manual Step Required
The AESO historical generation CSVs are large files (potentially 100MB+) hosted on a third-party service. You may need to:
1. Download them manually from `aeso.ca/market/market-and-system-reporting/data-requests/historical-generation-data/`
2. Upload via the existing `GenerationDataUploader` component in the AI Predictions tab

The edge function will attempt automated download first, but if the files are too large, the manual upload path is the fallback.

### Expected Outcome After Completion

| Data Category | Before | After |
|---|---|---|
| Generation | 13% (4,556) | **100%** (34,221) |
| Gas Price | 0% (0) | **100%** (34,221) |
| System Marginal Price | 13% (4,330) | **100%** (34,221) |
| Reserves/Intertie | 13% (4,556) | ~13% real + ~87% estimated |
| **Total usable records** | **~4,500** | **~34,000** |

This 7.5x increase in complete training records should dramatically improve model accuracy.

