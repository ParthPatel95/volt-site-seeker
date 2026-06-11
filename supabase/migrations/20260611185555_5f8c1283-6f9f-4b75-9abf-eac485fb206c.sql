-- Drop the incorrectly-shaped gem_listings table (it was empty) and recreate
-- with the canonical schema the scanner and useHiddenGems hook expect.
DROP TABLE IF EXISTS public.gem_listings;

CREATE TABLE public.gem_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_url text NOT NULL UNIQUE,
  title text,
  description_excerpt text,
  price_text text,
  address_text text,
  state text,
  lat double precision,
  lng double precision,
  geocode_precision text,
  gem_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  signal_score integer NOT NULL DEFAULT 0,
  search_query text,
  source text NOT NULL DEFAULT 'firecrawl',
  scraped_at timestamptz NOT NULL DEFAULT now(),
  raw jsonb,
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

-- Add remaining canonical Texas seed rows that were missing from the first pass.
INSERT INTO public.industrial_facilities
  (name, operator, facility_type, naics_code, lat, lng, coordinates_precision, municipality,
   status, status_as_of, capacity_value, capacity_unit, estimated_mw, estimate_basis,
   grid_voltage_kv, confidence, source_url, source_publisher, notes, last_verified, state)
SELECT * FROM (VALUES
  ('Freeport LNG Liquefaction','Freeport LNG','lng_liquefaction','486210',28.943,-95.309,'locality','Quintana Island','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,345,'medium','https://www.freeportlng.com/','Freeport LNG','Electric-motor-drive trains served from ERCOT; several hundred MW class. No public load figure.',NULL::date,'TX'),
  ('Austin Semiconductor Fab','Samsung','semiconductor_fab','334413',30.390,-97.622,'locality','Austin','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,345,'medium','https://semiconductor.samsung.com/us/','Samsung','Fab-class loads >100 MW; no public figure.',NULL::date,'TX'),
  ('Sherman Semiconductor Fabs','Texas Instruments','semiconductor_fab','334413',33.663,-96.618,'locality','Sherman','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,345,'low','https://www.ti.com/','Texas Instruments','Multi-fab campus ramping through the decade.',NULL::date,'TX'),
  ('Evadale Paper Mill','WestRock (Smurfit Westrock)','containerboard','322130',30.353,-94.073,'locality','Evadale','operating','2026-01-01'::date,1000000::numeric,'t/yr',44::numeric,'intensity_model',138,'low','https://www.smurfitwestrock.com/','Smurfit Westrock','Paper asset class under recurring portfolio review.',NULL::date,'TX'),
  ('La Porte Hydrogen / Syngas Complex','Air Products','air_separation','325120',29.662,-95.062,'locality','La Porte','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,138,'medium','https://www.airproducts.com/','Air Products','Gulf Coast hydrogen pipeline hub; ASU compressor loads.',NULL::date,'TX'),
  ('Rockdale Aluminum Smelter (former Alcoa)','Alcoa (closed)','aluminum_smelter','331313',30.652,-97.005,'locality','Rockdale','closed','2008-11-01'::date,267000::numeric,'t/yr',442::numeric,'intensity_model',345,'high','https://en.wikipedia.org/wiki/Sandow_Power_Plant','Public record','Smelter closed 2008; interconnection reused by one of the largest bitcoin-mining campuses in North America (Riot/Whinstone). Textbook hidden-gem precedent.','2026-01-01'::date,'TX')
) AS v(name,operator,facility_type,naics_code,lat,lng,coordinates_precision,municipality,status,status_as_of,capacity_value,capacity_unit,estimated_mw,estimate_basis,grid_voltage_kv,confidence,source_url,source_publisher,notes,last_verified,state);