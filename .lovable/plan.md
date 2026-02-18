

# Comprehensive AESO Data Ingestion Plan

## AESO API Inventory

Based on the official AESO API documentation (Azure APIM Gateway at `apimgw.aeso.ca`), here are all available APIs and their current usage status in our platform:

### Currently Used (4 of 13)

| API | Endpoint | What We Fetch |
|-----|----------|---------------|
| Pool Price Report | `/public/poolprice-api/v1.1/price/poolPrice` | Hourly pool prices (real-time + historical backfill) |
| System Marginal Price | `/public/systemmarginalprice-api/v1.1/price/systemMarginalPrice` | SMP values for spread analysis |
| Actual Forecast (AIL) | `/public/actualforecast-api/v1/load/albertaInternalLoad` | Alberta Internal Load (demand) |
| Current Supply Demand (CSD) | `/public/currentsupplydemand-api/v2/csd/summary/current` | Real-time generation mix, reserves, intertie flows |

### NOT Yet Used (9 APIs)

| # | API | Endpoint Pattern | Data Available |
|---|-----|-----------------|----------------|
| 1 | **AIES Gen Capacity** | `/public/generationcapacity-api/...` | Generation capacity by asset, planned/forced outages, maximum capability (MW) |
| 2 | **Load Outage Forecast** | `/public/loadoutage-api/...` | Submitted load outages with start/end dates and MW impact |
| 3 | **Interchange Outage Report** | `/public/interchangeoutage-api/...` | Outages affecting Transfer Capability (TTC) on interties/flowgates |
| 4 | **Interchange Capability Report** | `/public/interchangecapability-api/...` | Intertie capability data (import/export limits for BC, SK, MT) |
| 5 | **Pool Participant API** | `/public/poolparticipant-api/v1/poolparticipantlist` | Full list of pool participants operating in AIES |
| 6 | **Operating Reserve Offer Control** | `/public/operatingreserve-api/...` | OR offer control data, dispatched volumes, prices |
| 7 | **Metered Volume Report** | `/public/meteredvolume-api/...` | AIES metered volumes by asset |
| 8 | **Energy Merit Order** | `/public/energymeritorder-api/...` | Merit order snapshot (price/volume stack) |
| 9 | **Asset List API** | `/public/assetlist-api/...` | All assets connected to AIES with type, fuel, capacity |
| 10 | **Unit Commitment Data** | `/public/unitcommitment-api/v2/...` | Unit commitment directives |

## What Each New API Unlocks

### High Value (should ingest first)
1. **AIES Gen Capacity + Asset List** -- Complete picture of Alberta's generation fleet: outage schedules, available capacity vs installed capacity, asset metadata. Critical for supply-side forecasting and outage risk analysis.
2. **Operating Reserve Offer Control** -- Actual OR dispatch volumes and clearing prices (not just CSD summary). Enables OR revenue modeling in Power Model.
3. **Interchange Capability** -- Import/export limits on each intertie. Combined with existing flow data, enables congestion analysis (how close are flows to limits?).
4. **Energy Merit Order** -- The supply stack snapshot. Shows which generators are marginal and at what price. Essential for price forecasting and market intelligence.

### Medium Value
5. **Metered Volume Report** -- Actual metered generation by asset. Enables asset-level performance tracking and capacity factor analysis.
6. **Load Outage Forecast** -- Upcoming load outages help predict demand changes.
7. **Interchange Outage Report** -- Intertie outages affect import/export capacity and price volatility.

### Lower Priority
8. **Pool Participant List** -- Reference data; already partially fetched in `aeso-advanced-analytics`.
9. **Unit Commitment Data** -- Commitment directives; useful for operational awareness but less analytical value.

## Database Storage Plan

### New Table: `aeso_market_snapshots`

A unified table for periodic snapshots of all AESO API data (fetched every 5-15 minutes for real-time, daily for historical):

```sql
CREATE TABLE aeso_market_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  snapshot_type TEXT NOT NULL, -- 'realtime' or 'historical'
  
  -- Pool Price
  pool_price NUMERIC,
  system_marginal_price NUMERIC,
  
  -- Load
  ail_mw NUMERIC,
  forecast_ail_mw NUMERIC,
  
  -- Generation Capacity & Outages
  total_installed_capacity_mw NUMERIC,
  total_available_capacity_mw NUMERIC,
  total_outage_mw NUMERIC,
  planned_outage_mw NUMERIC,
  forced_outage_mw NUMERIC,
  
  -- Operating Reserves (detailed)
  or_dispatched_mw NUMERIC,
  or_clearing_price NUMERIC,
  or_regulating_mw NUMERIC,
  or_spinning_mw NUMERIC,
  or_supplemental_mw NUMERIC,
  
  -- Interchange
  interchange_bc_flow_mw NUMERIC,
  interchange_sk_flow_mw NUMERIC,
  interchange_mt_flow_mw NUMERIC,
  interchange_bc_capability_mw NUMERIC,
  interchange_sk_capability_mw NUMERIC,
  interchange_mt_capability_mw NUMERIC,
  
  -- Merit Order Summary
  merit_order_depth INTEGER,       -- number of offers in stack
  marginal_fuel_type TEXT,         -- fuel type of marginal unit
  merit_order_snapshot JSONB,      -- compressed stack data
  
  -- Metadata
  data_sources JSONB,              -- which APIs succeeded
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(timestamp, snapshot_type)
);

CREATE INDEX idx_ams_timestamp ON aeso_market_snapshots(timestamp DESC);
CREATE INDEX idx_ams_type_ts ON aeso_market_snapshots(snapshot_type, timestamp DESC);
```

