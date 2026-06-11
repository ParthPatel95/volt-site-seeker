-- Hidden Gems: industrial facilities registry + Texas expansion + gem_listings
-- (Applies content of supabase/migrations/20260610010000 and 20260610020000
-- which were checked in via GitHub but not yet executed against the DB.)

CREATE TABLE public.industrial_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  operator text,
  facility_type text NOT NULL,
  naics_code text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  coordinates_precision text NOT NULL DEFAULT 'locality',
  municipality text,
  status text NOT NULL DEFAULT 'unknown',
  status_as_of date,
  status_source_url text,
  capacity_value numeric,
  capacity_unit text,
  estimated_mw numeric,
  estimate_basis text,
  grid_voltage_kv integer,
  confidence text NOT NULL DEFAULT 'medium',
  source_url text,
  source_publisher text,
  notes text,
  last_verified date,
  state text NOT NULL DEFAULT 'AB',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_industrial_facilities_latlng_brin ON public.industrial_facilities USING BRIN (lat, lng);
CREATE INDEX idx_industrial_facilities_status ON public.industrial_facilities (status);
CREATE INDEX idx_industrial_facilities_type ON public.industrial_facilities (facility_type);
CREATE INDEX idx_industrial_facilities_state ON public.industrial_facilities (state);

GRANT SELECT ON public.industrial_facilities TO authenticated;
GRANT ALL ON public.industrial_facilities TO service_role;
ALTER TABLE public.industrial_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "industrial_facilities_read_auth"
  ON public.industrial_facilities FOR SELECT TO authenticated USING (true);

-- Seed data (Alberta + Texas) is loaded by the existing checked-in migration files
-- 20260610010000_industrial_facilities_registry.sql and
-- 20260610020000_gems_texas_and_listings.sql. To keep this re-apply migration
-- focused on schema (and avoid duplicating ~280 lines of seed SQL here), we
-- run those seed INSERTs by reading them from pg_read_file is not available
-- in hosted Supabase, so instead invoke them inline:

-- ── Alberta seed (subset of canonical 20-row seed) ──
INSERT INTO public.industrial_facilities
  (name, operator, facility_type, naics_code, lat, lng, coordinates_precision, municipality,
   status, status_as_of, capacity_value, capacity_unit, estimated_mw, estimate_basis,
   grid_voltage_kv, confidence, source_url, source_publisher, notes, state)
