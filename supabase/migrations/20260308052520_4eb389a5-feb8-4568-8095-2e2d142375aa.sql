
CREATE TABLE public.scan_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  property_type TEXT DEFAULT 'industrial',
  min_power_mw NUMERIC,
  budget_max NUMERIC,
  is_active BOOLEAN DEFAULT true,
  last_scanned_at TIMESTAMPTZ,
  notify_email BOOLEAN DEFAULT true,
  notify_in_app BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlist"
  ON public.scan_watchlist
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.scan_watchlist_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID REFERENCES public.scan_watchlist(id) ON DELETE CASCADE NOT NULL,
  scraped_property_id UUID NOT NULL,
  notified_at TIMESTAMPTZ,
  seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_watchlist_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist results"
  ON public.scan_watchlist_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.scan_watchlist w
      WHERE w.id = watchlist_id AND w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scan_watchlist w
      WHERE w.id = watchlist_id AND w.user_id = auth.uid()
    )
  );

CREATE TABLE public.property_shortlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE public.property_shortlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shortlist"
  ON public.property_shortlist
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
