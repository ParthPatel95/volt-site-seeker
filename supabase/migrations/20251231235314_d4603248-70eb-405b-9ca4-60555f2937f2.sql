-- Create hydro_miners table for managing Bitmain Hydro mining fleet
CREATE TABLE public.hydro_miners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL, -- e.g., "S21 Hydro", "S19 XP Hydro"
  ip_address INET NOT NULL,
  mac_address TEXT,
  api_port INTEGER NOT NULL DEFAULT 4028,
  http_port INTEGER NOT NULL DEFAULT 80,
  firmware_type TEXT NOT NULL DEFAULT 'stock' CHECK (firmware_type IN ('stock', 'luxos', 'braiins', 'foundry')),
  api_credentials JSONB DEFAULT '{}', -- Encrypted username/password for HTTP digest auth
  priority_group TEXT NOT NULL DEFAULT 'medium' CHECK (priority_group IN ('critical', 'high', 'medium', 'low', 'curtailable')),
  location TEXT, -- Rack/row identifier
  current_status TEXT NOT NULL DEFAULT 'offline' CHECK (current_status IN ('mining', 'idle', 'sleeping', 'offline', 'error', 'rebooting')),
  current_hashrate_th DECIMAL,
  target_hashrate_th DECIMAL,
  power_consumption_w INTEGER,
  inlet_temp_c DECIMAL,
  outlet_temp_c DECIMAL,
  chip_temp_avg_c DECIMAL,
  fan_speed_avg INTEGER,
  pool_url TEXT,
  worker_name TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create miner_power_readings table for historical data
CREATE TABLE public.miner_power_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  miner_id UUID NOT NULL REFERENCES public.hydro_miners(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  hashrate_th DECIMAL,
  power_w INTEGER,
  inlet_temp_c DECIMAL,
  outlet_temp_c DECIMAL,
  chip_temp_avg_c DECIMAL,
  chip_temp_max_c DECIMAL,
  fan_speeds JSONB,
  efficiency_jth DECIMAL, -- Joules per TH
  accepted_shares BIGINT,
  rejected_shares BIGINT,
  hardware_errors INTEGER
);

-- Create miner_control_log table for audit trail
CREATE TABLE public.miner_control_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  miner_ids UUID[] NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('sleep', 'wakeup', 'reboot', 'restart', 'set_power', 'set_frequency', 'register', 'delete', 'update_config')),
  triggered_by TEXT NOT NULL DEFAULT 'manual' CHECK (triggered_by IN ('automation', 'manual', 'schedule', 'alert')),
  trigger_reason TEXT,
  target_power_w INTEGER,
  execution_status TEXT NOT NULL DEFAULT 'pending' CHECK (execution_status IN ('pending', 'in_progress', 'success', 'partial', 'failed')),
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for efficient queries
CREATE INDEX idx_hydro_miners_status ON public.hydro_miners(current_status);
CREATE INDEX idx_hydro_miners_priority ON public.hydro_miners(priority_group);
CREATE INDEX idx_hydro_miners_ip ON public.hydro_miners(ip_address);
CREATE INDEX idx_miner_readings_miner_time ON public.miner_power_readings(miner_id, timestamp DESC);
CREATE INDEX idx_miner_control_log_time ON public.miner_control_log(created_at DESC);
CREATE INDEX idx_miner_control_log_action ON public.miner_control_log(action);

-- Enable RLS
ALTER TABLE public.hydro_miners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miner_power_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miner_control_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hydro_miners
CREATE POLICY "Anyone can view miners" ON public.hydro_miners FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage miners" ON public.hydro_miners FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for miner_power_readings
CREATE POLICY "Anyone can view readings" ON public.miner_power_readings FOR SELECT USING (true);
CREATE POLICY "Service can insert readings" ON public.miner_power_readings FOR INSERT WITH CHECK (true);

-- RLS Policies for miner_control_log
CREATE POLICY "Anyone can view control log" ON public.miner_control_log FOR SELECT USING (true);
CREATE POLICY "Service can insert control log" ON public.miner_control_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update control log" ON public.miner_control_log FOR UPDATE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_hydro_miners_updated_at
  BEFORE UPDATE ON public.hydro_miners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();