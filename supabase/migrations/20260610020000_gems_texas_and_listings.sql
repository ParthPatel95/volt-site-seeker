-- Hidden Gems expansion: Texas registry + real-estate listing signals.
--
-- Part 1: industrial_facilities gains a `state` column (AB | TX) and seeds
--         real Texas heavy-load plants. Same data policy as the Alberta
--         seed: provenance per row, intensity-model or published MW only,
--         desk-research rows carry confidence flags until re-verified.
-- Part 2: gem_listings stores REAL scraped listings from the
--         gem-listing-scanner edge function (Firecrawl search). Rows are
--         only ever written by the scanner from live scrape results —
--         there is no demo/seed data here by design.

-- ── Part 1: state column + Texas facilities ────────────────────────────────

ALTER TABLE public.industrial_facilities
  ADD COLUMN state text NOT NULL DEFAULT 'AB';

CREATE INDEX idx_industrial_facilities_state
  ON public.industrial_facilities (state);

INSERT INTO public.industrial_facilities
  (name, operator, facility_type, naics_code, lat, lng, coordinates_precision, municipality,
   status, status_as_of, capacity_value, capacity_unit, estimated_mw, estimate_basis,
   grid_voltage_kv, confidence, source_url, source_publisher, notes, last_verified, state)
VALUES
  -- Electrolysis / chlor-alkali — Texas Gulf Coast
  ('Freeport Integrated Chemical Complex', 'Dow', 'chlor_alkali', '325181',
   28.953, -95.363, 'locality', 'Freeport',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   345, 'medium', 'https://corporate.dow.com/en-us/locations/texas-operations.html', 'Dow',
   'Largest integrated chemical site in the Western Hemisphere; multiple chlor-alkali cell lines.', NULL, 'TX'),

  ('Freeport Chlor-Alkali Plant', 'Olin', 'chlor_alkali', '325181',
   28.948, -95.378, 'locality', 'Freeport',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   345, 'medium', 'https://www.olin.com/', 'Olin',
   'Olin is the world''s largest chlor-alkali producer; Freeport is its flagship site.', NULL, 'TX'),

  -- EAF steel — pure electrical melt loads (~0.5 MWh/t)
  ('Sinton Flat Roll Steel Mill', 'Steel Dynamics', 'eaf_steel', '331110',
   28.030, -97.550, 'locality', 'Sinton',
   'operating', '2026-01-01', 3000000, 't/yr', 190, 'intensity_model',
   345, 'medium', 'https://stld.steeldynamics.com/', 'Steel Dynamics',
   'EAF flat-roll mill commissioned 2021 — one of the largest single electrical loads in South Texas.', NULL, 'TX'),

  ('Jewett Structural Steel Mill', 'Nucor', 'eaf_steel', '331110',
   31.362, -96.144, 'locality', 'Jewett',
   'operating', '2026-01-01', 1000000, 't/yr', 63, 'intensity_model',
   138, 'medium', 'https://www.nucor.com/', 'Nucor',
   NULL, NULL, 'TX'),

  ('Seguin Steel Mill', 'CMC Steel Texas', 'eaf_steel', '331110',
   29.569, -97.964, 'locality', 'Seguin',
   'operating', '2026-01-01', 850000, 't/yr', 54, 'intensity_model',
   138, 'medium', 'https://www.cmc.com/', 'CMC',
   NULL, NULL, 'TX'),

  ('Midlothian Steel Mill', 'Gerdau', 'eaf_steel', '331110',
   32.464, -97.010, 'locality', 'Midlothian',
   'operating', '2026-01-01', 1000000, 't/yr', 63, 'intensity_model',
   138, 'medium', 'https://www.gerdau.com/', 'Gerdau',
   NULL, NULL, 'TX'),

  -- Cement — Midlothian cluster + Hunter
  ('Midlothian Cement Plant (Holcim)', 'Holcim US', 'cement', '327310',
   32.471, -96.994, 'locality', 'Midlothian',
   'operating', '2026-01-01', 2400000, 't/yr', 30, 'intensity_model',
   138, 'medium', 'https://www.holcim.us/', 'Holcim',
   NULL, NULL, 'TX'),

  ('Midlothian Cement Plant (Martin Marietta)', 'Martin Marietta', 'cement', '327310',
   32.468, -97.040, 'locality', 'Midlothian',
   'operating', '2026-01-01', 2200000, 't/yr', 28, 'intensity_model',
   138, 'medium', 'https://www.martinmarietta.com/', 'Martin Marietta',
   NULL, NULL, 'TX'),

  ('Hunter Cement Plant', 'Martin Marietta', 'cement', '327310',
   29.653, -98.090, 'locality', 'New Braunfels',
   'operating', '2026-01-01', 2100000, 't/yr', 26, 'intensity_model',
   138, 'medium', 'https://www.martinmarietta.com/', 'Martin Marietta',
   NULL, NULL, 'TX'),

  -- Electric-drive LNG — grid-served liquefaction (the Freeport model)
  ('Freeport LNG Liquefaction', 'Freeport LNG', 'lng_liquefaction', '486210',
   28.943, -95.309, 'locality', 'Quintana Island',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   345, 'medium', 'https://www.freeportlng.com/', 'Freeport LNG',
   'Electric-motor-drive trains served from the ERCOT grid — several hundred MW class. No public load figure; estimate deliberately omitted rather than guessed.', NULL, 'TX'),

  -- Semiconductor fabs — large, growing loads; published MW not available
  ('Austin Semiconductor Fab', 'Samsung', 'semiconductor_fab', '334413',
   30.390, -97.622, 'locality', 'Austin',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   345, 'medium', 'https://semiconductor.samsung.com/us/', 'Samsung',
   'Fab-class loads run well north of 100 MW but no figure is published — left null by policy.', NULL, 'TX'),

  ('Sherman Semiconductor Fabs', 'Texas Instruments', 'semiconductor_fab', '334413',
   33.663, -96.618, 'locality', 'Sherman',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   345, 'low', 'https://www.ti.com/', 'Texas Instruments',
   'Multi-fab campus ramping through the decade.', NULL, 'TX'),

  -- Paper
  ('Evadale Paper Mill', 'WestRock (Smurfit Westrock)', 'containerboard', '322130',
   30.353, -94.073, 'locality', 'Evadale',
   'operating', '2026-01-01', 1000000, 't/yr', 44, 'intensity_model',
   138, 'low', 'https://www.smurfitwestrock.com/', 'Smurfit Westrock',
   'Paper asset class under recurring portfolio review — watch for closure announcements.', NULL, 'TX'),

  -- Industrial gases / hydrogen — Houston Ship Channel
  ('La Porte Hydrogen / Syngas Complex', 'Air Products', 'air_separation', '325120',
   29.662, -95.062, 'locality', 'La Porte',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   138, 'medium', 'https://www.airproducts.com/', 'Air Products',
   'Gulf Coast hydrogen pipeline hub; ASU compressor loads.', NULL, 'TX'),

  -- The canonical precedent: closed smelter → bitcoin mine
  ('Rockdale Aluminum Smelter (former Alcoa)', 'Alcoa (closed)', 'aluminum_smelter', '331313',
   30.652, -97.005, 'locality', 'Rockdale',
   'closed', '2008-11-01', 267000, 't/yr', 442, 'intensity_model',
   345, 'high', 'https://en.wikipedia.org/wiki/Sandow_Power_Plant', 'Public record',
   'Smelter idled 2008, closed permanently — the interconnection was later reused by one of the largest bitcoin-mining campuses in North America (Riot, Whinstone). THE textbook hidden-gem precedent this feature exists to find earlier.', '2026-01-01', 'TX')
