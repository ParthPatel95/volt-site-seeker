

# Fix AESO API Endpoint Paths for Comprehensive Data Collector

## Problem

The `aeso-comprehensive-data-collector` edge function is only hitting 5 of 13 endpoints successfully. The other 8 return 404 because we're guessing wrong URL paths. The official AESO PDF documentation reveals the correct naming convention differs from what we assumed.

## Root Cause

The AESO Azure APIM gateway uses a specific naming pattern that differs from our guesses:
- We tried: `/generationcapacity-api/v1/capacity`
- Actual: `/aiesgencapacity-api/v1/AIESGenCapacity` (confirmed from AESO PDF)

The pattern is: the API name in the URL and the endpoint path use AESO-specific names (like `aiesgencapacity`, `AIESGenCapacity`) rather than generic names.

## Corrected Endpoint Paths

Based on the AESO PDF documentation and confirmed naming conventions:

| API | Our Wrong Path | Corrected Path |
|-----|---------------|----------------|
| Gen Capacity | `/generationcapacity-api/v1/capacity` | `/aiesgencapacity-api/v1/AIESGenCapacity?startDate=&endDate=` |
| Asset List | `/assetlist-api/v1/assetList` | `/assetlist-api/v1/AssetList` (try PascalCase) |
| Merit Order | `/energymeritorder-api/v1/meritOrder` | `/energymeritorder-api/v1/EnergyMeritOrder` |
| OR Report | `/operatingreserve-api/v1/orReport` | `/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?startDate=&endDate=` |
| Interchange Cap | `/interchangecapability-api/v1/capability` | `/interchangecapability-api/v1/InterchangeCapability` |
| Load Outage | `/loadoutage-api/v1/outages` | `/loadoutageforecast-api/v1/LoadOutageForecast` |
| Interchange Outage | `/interchangeoutage-api/v1/outages` | `/interchangeoutage-api/v1/InterchangeOutage` |
| Metered Volume | `/meteredvolume-api/v1/meteredVolume` | `/meteredvolume-api/v1/MeteredVolume?startDate=&endDate=` |
| Unit Commitment | (not tried) | `/unitcommitment-api/v2/UnitCommitment` |

Note: Some of these corrected paths are educated guesses based on the confirmed `aiesgencapacity` pattern. The function will try multiple variations for each and log which ones work.

## Changes

### File Modified: `supabase/functions/aeso-comprehensive-data-collector/index.ts`

1. Update the `ENDPOINTS` discovery arrays with corrected path patterns based on the AESO naming convention
2. Add the Gen Capacity endpoint as a date-parameterized endpoint (it requires `startDate` and `endDate`)
3. Add `unitcommitment` endpoint
4. Fix the SMP debug logging to handle undefined safely (line 180 `.substring()` on undefined)
5. Improve discovery logging to show the full response body snippet for 404s so we can see any hints about correct paths

No database changes needed -- the tables already exist and match the data structure.

