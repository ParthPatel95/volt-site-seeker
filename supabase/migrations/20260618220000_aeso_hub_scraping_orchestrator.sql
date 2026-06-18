-- AESO Hub scraping orchestrator: a single tab in the hub triggers every
-- data-collection function we've built, with shared run tracking.
--
-- Extends the legacy scraping_sources / scraping_jobs tables that were
-- created in 2025-06 but never wired up. Each row in scraping_sources is
-- now a CANONICAL DEFINITION of a scraper — what edge function backs it,
-- what params it accepts, what secrets it requires. scraping_jobs gets
-- richer per-run metadata so the UI can show items_found vs items_new,
-- the params we used, and a structured result summary alongside errors.

-- ── Part 1: extend scraping_sources ─────────────────────────────────────────

ALTER TABLE public.scraping_sources
  ADD COLUMN IF NOT EXISTS scraper_key text UNIQUE,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS edge_function text,
  ADD COLUMN IF NOT EXISTS default_params jsonb,
  ADD COLUMN IF NOT EXISTS required_secrets text[];

-- Loosen the type CHECK to allow our new categories. (The original CHECK
-- only accepted real_estate|corporate|news|social.)
ALTER TABLE public.scraping_sources
  DROP CONSTRAINT IF EXISTS scraping_sources_type_check;
ALTER TABLE public.scraping_sources
  ADD CONSTRAINT scraping_sources_type_check
  CHECK (type IN ('real_estate', 'corporate', 'news', 'social', 'osm', 'registry', 'satellite'));

-- ── Part 2: extend scraping_jobs ────────────────────────────────────────────

ALTER TABLE public.scraping_jobs
  ADD COLUMN IF NOT EXISTS scraper_key text,
  ADD COLUMN IF NOT EXISTS params jsonb,
  ADD COLUMN IF NOT EXISTS items_found integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS items_new integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS result_summary jsonb,
  ADD COLUMN IF NOT EXISTS triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_scraping_jobs_scraper_started
  ON public.scraping_jobs (scraper_key, started_at DESC);

-- ── Part 3: seed canonical scraper definitions ──────────────────────────────
-- Idempotent: ON CONFLICT(scraper_key) DO UPDATE so re-running the migration
-- (or future definition tweaks) updates rather than duplicates.

INSERT INTO public.scraping_sources
  (name, url, type, status, keywords, scraper_key, description, edge_function, default_params, required_secrets)
VALUES
  (
    'Property listings (Hidden Gems)',
    'https://api.firecrawl.dev',
    'real_estate', 'active',
    ARRAY['substation','MW','transmission','former plant','high voltage','rail spur'],
    'gem-listings',
    'Commercial real-estate listings carrying power-acquisition signals (substation on site, MW capacity quoted, former mill/plant, transmission frontage). Firecrawl web search across Alberta and Texas; results stored in gem_listings with re-seen tracking that marks stale rows after 14 days.',
    'gem-listing-scanner',
    '{"region":"both","limit_per_query":5}'::jsonb,
    ARRAY['FIRECRAWL_API_KEY']
  ),
  (
    'Industrial news & closure signals',
    'https://api.firecrawl.dev',
    'news', 'active',
    ARRAY['closure','idled','curtailed','layoff','shutdown','bankruptcy','wind-down'],
    'industrial-news',
    'News and press-release scan for facility status changes — closures, idlings, layoffs, bankruptcies. Same Firecrawl backend as the property scanner; results land in news_intelligence with per-article signal extraction.',
    'industrial-news-scanner',
    '{"region":"both","lookback_days":30,"limit_per_query":5}'::jsonb,
    ARRAY['FIRECRAWL_API_KEY']
  ),
  (
    'OSM heavy-industry discovery',
    'https://overpass-api.de',
    'osm', 'active',
    ARRAY['man_made=works','landuse=industrial','industrial=*','man_made=oil_refinery'],
    'osm-discovery',
    'OpenStreetMap scan for named heavy-industry sites (works, refineries, smelters, mineral extraction) not yet in the facility registry. Auto-inserts new low-confidence rows into industrial_facilities for human review; safe to re-run (skips existing OSM ids).',
    'osm-industrial-discovery',
    '{"region":"AB","limit":25}'::jsonb,
    NULL
  ),
  (
    'Sentinel-2 closure-signal monitor',
    'https://services.sentinel-hub.com',
    'satellite', 'active',
    ARRAY['NDVI','vegetation rebound','closure'],
    'satellite-activity',
    'Pulls Sentinel-2 NDVI time series over each facility footprint and a nearby baseline; rising vegetation over the footprint = visible-from-orbit closure signal. Stores observations + a trend score back on the facility row.',
    'facility-activity-monitor',
    '{"all_stale_days":30,"limit":5,"window_years":3}'::jsonb,
    ARRAY['SENTINEL_HUB_CLIENT_ID','SENTINEL_HUB_CLIENT_SECRET']
  ),
  (
    'Facility coordinate refinement',
    'https://maps.googleapis.com',
    'registry', 'active',
    ARRAY['Places','Geocoding','OSM parcel snap','multi-provider consensus'],
    'facility-refine',
    'Re-geocodes unverified facilities via Google Places + Geocoding, snaps to the OSM industrial parcel polygon when possible, and records multi-provider consensus distance. Fixes "town-centre" coordinate quality for the Hidden Gems list.',
    'facility-refine',
    '{"all_unverified":true,"limit":10}'::jsonb,
    ARRAY['GOOGLE_MAPS_API_KEY']
  )
ON CONFLICT (scraper_key) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  type = EXCLUDED.type,
  keywords = EXCLUDED.keywords,
  description = EXCLUDED.description,
  edge_function = EXCLUDED.edge_function,
  default_params = EXCLUDED.default_params,
  required_secrets = EXCLUDED.required_secrets,
  updated_at = now();
