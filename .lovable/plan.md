

# Fix All AESO API Endpoint Paths -- Comprehensive Research Results

## Root Cause Analysis

After researching the official AESO developer portal at `developer-apim.aeso.ca/product#product=aeso-public-api-product`, I found that **several API names in our code don't match the actual registered API IDs on the portal**. The portal lists exactly 14 APIs, and our function is using wrong base paths and wrong operation names for 7 of them.

## Key Discoveries

### 1. Intertie APIs use `itc-api` (not separate APIs)
The portal lists a single **"Intertie Public Reports - v1"** with API ID `itc-api-v1`. Our code tries `interchangecapability-api` and `interchangeoutage-api` which don't exist. Both interchange capability and outage reports are operations under `itc-api`.

### 2. Unit Commitment uses `unitcommitmentdata-api` (not `unitcommitment-api`)
Portal shows `unitcommitmentdata-api-v2`. We were trying `unitcommitment-api/v1` and `unitcommitment-api/v2`.

### 3. Load Outage operation name is `loadOutageReport` (camelCase)
The official docs show the endpoint as: `/loadoutageforecast-api/v1/loadOutageReport?startDate={startDate}`
We were trying `LoadOutageForecast`, `LoadOutage`, and `outages`.

### 4. Operation names follow camelCase pattern
From the confirmed endpoints, the AESO APIM uses camelCase for operation paths:
- `poolPrice` (confirmed working)
- `systemMarginalPrice` (confirmed working)  
- `albertaInternalLoad` (confirmed working)
- `poolparticipantlist` (confirmed working, lowercase)
- `assetlist` (confirmed working, lowercase)
- `AIESGenCapacity` (confirmed working, PascalCase exception)
- `loadOutageReport` (confirmed from docs)

## Corrected Endpoint Map

| API | Status | Wrong Path We Tried | Correct Path |
|-----|--------|---------------------|--------------|
| Pool Price | WORKING | -- | `/poolprice-api/v1.1/price/poolPrice` |
| SMP | WORKING | -- | `/systemmarginalprice-api/v1.1/price/systemMarginalPrice` |
| AIL | WORKING | -- | `/actualforecast-api/v1/load/albertaInternalLoad` |
| CSD | WORKING | -- | `/currentsupplydemand-api/v2/csd/summary/current` |
| Gen Capacity | WORKING | -- | `/aiesgencapacity-api/v1/AIESGenCapacity` |
| Asset List | WORKING | -- | `/assetlist-api/v1/assetlist` |
| Pool Participants | WORKING | -- | `/poolparticipant-api/v1/poolparticipantlist` |
| Load Outage | FAILING | `LoadOutageForecast` | `/loadoutageforecast-api/v1/loadOutageReport?startDate=...` |
| Energy Merit Order | FAILING | `EnergyMeritOrder` | Try: `/energymeritorder-api/v1/energyMeritOrderReport` and `/energymeritorder-api/v1/energyMeritOrder` |
| OR Offer Control | FAILING | `OperatingReserveOfferControl` | Try: `/operatingreserveoffercontrol-api/v1/operatingReserveOfferControlReport?startDate=...` |
| Metered Volume | FAILING | `MeteredVolume` | Try: `/meteredvolume-api/v1/meteredVolumeReport?startDate=...` |
| Intertie Reports | FAILING | `interchangecapability-api/...` | Try: `/itc-api/v1/interchangeCapability`, `/itc-api/v1/interchangeOutage`, `/itc-api/v1/itcReport` |
| Unit Commitment | FAILING | `unitcommitment-api/v2/...` | Try: `/unitcommitmentdata-api/v2/unitCommitmentData`, `/unitcommitmentdata-api/v2/unitCommitment` |

## Changes

### File: `supabase/functions/aeso-comprehensive-data-collector/index.ts`

**What changes (only the ENDPOINTS object and discovery arrays):**

1. **Load Outage** -- Replace all 3 discovery paths with the confirmed path: `/loadoutageforecast-api/v1/loadOutageReport?startDate={start}&endDate={end}` (requires date params, confirmed from docs)

2. **Energy Merit Order** -- Add camelCase variations: `energyMeritOrderReport`, `energyMeritOrderSnapshot`, keep `EnergyMeritOrder` as fallback

3. **OR Offer Control** -- Add camelCase variations: `operatingReserveOfferControlReport`, `orReport` (this path works in `aeso-reserves-backfill` using `Ocp-Apim-Subscription-Key` header but uses the shorter `operatingreserve-api` prefix)

4. **Intertie Reports** -- Replace both `interchangecapability-api` and `interchangeoutage-api` sections with `itc-api` paths:
   - `/itc-api/v1/interchangeCapability`
   - `/itc-api/v1/interchangeOutage`  
   - `/itc-api/v1/itcReport`
   - `/itc-api/v1/intertieReport`

5. **Metered Volume** -- Add camelCase: `meteredVolumeReport`

6. **Unit Commitment** -- Fix base path from `unitcommitment-api` to `unitcommitmentdata-api`:
   - `/unitcommitmentdata-api/v2/unitCommitmentData`
   - `/unitcommitmentdata-api/v2/unitCommitment`

7. **Auth header** -- The existing `aeso-reserves-backfill` function uses `Ocp-Apim-Subscription-Key` header and the path `/operatingreserve-api/v1/orReport` for OR data. Our collector tries `API-KEY` first then falls back to `Ocp-Apim-Subscription-Key`. Both should work per the official docs, but we should ensure the fallback is actually triggered properly. Currently the fallback only fires on 401 status -- add 403 as a trigger too.

**What does NOT change:**
- All 7 working endpoints remain untouched
- The snapshot storage logic stays the same
- The CSD parsing, pool price parsing, AIL parsing all stay the same
- The asset list and gen capacity code stays the same

### No other files are modified

The `energy-data-integration` function is not changed -- it only uses the 4 confirmed working endpoints (pool price, SMP, AIL, CSD) and will continue to work exactly as before.

## Technical Notes

- The Load Outage API has a `startDate` as a **path template parameter** (required), meaning it must be provided. The docs say dates from 2013-09-22 onward, up to 24 months in the future.
- The AESO APIM may return different response wrapper structures per API. The existing parsing logic with `result.return` and `result.data` fallbacks should handle most cases.
- For any endpoints that still return 404 after this fix, the discovery logging will show the exact error response to help with further debugging.

