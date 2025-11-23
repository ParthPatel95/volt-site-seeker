-- Create dashboard tags table
CREATE TABLE IF NOT EXISTS public.dashboard_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES aeso_custom_dashboards(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dashboard_id, tag)
);

-- Create dashboard stars/favorites table
CREATE TABLE IF NOT EXISTS public.dashboard_stars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES aeso_custom_dashboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dashboard_id, user_id)
);

-- Create dashboard views tracking table
CREATE TABLE IF NOT EXISTS public.dashboard_view_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES aeso_custom_dashboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_view_logs ENABLE ROW LEVEL SECURITY;

-- Policies for dashboard_tags
CREATE POLICY "Anyone can view dashboard tags"
  ON public.dashboard_tags FOR SELECT
  USING (true);

CREATE POLICY "Dashboard owner can manage tags"
  ON public.dashboard_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM aeso_custom_dashboards
      WHERE id = dashboard_id AND created_by = auth.uid()
    )
  );

-- Policies for dashboard_stars
CREATE POLICY "Users can view their own stars"
  ON public.dashboard_stars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own stars"
  ON public.dashboard_stars FOR ALL
  USING (auth.uid() = user_id);

-- Policies for dashboard_view_logs
CREATE POLICY "Users can view their own view logs"
  ON public.dashboard_view_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own view logs"
  ON public.dashboard_view_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_dashboard_tags_dashboard_id ON public.dashboard_tags(dashboard_id);
CREATE INDEX idx_dashboard_tags_tag ON public.dashboard_tags(tag);
CREATE INDEX idx_dashboard_stars_dashboard_id ON public.dashboard_stars(dashboard_id);
CREATE INDEX idx_dashboard_stars_user_id ON public.dashboard_stars(user_id);
CREATE INDEX idx_dashboard_view_logs_dashboard_id ON public.dashboard_view_logs(dashboard_id);
CREATE INDEX idx_dashboard_view_logs_user_id ON public.dashboard_view_logs(user_id);
CREATE INDEX idx_dashboard_view_logs_viewed_at ON public.dashboard_view_logs(viewed_at DESC);

-- Add view_count column to dashboards table for caching
ALTER TABLE public.aeso_custom_dashboards 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to update view count
CREATE OR REPLACE FUNCTION update_dashboard_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE aeso_custom_dashboards
  SET view_count = view_count + 1
  WHERE id = NEW.dashboard_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update view count
CREATE TRIGGER increment_dashboard_views
  AFTER INSERT ON dashboard_view_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_view_count();