;

-- ── Part 2: scraped listing signals ─────────────────────────────────────────

CREATE TABLE public.gem_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_url text NOT NULL UNIQUE,
  title text,
  description_excerpt text,        -- first ~500 chars of scraped description
  price_text text,                 -- as listed; never parsed into fake numbers
  address_text text,
  state text,                      -- 'AB' | 'TX' | NULL when not derivable
  lat double precision,            -- only set when geocoded; NULL otherwise
  lng double precision,
  geocode_precision text,          -- 'address' | 'locality' | NULL
  gem_signals jsonb NOT NULL DEFAULT '[]'::jsonb,  -- matched signal keywords
  signal_score integer NOT NULL DEFAULT 0,         -- deterministic keyword score
  search_query text,               -- the query that surfaced this listing
  source text NOT NULL DEFAULT 'firecrawl',
  scraped_at timestamptz NOT NULL DEFAULT now(),
  raw jsonb,                       -- original search-result payload for audit
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gem_listings_state ON public.gem_listings (state);
CREATE INDEX idx_gem_listings_score ON public.gem_listings (signal_score DESC);
CREATE INDEX idx_gem_listings_scraped ON public.gem_listings (scraped_at DESC);

GRANT SELECT ON public.gem_listings TO authenticated;
GRANT ALL ON public.gem_listings TO service_role;
ALTER TABLE public.gem_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gem_listings_read_auth"
  ON public.gem_listings FOR SELECT TO authenticated USING (true);
