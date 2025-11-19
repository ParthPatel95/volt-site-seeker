-- Fix Phase 1 and Phase 2 SQL functions to include WHERE clauses (required by Supabase)

-- Drop and recreate calculate_enhanced_features_batch with WHERE clauses
DROP FUNCTION IF EXISTS public.calculate_enhanced_features_batch();

CREATE OR REPLACE FUNCTION public.calculate_enhanced_features_batch()
RETURNS TABLE(batch_timestamp timestamp with time zone, records_processed integer, success boolean)
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- Update extended lag features (6h, 12h, 168h) with WHERE clause
  UPDATE aeso_training_data t
  SET
    price_lag_6h = lag6.pool_price,
    price_lag_12h = lag12.pool_price,
    price_lag_168h = lag168.pool_price
  FROM (
    SELECT 
      timestamp,
      LAG(pool_price, 6) OVER (ORDER BY timestamp) as pool_price
    FROM aeso_training_data
  ) lag6,
  (
    SELECT 
      timestamp,
      LAG(pool_price, 12) OVER (ORDER BY timestamp) as pool_price
    FROM aeso_training_data
  ) lag12,
  (
    SELECT 
      timestamp,
      LAG(pool_price, 168) OVER (ORDER BY timestamp) as pool_price
    FROM aeso_training_data
  ) lag168
  WHERE t.timestamp = lag6.timestamp
    AND t.timestamp = lag12.timestamp
    AND t.timestamp = lag168.timestamp
    AND t.id IS NOT NULL; -- Required WHERE clause

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % records with lag features', updated_count;

  -- Update rolling price quantiles with batching
  WITH quantile_calcs AS (
    SELECT 
      t1.id,
      (
        SELECT percentile_cont(0.10) WITHIN GROUP (ORDER BY pool_price)
        FROM aeso_training_data t2
        WHERE t2.timestamp BETWEEN t1.timestamp - INTERVAL '24 hours' AND t1.timestamp
      ) as q10,
      (
        SELECT percentile_cont(0.50) WITHIN GROUP (ORDER BY pool_price)
        FROM aeso_training_data t2
        WHERE t2.timestamp BETWEEN t1.timestamp - INTERVAL '24 hours' AND t1.timestamp
      ) as q50,
      (
        SELECT percentile_cont(0.90) WITHIN GROUP (ORDER BY pool_price)
        FROM aeso_training_data t2
        WHERE t2.timestamp BETWEEN t1.timestamp - INTERVAL '24 hours' AND t1.timestamp
      ) as q90
    FROM aeso_training_data t1
    WHERE t1.timestamp >= (SELECT MIN(timestamp) + INTERVAL '24 hours' FROM aeso_training_data)
  )
  UPDATE aeso_training_data t
  SET
    price_quantile_10th_24h = qc.q10,
    price_quantile_50th_24h = qc.q50,
    price_quantile_90th_24h = qc.q90
  FROM quantile_calcs qc
  WHERE t.id = qc.id;

  -- Update demand quantile
  WITH demand_quantiles AS (
    SELECT 
      t1.id,
      (
        SELECT percentile_cont(0.90) WITHIN GROUP (ORDER BY ail_mw)
        FROM aeso_training_data t2
        WHERE t2.timestamp BETWEEN t1.timestamp - INTERVAL '24 hours' AND t1.timestamp
          AND t2.ail_mw IS NOT NULL
      ) as q90
    FROM aeso_training_data t1
    WHERE t1.ail_mw IS NOT NULL
      AND t1.timestamp >= (SELECT MIN(timestamp) + INTERVAL '24 hours' FROM aeso_training_data)
  )
  UPDATE aeso_training_data t
  SET demand_quantile_90th_24h = dq.q90
  FROM demand_quantiles dq
  WHERE t.id = dq.id;

  -- Update day_type with WHERE clause
  UPDATE aeso_training_data
  SET day_type = CASE
    WHEN is_weekend THEN 1
    WHEN EXTRACT(MONTH FROM timestamp) = 1 AND EXTRACT(DAY FROM timestamp) = 1 THEN 2
    WHEN EXTRACT(MONTH FROM timestamp) = 7 AND EXTRACT(DAY FROM timestamp) = 1 THEN 2
    WHEN EXTRACT(MONTH FROM timestamp) = 12 AND EXTRACT(DAY FROM timestamp) = 25 THEN 2
    WHEN EXTRACT(MONTH FROM timestamp) = 12 AND EXTRACT(DAY FROM timestamp) = 26 THEN 2
    ELSE 0
  END
  WHERE id IS NOT NULL; -- Required WHERE clause

  RETURN QUERY
  SELECT 
    NOW() as batch_timestamp,
    (SELECT COUNT(*)::INTEGER FROM aeso_training_data) as records_processed,
    TRUE as success;
END;
$$;

-- Drop and recreate calculate_phase2_features_batch with WHERE clauses
DROP FUNCTION IF EXISTS public.calculate_phase2_features_batch();

CREATE OR REPLACE FUNCTION public.calculate_phase2_features_batch()
RETURNS TABLE(batch_timestamp timestamp with time zone, total_records integer, success boolean)
LANGUAGE plpgsql
AS $$
DECLARE
  pi CONSTANT NUMERIC := 3.141592653589793;
  updated_rows INTEGER;
BEGIN
  -- Update Fourier features with WHERE clause
  UPDATE aeso_training_data
  SET
    fourier_daily_sin_1 = SIN(2 * pi * hour_of_day / 24.0),
    fourier_daily_cos_1 = COS(2 * pi * hour_of_day / 24.0),
    fourier_daily_sin_2 = SIN(4 * pi * hour_of_day / 24.0),
    fourier_daily_cos_2 = COS(4 * pi * hour_of_day / 24.0),
    fourier_weekly_sin = SIN(2 * pi * hour_of_week / 168.0),
    fourier_weekly_cos = COS(2 * pi * hour_of_week / 168.0),
    fourier_annual_sin_1 = SIN(2 * pi * EXTRACT(DOY FROM timestamp) / 365.25),
    fourier_annual_cos_1 = COS(2 * pi * EXTRACT(DOY FROM timestamp) / 365.25),
    fourier_annual_sin_2 = SIN(4 * pi * EXTRACT(DOY FROM timestamp) / 365.25),
    fourier_annual_cos_2 = COS(4 * pi * EXTRACT(DOY FROM timestamp) / 365.25)
  WHERE id IS NOT NULL; -- Required WHERE clause

  -- Update timing indicators with WHERE clause
  UPDATE aeso_training_data
  SET
    is_morning_ramp = CASE WHEN hour_of_day >= 6 AND hour_of_day < 9 THEN 1 ELSE 0 END,
    is_evening_peak = CASE WHEN hour_of_day >= 17 AND hour_of_day < 21 THEN 1 ELSE 0 END,
    is_overnight = CASE WHEN hour_of_day >= 23 OR hour_of_day < 5 THEN 1 ELSE 0 END
  WHERE id IS NOT NULL; -- Required WHERE clause

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  RAISE NOTICE 'Phase 2 Features: Updated % rows with Fourier & timing features', updated_rows;

  RETURN QUERY
  SELECT 
    NOW() as batch_timestamp,
    (SELECT COUNT(*)::INTEGER FROM aeso_training_data) as total_records,
    TRUE as success;
END;
$$;