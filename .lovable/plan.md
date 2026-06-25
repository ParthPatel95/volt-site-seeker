## Goal

Replace the custom property scrapers and the orchestrator's source list with Firecrawl-backed scrapers. One scraping engine (Firecrawl), one orchestrator, one tracking model. FIRECRAWL_API_KEY is already linked via the workspace connector — no new secrets needed.

## What changes

### 1. New unified Firecrawl scraper edge function
`supabase/functions/firecrawl-scraper/index.ts` — a single edge function that accepts:
```
{ scraper_key, query?, urls?, region?, limit? }
```
and runs Firecrawl `/v2/search` + `/v2/scrape` (markdown + links + json extraction with a small Zod-ish schema) for the requested source. Returns the canonical shape the orchestrator already understands (`{ success, results_scanned, listings_stored, ... }`).

Internally it dispatches by `scraper_key` to one of these Firecrawl-only routines:
- `gem-listings` — power-heavy industrial site listings (LoopNet, Crexi, Realtor.ca commercial, regional brokers).
- `industrial-news` — Firecrawl Search with `tbs:'qdr:w'` for AB/TX/AZ data center, mining, substation, curtailment news.
- `property-scan` — generic URL-based scraper used by the Property Scraper page (replaces ai/comprehensive/loopnet/multi-source/real-estate-multi).
- `firecrawl-discovery` — Firecrawl `/v2/map` + `/v2/scrape` on industrial/MLS domains to discover new facility URLs (replaces hand-rolled OSM-style discovery for non-OSM sources; `osm-discovery` itself stays on Overpass — it's not a scraping target Firecrawl serves).

All routines:
- Use `Authorization: Bearer ${FIRECRAWL_API_KEY}` against `https://api.firecrawl.dev/v2/...`.
- Return `{ success: false, error, needs: ['FIRECRAWL_API_KEY'] }` with HTTP 503 if the key is missing.
- Surface Firecrawl 402 (insufficient credits) as `success: false` with the connector-managed upgrade hint (coupon `LOVABLE50`).
- Idempotent upserts into the existing destination tables (`gem_listings`, `news_intelligence`, `scraped_properties`, `industrial_facilities`) keyed on the existing unique indexes (`listing_url`, `url`, etc.) — no schema changes required.

### 2. Orchestrator + sources registry
- `supabase/functions/scraping-orchestrator/index.ts`: extend the `summarise()` switch with `property-scan` and `firecrawl-discovery` adapters; no other logic changes.
- `supabase/functions/scraping-seed/index.ts`: re-seed `scraping_sources` so every active row now points `edge_function = 'firecrawl-scraper'`. Existing keys (`gem-listings`, `industrial-news`) keep working. Add the new `property-scan` and `firecrawl-discovery` keys. `osm-discovery`, `satellite-activity`, `facility-refine` stay on their own functions (they're not scrapers and don't use Firecrawl).

### 3. Property Scraper page
- `src/pages/PropertyScraper.tsx` + `src/components/scraping/{AIPropertyScraper, ComprehensiveScraper, MultiSourceScraper, FirecrawlPropertyScanner}.tsx`:
  - Stop calling `ai-property-scraper`, `comprehensive-property-scraper`, `multi-source-scraper`, `loopnet-scraper`, `real-estate-multi-scraper`, `firecrawl-property-scanner`. All four UI surfaces invoke the orchestrator with `{ scraper_key: 'property-scan', params: { query | urls, region, limit } }`.
  - Results read from the same `scraped_properties` table they already render from.
  - Keep the existing filter/card UI exactly as-is.

### 4. Decommission superseded functions
After the page is migrated, delete these edge functions via `supabase--delete_edge_functions`:
- `ai-property-scraper`
- `comprehensive-property-scraper`
- `loopnet-scraper`
- `multi-source-scraper`
- `real-estate-multi-scraper`
- `firecrawl-property-scanner`
- `gem-listing-scanner` (logic folded into `firecrawl-scraper`)
- `industrial-news-scanner` (logic folded into `firecrawl-scraper`)

Their `scraping_sources` rows get re-pointed by the seed step before deletion, so no broken `edge_function` references remain.

### 5. Verify
- `supabase--curl_edge_functions` `/firecrawl-scraper` with each `scraper_key` and confirm 200 + non-zero counts (or a clean 503 if key absent).
- Run `/scraping-orchestrator` with `scraper_key: 'all'` and confirm every job row closes `completed`.
- Open `/property-scraper` and `/app/aeso-market-hub` → Scraping tab in the preview, run one scrape from each, confirm rows land in `scraped_properties` / `gem_listings` / `news_intelligence`.

## Out of scope

- No new tables, no new secrets, no UI redesign.
- OSM/Sentinel/Google flows are not changed — Firecrawl doesn't serve those data sources.
- `useScraping.ts` already calls the orchestrator correctly; no hook changes.
