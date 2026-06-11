-- Hidden Gems depth pass: verified locations, live grid checks, watchlist.
--
-- Part 1: industrial_facilities gains columns written by the new
--         facility-refine edge function — Google-geocoded coordinates and
--         OSM-measured grid context. These columns are only ever populated
--         from live API responses (location_method records which); they are
--         never seeded with guesses.
-- Part 2: gem_watchlist — per-user saved facilities/listings with strict
--         owner-scoped RLS.

-- ── Part 1: refinement columns ──────────────────────────────────────────────

ALTER TABLE public.industrial_facilities
  ADD COLUMN location_method text,              -- 'google_geocode' | 'seed' | NULL
  ADD COLUMN osm_substation_km double precision, -- live Overpass measurement
  ADD COLUMN osm_max_voltage_kv integer,
  ADD COLUMN osm_checked_at timestamptz;

-- Existing rows were desk-research seeds; record that explicitly so the UI
-- can distinguish "seeded guess" from "API-verified".
UPDATE public.industrial_facilities SET location_method = 'seed';

-- ── Part 2: watchlist ───────────────────────────────────────────────────────

CREATE TABLE public.gem_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('facility', 'listing')),
  target_id uuid NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_gem_watchlist_user ON public.gem_watchlist (user_id, created_at DESC);

ALTER TABLE public.gem_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_select_own" ON public.gem_watchlist
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "watchlist_insert_own" ON public.gem_watchlist
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_update_own" ON public.gem_watchlist
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "watchlist_delete_own" ON public.gem_watchlist
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gem_watchlist TO authenticated;
GRANT ALL ON public.gem_watchlist TO service_role;
