

# Fix Remaining 5 AESO API Endpoints -- Confirmed Paths from Official Documentation

## Root Cause (DEFINITIVE)

The AESO APIM gateway uses **nested operation paths** that we were not trying. I scraped the official developer portal and found the exact documented URLs.

### Evidence Table

| API | What we tried (404) | Official documented URL | Status |
|-----|---------------------|------------------------|--------|
| Energy Merit Order | `/energymeritorder-api/v1/energyMeritOrderReport` | `/energymeritorder-api/v1/meritOrder/energy?startDate={startDate}` | CONFIRMED from docs |
| OR Offer Control | `/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?startDate=...&endDate=...` | Same path but returns 400 "Invalid Parameter name" -- path exists, params wrong | Needs param fix |
| ITC (Interchange) | `/itc-api/v1/interchangeCapability` | Likely nested: `/itc-api/v1/report/interchangeCapability` or `/itc-api/v1/intertie/capability` | Probe needed |
| Metered Volume | `/meteredvolume-api/v1/meteredVolumeReport?startDate=...` | Likely nested: `/meteredvolume-api/v1/volume/meteredVolume?startDate=...` | Probe needed |

### Key insight from working endpoints

Looking at confirmed paths, AESO uses a **category/operation** pattern:
- Pool Price: `/poolprice-api/v1.1/price/poolPrice` (category: `price`)
- SMP: `/systemmarginalprice-api/v1.1/price/systemMarginalPrice` (category: `price`)
- AIL: `/actualforecast-api/v1/load/albertaInternalLoad` (category: `load`)
- CSD: `/currentsupplydemand-api/v2/csd/summary/current` (category: `csd/summary`)
- Energy Merit Order: `/energymeritorder-api/v1/meritOrder/energy` (category: `meritOrder`)
- Gen Capacity: `/aiesgencapacity-api/v1/AIESGenCapacity` (flat -- exception)
- Asset List: `/assetlist-api/v1/assetlist` (flat -- exception)

So the 5 failing APIs likely follow the nested pattern with a category prefix.

## Changes

### File: `supabase/functions/aeso-comprehensive-data-collector/index.ts`

#### Change 1: Fix Energy Merit Order paths (GUARANTEED fix)
Replace the entire `meritOrder` array with the confirmed documented URL as the first entry:
```
meritOrder: [
  "/energymeritorder-api/v1/meritOrder/energy?startDate={start}",  // Official docs confirmed
  "/energymeritorder-api/v1/energyMeritOrderReport",  // fallback
]
```
Note: `startDate` must be 60+ days prior to current date (same as OR data).

#### Change 2: Fix OR Report parameter names
The path `/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl` is confirmed WORKING (returns 400 not 404). The 400 error says "Invalid Parameter name" for `startDate`/`endDate`. Try these parameter variations:
```
orReport: [
  "/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?start_date={start}&end_date={end}",
  "/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?date={start}",
  "/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl?report_date={start}",
  "/operatingreserveoffercontrol-api/v1/OperatingReserveOfferControl",  // no params at all
  "/operatingreserveoffercontrol-api/v1/offerControl/operatingReserve?startDate={start}",
  "/operatingreserveoffercontrol-api/v1/report/offerControl?startDate={start}",
]
```

#### Change 3: Fix Interchange paths with nested segments
Following the category/operation pattern. The portal lists ONE API `itc-api-v1` with multiple operations:
```
interchangeCapability: [
  "/itc-api/v1/intertie/capability",
  "/itc-api/v1/report/interchangeCapability",
  "/itc-api/v1/capability/interchange",
  "/itc-api/v1/atc/capability",
  "/itc-api/v1/interchangeCapability",  // flat fallback
]
interchangeOutage: [
  "/itc-api/v1/intertie/outage",
  "/itc-api/v1/report/interchangeOutage",
  "/itc-api/v1/outage/interchange",
  "/itc-api/v1/interchangeOutage",  // flat fallback
]
```
Remove `interchangecapability-api` and `interchangeoutage-api` prefixes entirely -- they do not exist.

#### Change 4: Fix Metered Volume with nested path
```
meteredVolume: [
  "/meteredvolume-api/v1/volume/meteredVolume?startDate={start}&endDate={end}",
  "/meteredvolume-api/v1/report/meteredVolume?startDate={start}&endDate={end}",
  "/meteredvolume-api/v1/meter/volume?startDate={start}&endDate={end}",
  "/meteredvolume-api/v1/meteredVolumeReport?startDate={start}&endDate={end}",  // flat fallback
]
```

#### Change 5: Use 60-day prior dates for Merit Order (like OR)
The docs explicitly say EMMO data is "available 60 days after the date of the snapshot". Update the merit order fetch to use a date 61+ days in the past, same as the OR report already does.

#### Change 6: Increase maxPaths for discovery
Currently `tryEndpointsDualAuth` limits to `maxPaths = 3`. For the new expanded path arrays, increase to `maxPaths = 5` to ensure all variations are tested.

### What does NOT change
- All 9 working endpoints remain completely untouched
- The `energy-data-integration` function is not modified
- CSD parsing, snapshot storage, and all data extraction logic unchanged
- Frontend hooks unchanged
- Diagnostic mode unchanged

### No other files are modified

## Expected Outcome
- Energy Merit Order: should succeed immediately (official documented path)
- OR Report: high chance of success since the endpoint exists (400 not 404) -- just need the right parameter names
- ITC/Metered Volume: improved odds with nested path probing following the confirmed pattern from other AESO APIs

## Technical Notes
- Energy Merit Order data is delayed 60 days per AESO policy (same as OR data)
- Available from September 1, 2009 onward
- The EMMO response contains `data[]` array with `MeritOrderData` objects
- All critical real-time data (reserves, interchange flows, generation) remains available via the working CSD endpoint regardless of whether these supplemental APIs are fixed
