-- Add voltage, temperature, and power factor to PDU readings
ALTER TABLE pdu_power_readings 
ADD COLUMN IF NOT EXISTS voltage NUMERIC,
ADD COLUMN IF NOT EXISTS temperature_celsius NUMERIC,
ADD COLUMN IF NOT EXISTS power_factor NUMERIC;

-- Create notification settings table
CREATE TABLE datacenter_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES datacenter_shutdown_rules(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'webhook', 'app')),
  destination TEXT,
  notify_on_warning BOOLEAN DEFAULT true,
  notify_on_shutdown BOOLEAN DEFAULT true,
  notify_on_resume BOOLEAN DEFAULT true,
  delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chart annotations table
CREATE TABLE chart_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  annotation_type TEXT NOT NULL CHECK (annotation_type IN ('horizontal_line', 'trend_line', 'text', 'fib', 'ceiling', 'floor')),
  data JSONB NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE datacenter_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_annotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification settings (authenticated users can manage)
CREATE POLICY "Users can view notification settings" 
ON datacenter_notification_settings 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create notification settings" 
ON datacenter_notification_settings 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update notification settings" 
ON datacenter_notification_settings 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Users can delete notification settings" 
ON datacenter_notification_settings 
FOR DELETE 
TO authenticated 
USING (true);

-- RLS Policies for chart annotations (users can only manage their own)
CREATE POLICY "Users can view own chart annotations" 
ON chart_annotations 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chart annotations" 
ON chart_annotations 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chart annotations" 
ON chart_annotations 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chart annotations" 
ON chart_annotations 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_notification_settings_rule_id ON datacenter_notification_settings(rule_id);
CREATE INDEX idx_chart_annotations_user_id ON chart_annotations(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON datacenter_notification_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chart_annotations_updated_at
BEFORE UPDATE ON chart_annotations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();