### New Table: `aeso_assets`

Reference table for all AIES-connected assets:

```sql
CREATE TABLE aeso_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id TEXT UNIQUE NOT NULL,
  asset_name TEXT,
  fuel_type TEXT,
  sub_fuel_type TEXT,
  installed_capacity_mw NUMERIC,
  net_to_grid_capacity_mw NUMERIC,
  owner TEXT,
  operating_status TEXT,
  region TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

CREATE INDEX idx_aa_fuel ON aeso_assets(fuel_type);
```

### New Table: `aeso_outages`

Track generation and interchange outages:

```sql
CREATE TABLE aeso_outages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outage_type TEXT NOT NULL,      -- 'generation', 'interchange', 'load'
  asset_id TEXT,
  asset_name TEXT,
  outage_mw NUMERIC,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  reason TEXT,
  status TEXT,                    -- 'planned', 'forced', 'active'
  source_api TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

CREATE INDEX idx_ao_type_time ON aeso_outages(outage_type, start_time DESC);
CREATE INDEX idx_ao_active ON aeso_outages(status) WHERE status = 'active';
```

## Edge Function: `aeso-comprehensive-data-collector`

A single new edge function that fetches ALL AESO APIs and stores results:

### Architecture
- Called on a schedule (every 15 minutes via pg_cron) or manually
- Fetches all 13 AESO API endpoints in parallel with individual timeouts
- Stores snapshot in `aeso_market_snapshots`
- Upserts asset data into `aeso_assets`
- Upserts outage data into `aeso_outages`
- Returns summary of what was fetched successfully

### Endpoint Discovery
The function will first try known endpoint patterns and log the actual available endpoints. Since AESO's APIM portal requires browser authentication to list APIs, we'll use the documented patterns:

```text
Base: https://apimgw.aeso.ca/public/

Pool Price:          poolprice-api/v1.1/price/poolPrice
SMP:                 systemmarginalprice-api/v1.1/price/systemMarginalPrice
Actual Forecast:     actualforecast-api/v1/load/albertaInternalLoad
CSD:                 currentsupplydemand-api/v2/csd/summary/current
Gen Capacity:        generationcapacity-api/v1/capacity  (needs discovery)
Load Outage:         loadoutage-api/v1/outages           (needs discovery)
Interchange Outage:  interchangeoutage-api/v1/outages    (needs discovery)
Interchange Cap:     interchangecapability-api/v1/capability (needs discovery)
Pool Participants:   poolparticipant-api/v1/poolparticipantlist
OR Offer Control:    operatingreserve-api/v1/orReport
Metered Volume:      meteredvolume-api/v1/meteredVolume   (needs discovery)
Energy Merit Order:  energymeritorder-api/v1/meritOrder   (needs discovery)
Asset List:          assetlist-api/v1/assetList            (needs discovery)
```

For undiscovered endpoints, the function will try common path patterns and log responses to help us identify the correct paths.

## Implementation Steps

1. **Create database tables** -- `aeso_market_snapshots`, `aeso_assets`, `aeso_outages` with RLS policies
2. **Build `aeso-comprehensive-data-collector` edge function** -- Parallel fetch of all AESO APIs, parse responses, store in database
3. **Set up pg_cron schedule** -- Run collector every 15 minutes for real-time snapshots
4. **Update `energy-data-integration`** -- Optionally read from `aeso_market_snapshots` for faster responses (database read vs API call)
5. **Add endpoint discovery logging** -- For the 5-6 APIs where we don't yet know the exact path, add probe logic that logs responses to help us refine

## Files Changed

- **New**: `supabase/functions/aeso-comprehensive-data-collector/index.ts` -- The unified collector
- **Modified**: `supabase/functions/energy-data-integration/index.ts` -- Optional: read from DB snapshots as cache layer
- **Database**: 3 new tables via migration

No frontend changes needed initially -- the data will flow into the existing UI through the same hooks once `energy-data-integration` reads from the snapshot table.

