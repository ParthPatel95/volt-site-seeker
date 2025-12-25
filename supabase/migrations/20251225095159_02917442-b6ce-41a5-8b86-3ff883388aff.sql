-- PDU Device Registry
CREATE TABLE public.pdu_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip_address TEXT,
  protocol TEXT NOT NULL DEFAULT 'rest' CHECK (protocol IN ('snmp', 'modbus', 'rest', 'webhook')),
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  priority_group TEXT NOT NULL DEFAULT 'medium' CHECK (priority_group IN ('critical', 'high', 'medium', 'low')),
  location TEXT,
  current_status TEXT NOT NULL DEFAULT 'online' CHECK (current_status IN ('online', 'offline', 'shutting_down', 'starting_up', 'error')),
  total_outlets INTEGER DEFAULT 8,
  active_outlets INTEGER DEFAULT 8,
  current_load_kw NUMERIC DEFAULT 0,
  max_capacity_kw NUMERIC DEFAULT 0,
  last_status_check TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datacenter Shutdown Rules
CREATE TABLE public.datacenter_shutdown_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_ceiling_cad NUMERIC NOT NULL,
  price_floor_cad NUMERIC NOT NULL,
  soft_ceiling_cad NUMERIC,
  duration_threshold_minutes INTEGER DEFAULT 5,
  grace_period_seconds INTEGER DEFAULT 60,
  affected_priority_groups TEXT[] DEFAULT ARRAY['low', 'medium'],
  notification_channels TEXT[] DEFAULT ARRAY['app'],
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datacenter Automation Log
CREATE TABLE public.datacenter_automation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL CHECK (action_type IN ('shutdown', 'resume', 'warning', 'manual_override', 'scheduled')),
  trigger_price NUMERIC,
  threshold_price NUMERIC,
  rule_id UUID REFERENCES public.datacenter_shutdown_rules(id),
  affected_pdus UUID[],
  affected_pdu_count INTEGER DEFAULT 0,
  total_load_affected_kw NUMERIC DEFAULT 0,
  decision_confidence NUMERIC,
  estimated_savings_cad NUMERIC,
  actual_savings_cad NUMERIC,
  grid_stress_level TEXT,
  market_regime TEXT,
  ai_prediction_price NUMERIC,
  executed_by TEXT DEFAULT 'system',
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PDU Power Readings (for tracking power consumption over time)
CREATE TABLE public.pdu_power_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdu_id UUID NOT NULL REFERENCES public.pdu_devices(id) ON DELETE CASCADE,
  power_kw NUMERIC NOT NULL,
  voltage NUMERIC,
  current_amps NUMERIC,
  power_factor NUMERIC,
  energy_kwh NUMERIC,
  outlet_states JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Ceiling Alerts (extends existing alert system)
CREATE TABLE public.price_ceiling_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('ceiling_breach', 'ceiling_warning', 'floor_breach', 'forecast_warning', 'grid_stress')),
  current_price NUMERIC NOT NULL,
  threshold_price NUMERIC NOT NULL,
  price_direction TEXT CHECK (price_direction IN ('rising', 'falling', 'stable')),
  forecast_breach_hours INTEGER,
  grid_stress_level TEXT,
  rule_id UUID REFERENCES public.datacenter_shutdown_rules(id),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  auto_action_taken BOOLEAN DEFAULT false,
  action_log_id UUID REFERENCES public.datacenter_automation_log(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost Savings Summary (aggregated savings data)
CREATE TABLE public.datacenter_cost_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_curtailment_hours NUMERIC DEFAULT 0,
  total_energy_avoided_kwh NUMERIC DEFAULT 0,
  average_price_avoided_cad NUMERIC DEFAULT 0,
  total_savings_cad NUMERIC DEFAULT 0,
  peak_price_avoided_cad NUMERIC DEFAULT 0,
  shutdown_count INTEGER DEFAULT 0,
  resume_count INTEGER DEFAULT 0,
  false_positive_count INTEGER DEFAULT 0,
  uptime_percentage NUMERIC DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.pdu_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datacenter_shutdown_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datacenter_automation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdu_power_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_ceiling_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datacenter_cost_savings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pdu_devices
CREATE POLICY "Users can view PDU devices" ON public.pdu_devices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert PDU devices" ON public.pdu_devices FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own PDU devices" ON public.pdu_devices FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own PDU devices" ON public.pdu_devices FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for shutdown_rules
CREATE POLICY "Users can view shutdown rules" ON public.datacenter_shutdown_rules FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert shutdown rules" ON public.datacenter_shutdown_rules FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own shutdown rules" ON public.datacenter_shutdown_rules FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own shutdown rules" ON public.datacenter_shutdown_rules FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for automation_log (read-only for users, system can insert)
CREATE POLICY "Users can view automation logs" ON public.datacenter_automation_log FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role can insert automation logs" ON public.datacenter_automation_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update automation logs" ON public.datacenter_automation_log FOR UPDATE USING (true);

-- RLS Policies for power_readings
CREATE POLICY "Users can view power readings" ON public.pdu_power_readings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role can insert power readings" ON public.pdu_power_readings FOR INSERT WITH CHECK (true);

-- RLS Policies for price_ceiling_alerts
CREATE POLICY "Users can view price ceiling alerts" ON public.price_ceiling_alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role can manage price ceiling alerts" ON public.price_ceiling_alerts FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for cost_savings
CREATE POLICY "Users can view cost savings" ON public.datacenter_cost_savings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role can manage cost savings" ON public.datacenter_cost_savings FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_pdu_devices_status ON public.pdu_devices(current_status);
CREATE INDEX idx_pdu_devices_priority ON public.pdu_devices(priority_group);
CREATE INDEX idx_automation_log_status ON public.datacenter_automation_log(status);
CREATE INDEX idx_automation_log_executed_at ON public.datacenter_automation_log(executed_at DESC);
CREATE INDEX idx_power_readings_pdu_timestamp ON public.pdu_power_readings(pdu_id, timestamp DESC);
CREATE INDEX idx_price_ceiling_alerts_active ON public.price_ceiling_alerts(is_active, created_at DESC);
CREATE INDEX idx_cost_savings_period ON public.datacenter_cost_savings(period_start, period_end);

-- Trigger for updated_at
CREATE TRIGGER update_pdu_devices_updated_at BEFORE UPDATE ON public.pdu_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shutdown_rules_updated_at BEFORE UPDATE ON public.datacenter_shutdown_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();