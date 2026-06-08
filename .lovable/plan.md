## What I found

- The satellite image error is likely configuration/code-path related: `site-satellite-image` and `site-asset-vision` call `GOOGLE_MAPS_API_KEY`, but that secret is not present in the project secrets I can see. The current function returns a 500, which the UI displays as “Edge Function returned a non-2xx status code”.
- Nearby substations are currently loaded only from the legacy `substations` table. That table does not contain the visible substation beside `51.024423, -113.144688`, so the report misses it even though it is clearly visible in imagery.
- The Site Intelligence UI is one long report made of stacked sections, so it is hard to compare findings quickly.

## Plan

### 1. Fix satellite imagery and AI scan reliability
- Update `site-satellite-image` and `site-asset-vision` so failures return clear, actionable messages instead of the generic non-2xx error.
- Use the connected Google Maps runtime correctly:
  - If the project has a Google Maps connector secret available, call Static Maps through the connector/gateway pattern.
  - If not, surface a precise “Google Maps credential not available to edge functions” message so the setup issue is obvious.
- Keep the displayed satellite image as real Google imagery only; no placeholder or fake imagery.

### 2. Add Open Infrastructure / OSM-backed substation discovery
- Add a new live lookup path for nearby electrical infrastructure using OpenStreetMap/OpenInfraMap-style data via the Overpass API:
  - `power=substation`
  - `power=transformer`
  - `power=switchgear`
  - nearby `power=line` / `power=minor_line`
- Return real OSM tags where available: name, operator, voltage, substation type, power feature type, distance, coordinates, and source URL.
- Mark these records as `verified` only as “OpenStreetMap/OpenInfraMap tagged feature”, not as engineering-verified capacity.
- Merge this live substation layer into `alberta-site-report` so the Power & Transmission section catches assets like the visible substation beside the provided site.
- Add the Open Infrastructure record count into “Datasets queried” so it is obvious whether that live layer loaded.

### 3. Improve substation detail and honesty
- In Power & Transmission, split substations into:
  - **Dataset substations** from internal/AESO-style records
  - **Open Infrastructure detections** from OSM/OpenInfraMap tags
  - **Aerial AI detections** from satellite scan
- Add a warning when satellite imagery detects a substation but neither the internal dataset nor Open Infrastructure lookup contains one nearby.
- Do not invent capacity, owner, or voltage if OSM does not provide it; show “Not tagged” instead.

### 4. Redesign Site Intelligence from long scroll into an analysis dashboard
- Replace the single long vertical report with a more usable dashboard layout:
  - Sticky top summary with location, overall score, coverage/confidence, export, and key risks.
  - A compact “decision summary” row: Power, Fiber, Cooling/Climate, Water, Risk, Logistics.
  - Tabbed sections instead of endless scrolling:
    - Overview
    - Power
    - Fiber
    - Cooling & Water
    - Logistics & Workforce
    - Risk & Regulatory
    - Imagery & AI Scan
    - Methodology
  - Keep dense tables, but show the most important 3–5 records first with expandable/detail areas where needed.
- Make the imagery/substation area more prominent in the Power and Imagery tabs so visual findings and structured data can be compared quickly.

### 5. Verification
- Test the edge functions directly with the example coordinates `51.024423, -113.144688`.
- Confirm the satellite image loads or shows a precise credential error.
- Confirm Open Infrastructure lookup returns the nearby substation if it is tagged in OSM/OpenInfraMap.
- Confirm no fake substation details are displayed when fields are missing.
- Bump `APP_VERSION` after implementation.