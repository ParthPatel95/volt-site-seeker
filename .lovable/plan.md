## Goal

You asked: are the new features working, and is any data fake or made up?
The short answer from my review: the **satellite image + AI asset scan** features are wired correctly, but several of the **new dataset sections** (workforce, construction wages, EPC firms, mill rates, dark fiber, carrier-hotel cross-connect fees) are **curated estimates dressed up as "verified" data**. They have plausible numbers and source URLs, but the values were not actually pulled live from those URLs (and at least two of those URLs return 404/403 today). Per your "no fake or made-up data" rule, we need to relabel them and tighten the coverage badge so they are clearly marked as estimates, not verified facts.

This plan fixes the honesty problem and verifies the AI scan path end-to-end.

## What I verified is real and live

- `alberta-site-report` edge function loads 13 reference tables in parallel and computes distances correctly.
- ECCC climate normals, NRCan seismic ratings, PeeringDB IXPs, AESO transmission lines, StatsCan population centres, generation assets — these rows in the DB do match their cited sources and are safe to keep as "verified".
- Modeled fiber latency to cloud regions uses real physics (5 µs/km × 1.4 routing). Already labelled "modeled" — correct.
- `site-satellite-image` correctly calls Google Static Maps (hybrid, scale=2) and returns base64.
- `site-asset-vision` correctly forwards the satellite image to `google/gemini-2.5-flash` via the Lovable AI gateway with a strict JSON schema prompt and returns detections + cross-checks them in the UI.

## What is NOT honest right now

Rows in these tables are hand-curated estimates but the UI's `CoverageBadge` treats them as "verified" because `classifyRow` defaults to verified whenever `source_url` is non-empty:

| Table | Issue |
|---|---|
| `alberta_workforce_stats` | Electrician/HVAC/IT counts and median wages are estimates, not pulled from StatsCan tables |
| `alberta_construction_capacity` | EPC firm "mega-project capable" flag and recent-project lists are editorial |
| `alberta_construction_wages` | Union vs open-shop rates are typical-range estimates, not the live Alberta Wage & Salary Survey |
| `alberta_regulatory_zones` | Mill rates, M&E exemption flags, AUC permit weeks — point-in-time estimates; several source URLs 404 |
| `alberta_carrier_pop_details` | Cross-connect fee estimates and "open access" flags are editorial |
| `alberta_last_mile_providers` | Speeds and tech are typical, not from CRTC/ISED feeds |
| `alberta_dark_fiber_inventory` | IFA counts are estimates; some rows already correctly use `source_url='estimate'` |

## Changes

### 1. Honest classification in `SiteReport.tsx`
Change `classifyRow` so a row is only "verified" when the row explicitly sets `confidence='verified'`. Default becomes "estimated". This flips the badges to amber/red on the curated sections automatically.

Also force-classify the following sections so the badge is correct regardless of row contents:
- Workforce, Construction, Regulatory, Connectivity Depth → `forcedConfidence: 'estimated'`
- Cloud reach → already `'modeled'` (keep)
- Climate, Risk, Transmission, IXPs, Population centres, Carrier POPs (the original 45-row table) → `'verified'`

### 2. Add a "Data accuracy" banner at the top of the report
Above the existing coverage legend, render a short panel that lists:
- **Verified** (live or quarterly-refreshed authoritative source): AESO transmission, ECCC climate normals, NRCan seismic, PeeringDB, StatsCan 2021 population, AER generation list, carrier POP locations.
- **Modeled**: fiber latency to cloud regions (physics), drive times (km / 95 km/h), hyperscaler score weighting.
- **Estimated (use with caution)**: workforce trade counts, construction wages, EPC capability, municipal mill rates, last-mile speeds, dark-fiber IFA counts, carrier-hotel cross-connect fees.

This is one short Card with three columns and the same icons used elsewhere — no business-logic change.

### 3. Fix broken / wrong source URLs
Replace the two confirmed bad URLs (Strathcona 404, open.alberta 403) and any others surfaced by a quick HEAD check against every distinct `source_url` in the new tables. A one-shot migration UPDATEs the rows with the canonical landing pages, and adds `confidence` columns (text) to all seven tables so future rows can mark themselves accurately.

### 4. Verify the AI scan path end-to-end
- Confirm `GOOGLE_MAPS_API_KEY` and `LOVABLE_API_KEY` are present (they are — both functions already gate on them).
- Add an explicit empty-result hint in `AerialScanSection` when `scan.detections.length === 0` so the user knows the model ran but saw nothing, instead of a silent panel.
- When an AI-detected `substation` is NOT covered by the dataset, surface a "Possibly missing from dataset — please review" callout (already in code via `isCovered`, but currently buried — promote it to a top-of-section warning if any high-confidence detection is uncovered).

### 5. Surface dataset health in the report
The edge function already returns `methodology.datasets_loaded` counts. Add a tiny "Datasets loaded" line under the Methodology card so you can see at a glance that e.g. 406 substations, 45 carrier POPs, 12 transmission lines were actually queried.

### 6. Version
Bump `APP_VERSION` to `'2026.06.08.006'`.

## Out of scope

- Building live ingestion pipelines for StatsCan / Alberta Wage Survey / CRTC / municipal tax rolls. That is the only way to make these rows truly "verified live" and is a multi-day project per dataset — happy to scope it next if you want.
- Persisting AI scan results.
- Polygon overlays on the satellite image.

## Files touched

- `src/components/aeso-hub/site-intel/SiteReport.tsx` (classifyRow, banner, forced confidences, empty-state hint, missing-asset callout, datasets-loaded line)
- `src/constants/app-version.ts`
- New migration adding a `confidence` text column to the seven curated tables, defaulting to `'estimated'`, plus a handful of UPDATEs to fix the bad source URLs and mark the rows that are genuinely verified.

After approval I will implement and then sanity-check by invoking `alberta-site-report`, `site-satellite-image`, and `site-asset-vision` against a known Alberta coordinate.
