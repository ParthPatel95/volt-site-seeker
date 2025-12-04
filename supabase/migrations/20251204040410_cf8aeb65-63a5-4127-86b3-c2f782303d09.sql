-- Create ASIC miners table
CREATE TABLE public.asic_miners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  hashrate_th NUMERIC NOT NULL,
  power_watts INTEGER NOT NULL,
  efficiency_jth NUMERIC NOT NULL,
  cooling_type TEXT NOT NULL DEFAULT 'air',
  release_date DATE,
  msrp_usd INTEGER,
  market_price_usd INTEGER,
  algorithm TEXT NOT NULL DEFAULT 'SHA-256',
  is_available BOOLEAN NOT NULL DEFAULT true,
  generation TEXT NOT NULL DEFAULT 'current',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asic_miners ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view ASIC miners"
ON public.asic_miners
FOR SELECT
USING (true);

-- Insert 25+ ASIC miners
INSERT INTO public.asic_miners (manufacturer, model, hashrate_th, power_watts, efficiency_jth, cooling_type, market_price_usd, generation, notes) VALUES
-- Bitmain S21 Series
('Bitmain', 'Antminer S21 XP Hyd', 473, 5676, 12.0, 'hydro', 12000, 'current', 'Flagship hydro-cooled model'),
('Bitmain', 'Antminer S21 Hyd', 335, 5360, 16.0, 'hydro', 7500, 'current', 'High-performance hydro'),
('Bitmain', 'Antminer S21 Pro', 234, 3510, 15.0, 'air', 5600, 'current', 'Premium air-cooled'),
('Bitmain', 'Antminer S21', 200, 3500, 17.5, 'air', 3500, 'current', 'Standard S21'),
('Bitmain', 'Antminer S21e', 180, 3330, 18.5, 'air', 3000, 'current', 'Entry-level S21'),
('Bitmain', 'Antminer T21', 190, 3610, 19.0, 'air', 3200, 'current', 'Budget-friendly option'),
-- Bitmain S19 Series
('Bitmain', 'Antminer S19 XP Hyd', 255, 5304, 20.8, 'hydro', 3500, 'previous', 'Previous gen hydro'),
('Bitmain', 'Antminer S19k Pro', 120, 2760, 23.0, 'air', 1300, 'previous', 'Efficient older model'),
('Bitmain', 'Antminer S19j Pro+', 117, 3355, 28.7, 'air', 1100, 'previous', 'Reliable workhorse'),
('Bitmain', 'Antminer S19j Pro', 100, 2950, 29.5, 'air', 900, 'previous', 'Budget mining'),
('Bitmain', 'Antminer S19 Pro', 110, 3250, 29.5, 'air', 800, 'previous', 'Legacy popular model'),
-- MicroBT M60/M66 Series
('MicroBT', 'Whatsminer M66S', 298, 5513, 18.5, 'immersion', 8000, 'current', 'Top immersion model'),
('MicroBT', 'Whatsminer M66S Air', 268, 4956, 18.5, 'air', 6500, 'current', 'Air-cooled M66'),
('MicroBT', 'Whatsminer M63S', 334, 6176, 18.5, 'immersion', 9000, 'current', 'High hashrate immersion'),
('MicroBT', 'Whatsminer M60S', 186, 3441, 18.5, 'air', 3400, 'current', 'Efficient air-cooled'),
('MicroBT', 'Whatsminer M60', 172, 3154, 18.3, 'air', 3000, 'current', 'Standard M60'),
('MicroBT', 'Whatsminer M56S++', 230, 5130, 22.3, 'air', 4500, 'current', 'High power variant'),
('MicroBT', 'Whatsminer M50S++', 138, 3300, 24.0, 'air', 2000, 'previous', 'Previous gen efficient'),
('MicroBT', 'Whatsminer M30S++', 112, 3400, 31.0, 'air', 1000, 'previous', 'Budget option'),
-- Canaan Avalon Series
('Canaan', 'Avalon A1566', 185, 3681, 19.9, 'air', 3600, 'current', 'Latest Avalon model'),
('Canaan', 'Avalon A1566 Immersion', 249, 4725, 19.0, 'immersion', 5000, 'current', 'Immersion variant'),
('Canaan', 'Avalon A1466', 150, 3150, 21.0, 'air', 2800, 'current', 'Mid-range Avalon'),
('Canaan', 'Avalon A1366', 130, 3250, 25.0, 'air', 2000, 'previous', 'Previous generation'),
-- Bitdeer Sealminer Series
('Bitdeer', 'Sealminer A2', 226, 4050, 17.9, 'air', 5000, 'current', 'New Bitdeer flagship'),
('Bitdeer', 'Sealminer A2 Hydro', 446, 6272, 14.1, 'hydro', 10000, 'current', 'Hydro variant'),
('Bitdeer', 'Sealminer A1', 190, 3420, 18.0, 'air', 4000, 'current', 'First gen Sealminer'),
-- iPollo
('iPollo', 'iPollo G1 Mini', 100, 2200, 22.0, 'air', 2200, 'current', 'Compact miner'),
('iPollo', 'iPollo G1', 150, 3300, 22.0, 'air', 3000, 'current', 'Standard iPollo');

-- Create index for common queries
CREATE INDEX idx_asic_miners_manufacturer ON public.asic_miners(manufacturer);
CREATE INDEX idx_asic_miners_cooling_type ON public.asic_miners(cooling_type);
CREATE INDEX idx_asic_miners_generation ON public.asic_miners(generation);