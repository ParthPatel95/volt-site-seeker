-- Industrial facilities registry for the Hidden Gems site finder.
--
-- Unlike alberta_industrial_parks (zoned land), this table tracks OPERATING
-- INDUSTRIAL PLANTS whose existing grid interconnection makes them potential
-- acquisition targets when the host business idles, curtails, or closes —
-- the "45 MW sodium chlorite plant" pattern: electrolysis/motor-heavy
-- facilities where the substation and DTS contract outlive the business.
--
-- Data policy (matches the other alberta_* reference tables):
--   * Every row carries source_url / source_publisher provenance.
--   * estimated_mw is NEVER invented: it is either a published figure
--     (estimate_basis = 'published') or derived from nameplate production
--     capacity × a documented per-industry energy intensity
--     (estimate_basis = 'intensity_model' — see src/lib/hidden-gems.ts).
--   * status reflects the best-known operating state with status_as_of;
--     rows seeded from desk research are confidence = 'medium' or 'low'
--     until re-verified. The UI surfaces confidence and never presents
--     low-confidence rows as facts.
--   * coordinates_precision records whether lat/lng is the plant gate
--     ('site') or town-level ('locality').

CREATE TABLE public.industrial_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  operator text,
  facility_type text NOT NULL,          -- sodium_chlorate | chlor_alkali | pulp_kraft | pulp_mechanical | newsprint | osb_panel | sawmill | cement | lime | fertilizer_nitrogen | methanol | petrochemical | metals_refinery | carbon_black | gas_processing | air_separation | hydrogen | food_processing | canola_crush
  naics_code text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  coordinates_precision text NOT NULL DEFAULT 'locality',  -- 'site' | 'locality'
  municipality text,
  status text NOT NULL DEFAULT 'unknown',  -- operating | curtailed | idle | announced_closure | closed | for_sale | unknown
  status_as_of date,
  status_source_url text,
  capacity_value numeric,               -- nameplate production capacity
  capacity_unit text,                   -- 't/yr' | 'm3/yr' | 'MW' (when published load)
  estimated_mw numeric,                 -- electrical load estimate; see estimate_basis
  estimate_basis text,                  -- 'published' | 'intensity_model' | NULL (no estimate)
  grid_voltage_kv integer,              -- interconnection voltage if publicly known
  confidence text NOT NULL DEFAULT 'medium',  -- high | medium | low
  source_url text,
  source_publisher text,
  notes text,
  last_verified date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_industrial_facilities_latlng_brin
  ON public.industrial_facilities USING BRIN (lat, lng);
CREATE INDEX idx_industrial_facilities_status
  ON public.industrial_facilities (status);
CREATE INDEX idx_industrial_facilities_type
  ON public.industrial_facilities (facility_type);

GRANT SELECT ON public.industrial_facilities TO authenticated;
GRANT ALL ON public.industrial_facilities TO service_role;
ALTER TABLE public.industrial_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "industrial_facilities_read_auth"
  ON public.industrial_facilities FOR SELECT TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────────────────
-- Seed: Alberta heavy-load industrial facilities (desk research, Jan 2026
-- knowledge). Coordinates are locality-precision unless noted. Statuses
-- default to 'operating' with confidence 'medium' — refresh via news scan
-- before acting on any row. estimated_mw values use the intensity model
-- documented in src/lib/hidden-gems.ts unless estimate_basis = 'published'.
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO public.industrial_facilities
  (name, operator, facility_type, naics_code, lat, lng, coordinates_precision, municipality,
   status, status_as_of, capacity_value, capacity_unit, estimated_mw, estimate_basis,
   grid_voltage_kv, confidence, source_url, source_publisher, notes, last_verified)
