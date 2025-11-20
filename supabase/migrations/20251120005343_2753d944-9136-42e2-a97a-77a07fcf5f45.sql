-- Create custom dashboards table
CREATE TABLE public.aeso_custom_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_name TEXT NOT NULL,
  description TEXT,
  layout_config JSONB DEFAULT '{"lg": [], "md": [], "sm": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_template BOOLEAN DEFAULT false,
  thumbnail_url TEXT
);

-- Create dashboard widgets table
CREATE TABLE public.aeso_dashboard_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.aeso_custom_dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('line_chart', 'bar_chart', 'area_chart', 'stat_card', 'gauge', 'table', 'pie_chart', 'combo_chart', 'heat_map')),
  widget_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_source TEXT NOT NULL CHECK (data_source IN ('historical_pricing', 'predictions', 'analytics', 'market_data', 'generation', 'weather')),
  data_filters JSONB DEFAULT '{}'::jsonb,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 4,
  height INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared dashboards table
CREATE TABLE public.aeso_shared_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.aeso_custom_dashboards(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  require_otp BOOLEAN DEFAULT false,
  recipient_email TEXT,
  recipient_name TEXT,
  access_level TEXT NOT NULL DEFAULT 'view_only' CHECK (access_level IN ('view_only', 'view_and_export')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  allowed_domains TEXT[],
  allowed_ips TEXT[],
  custom_branding JSONB DEFAULT '{}'::jsonb,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard views table for analytics
CREATE TABLE public.aeso_dashboard_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_dashboard_id UUID NOT NULL REFERENCES public.aeso_shared_dashboards(id) ON DELETE CASCADE,
  viewer_email TEXT,
  viewer_name TEXT,
  viewer_ip TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_duration INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.aeso_custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeso_dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeso_shared_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aeso_dashboard_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for aeso_custom_dashboards
CREATE POLICY "Users can view own dashboards"
ON public.aeso_custom_dashboards FOR SELECT
USING (auth.uid() = created_by OR is_template = true);

CREATE POLICY "Users can create dashboards"
ON public.aeso_custom_dashboards FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own dashboards"
ON public.aeso_custom_dashboards FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own dashboards"
ON public.aeso_custom_dashboards FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for aeso_dashboard_widgets
CREATE POLICY "Users can manage widgets for own dashboards"
ON public.aeso_dashboard_widgets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.aeso_custom_dashboards
    WHERE id = dashboard_id AND created_by = auth.uid()
  )
);

-- RLS Policies for aeso_shared_dashboards
CREATE POLICY "Users can view own share links"
ON public.aeso_shared_dashboards FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create share links for own dashboards"
ON public.aeso_shared_dashboards FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.aeso_custom_dashboards
    WHERE id = dashboard_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can manage own share links"
ON public.aeso_shared_dashboards FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own share links"
ON public.aeso_shared_dashboards FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for aeso_dashboard_views
CREATE POLICY "Owners can view dashboard analytics"
ON public.aeso_dashboard_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.aeso_shared_dashboards sd
    JOIN public.aeso_custom_dashboards d ON sd.dashboard_id = d.id
    WHERE sd.id = shared_dashboard_id AND d.created_by = auth.uid()
  )
);

CREATE POLICY "Service role can insert dashboard views"
ON public.aeso_dashboard_views FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_dashboards_created_by ON public.aeso_custom_dashboards(created_by);
CREATE INDEX idx_dashboards_is_template ON public.aeso_custom_dashboards(is_template);
CREATE INDEX idx_widgets_dashboard_id ON public.aeso_dashboard_widgets(dashboard_id);
CREATE INDEX idx_shared_dashboards_token ON public.aeso_shared_dashboards(share_token);
CREATE INDEX idx_shared_dashboards_status ON public.aeso_shared_dashboards(status);
CREATE INDEX idx_dashboard_views_shared_id ON public.aeso_dashboard_views(shared_dashboard_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_dashboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_aeso_custom_dashboards_updated_at
BEFORE UPDATE ON public.aeso_custom_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.update_dashboard_updated_at();

CREATE TRIGGER update_aeso_dashboard_widgets_updated_at
BEFORE UPDATE ON public.aeso_dashboard_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_dashboard_updated_at();

CREATE TRIGGER update_aeso_shared_dashboards_updated_at
BEFORE UPDATE ON public.aeso_shared_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.update_dashboard_updated_at();