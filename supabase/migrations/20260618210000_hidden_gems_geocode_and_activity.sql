-- Hidden Gems: stronger geocoding provenance + closure-signal observations.
--
-- Part 1: industrial_facilities gains columns that let the rewritten
--   facility-refine function track multi-provider consensus (Google Places +
--   Geocoding, with OSM industrial-polygon snap). The current single-provider
--   pipeline often kept the geocoded town-centre and called it "locality"; we
--   now distinguish coordinates snapped to a real industrial parcel from those
--   that are just a city centroid, and surface the disagreement between
--   providers in the UI.
-- Part 2: facility_activity_observations — historical Sentinel-2 NDVI
--   readings near each facility, plus the rolling closure-signal trend that
--   the facility-activity-monitor edge function computes from them.

-- ── Part 1: richer coordinate provenance ────────────────────────────────────

ALTER TABLE public.industrial_facilities
  -- The current `coordinates_precision` text column is kept (callers read it),
  -- but extended with two new tiers and supplemented with structured fields.
  --   site     — rooftop / building-resolution (Google Places ROOFTOP)
  --   parcel   — snapped to an OSM industrial polygon at the geocode point
  --   locality — town-centre / municipal centroid (low quality, was the bug)
  --   unverified — kept as-is from the seed
  ADD COLUMN coord_provider text,         -- 'google_places' | 'google_geocode' | 'osm_parcel_snap' | 'seed'
  ADD COLUMN coord_consensus_km double precision, -- max distance between candidate providers
  ADD COLUMN coord_candidates jsonb,      -- array of { provider, lat, lng, label, kind }
  ADD COLUMN osm_parcel_id text,          -- OSM way/relation id we snapped to, if any
  ADD COLUMN osm_parcel_name text,        -- the polygon's name= tag, when present
  ADD COLUMN osm_parcel_kind text;        -- 'industrial' | 'works' | 'plant' | 'refinery' | ...

-- Recently re-seeded rows can stay 'seed'; everything else gets 'seed' too.
UPDATE public.industrial_facilities
  SET coord_provider = COALESCE(coord_provider, location_method, 'seed');

-- ── Part 2: facility-activity observations + rolling trend ──────────────────

-- One row per scene the activity monitor evaluates over a small bbox around
-- the facility. NDVI mean inside the footprint vs a nearby bare-soil baseline
-- is the headline metric — rising NDVI over the footprint means vegetation
-- is reclaiming the site, the classic visible-from-orbit closure signal.
-- Every row carries the scene id + cloud cover so a reviewer can trace it.
CREATE TABLE public.facility_activity_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.industrial_facilities(id) ON DELETE CASCADE,
  observed_at date NOT NULL,
  source text NOT NULL,                   -- 'sentinel-2-l2a' | 'landsat-9-c2l2' | ...
  scene_id text,
  cloud_cover_pct numeric,
  ndvi_mean_footprint numeric,            -- mean NDVI inside the facility bbox
  ndvi_mean_baseline numeric,             -- mean NDVI over a nearby reference area
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (facility_id, observed_at, source)
);

CREATE INDEX idx_facility_activity_facility_date
  ON public.facility_activity_observations (facility_id, observed_at DESC);

-- Rolling trend computed by the monitor and stored back on the facility so
-- the list can sort/filter by it without joining the observations every read.
ALTER TABLE public.industrial_facilities
  -- 'rising_vegetation' | 'stable' | 'recovering' | 'no_data'
  ADD COLUMN activity_trend text,
  -- 0–100, higher = stronger closure signal (vegetation encroaching faster
  -- than the surrounding baseline over the analysis window)
  ADD COLUMN activity_trend_score numeric,
  ADD COLUMN activity_window_start date,
  ADD COLUMN activity_window_end date,
  ADD COLUMN activity_checked_at timestamptz,
  -- short human-readable explanation derived from the observations,
  -- e.g. "NDVI +0.18 over footprint vs +0.02 baseline (2023→2026)"
  ADD COLUMN activity_evidence text;

GRANT SELECT ON public.facility_activity_observations TO authenticated;
GRANT ALL ON public.facility_activity_observations TO service_role;
ALTER TABLE public.facility_activity_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_observations_read_auth"
  ON public.facility_activity_observations FOR SELECT TO authenticated USING (true);
