-- Create price alerts table for user-defined price monitoring
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_threshold', 'spike_detection', 'forecast_alert')),
  threshold_value NUMERIC NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below', 'spike')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_method TEXT NOT NULL DEFAULT 'app' CHECK (notification_method IN ('app', 'email')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own price alerts" 
ON public.price_alerts 
FOR ALL
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = true;

-- Create update trigger
CREATE TRIGGER update_price_alerts_updated_at
  BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();