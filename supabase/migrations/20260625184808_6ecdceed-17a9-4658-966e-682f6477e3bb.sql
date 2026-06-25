ALTER TABLE public.gem_listings
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_stale boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS gem_listings_last_seen_at_idx ON public.gem_listings (last_seen_at DESC);

CREATE OR REPLACE FUNCTION public.mark_stale_gem_listings(p_threshold_hours integer DEFAULT 72)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.gem_listings
  SET is_stale = true
  WHERE last_seen_at < now() - make_interval(hours => p_threshold_hours)
    AND is_stale = false;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;