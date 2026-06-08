## Goal

Site Intelligence "Power" model becomes a pure Open Infrastructure (OSM / OpenInfraMap) view — internal Supabase transmission/substation tables are not queried or shown. Rebuild the Site Intelligence UI from the ground up into a professional analyst workspace and add new analytical tools that OSM data unlocks.

## 1. Power = Open Infrastructure only

Backend (`supabase/functions/osm-power-infrastructure`)
- Expand the Overpass query to pull everything OSM tags around the point:
  - `power=substation | transformer | switchgear | plant | generator | compensator | converter`
  - `power=line | minor_line | cable` (with `geometry` so we can measure perpendicular distance, not just centroid)
  - `power=tower | pole | portal` (nearest structure)
  - `man_made=tower` filtered to `tower:type=communication` for adjacent telecom (optional toggle)
- For each element, return every meaningful OSM tag verbatim: `name`, `operator`, `owner`, `voltage` (parsed into kV list), `frequency`, `substation` (transmission/distribution/industrial/traction), `location` (overhead/underground), `cables`, `circuits`, `wires`, `start_date`, `ref`, `rating`, `gas_insulated`, `wikidata`, `wikipedia`.
- Compute: distance_km (centroid), nearest-point distance for lines, bearing from site, and a per-feature `source_url` to openstreetmap.org and `openinframap_url` to openinframap.org.
- Add an aggregated `summary`: highest nearby voltage, count by voltage class (≥240 kV, 138–230 kV, 69–138 kV, <69 kV), nearest transmission substation, nearest distribution substation, nearest line of each class, total tagged generation capacity (sum of `generator:output:electricity` where present, with units preserved), and a `data_completeness` score (how many of the top-N features had voltage/operator/name).
- Increase default radius to 8 km, cap 25 km; raise element cap to 500. Keep the multi-endpoint Overpass fallback.
- No invented fields — anything missing returns `null` and renders as "Not tagged in OSM".

Frontend
- Delete the internal-dataset Power section entirely from `SiteReport.tsx` (remove `report.transmission.nearest_lines` / `nearest_substations` rendering). The Power tab renders **only** OSM data.
- Remove the "missing from internal dataset" cross-check (no internal dataset is shown anymore).
- `alberta-site-report` continues to provide the non-power context (climate, seismic, IXPs, population, pipelines, water, logistics). Its `transmission` block is simply ignored by the UI; we won't change the edge function in this pass.

## 2. New analytical tools (all OSM-driven)

Added to the Power tab:
- **Voltage profile chart** — bar chart of feature counts by voltage class with the closest example per class.
- **Distance decay panel** — for each of substations, generation, and lines: nearest, median, and 90th-percentile distance with sparkline.
- **Radial heat dial** — 12-sector compass showing which bearings concentrate transmission assets (helps siting an interconnect route).
- **Interconnect candidate ranker** — scores nearby substations on (a) distance, (b) max voltage, (c) transmission vs distribution, (d) operator known, and lists top 3 with map pins and a "tap point" rationale.
- **Generation neighbors** — table of `power=plant`/`generator` with source (wind/solar/gas/hydro), output, operator, distance.
- **Line crossings within 1 km** — counts and lists overhead vs underground segments and gas-insulated substations (useful for resilience scoring).
- **OSM data quality strip** — per-result completeness percentage + a "View on OpenInfraMap" deep-link button.

## 3. Full UI rebuild

Replace the current `SiteReport.tsx` (a tabbed monolith) with a modular analyst workspace:

```text
src/components/aeso-hub/site-intel/
  SiteWorkspace.tsx            ← new top-level shell
  workspace/
    SiteHeader.tsx             ← address, coords, score chips, export menu
    SiteSidebar.tsx            ← persistent nav (Overview, Power, Connectivity,
                                 Climate & Risk, Logistics, Imagery, Methodology)
    SiteKpiStrip.tsx           ← 6 KPI cards (max kV nearby, nearest sub km,
                                 fiber km, water km, seismic, hyperscaler score)
    panels/
      OverviewPanel.tsx        ← decision summary + mini-map + top risks
      PowerPanel.tsx           ← OSM-only, hosts all new analytical tools
      ConnectivityPanel.tsx    ← IXPs, carrier POPs, fiber
      ClimateRiskPanel.tsx     ← climate normals, seismic, wildfire
      LogisticsPanel.tsx       ← rail, highway, workforce, industrial parks
      ImageryPanel.tsx         ← satellite + AI asset detection
      MethodologyPanel.tsx     ← data sources & timestamps
    charts/VoltageBarChart.tsx, DistanceDecay.tsx, BearingDial.tsx
    InterconnectRanker.tsx
```

Design language
- Persistent left sidebar (collapsible on <1024 px), sticky top header with location + export, main content paginates per panel instead of one long scroll.
- Each panel ≤ one viewport tall on first paint; expandable "show all" inside.
- Cards use the existing institutional palette (deep navy / Bitcoin orange accents) per project memory — no new tokens.
- Recharts for bar/line, a small SVG for the bearing dial, leaflet (already loaded for `AlbertaMap`) for the Power mini-map with substation/line overlays.

`SiteReport.tsx` is replaced by `SiteWorkspace.tsx` in its single import site (`AESOMarketHub` site-intel route). Old file deleted.

## 4. Verification

- Call `osm-power-infrastructure` at `51.024423, -113.144688` and confirm: Namaka Substation present with operator/voltage; voltage profile and bearing dial populate; interconnect ranker returns ≥1 candidate; no internal-dataset rows render anywhere in the Power tab.
- Confirm UI: sidebar nav works, KPI strip renders, each panel scroll-free at 1280×800, PDF export still works (rebuilt against the new structure).

## Technical notes

- Edge function: still public (no JWT), still uses Overpass; concurrent requests rate-limited via 1.5 s cache window keyed by lat/lng/radius (in-memory in the function instance) to be polite.
- `radius_m` becomes a query param controllable from the Power panel (3, 8, 15, 25 km).
- All distance math stays in km, two-decimal precision.
- No DB migrations. No new secrets. APP_VERSION bumped at the end.
