-- Drop the existing constraint
ALTER TABLE telegram_alert_rules 
DROP CONSTRAINT IF EXISTS telegram_alert_rules_alert_type_check;

-- Add the new constraint with all alert types
ALTER TABLE telegram_alert_rules 
ADD CONSTRAINT telegram_alert_rules_alert_type_check 
CHECK (alert_type = ANY (ARRAY[
  -- Original types
  'price_low',
  'price_high', 
  'grid_stress',
  'plant_outage',
  'eea',
  'price_spike',
  'custom',
  -- Scheduled Reports
  'hourly_summary',
  'daily_morning_briefing',
  'daily_evening_summary',
  -- Generation Mix
  'generation_mix',
  'renewable_percentage',
  'wind_forecast',
  'solar_production',
  -- Market Conditions
  'price_negative',
  'intertie_flow',
  'demand_peak'
]));