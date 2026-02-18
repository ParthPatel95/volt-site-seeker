

# Fix AESO API Calls -- Root Cause Found + Comprehensive Fix

## Research Findings

### Critical Discovery 1: The `gridstatus` Python library (gold-standard AESO integration) NEVER calls the 5 failing APIs
After reading the full 1800-line gridstatus source code, they get ALL their data from just 7 endpoints -- the same 7 we already have working. Reserves, interchange flows, and generation data all come from the CSD endpoint. This is exactly what our `energy-data-integration` function already does.

### Critical Discovery 2: The `aeso-reserves-backfill` function is ALSO broken
I tested it live -- `/operatingreserve-api/v1/orReport` returns 404 too. The 100 reserve records we have came from CSD extraction in `energy-data-integration`, not from the OR API. So the "known working path" was never actually working recently.

### Critical Discovery 3: The AESO lists "Interchange Outage Report" and "Interchange Capability Report" as SEPARATE APIs from "Intertie Public Reports"
The AESO main site lists them separately, suggesting they may have different API IDs than `itc-api`. We have been trying the wrong API prefix.

### Critical Discovery 4: Header mismatch
The gridstatus library uses `Cache-Control: no-cache` header. Our code uses `Accept: application/json` instead. While unlikely to cause 404s, it should match the reference implementation.

### Critical Discovery 5: Dual-auth bug for OR paths
In `tryEndpointsDualAuth`, for paths containing "operatingreserve", `fetchAESO` uses `Ocp-Apim-Subscription-Key` first. When it gets 404, `tryEndpointsDualAuth` explicitly retries with `Ocp-Apim-Subscription-Key` AGAIN (same header). The `API-KEY` header is never tried for OR paths.

## Changes

### File: `supabase/functions/aeso-comprehensive-data-collector/index.ts`

#### Change 1: Fix the dual-auth bug in `tryEndpointsDualAuth`
The function at line 134 always retries with `Ocp-Apim-Subscription-Key` on 404, but for OR paths, `fetchAESO` already used that header. Fix: explicitly try BOTH headers independently regardless of path, using raw fetch calls instead of relying on `fetchAESO`'s auth logic.

#### Change 2: Add `Cache-Control: no-cache` header to match gridstatus
Add this header to all AESO API requests alongside the existing headers. This matches the reference implementation.

#### Change 3: Try BOTH `AESO_API_KEY` and `AESO_SUBSCRIPTION_KEY_PRIMARY` independently
These might be different keys. Currently we pick one and use it everywhere. For failing endpoints, try the OTHER key too.

#### Change 4: Add Interchange Outage/Capability as separate API prefixes
The AESO main site lists these separately. Add paths like:
- `/interchangecapability-api/v1/...` (separate from itc-api)
- `/interchangeoutage-api/v1/...` (separate from itc-api)
Keep the `itc-api` paths as fallbacks.

#### Change 5: Add a `diagnostic` mode
When called with `{ "mode": "diagnostic" }`, run a focused probe of JUST the failing APIs trying:
- Multiple URL prefixes (with and without `/public/`)
- Both API keys independently
- Both auth headers independently  
- GET and POST methods
- Log exact status codes and response bodies
This will definitively identify the correct combination.

#### Change 6: Remove the broken `/operatingreserve-api/v1/orReport` path
This path was confirmed broken (404) in live testing of both the comprehensive collector AND the reserves backfill function. Keep only the `operatingreserveoffercontrol-api` prefix which previously returned 400 (meaning the path exists but parameters were wrong).

### What does NOT change
- All 9 working endpoints remain completely untouched (poolPrice, SMP, AIL, CSD, genCapacity, assetList, loadOutage, poolParticipant, unitCommitment)
- The `energy-data-integration` function is not modified
- The CSD parsing, snapshot storage, and all data extraction logic stays the same
- Frontend hooks unchanged

### No other files modified

## Expected Outcome
- The diagnostic mode will reveal the exact correct combination of URL prefix + auth header + API key for each failing endpoint
- The dual-auth bug fix ensures all header combinations are actually tested
- Even if the 5 APIs remain unreachable, all critical data (reserves, interchange, generation) is already provided by CSD

## Technical Notes
- The CSD endpoint already provides real-time reserves (560 MW spinning confirmed in logs), interchange flows (BC/SK/MT), and generation by fuel type
- The 5 "failing" APIs provide SUPPLEMENTAL data (historical OR offers, merit order stack, metered volumes) that enhance analytics but are not required for core functionality
- AESO may have changed their APIM gateway routing since the portal was last updated

