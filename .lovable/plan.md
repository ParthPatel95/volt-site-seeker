## Goal
Show a high-resolution satellite image of the looked-up coordinate inside the Site Report, then run an AI pass over the image to detect on-site / nearby assets (substations, transmission lines, gas regulators, water reservoirs, rail spurs, buildings, fiber huts, etc.) — useful as a sanity check against the dataset-driven results.

## What I'll build

### 1. Satellite image card (frontend, in `SiteReport.tsx`)
- New "Aerial Imagery" card above the Connectivity Depth section.
- Three zoom presets: Site (≈18 zoom, ~250 m across), Neighborhood (≈16, ~1 km), Area (≈14, ~4 km).
- Uses Google Maps Static API via existing connector (`GOOGLE_MAPS_API_KEY`).
- 640×640 hybrid (satellite + labels) image, served through a thin Supabase edge function so the key stays server-side.
- Caption shows lat/lng, zoom, capture provider, and a "View in Google Maps" link.

### 2. New edge function `site-satellite-image`
- Input: `{ lat, lng, zoom }`.
- Calls `https://maps.googleapis.com/maps/api/staticmap?...&maptype=hybrid` via the Google Maps connector gateway.
- Returns the PNG bytes (with CORS) so the browser can render `<img src=…>` from an object URL.
- Cheap, no DB writes.

### 3. New edge function `site-asset-vision`
- Input: `{ lat, lng, zoom }` (zoom defaults to 18).
- Fetches the static satellite image as above (server side, no extra round-trip).
- Sends the image to Lovable AI Gateway (`google/gemini-2.5-flash`, vision-capable) with a structured-output prompt asking it to identify visible assets in the frame and return JSON:
  ```
  { detections: [
      { type: 'substation'|'transmission_line'|'gas_regulator'|'water_body'
             |'rail'|'road'|'building'|'solar_array'|'wind_turbine'
             |'fiber_hut'|'cleared_pad'|'other',
        label: string,
        confidence: 'high'|'medium'|'low',
        approx_bearing_deg?: number,
        approx_distance_m?: number,
        notes?: string } ],
    summary: string,
    image_quality: 'good'|'cloudy'|'low_detail' }
  ```
- Returns the detections plus the lat/lng/zoom used.

### 4. Wire into Site Report
- New hook `useSiteSatellite(lat, lng)` and `useSiteAssetVision(lat, lng)` (React Query, cached per coord+zoom).
- New section "Aerial Imagery & AI Asset Scan":
  - Satellite image (zoom toggle).
  - "Run AI scan" button (lazy — don't auto-spend tokens on every report).
  - Detections rendered as a small table: Type · Label · Confidence · Bearing/Distance · Notes.
  - Cross-check block: for each detection of type `substation` / `transmission_line` / `gas_regulator` / `rail`, highlight whether the dataset already lists something within 1 km of the same bearing; if not, show an "⚠ Possibly missing from dataset — review" chip so you can spot gaps like the substation you mentioned.

### 5. Version bump
- `APP_VERSION` → `'2026.06.08.005'`.

## Out of scope
- Persisting detections to a table (kept in-memory / React Query cache for now).
- Polygon/box overlays on the satellite image (Gemini bounding boxes are unreliable at this zoom; we'll show a text list instead).
- Automatic backfill of missing assets into the Alberta reference tables.

## Files
- New: `supabase/functions/site-satellite-image/index.ts`
- New: `supabase/functions/site-asset-vision/index.ts`
- New: `src/hooks/useSiteSatellite.ts`, `src/hooks/useSiteAssetVision.ts`
- Edit: `src/components/aeso-hub/site-intel/SiteReport.tsx` (new card + cross-check)
- Edit: `src/constants/app-version.ts`

Approve and I'll build it.
