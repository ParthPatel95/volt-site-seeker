## Goal

Make the Site Intelligence report defensible to a hyperscaler / AI-HPC client. Two problems today:

1. **Thin & uncited data** — only 19 carrier POPs, 6 long-haul routes, 8 carriers, 7 population centres. No `source_url` / `last_verified` on most rows, so we can't prove accuracy.
2. **Missing categories** — no workforce/talent, no EPC capacity, no tax/regulatory, no connectivity depth (dark fiber, last-mile, IXP peers).

## What gets built

### 1. Schema upgrades (single migration)

Add `source_url TEXT` and `last_verified DATE` to every Alberta reference table that doesn't already have them: `alberta_carrier_pops`, `alberta_fiber_routes`, `alberta_transmission_lines`, `alberta_gas_pipelines`, `alberta_water_sources`, `alberta_water_licences`, `alberta_industrial_parks`, `alberta_logistics_assets`, `alberta_generation_assets`, `alberta_population_centres`, `alberta_municipal_incentives`, `cloud_regions`, `internet_exchanges`.

New tables (all read-only reference, `GRANT SELECT TO authenticated` + `service_role` ALL, RLS on with public-read policy):

- **`alberta_workforce_stats`** — per population centre / CMA: labour_force, unemployment_rate, pct_post_secondary, electricians_count, hvac_techs_count, it_workers_count, median_wage_electrician, median_wage_it. Source: StatsCan Census 2021 + Alberta Labour Force Survey.
- **`alberta_post_secondary`** — institutions (SAIT, NAIT, U of C, U of A, Red Deer Polytechnic, Lethbridge College, Bow Valley, Olds): lat/lng, program_focus (electrical/HVAC/IT/data-centre-ops), annual_grads, source_url.
- **`alberta_construction_capacity`** — major EPC/GC firms with Alberta presence (PCL, Ledcor, EllisDon, Graham, Chandos, Clark Builders, Bird, Stuart Olson): hq_city, mega_project_capable (bool), union_status, recent_dc_or_industrial_projects (jsonb), source_url.
- **`alberta_construction_wages`** — trade, union_rate_2026, open_shop_rate_2026, source (Alberta Wage & Salary Survey 2024-2025 + CLR Alberta).
- **`alberta_regulatory_zones`** — polygon-ish point grid covering Alberta with: municipality, mill_rate_non_residential, machinery_equipment_exempt (bool), school_tax_rate, aer_region, auc_typical_permit_weeks, indigenous_consultation_required (bool), treaty_area. Sources cited per row (Municipal Affairs, AUC, ACO).
- **`alberta_carrier_pop_details`** — extends `alberta_carrier_pops` with: facility_type (carrier hotel / colo / meet-me-room), open_access (bool), cross_connect_fee_estimate, building_owner, source_url.
- **`alberta_last_mile_providers`** — keyed by population_centre: providers (jsonb array of {name, max_speed_gbps, technology}), source (CRTC + ISED National Broadband Data).
- **`alberta_dark_fiber_inventory`** — per route segment: owner, lit_or_dark, conduit_owner, ifa_count_estimate, source_url.

### 2. Data seeding

Curated INSERTs (via `supabase--insert` after migration) drawn from public, citable sources. Every row carries `source_url` + `last_verified='2026-06-08'`. Target counts:

- Carrier POPs: **19 → ~55** (add Cologix YYC1/YYC2, eStruxture YYC-1/EDM-1, Beanfield, Zayo Bridge Pop, Bell carrier hotels in Calgary/Edmonton, Telus IDC, Shaw/Rogers head-ends in Red Deer/Lethbridge/Medicine Hat/Grande Prairie/Fort McMurray, Cybera GigaPOP, Q9/Aptum). Carriers: 8 → ~15.
- Long-haul fiber routes: **6 → ~25** (add Bell trans-Canada backbone, Telus PureFibre intercity, Zayo Calgary-Vancouver & Calgary-Chicago, Shaw IP-1, Allstream, MTS/Bell MTS to Winnipeg, Cybera CAnet relay, TransAlta dark fiber along transmission ROW where publicly disclosed).
- IXPs: add YYCIX, YEGIX (real members, source PeeringDB pages — cited even though static).
- Population/workforce: **7 → ~20** centres covering all CMAs + key industrial towns.
- Post-secondary: ~12 rows.
- Regulatory zones: ~25 municipalities.
- Logistics: expand to include all CN/CP intermodal yards, regional airports.

