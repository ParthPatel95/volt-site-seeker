## QA Smoke Test Plan — All New Features

Run a non-destructive smoke test across the four surfaces. Each edge function gets one curl call; verify HTTP 200 + valid payload shape. No code changes unless a regression is found.

### 1. Firecrawl scrapers
- `gem-listing-scanner` — POST `{ query: "industrial land alberta" }` → expect `success: true`, results array
- `industrial-news-scanner` — POST `{ query: "alberta data center" }` → expect items array
- `firecrawl-property-scanner` — POST `{ query: "data center site canada", budget: 5000000, powerMW: 50 }` → expect listings
- Confirm Firecrawl v2 endpoints in code; report any 402 credit issues

### 2. Sentinel Hub facility monitor
- Call `sentinel-hub-ndvi` (or equivalent) for 2 known facilities (Alberta Heartland + one US site)
- Verify OAuth token mint + NDVI stats payload

### 3. Site Intel geocoding (Canada + USA)
- `geocode-address`: "Calgary, AB", "Midland, TX", "Phoenix, AZ", "Toronto, ON" — expect lat/lng each
- `alberta-site-report`: cross-border address → expect report (no bounds rejection)
- `google-maps-substation-finder`: US coords → expect substations

### 4. AESO pipeline
- `aeso-ensemble-predictor` — expect prediction anchored to now (not Nov 2025)
- `aeso-monitoring-endpoint` — expect `status: healthy`
- `aeso-feature-calculator` — expect success, no OOM
- DB check: `audit_aeso_hourly_coverage()` over 2024-01 → 2026-06; confirm no missing price hours in elapsed months

### Deliverable
Single QA report: ✅/❌ per check with response snippet or error. If any failures, list root cause and proposed fix (no fixes applied in this pass — confirm before any code change).
