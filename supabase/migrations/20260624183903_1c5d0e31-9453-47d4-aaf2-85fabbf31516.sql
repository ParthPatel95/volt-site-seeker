ALTER TABLE public.industrial_facilities
  ADD COLUMN IF NOT EXISTS location_method text,
  ADD COLUMN IF NOT EXISTS coord_provider text,
  ADD COLUMN IF NOT EXISTS coord_consensus_km double precision,
  ADD COLUMN IF NOT EXISTS coord_candidates jsonb,
  ADD COLUMN IF NOT EXISTS osm_parcel_id text,
  ADD COLUMN IF NOT EXISTS osm_parcel_name text,
  ADD COLUMN IF NOT EXISTS osm_parcel_kind text,
  ADD COLUMN IF NOT EXISTS activity_trend text,
  ADD COLUMN IF NOT EXISTS activity_trend_score numeric,
  ADD COLUMN IF NOT EXISTS activity_window_start date,
  ADD COLUMN IF NOT EXISTS activity_window_end date,
  ADD COLUMN IF NOT EXISTS activity_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS activity_evidence text;

UPDATE public.industrial_facilities
SET location_method = COALESCE(location_method, 'seed'),
    coord_provider = COALESCE(coord_provider, location_method, 'seed')
WHERE coord_provider IS NULL OR location_method IS NULL;

CREATE TABLE IF NOT EXISTS public.facility_activity_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.industrial_facilities(id) ON DELETE CASCADE,
  observed_at date NOT NULL,
  source text NOT NULL,
  scene_id text,
  cloud_cover_pct numeric,
  ndvi_mean_footprint numeric,
  ndvi_mean_baseline numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (facility_id, observed_at, source)
);

GRANT SELECT ON public.facility_activity_observations TO authenticated;
GRANT ALL ON public.facility_activity_observations TO service_role;

ALTER TABLE public.facility_activity_observations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'facility_activity_observations'
      AND policyname = 'activity_observations_read_auth'
  ) THEN
    CREATE POLICY "activity_observations_read_auth"
      ON public.facility_activity_observations
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_facility_activity_facility_date
  ON public.facility_activity_observations (facility_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_industrial_facilities_osm_parcel_id
  ON public.industrial_facilities (osm_parcel_id)
  WHERE osm_parcel_id IS NOT NULL;