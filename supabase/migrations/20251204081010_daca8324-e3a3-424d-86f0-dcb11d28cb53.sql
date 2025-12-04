-- Intelligence Hub persistence tables

-- Saved opportunities table
CREATE TABLE public.intelligence_hub_saved_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Watchlist table
CREATE TABLE public.intelligence_hub_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  opportunity_name TEXT NOT NULL,
  opportunity_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

-- Alerts table
CREATE TABLE public.intelligence_hub_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alert preferences table
CREATE TABLE public.intelligence_hub_alert_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enable_new_opportunity_alerts BOOLEAN NOT NULL DEFAULT true,
  enable_distress_signal_alerts BOOLEAN NOT NULL DEFAULT true,
  enable_price_change_alerts BOOLEAN NOT NULL DEFAULT false,
  enable_email_notifications BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scan history table
CREATE TABLE public.intelligence_hub_scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_config JSONB NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  total_mw NUMERIC,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.intelligence_hub_saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_hub_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_hub_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_hub_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_hub_scan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved opportunities
CREATE POLICY "Users can view their own saved opportunities" ON public.intelligence_hub_saved_opportunities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own saved opportunities" ON public.intelligence_hub_saved_opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saved opportunities" ON public.intelligence_hub_saved_opportunities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved opportunities" ON public.intelligence_hub_saved_opportunities FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for watchlist
CREATE POLICY "Users can view their own watchlist" ON public.intelligence_hub_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own watchlist items" ON public.intelligence_hub_watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watchlist items" ON public.intelligence_hub_watchlist FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for alerts
CREATE POLICY "Users can view their own alerts" ON public.intelligence_hub_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alerts" ON public.intelligence_hub_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.intelligence_hub_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.intelligence_hub_alerts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for alert preferences
CREATE POLICY "Users can view their own alert preferences" ON public.intelligence_hub_alert_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alert preferences" ON public.intelligence_hub_alert_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alert preferences" ON public.intelligence_hub_alert_preferences FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for scan history
CREATE POLICY "Users can view their own scan history" ON public.intelligence_hub_scan_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scan history" ON public.intelligence_hub_scan_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_intelligence_hub_saved_opportunities_updated_at
  BEFORE UPDATE ON public.intelligence_hub_saved_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intelligence_hub_alert_preferences_updated_at
  BEFORE UPDATE ON public.intelligence_hub_alert_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();