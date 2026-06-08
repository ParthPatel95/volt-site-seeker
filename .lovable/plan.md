## Problem

1. **Squeezed layout** — At ~1075 px the Site Lookup is a 380 px form + workspace, and the workspace itself has a fixed 208 px inner sidebar plus a 6‑column KPI strip. Result: KPI cards and panel content collide (visible in screenshot).
2. **Shallow fiber data** — The edge function already computes `top_routes`, `cloud_reach`, `nearest_long_haul_routes`, `carrier_pop_details`, `last_mile_in_municipality`, `dark_fiber_segments_nearby`, and `peering_hubs`, but the Connectivity panel only renders 2 small tables (POPs + IXPs). Tons of data is silently dropped.

## Plan

### 1. Layout (presentation only)

**`src/components/aeso-hub/tabs/SiteIntelTab.tsx`**
- After a report is generated, collapse the lookup form into a slim header chip ("📍 lat,lng · Change") and give the workspace the full content width. Form re‑expands on "Change".
- Change the grid from fixed `lg:grid-cols-[380px_1fr]` to a stack on `< xl`, two‑column only at `xl+`.

**`src/components/aeso-hub/site-intel/SiteWorkspace.tsx`**
- Inner workspace sidebar starts **collapsed by default** (icon‑only `w-12`), expands on hover/click. Removes the 208 px static rail.
- KPI strip: switch from `lg:grid-cols-6` to a container‑driven 2 / 3 / 6 layout with `@container` queries so it reflows by the workspace's own width, not the viewport.
- Add `min-w-0` and `overflow-x-auto` guards on table wrappers so deeper fiber tables don't push the layout.

### 2. Fiber depth — render everything we already have

Rewrite `ConnectivityPanel` in `SiteWorkspace.tsx` to surface every fiber field returned by the edge function:

- **Fiber score card** — score, grade, 4 sub‑score bars (proximity / carrier diversity / route diversity / latency) from `report.fiber.score.breakdown`.
- **Top routes** — full ranked table (`report.fiber.top_routes`): rank, carrier, POP, site→POP km, peering hub, modeled latency, composite score.
- **Carrier POPs** — extend existing table with all latency columns + source URL.
- **Carrier POP details** — `report.connectivity_depth.carrier_pop_details`: facility address, building owner, lit services, cross‑connect fee, MMR availability, 24×7 access.
- **Long‑haul routes** — `report.fiber.nearest_long_haul_routes`: route name, carrier, A‑Z endpoints, fiber pair count, lit/dark, distance to route.
- **Dark fiber inventory** — `report.connectivity_depth.dark_fiber_segments_nearby`: segment, strands available, IRU term, vendor.
- **Last‑mile providers** — `report.connectivity_depth.last_mile_in_municipality` (multi‑provider list with tech / max speed / pricing tier).
- **IXPs** — keep existing, add ASN count and switch fabric.
- **Cloud reach** — `report.fiber.cloud_reach`: provider, region, distance, modeled one‑way ms, source URL.
- **Peering hubs** — `report.fiber.peering_hubs` distance + modeled latency from the site to YYC / YEG / SEA / ORD.

All sections become collapsible accordion items so the panel doesn't get visually overwhelming, with the score + top routes open by default.

### 3. Fiber depth — pull live external data

New edge function **`supabase/functions/fiber-depth-lookup/index.ts`** that the Connectivity panel calls on mount (same pattern as `osm-power-infrastructure`):

- **PeeringDB** (`https://www.peeringdb.com/api/`): nearby `fac` (facilities) within ~75 km, their participants (`netfac`/`net`), ASN counts, IPv4/IPv6 prefixes, peering policies. Also list nearby `ix` with full participant lists.
- **OpenStreetMap Overpass**: query `man_made=communications_tower`, `telecom=*`, `man_made=tower` with `tower:type=communication`, plus `building=data_center` within 25 km. Returns name, operator, height, distance.
- **CRTC Broadband Map (ISED National Broadband Internet Service Availability)**: hex‑level availability for the site's cell — list every ISP serving the hex with max down/up speed and tech (fibre / FWA / cable / DSL / GEO / LEO).
- **Hurricane Electric BGP toolkit** (`bgp.he.net`) scrape for upstream ASN context of the closest carrier POPs.

Edge function returns a normalized JSON object cached in a new `alberta_fiber_depth_cache` table (key = rounded lat/lng + day), so repeat lookups are free.

New panel section "Live fiber scan" renders the result with the same Section/MiniTable atoms; clearly badges each table with its source (PeeringDB / OSM / ISED / HE).

### 4. PDF export
Extend `handlePdf` to include the new tables (top routes, cloud reach, last‑mile, dark fiber, PeeringDB facilities) so the exported report matches the screen.

### 5. Version
Bump `APP_VERSION` to `'2026.06.08.012'`.

## Files

**Edit**
- `src/components/aeso-hub/tabs/SiteIntelTab.tsx` — collapse form after report; widen workspace.
- `src/components/aeso-hub/site-intel/SiteWorkspace.tsx` — sidebar default‑collapsed, KPI container query, rewritten ConnectivityPanel with all fiber tables + live‑scan integration, extended PDF export.
- `src/constants/app-version.ts` — bump version.

**Create**
- `supabase/functions/fiber-depth-lookup/index.ts` — PeeringDB + OSM telecom + ISED + HE.net aggregator.
- `supabase/migrations/<ts>_alberta_fiber_depth_cache.sql` — cache table with GRANTs + RLS (service_role only writes; authenticated reads).

## Verification

- Build passes.
- Manual: load Site Lookup at 1024 / 1280 / 1440 widths and confirm no horizontal overflow, KPI strip reflows cleanly, workspace gets full width post‑report.
- Connectivity panel renders all 9+ fiber sections with non‑empty data for a Calgary test point.
- `fiber-depth-lookup` edge function returns 200 with PeeringDB + ISED + OSM payload for `51.0447, -114.0719`.
