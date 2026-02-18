

# Fix Remaining AESO API Endpoints -- Evidence-Based Corrections

## Current Status

Working (9/14): Pool Price, SMP, AIL, CSD, Gen Capacity, Asset List, Pool Participants, Load Outage, Unit Commitment

Failing (5/14): Energy Merit Order, Operating Reserve, Interchange Capability, Interchange Outage, Metered Volume

## Root Cause Analysis

### 1. Operating Reserve -- WRONG API prefix (guaranteed fix)
Our `aeso-reserves-backfill` function ALREADY successfully calls OR data using:
```
/operatingreserve-api/v1/orReport
```
with header `Ocp-Apim-Subscription-Key`. But the comprehensive collector uses the WRONG prefix `operatingreserveoffercontrol-api`. The portal lists `operatingreserveoffercontrol-api-v1` as the API ID, but the actual gateway routes through `operatingreserve-api`.

### 2. Remaining 4 APIs -- Path discovery needed
For Energy Merit Order, ITC (interchange), and Metered Volume, we've tried many path variations and all return `{ "statusCode": 404, "message": "Resource not found" }` from Azure APIM itself. This means the APIM gateway doesn't recognize ANY of our operation name guesses.

The approach: add a comprehensive "probe" mode that tries the base API path (no operation), both auth headers, and many more path patterns including path-based date parameters.

## Changes

### File: `supabase/functions/aeso-comprehensive-data-collector/index.ts`

#### Change 1: Fix OR Report (confirmed fix)
Add the known-working path from `aeso-reserves-backfill` as the FIRST entry in the OR discovery array:
```
orReport: [
  "/operatingreserve-api/v1/orReport?startDate={start}&endDate={end}",  // Known working path
  "/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?...",  // Keep as fallbacks
]
```

#### Change 2: Fix `fetchAESO` to try `Ocp-Apim-Subscription-Key` FIRST for OR-related paths
The `aeso-reserves-backfill` function uses `Ocp-Apim-Subscription-Key` header (not `API-KEY`) and it works. Add logic so paths containing `operatingreserve` use this header first.

#### Change 3: Expand path discovery arrays for remaining 4 APIs
Add many more path variations based on Azure APIM naming conventions:

**Energy Merit Order** (try path-based parameters and more operation names):
```
/energymeritorder-api/v1/                                  // Base path probe
/energymeritorder-api/v1/report
/energymeritorder-api/v1/snapshot
/energymeritorder-api/v1/merit-order
/energymeritorder-api/v1/energymeritorder
```

**Interchange (ITC)** (try date parameters and more operations):
```
/itc-api/v1/                                               // Base path probe
/itc-api/v1/capability
/itc-api/v1/outage
/itc-api/v1/report
/itc-api/v1/InterchangeCapability
/itc-api/v1/InterchangeOutage
```

**Metered Volume** (try path-based dates like other confirmed APIs):
```
/meteredvolume-api/v1/                                     // Base path probe
/meteredvolume-api/v1/report?startDate={start}&endDate={end}
/meteredvolume-api/v1/volume?startDate={start}&endDate={end}
/meteredvolume-api/v1/meteredvolume?startDate={start}&endDate={end}
```

#### Change 4: Improve discovery logging
For any 404 response, also probe the API root path (e.g., `/energymeritorder-api/v1/`) to see if APIM returns a list of available operations or a more helpful error message.

#### Change 5: Try both auth headers for ALL discovery endpoints
Currently we only fallback on 401/403. For discovery probing, try both headers independently and log which one works, since some APIs may only accept one header type.

### What does NOT change
- All 9 working endpoints remain untouched (same paths, same logic)
- The CSD parsing, pool price parsing, AIL parsing unchanged
- The asset list and gen capacity code unchanged
- The snapshot storage logic unchanged
- The `energy-data-integration` function unchanged

### No other files modified

## Expected Outcome
- OR Report should immediately start working (confirmed path from existing codebase)
- For the remaining 4 APIs, expanded probing will discover the correct paths or confirm they need special handling
- Enhanced logging will show exactly what APIM returns for each probe, helping diagnose the remaining issues

## Technical Notes
- The `operatingreserve-api` prefix works in production (proven by `aeso-reserves-backfill`) despite the portal listing it as `operatingreserveoffercontrol-api-v1`
- Azure APIM may have different "API IDs" in the portal vs the actual gateway routing prefix
- Some APIs may require specific date ranges (e.g., OR data has 60-day delay)
- The base path probe (`/api-name/v1/`) may return a Swagger/OpenAPI spec or a list of operations

