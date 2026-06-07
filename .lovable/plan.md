## Alberta Site Intelligence — new AESO Market Hub view

Add a comprehensive **"Site Intelligence"** view to the AESO Market Hub that lets clients evaluate any Alberta location across the four infrastructure layers needed for an AI/HPC/mining build: **fiber, transmission, gas & water, and site logistics**. Sourced from a curated dataset + live enrichment.

### What the user gets

Two modes inside one view:

1. **Map Explorer** (Mapbox/Leaflet of Alberta)
   - Toggleable layers: Fiber backbone routes, Carrier POPs, AESO transmission lines (138/240/500 kV), Substations, NGTL gas mainlines + tap stations, Water bodies/rivers, Rail, Highways, Industrial parks, Airports.
   - Click any feature → side panel with full attributes + source citation.
   - Layer legend, basemap toggle (satellite/terrain), distance measurement tool.

2. **Address / Coordinate Lookup → Site Report**
   - Input: address (Google Places autocomplete via existing Google Maps connector) or lat/lng.
   - Output: full **Alberta Site Intelligence Report** with:
     - **Fiber & Network**: nearest carrier POP (Bell, Telus, Shaw/Rogers, Zayo, Beanfield, AXIA), distance, lit/dark availability, estimated latency to YYC, YEG, Seattle, Chicago.
     - **Transmission**: nearest 138/240/500 kV line + substation, owner (AltaLink/ATCO/EPCOR/Fortis), distance, voltage, AESO connection queue status (live from existing `aeso_outages` / outage API where available).
     - **Gas & Water**: nearest NGTL pipeline, tap station distance, nearest major water source, municipal water utility.
     - **Site Logistics**: zoning hint, nearest rail spur, highway, airport, drive time to Calgary/Edmonton, industrial park membership.
     - **Climate**: avg annual temperature, free-cooling hours, wildfire/flood risk flags (Google Weather + Air Quality APIs).
     - **PDF export** of the full report.

### Data strategy (curated + live enrichment)

**Curated (seeded into Supabase)** — verified open datasets:

| Layer | Source |
|---|---|
| AESO transmission lines & substations | AESO Open Data — transmission topology shapefile (re-use existing `substations` table; add `transmission_lines` table) |
| Fiber backbone (long-haul) | CRTC fiber infrastructure dataset + AXIA SuperNet public route map + ISED broadband datasets |
| NGTL pipelines + tap stations | CER (Canada Energy Regulator) Open Data pipeline GIS layer |
| Hydrography (rivers/lakes) | Natural Resources Canada CanVec |
| Rail, highways, industrial parks, airports | OpenStreetMap (extract Alberta clip) |
| Municipal water utilities | Alberta Environment open data |

Seed via a one-time edge function (`alberta-infra-seed`) that downloads each source, clips to Alberta, simplifies geometries, and bulk-inserts into Supabase.

**Live enrichment** (per-lookup, called from the Site Report edge function):
- **Google Maps connector** (already linked) — geocoding, Places, Routes for drive times, Weather + Air Quality.
- **Firecrawl** — carrier coverage page scrape + Lovable AI (Gemini Flash) extraction for "is this address inside carrier X's footprint?" when not in curated POPs.
- **AESO APIM** — pull live outage/queue info for the nearest substation (re-use existing AESO ingestion patterns).

### Backend (new)

1. **Supabase tables** (new, all with proper GRANTs + RLS read-for-authenticated):
   - `alberta_transmission_lines` (geometry, voltage_kv, owner, name, in_service_date)
   - `alberta_fiber_routes` (geometry, carrier, route_type, lit_dark, source)
   - `alberta_carrier_pops` (point, carrier, address, services, latency_to_yyc_ms, latency_to_sea_ms, latency_to_ord_ms)
   - `alberta_gas_pipelines` (geometry, operator, diameter_mm, pressure_kpa)
   - `alberta_gas_taps` (point, operator, capacity)
   - `alberta_water_sources` (geometry, name, type)
   - `alberta_rail` / `alberta_industrial_parks` / `alberta_airports` (geometry/point + attrs)
   - `alberta_site_reports` (cached generated reports keyed by lat/lng hash + user_id; 7-day TTL)
   - Reuse existing `substations` table.
   - PostGIS not enabled — store geometries as **GeoJSON `jsonb`** + precomputed `lat`/`lng` for points; use Haversine in SQL function `nearest_features(lat, lng, layer, limit)`.

2. **Edge functions**:
   - `alberta-infra-seed` — one-time ingestion of curated datasets (admin-only, idempotent).
   - `alberta-site-report` — given `{lat, lng}`: runs nearest-feature queries, calls Google Maps (drive times, weather, air quality), invokes Firecrawl+Gemini for missing carrier coverage, caches result in `alberta_site_reports`, returns full JSON report.

### Frontend (new files under `src/components/aeso-hub/site-intel/`)

- `SiteIntelTab.tsx` — top-level view with toggle between Map / Lookup modes.
- `AlbertaMap.tsx` — Leaflet map (already lightweight; add `leaflet` + `react-leaflet` if not present) with layer toggles fed from Supabase via React Query.
- `LayerToggleSidebar.tsx`, `FeaturePopup.tsx`, `LayerLegend.tsx`.
- `SiteLookupForm.tsx` — Google Places autocomplete (existing browser key) + manual lat/lng.
- `SiteReport.tsx` — sectioned report renderer (Fiber / Transmission / Gas+Water / Logistics / Climate) with source citations + PDF export via existing `jspdf` setup.
- `useAlbertaSiteReport.ts` — React Query hook calling the edge function.

### Hub wiring

- Add `'site-intel'` to `AESOHubView` union in `AESOHubSidebar.tsx`.
- Add label `'Site Intelligence'` + `MapPin`/`Network` icon to sidebar + `VIEW_LABELS`.
- Render `<SiteIntelTab />` in `AESOMarketHub.tsx` switch.

### Out of scope (call out to user before building)

- No write access to AESO connection queue (read-only display of public queue PDF data; flag as "as of latest verified publish date").
- Real-time fiber capacity (carriers don't publish) — we show route presence + carrier names, not Mbps available.
- Crown land availability and detailed zoning require provincial GIS layers that aren't fully open; we'll show the nearest municipality + link to its zoning portal, not parcel-level zoning.

### Memory updates

After build, save:
- `mem://features/aeso-market-hub/site-intelligence` — data sources, schema, edge function flow.
- `mem://constraints/alberta-infra-data-freshness` — quarterly refresh cadence + verified-as-of dates.

### Order of execution

1. Supabase migrations (tables + grants + RLS + nearest-feature SQL function).
2. `alberta-infra-seed` edge function (admin-triggered, populates curated layers).
3. `alberta-site-report` edge function.
4. Frontend: `SiteIntelTab` + map + lookup + report, wired into hub sidebar.
5. Bump `APP_VERSION`. Smoke test in preview.

Ready to switch to build mode when you approve.