-- Phase 2: Fourier Transform and Advanced Timing Features
-- Calculates cyclical temporal patterns and time-of-day indicators

CREATE OR REPLACE FUNCTION public.calculate_phase2_features_batch()
RETURNS TABLE(
  batch_timestamp TIMESTAMP WITH TIME ZONE,
  total_records INTEGER,
  success BOOLEAN
) 
LANGUAGE plpgsql
AS $$
DECLARE
  pi CONSTANT NUMERIC := 3.141592653589793;
  updated_rows INTEGER;
BEGIN
  -- Update Fourier features for daily patterns (24-hour cycle)
  -- Using 2 harmonics to capture primary and secondary daily patterns
  UPDATE aeso_training_data
  SET
    fourier_daily_sin_1 = SIN(2 * pi * hour_of_day / 24.0),
    fourier_daily_cos_1 = COS(2 * pi * hour_of_day / 24.0),
    fourier_daily_sin_2 = SIN(4 * pi * hour_of_day / 24.0),
    fourier_daily_cos_2 = COS(4 * pi * hour_of_day / 24.0);

  -- Update Fourier features for weekly patterns (168-hour cycle)
  UPDATE aeso_training_data
  SET
    fourier_weekly_sin = SIN(2 * pi * hour_of_week / 168.0),
    fourier_weekly_cos = COS(2 * pi * hour_of_week / 168.0);

  -- Update Fourier features for annual patterns (8760-hour cycle)
  -- Using day of year instead of hour of year for better numerical stability
  UPDATE aeso_training_data
  SET
    fourier_annual_sin_1 = SIN(2 * pi * EXTRACT(DOY FROM timestamp) / 365.25),
    fourier_annual_cos_1 = COS(2 * pi * EXTRACT(DOY FROM timestamp) / 365.25),
    fourier_annual_sin_2 = SIN(4 * pi * EXTRACT(DOY FROM timestamp) / 365.25),
    fourier_annual_cos_2 = COS(4 * pi * EXTRACT(DOY FROM timestamp) / 365.25);

  -- Update advanced timing indicators
  UPDATE aeso_training_data
  SET
    -- Morning ramp: 6 AM - 9 AM (high demand increase)
    is_morning_ramp = CASE 
      WHEN hour_of_day >= 6 AND hour_of_day < 9 THEN 1 
      ELSE 0 
    END,
    
    -- Evening peak: 5 PM - 9 PM (highest demand period)
    is_evening_peak = CASE 
      WHEN hour_of_day >= 17 AND hour_of_day < 21 THEN 1 
      ELSE 0 
    END,
    
    -- Overnight: 11 PM - 5 AM (lowest demand period)
    is_overnight = CASE 
      WHEN hour_of_day >= 23 OR hour_of_day < 5 THEN 1 
      ELSE 0 
    END;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  RAISE NOTICE 'Phase 2 Features: Updated % rows with Fourier & timing features', updated_rows;

  RETURN QUERY
  SELECT 
    NOW() as batch_timestamp,
    (SELECT COUNT(*)::INTEGER FROM aeso_training_data) as total_records,
    TRUE as success;
END;
$$;