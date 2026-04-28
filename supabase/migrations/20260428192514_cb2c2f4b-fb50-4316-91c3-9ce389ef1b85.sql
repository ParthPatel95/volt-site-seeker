CREATE TABLE public.consulting_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  client_type TEXT NOT NULL CHECK (client_type IN ('ai_hpc','bitcoin','inference','other')),
  target_capacity_mw NUMERIC,
  target_geography TEXT,
  timeline TEXT,
  project_description TEXT,
  source TEXT NOT NULL DEFAULT 'advisory_page',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consulting_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (public marketing form)
CREATE POLICY "Anyone can submit consulting inquiry"
  ON public.consulting_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read submitted inquiries
CREATE POLICY "Admins can read consulting inquiries"
  ON public.consulting_inquiries
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update inquiry status
CREATE POLICY "Admins can update consulting inquiries"
  ON public.consulting_inquiries
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_consulting_inquiries_updated_at
  BEFORE UPDATE ON public.consulting_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_consulting_inquiries_created_at ON public.consulting_inquiries (created_at DESC);
CREATE INDEX idx_consulting_inquiries_status ON public.consulting_inquiries (status);