-- Create table for AESO grid alerts from RSS feed
CREATE TABLE public.aeso_grid_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  guid TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'ended'
  alert_type TEXT, -- 'grid_alert', 'eea', 'maintenance'
  source TEXT DEFAULT 'aeso_rss',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aeso_grid_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (alerts are public info)
CREATE POLICY "Anyone can view grid alerts"
ON public.aeso_grid_alerts
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_aeso_grid_alerts_published_at ON public.aeso_grid_alerts(published_at DESC);
CREATE INDEX idx_aeso_grid_alerts_status ON public.aeso_grid_alerts(status);

-- Create trigger for updated_at
CREATE TRIGGER update_aeso_grid_alerts_updated_at
BEFORE UPDATE ON public.aeso_grid_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();