Where a hard public number doesn't exist (e.g., dark fiber count), we mark `source_url='estimate'` and the UI labels it "Estimate" — never silently presented as verified.

### 3. Edge function expansion (`alberta-site-report/index.ts`)

Add new pulls in the `Promise.all`:

- `alberta_workforce_stats`, `alberta_post_secondary`, `alberta_construction_capacity`, `alberta_construction_wages`, `alberta_regulatory_zones`, `alberta_last_mile_providers`, `alberta_dark_fiber_inventory`, `alberta_carrier_pop_details`.

New response sections:

```text
report.workforce = {
  nearest_centre, labour_force, unemployment_rate, pct_post_secondary,
  trades_supply: { electricians, hvac_techs, it_workers, median_wages },
  post_secondary_within_150km: [...],
  sources: [...]
}
report.construction = {
  epc_firms_with_alberta_presence: [...],
  union_vs_open_wage_table: [...],
  sources: [...]
}
report.regulatory = {
  municipality, mill_rate_non_residential, m_and_e_exempt,
  school_tax, aer_region, auc_typical_permit_weeks,
  indigenous_consultation_required, treaty_area,
  sources: [...]
}
report.connectivity_depth = {
  carrier_pop_details: [...],      // open-access flag, MMR, x-connect fees
  last_mile_in_municipality: [...], // CRTC/ISED data
  dark_fiber_segments_nearby: [...] // owner, lit/dark, IFA
}
```

Every existing nearest-* item is re-shaped to include `source_url` and `last_verified` pulled from the row.

Methodology block is extended with a `data_sources` summary listing each table + total citations.

### 4. UI changes (`SiteReport.tsx`)

Add four new cards beneath the existing report:

1. **Workforce & Talent** — labour force, unemployment, post-secondary programs table with annual grads.
2. **Construction & EPC** — EPC firms list, union vs open-shop wage table, lead-time note.
3. **Tax, Land & Regulatory** — mill rate, M&E exemption badge, AUC permit weeks, Indigenous consultation note + treaty area.
4. **Connectivity Depth** — POP open-access matrix, last-mile providers in municipality, dark fiber segments.

Every existing card gets a small "ⓘ Source" link pulling from each row's `source_url`. A "Data sources" footer at the bottom of the report enumerates all distinct sources cited.

No grading/scoring changes (grades were already removed per previous request).

### 5. App version bump

`src/constants/app-version.ts` → `'2026.06.08.003'`.

## Technical notes

- All new tables live in `public`, follow the GRANT-then-RLS-then-policy pattern from project rules. Policies: `SELECT TO authenticated USING (true)` for reference data; `ALL TO service_role`.
- No live external API calls at request time (per chosen option) — keeps the edge function under 2s and avoids rate-limit risk. Refresh cadence is handled by re-seeding with a dated migration when sources update.
- Edge function stays a single file. New helper `withSource(row)` attaches `source_url`/`last_verified` to every nearest-* item.
- React component stays under 600 lines by splitting the four new cards into small subcomponents in the same file (matches existing pattern).

## Out of scope

- Live PeeringDB / CRTC / ISED API calls at runtime (rejected option).
- Changing the Site Intel scoring or grading.
- Map rendering of new layers (data-only this pass; map overlays would be a follow-up).
- Backfilling `source_url` for non-Alberta reference tables (e.g., `cloud_regions` already has it).

## Deliverables

- 1 migration: schema additions + new tables with GRANTs/RLS/policies.
- Bulk INSERTs to seed all new + expanded data (cited, dated).
- Updated `supabase/functions/alberta-site-report/index.ts`.
- Updated `src/components/aeso-hub/site-intel/SiteReport.tsx`.
- App version bump.
