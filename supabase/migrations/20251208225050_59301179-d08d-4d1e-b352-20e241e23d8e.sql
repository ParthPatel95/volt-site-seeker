-- Table to store shared AESO analysis reports
CREATE TABLE public.shared_aeso_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  share_token TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'AESO Analysis Report',
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  report_type TEXT DEFAULT 'single' CHECK (report_type IN ('single', 'comprehensive')),
  report_data JSONB NOT NULL,
  report_config JSONB NOT NULL,
  report_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track viewer access
CREATE TABLE public.shared_aeso_report_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.shared_aeso_reports(id) ON DELETE CASCADE,
  viewer_name TEXT NOT NULL,
  viewer_email TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  viewer_ip TEXT,
  viewer_user_agent TEXT
);

-- Table for translation cache
CREATE TABLE public.aeso_report_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.shared_aeso_reports(id) ON DELETE CASCADE,
  target_language TEXT NOT NULL,
  translated_content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, target_language)
);

-- Enable RLS
ALTER TABLE public.shared_aeso_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_aeso_report_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeso_report_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_aeso_reports
CREATE POLICY "Users can view their own shared reports"
ON public.shared_aeso_reports FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create shared reports"
ON public.shared_aeso_reports FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own shared reports"
ON public.shared_aeso_reports FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own shared reports"
ON public.shared_aeso_reports FOR DELETE
USING (auth.uid() = created_by);

-- Public read access for shared reports via token (for edge functions)
CREATE POLICY "Public can read active shared reports by token"
ON public.shared_aeso_reports FOR SELECT
USING (status = 'active');

-- RLS Policies for shared_aeso_report_views (anyone can insert views, owners can read)
CREATE POLICY "Anyone can record views"
ON public.shared_aeso_report_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Report owners can view access logs"
ON public.shared_aeso_report_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_aeso_reports r
    WHERE r.id = report_id AND r.created_by = auth.uid()
  )
);

-- RLS Policies for translations (public read, system write)
CREATE POLICY "Anyone can read translations"
ON public.aeso_report_translations FOR SELECT
USING (true);

CREATE POLICY "Anyone can create translations"
ON public.aeso_report_translations FOR INSERT
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_shared_aeso_reports_updated_at
BEFORE UPDATE ON public.shared_aeso_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster token lookups
CREATE INDEX idx_shared_aeso_reports_token ON public.shared_aeso_reports(share_token);
CREATE INDEX idx_shared_aeso_reports_status ON public.shared_aeso_reports(status);