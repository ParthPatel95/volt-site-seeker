## Goal

Two things the user asked for:

1. **Data accuracy + visible sourcing** — every datapoint in the report should carry a citation (URL + publisher + as-of date) and a confidence tier (Verified / Modeled / Estimated). Today the curated tables have a `source_url` column but it's only surfaced for POPs; transmission, gas, water, parks have no visible attribution.
2. **Hyperscaler / AI-HPC grade depth** — add the sections an AWS / Microsoft / Meta / CoreWeave / xAI siting team actually asks for.

## Part 1 — Verify & cite every row

### Curated-data cleanup
- Re-seed `alberta_transmission_lines`, `alberta_gas_pipelines`, `alberta_water_sources`, `alberta_industrial_parks`, `alberta_carrier_pops`, `alberta_fiber_routes` against **primary public sources**:
  - **Transmission** — AESO ISO Tariff Appendix + AESO interactive transmission map (https://www.aeso.ca/grid/projects/) → owner (AltaLink / ATCO / ENMAX / EPCOR / city utilities), kV class, in-service year.
  - **Substations** — AESO substation registry + utility owner's GIS layer; record MVA rating where published.
  - **Gas pipelines** — CER pipeline data portal (https://www.cer-rec.gc.ca/en/data-analysis/) + Alberta Energy Regulator Pipeline Map → NPS, MOP, commodity, operator.
  - **Water** — Alberta Environment & Protected Areas surface-water licences (Water Act diversion records) + Alberta River Basin reports.
  - **Industrial parks** — Each municipality's economic development page (Alberta's Industrial Heartland, Edmonton Global, City of Medicine Hat, etc.) — record latest published "available power" only when the municipality states it.
  - **Carrier POPs / fiber** — PeeringDB (https://www.peeringdb.com), each carrier's coverage map (Bell, Telus, Zayo, Cologix, eStruxture, Hurricane Electric), CIRA IXP map.
- Add columns to every curated table: `source_url TEXT`, `source_publisher TEXT`, `source_as_of DATE`, `confidence TEXT CHECK (confidence IN ('verified','modeled','estimated'))`.
- Backfill latencies: replace hand-typed numbers with the standard fiber-latency model (`~5 µs/km` one-way over the great-circle distance) and label them `modeled`. Only mark as `verified` where a carrier publishes a SLA latency figure.

### Edge function changes
- Return `sources: [{url, publisher, as_of, confidence}]` on every nested record (POP, line, pipeline, water, park, substation).
- Add a top-level `methodology` block per scoring sub-metric: formula, inputs, units, and source.

### UI changes (`SiteReport.tsx`)
- New "Source" column in every table (publisher chip + external-link icon → opens `source_url`).
- Confidence chip (green / amber / grey) next to each row.
- Replace the single "Data provenance" card at the bottom with a per-section "Methodology & sources" expandable card showing the formula and the citation list for that section.
- Add an "As of" badge in the report header showing the oldest source date in the report.

## Part 2 — Hyperscaler / AI-HPC depth

Add the following sections to the report. All are computed in the edge function from public datasets (curated table + on-the-fly enrichment).

### A. Power & grid capacity (expand existing Transmission section)
- **Nearest substation MVA rating, transformer count, voltage classes** (AESO + AltaLink/ATCO published ratings).
- **AESO interconnection queue position & status** for projects within 25 km (AESO LTAP queue, public).
- **Generation mix within 100 km** — wind, solar, gas, cogen capacity (AESO Asset List, already in `aeso_assets`).
- **Grid carbon intensity (gCO₂/kWh)** — pull current value from existing AESO data + 12-month rolling avg.
- **Curtailment exposure** — count of negative-price hours in last 12 months at the nearest pricing node (already have `aeso_training_data`).
- **Estimated time-to-energize** band (12 / 24 / 36+ months) based on voltage class + queue depth.

### B. Climate & cooling (new section)
Pull from **Environment & Climate Change Canada Climate Normals 1991-2020** for the nearest station (open dataset, no key needed):
- Mean annual dry-bulb, ASHRAE 0.4% / 1% / 2% design dry-bulb and mean-coincident wet-bulb.
- **Annual free-cooling hours** (hours where dry-bulb < 18 °C — proxy for direct-air or dry-cooler economization).
- **WUE-driver index**: estimated hours requiring evaporative make-up.
- ASHRAE climate zone.
- Source: ECCC station ID + URL + observation period.

### C. Natural-hazard risk (new section)
- **Seismic** — NRCan 2020 National Building Code seismic hazard values (Sa(0.2) / PGA) for the lat/lng (NRCan open API).
- **Wildfire** — distance to nearest historical fire perimeter from Alberta Wildfire Open Data (last 10 yrs).
- **Flood** — Alberta Flood Hazard Mapping flag (where mapped) and distance to 100-yr floodplain edge.
- **Tornado climatology** — Environment Canada tornado density grid.
- Render as a 4-cell risk matrix (Low / Moderate / High / Severe) with source link per row.

### D. Water rights & cooling water (expand Water section)
- Closest **licensed surface-water diversion point** with licensed m³/year (Alberta EPA Water Use Reporting open dataset).
- Sub-basin allocation status (closed / partially closed / open) — Alberta River Basin reports.
- Distance to nearest **treated municipal water main** (if within 25 km of an industrial park already in our table).

### E. Cloud & network reach (expand Fiber section)
- Add hyperscaler cloud regions to `PEER_HUBS`: `AWS us-west-2 (Hillsboro OR)`, `AWS ca-central-1 (Montreal)`, `Azure West US 2`, `Azure Canada Central`, `GCP us-west1`, `GCP northamerica-northeast1`.
- Compute modeled one-way latency (great-circle × 5 µs/km × 1.4 routing factor) to each, label `modeled`.
- **Nearest IXP / peering fabric** (YYC-IX, YEG-IX, SIX, Equinix Toronto) with port density from PeeringDB.
- **Dark-fiber availability flag** per long-haul route (carrier publishes dark fiber on this route Y/N).
- **Subsea cable landing reach** — onward latency from SEA to Tokyo/Sydney/Singapore (Submarine Cable Map data).

### F. Land, jurisdiction & incentives (new section)
- Municipality + county for the lat/lng (reverse-geocode via Google Geocoding API — key already in secrets).
- **Property tax rate (mill rate)** for the host municipality where published.
- **Provincial / municipal incentives** snapshot — Alberta IRA-equivalent investment tax credits, sub-50 ¢/kWh power deals via the Alberta Industrial Heartland, etc. (curated, with source links to gov't pages).
- **Zoning class** for the parcel (from the existing `alberta_industrial_parks` if the site falls inside one; otherwise "outside designated industrial park").

### G. Workforce & logistics (expand Site Logistics)
- Population + labour-force size within 100 km (Stats Canada census 2021 open data).
- Skilled-trades availability index (electricians + millwrights per 1k workforce, Stats Canada NOC data).
- Distance to **Class-I rail spur** (CN / CPKC, already publicly mapped).
- Distance to **heavy-haul highway** (Alberta Transportation High-Load Corridor map) — critical for moving transformers and chillers.
- Distance to **international airport** (YYC / YEG).

### H. Sustainability & PPA (new section)
- Nearest operating + announced wind / solar farms within 100 km (already in `aeso_assets`) with MW and PPA-available flag.
- Estimated renewable PPA price band ($/MWh) using last 12 mo of AESO market data already in DB.
- Grid carbon intensity trajectory chart (already have data).

## Composite "Hyperscaler Suitability Score"

Replace the standalone Fiber Score with a 0-100 **Hyperscaler Suitability Score** that rolls up:
- Fiber & network (20)
- Power capacity & speed-to-energize (25)
- Climate / free-cooling (15)
- Water availability (10)
- Risk (10, inverted)
- Sustainability & PPA access (10)
- Logistics & workforce (10)

Keep the existing Fiber sub-score visible inside the breakdown.

## Files to touch

- `supabase/migrations/<new>.sql` — add `source_url / source_publisher / source_as_of / confidence` columns to the six curated tables; new `alberta_climate_normals`, `alberta_hazard_grid`, `alberta_water_licences`, `alberta_municipal_incentives` tables (with GRANTs + RLS).
- Data-seed migration — re-seed every row with verified primary sources.
- `supabase/functions/alberta-site-report/index.ts` — add climate / hazard / cloud-latency / water-rights / workforce / sustainability sections, methodology blocks, per-row sources, and the new composite score.
- `src/hooks/useAlbertaSiteReport.ts` — extend `SiteReport` type.
- `src/components/aeso-hub/site-intel/SiteReport.tsx` — render new sections, source chips, confidence chips, methodology expanders, replace fiber score with hyperscaler suitability score.
- `src/constants/app-version.ts` — bump.

## Out of scope (call out if user wants them)

- Live ingestion from the AESO interconnection queue API and ECCC climate API as scheduled jobs (could be added later; this plan reads them on-demand inside the edge function with response caching in `alberta_site_reports`).
- Parcel-level zoning + ALR overlay (needs municipal GIS scraping per municipality).
- Carbon-free-energy 24/7 matching score (needs hourly PPA modelling).

Ready to switch to build mode and implement?