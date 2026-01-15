-- Create table for Telegram alert configurations
CREATE TABLE public.telegram_alert_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_token TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Telegram Alerts',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual alert rules
CREATE TABLE public.telegram_alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_id UUID NOT NULL REFERENCES public.telegram_alert_settings(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_low', 'price_high', 'grid_stress', 'plant_outage', 'eea', 'price_spike', 'custom')),
  condition TEXT NOT NULL DEFAULT 'below' CHECK (condition IN ('above', 'below', 'equals', 'contains', 'change_percent')),
  threshold_value NUMERIC,
  custom_metric TEXT,
  message_template TEXT,
  cooldown_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for alert history
CREATE TABLE public.telegram_alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.telegram_alert_rules(id) ON DELETE CASCADE,
  setting_id UUID NOT NULL REFERENCES public.telegram_alert_settings(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  trigger_data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.telegram_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for telegram_alert_settings
CREATE POLICY "Users can view their own telegram settings"
  ON public.telegram_alert_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own telegram settings"
  ON public.telegram_alert_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telegram settings"
  ON public.telegram_alert_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram settings"
  ON public.telegram_alert_settings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for telegram_alert_rules
CREATE POLICY "Users can view their own telegram rules"
  ON public.telegram_alert_rules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.telegram_alert_settings 
    WHERE id = telegram_alert_rules.setting_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create telegram rules for their settings"
  ON public.telegram_alert_rules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.telegram_alert_settings 
    WHERE id = telegram_alert_rules.setting_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own telegram rules"
  ON public.telegram_alert_rules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.telegram_alert_settings 
    WHERE id = telegram_alert_rules.setting_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own telegram rules"
  ON public.telegram_alert_rules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.telegram_alert_settings 
    WHERE id = telegram_alert_rules.setting_id AND user_id = auth.uid()
  ));

-- RLS Policies for telegram_alert_history
CREATE POLICY "Users can view their own telegram history"
  ON public.telegram_alert_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.telegram_alert_settings 
    WHERE id = telegram_alert_history.setting_id AND user_id = auth.uid()
  ));

-- Service role can insert history (for edge functions)
CREATE POLICY "Service role can insert telegram history"
  ON public.telegram_alert_history FOR INSERT
  WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_telegram_settings_updated_at
  BEFORE UPDATE ON public.telegram_alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telegram_rules_updated_at
  BEFORE UPDATE ON public.telegram_alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_telegram_settings_user_id ON public.telegram_alert_settings(user_id);
CREATE INDEX idx_telegram_settings_active ON public.telegram_alert_settings(is_active) WHERE is_active = true;
CREATE INDEX idx_telegram_rules_setting_id ON public.telegram_alert_rules(setting_id);
CREATE INDEX idx_telegram_rules_active ON public.telegram_alert_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_telegram_rules_type ON public.telegram_alert_rules(alert_type);
CREATE INDEX idx_telegram_history_rule_id ON public.telegram_alert_history(rule_id);
CREATE INDEX idx_telegram_history_sent_at ON public.telegram_alert_history(sent_at DESC);