VALUES
  -- Electrolysis chemicals — the archetypal hidden-gem class (≈9 MWh/t chlorate)
  ('Bruderheim Sodium Chlorate Plant', 'ERCO Worldwide', 'sodium_chlorate', '325181',
   53.805, -112.931, 'locality', 'Bruderheim',
   'operating', '2026-01-01', 55000, 't/yr', 57, 'intensity_model',
   144, 'medium', 'https://www.ercoworldwide.com/locations/', 'ERCO Worldwide',
   'Electrolysis load; chlorate plants of this size typically hold a 40–60 MW DTS contract. The benchmark "hidden gem" facility class.', NULL),

  ('Fort Saskatchewan Chlor-Alkali Complex', 'Dow Chemical Canada', 'chlor_alkali', '325181',
   53.713, -113.155, 'locality', 'Fort Saskatchewan',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   240, 'medium', 'https://corporate.dow.com/en-us/locations/fort-saskatchewan.html', 'Dow',
   'Part of the Dow Fort Saskatchewan complex (Path2Zero ethylene expansion underway). Chlor-alkali cells are large electrolysis loads.', NULL),

  ('Fort Saskatchewan Metals Refinery', 'Sherritt International', 'metals_refinery', '331410',
   53.717, -113.207, 'locality', 'Fort Saskatchewan',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   NULL, 'medium', 'https://www.sherritt.com/Operations/Metals', 'Sherritt',
   'Nickel/cobalt refinery; hydrogen reduction + electrowinning loads.', NULL),

  -- Pulp & paper — mechanical pulping is electricity-intensive (~2.2 MWh/t)
  ('Slave Lake Pulp (BCTMP)', 'West Fraser', 'pulp_mechanical', '322110',
   55.273, -114.749, 'locality', 'Slave Lake',
   'unknown', '2026-01-01', 230000, 't/yr', 58, 'intensity_model',
   144, 'low', 'https://www.westfraser.com/products/pulp', 'West Fraser',
   'BCTMP mill — mechanical pulping is among the highest electricity-intensity wood processes. Operating status fluctuated in recent years; verify before action.', NULL),

  ('Whitecourt Newsprint Mill', 'Alberta Newsprint Company', 'newsprint', '322122',
   54.124, -115.751, 'locality', 'Whitecourt',
   'operating', '2026-01-01', 260000, 't/yr', 65, 'intensity_model',
   144, 'medium', 'https://albertanewsprint.com/', 'ANC',
   'TMP newsprint — structurally declining product class; high electrical load (~2.2 MWh/t). Watch for curtailment news.', NULL),

  ('Hinton Kraft Pulp Mill', 'Mondi (ex-West Fraser Hinton Pulp)', 'pulp_kraft', '322110',
   53.397, -117.566, 'locality', 'Hinton',
   'operating', '2026-01-01', 250000, 't/yr', 18, 'intensity_model',
   144, 'medium', 'https://www.mondigroup.com/', 'Mondi',
   'Kraft process self-generates most steam/power from black liquor — net grid draw modest, but site has full transmission interconnect.', NULL),

  ('Peace River Kraft Pulp Mill', 'Mercer International', 'pulp_kraft', '322110',
   56.281, -117.456, 'locality', 'Peace River',
   'operating', '2026-01-01', 475000, 't/yr', 33, 'intensity_model',
   144, 'medium', 'https://mercerint.com/operations/mercer-peace-river/', 'Mercer',
   'NBSK mill with on-site cogen; net exporter at times.', NULL),

  ('Athabasca Kraft Pulp Mill (Al-Pac)', 'Alberta-Pacific Forest Industries', 'pulp_kraft', '322110',
   54.873, -112.869, 'locality', 'Athabasca County (Boyle)',
   'operating', '2026-01-01', 650000, 't/yr', 45, 'intensity_model',
   240, 'medium', 'https://alpac.ca/', 'Al-Pac',
   'Largest single-line kraft mill in North America; biomass cogen on site.', NULL),

  ('Grande Prairie Kraft Pulp Mill', 'International Paper (ex-Weyerhaeuser)', 'pulp_kraft', '322110',
   55.130, -118.745, 'locality', 'Grande Prairie',
   'operating', '2026-01-01', 350000, 't/yr', 25, 'intensity_model',
   144, 'low', 'https://www.internationalpaper.com/', 'International Paper',
   'Ownership/portfolio reviews recurring in this asset class; verify operator and status.', NULL),

  -- Panels & sawmills — moderate loads, strong substation reuse profile
  ('High Level OSB Mill', 'Tolko Industries', 'osb_panel', '321219',
   58.512, -117.135, 'locality', 'High Level',
   'operating', '2026-01-01', 800000, 'm3/yr', 16, 'intensity_model',
   144, 'low', 'https://tolko.com/', 'Tolko',
   'Remote North-West AB; long radial feed — interconnection more valuable than location suggests.', NULL),

  ('Edson OSB Mill', 'Weyerhaeuser', 'osb_panel', '321219',
   53.581, -116.439, 'locality', 'Edson',
   'operating', '2026-01-01', 700000, 'm3/yr', 14, 'intensity_model',
   144, 'low', 'https://www.weyerhaeuser.com/', 'Weyerhaeuser',
   NULL, NULL),

  -- Cement & lime — big kilns + grinding (~0.11 MWh/t cement, electrical)
  ('Exshaw Cement Plant', 'Lafarge (Holcim)', 'cement', '327310',
   51.080, -115.160, 'locality', 'Exshaw',
   'operating', '2026-01-01', 2200000, 't/yr', 28, 'intensity_model',
   138, 'medium', 'https://www.lafarge.ca/en/exshaw-cement-plant', 'Lafarge',
   'One of Canada''s largest cement plants.', NULL),

  ('Edmonton Cement Plant', 'Heidelberg Materials (ex-Lehigh)', 'cement', '327310',
   53.572, -113.412, 'locality', 'Edmonton',
   'operating', '2026-01-01', 1300000, 't/yr', 16, 'intensity_model',
   138, 'medium', 'https://www.heidelbergmaterials-northamerica.com/', 'Heidelberg Materials',
   'CCUS retrofit announced — strategic site, unlikely seller, but tracks the class.', NULL),

  -- Nitrogen / methanol / carbon black — Medicine Hat industrial cluster
  ('Medicine Hat Nitrogen Complex', 'CF Industries', 'fertilizer_nitrogen', '325311',
   50.058, -110.745, 'locality', 'Medicine Hat',
   'operating', '2026-01-01', 1300000, 't/yr', 35, 'intensity_model',
   138, 'medium', 'https://www.cfindustries.com/what-we-do/locations', 'CF Industries',
   'Ammonia/urea — primarily gas-fed; electrical load from compression and ASU.', NULL),

  ('Medicine Hat Methanol Plant', 'Methanex', 'methanol', '325199',
   50.041, -110.737, 'locality', 'Medicine Hat',
   'operating', '2026-01-01', 600000, 't/yr', 12, 'intensity_model',
   138, 'medium', 'https://www.methanex.com/about-us/global-locations/', 'Methanex',
   'Restarted 2011 after long idle — this site itself is a historical hidden-gem case study.', NULL),

  ('Medicine Hat Thermal Carbon Black Plant', 'Cancarb (Tokai Carbon)', 'carbon_black', '325180',
   50.066, -110.722, 'locality', 'Medicine Hat',
   'operating', '2026-01-01', 50000, 't/yr', NULL, NULL,
   69, 'medium', 'https://www.cancarb.com/', 'Cancarb',
   NULL, NULL),

  ('Redwater Fertilizer Operations', 'Nutrien', 'fertilizer_nitrogen', '325311',
   53.951, -113.103, 'locality', 'Redwater',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   240, 'medium', 'https://www.nutrien.com/', 'Nutrien',
   'Heartland-region nitrogen + phosphate operations.', NULL),

  ('Carseland Nitrogen Plant', 'Nutrien', 'fertilizer_nitrogen', '325311',
   50.840, -113.443, 'locality', 'Carseland',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   138, 'medium', 'https://www.nutrien.com/', 'Nutrien',
   NULL, NULL),

  ('Joffre Petrochemical Complex', 'NOVA Chemicals', 'petrochemical', '325110',
   52.297, -113.551, 'locality', 'Joffre (Lacombe County)',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   240, 'medium', 'https://www.novachem.com/', 'NOVA Chemicals',
   'One of the world''s largest ethylene complexes; major cogen on site.', NULL),

  -- Industrial gases & hydrogen — Heartland cluster, electrolysis-adjacent
  ('Fort Saskatchewan Air Separation / Hydrogen', 'Air Products', 'air_separation', '325120',
   53.770, -113.130, 'locality', 'Fort Saskatchewan (Heartland)',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   240, 'medium', 'https://www.airproducts.com/company/locations', 'Air Products',
   'Net-zero hydrogen complex; ASU compressor trains are pure electrical load.', NULL),

  -- Food processing — southern AB irrigation belt
  ('Taber Potato Processing Plant', 'Lamb Weston', 'food_processing', '311411',
   49.787, -112.150, 'locality', 'Taber',
   'operating', '2026-01-01', NULL, NULL, NULL, NULL,
   69, 'medium', 'https://www.lambweston.com/', 'Lamb Weston',
   'Refrigeration-heavy; expanded 2023.', NULL),

  ('Lloydminster Canola Crush Plant', 'ADM', 'canola_crush', '311224',
   53.278, -110.005, 'locality', 'Lloydminster (AB side)',
   'operating', '2026-01-01', 1500, 't/day', 9, 'intensity_model',
   72, 'low', 'https://www.adm.com/', 'ADM',
   NULL, NULL)
;
