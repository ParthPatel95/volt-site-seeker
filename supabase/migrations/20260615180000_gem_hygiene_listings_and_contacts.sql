-- Hidden Gems hygiene: listing freshness tracking + facility coordinate
-- provenance fields the panel/detail view needs to surface correctly.

-- ── 1. Listing freshness ────────────────────────────────────────────────────
-- Without this, listings stay in the panel forever after the property sells.
-- The scanner now stamps last_seen_at on every hit; a row that hasn't been
-- re-seen in 14 days is marked 'stale' so the UI can filter or label it.

ALTER TABLE public.gem_listings
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'stale', 'sold_or_removed'));

-- Backfill last_seen_at from scraped_at so existing rows have a sensible
-- baseline.
UPDATE public.gem_listings
  SET last_seen_at = scraped_at
  WHERE last_seen_at = created_at AND scraped_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gem_listings_status ON public.gem_listings (status);
CREATE INDEX IF NOT EXISTS idx_gem_listings_last_seen ON public.gem_listings (last_seen_at DESC);

-- One-shot helper to mark rows stale. Called by the scanner after each run
-- (and exposed as an RPC so a cron job can call it independently).
CREATE OR REPLACE FUNCTION public.mark_stale_gem_listings(p_days integer DEFAULT 14)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.gem_listings
  SET status = 'stale'
  WHERE status = 'active'
    AND last_seen_at < (now() - (p_days || ' days')::interval);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_stale_gem_listings(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_stale_gem_listings(integer) TO service_role;

-- ── 2. Facility contact / off-market intel surface ──────────────────────────
-- The "Full report" dialog needs places to surface deal-team contacts and any
-- known off-market broker. Optional everywhere — UI shows "—" when null.

ALTER TABLE public.industrial_facilities
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_role text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS broker_name text,
  ADD COLUMN IF NOT EXISTS broker_url text,
  ADD COLUMN IF NOT EXISTS deal_notes text;