SELECT * FROM (VALUES
  ('Bruderheim Sodium Chlorate Plant','ERCO Worldwide','sodium_chlorate','325181',53.805,-112.931,'locality','Bruderheim','operating','2026-01-01'::date,55000::numeric,'t/yr',57::numeric,'intensity_model',144,'medium','https://www.ercoworldwide.com/locations/','ERCO Worldwide','Electrolysis load; chlorate plants of this size typically hold a 40-60 MW DTS contract.','AB'),
  ('Fort Saskatchewan Chlor-Alkali Complex','Dow Chemical Canada','chlor_alkali','325181',53.713,-113.155,'locality','Fort Saskatchewan','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,240,'medium','https://corporate.dow.com/en-us/locations/fort-saskatchewan.html','Dow','Part of the Dow Fort Saskatchewan complex.','AB'),
  ('Fort Saskatchewan Metals Refinery','Sherritt International','metals_refinery','331410',53.717,-113.207,'locality','Fort Saskatchewan','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,NULL,'medium','https://www.sherritt.com/Operations/Metals','Sherritt','Nickel/cobalt refinery; hydrogen reduction + electrowinning loads.','AB'),
  ('Slave Lake Pulp (BCTMP)','West Fraser','pulp_mechanical','322110',55.273,-114.749,'locality','Slave Lake','unknown','2026-01-01'::date,230000::numeric,'t/yr',58::numeric,'intensity_model',144,'low','https://www.westfraser.com/products/pulp','West Fraser','BCTMP mill; verify status before action.','AB'),
  ('Whitecourt Newsprint Mill','Alberta Newsprint Company','newsprint','322122',54.124,-115.751,'locality','Whitecourt','operating','2026-01-01'::date,260000::numeric,'t/yr',65::numeric,'intensity_model',144,'medium','https://albertanewsprint.com/','ANC','TMP newsprint; structurally declining.','AB'),
  ('Hinton Kraft Pulp Mill','Mondi (ex-West Fraser Hinton Pulp)','pulp_kraft','322110',53.397,-117.566,'locality','Hinton','operating','2026-01-01'::date,250000::numeric,'t/yr',18::numeric,'intensity_model',144,'medium','https://www.mondigroup.com/','Mondi','Kraft mill; full transmission interconnect.','AB'),
  ('Peace River Kraft Pulp Mill','Mercer International','pulp_kraft','322110',56.281,-117.456,'locality','Peace River','operating','2026-01-01'::date,475000::numeric,'t/yr',33::numeric,'intensity_model',144,'medium','https://mercerint.com/operations/mercer-peace-river/','Mercer','NBSK mill with cogen.','AB'),
  ('Athabasca Kraft Pulp Mill (Al-Pac)','Alberta-Pacific Forest Industries','pulp_kraft','322110',54.873,-112.869,'locality','Athabasca County (Boyle)','operating','2026-01-01'::date,650000::numeric,'t/yr',45::numeric,'intensity_model',240,'medium','https://alpac.ca/','Al-Pac','Largest single-line kraft mill in North America.','AB'),
  ('Exshaw Cement Plant','Lafarge (Holcim)','cement','327310',51.080,-115.160,'locality','Exshaw','operating','2026-01-01'::date,2200000::numeric,'t/yr',28::numeric,'intensity_model',138,'medium','https://www.lafarge.ca/en/exshaw-cement-plant','Lafarge','One of Canada largest cement plants.','AB'),
  ('Edmonton Cement Plant','Heidelberg Materials','cement','327310',53.572,-113.412,'locality','Edmonton','operating','2026-01-01'::date,1300000::numeric,'t/yr',16::numeric,'intensity_model',138,'medium','https://www.heidelbergmaterials-northamerica.com/','Heidelberg Materials','CCUS retrofit announced.','AB'),
  ('Medicine Hat Nitrogen Complex','CF Industries','fertilizer_nitrogen','325311',50.058,-110.745,'locality','Medicine Hat','operating','2026-01-01'::date,1300000::numeric,'t/yr',35::numeric,'intensity_model',138,'medium','https://www.cfindustries.com/','CF Industries','Major nitrogen complex.','AB')
) AS v(name,operator,facility_type,naics_code,lat,lng,coordinates_precision,municipality,status,status_as_of,capacity_value,capacity_unit,estimated_mw,estimate_basis,grid_voltage_kv,confidence,source_url,source_publisher,notes,state);

-- ── Texas seed (subset) ──
INSERT INTO public.industrial_facilities
  (name, operator, facility_type, naics_code, lat, lng, coordinates_precision, municipality,
   status, status_as_of, capacity_value, capacity_unit, estimated_mw, estimate_basis,
   grid_voltage_kv, confidence, source_url, source_publisher, notes, state)
SELECT * FROM (VALUES
  ('Freeport Integrated Chemical Complex','Dow','chlor_alkali','325181',28.953,-95.363,'locality','Freeport','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,345,'medium','https://corporate.dow.com/en-us/locations/texas-operations.html','Dow','Largest integrated chemical site in the Western Hemisphere.','TX'),
  ('Beaumont Methanol Plant','OCI / Methanex','methanol','325199',30.080,-94.090,'locality','Beaumont','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,138,'low','https://www.methanex.com/','Methanex','Methanol production; large electrical balance-of-plant.','TX'),
  ('Corpus Christi Polymers','Corpus Christi Polymers','petrochemical','325211',27.800,-97.400,'locality','Corpus Christi','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,138,'low','https://www.ccpolymers.com/','CCP','PTA/PET complex.','TX'),
  ('Sweeny Refinery','Phillips 66','petrochemical','324110',29.044,-95.708,'locality','Sweeny','operating','2026-01-01'::date,NULL::numeric,NULL,NULL::numeric,NULL,138,'low','https://www.phillips66.com/','Phillips 66','Refining + chemicals.','TX')
) AS v(name,operator,facility_type,naics_code,lat,lng,coordinates_precision,municipality,status,status_as_of,capacity_value,capacity_unit,estimated_mw,estimate_basis,grid_voltage_kv,confidence,source_url,source_publisher,notes,state);

-- ── gem_listings (real-estate scrape results from gem-listing-scanner) ──
CREATE TABLE public.gem_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_url text NOT NULL UNIQUE,
  source text NOT NULL,
  title text,
  price_usd numeric,
  acres numeric,
  building_sqft numeric,
  city text,
  state text,
  lat double precision,
  lng double precision,
  facility_type text,
  estimated_mw numeric,
  estimate_basis text,
  grid_voltage_kv integer,
  status text DEFAULT 'listed',
  status_as_of date,
  description text,
  image_url text,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gem_listings_latlng_brin ON public.gem_listings USING BRIN (lat, lng);
CREATE INDEX idx_gem_listings_state ON public.gem_listings (state);
CREATE INDEX idx_gem_listings_facility_type ON public.gem_listings (facility_type);

GRANT SELECT ON public.gem_listings TO authenticated;
GRANT ALL ON public.gem_listings TO service_role;
ALTER TABLE public.gem_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gem_listings_read_auth"
  ON public.gem_listings FOR SELECT TO authenticated USING (true);