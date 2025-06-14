
-- Enable Row Level Security on the remaining tables
ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_timing_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for user_alert_preferences (user-specific data)
CREATE POLICY "Users can view their own alert preferences" ON public.user_alert_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alert preferences" ON public.user_alert_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert preferences" ON public.user_alert_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert preferences" ON public.user_alert_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for market_timing_analysis (public read, authenticated write)
CREATE POLICY "Anyone can view market timing analysis" ON public.market_timing_analysis
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert market timing analysis" ON public.market_timing_analysis
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update market timing analysis" ON public.market_timing_analysis
  FOR UPDATE USING (auth.uid() IS NOT NULL);
