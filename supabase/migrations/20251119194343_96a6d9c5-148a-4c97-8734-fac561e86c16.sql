-- Drop and recreate the enhanced features calculation function with proper quantile calculation

DROP FUNCTION IF EXISTS calculate_enhanced_features_batch();

CREATE OR REPLACE FUNCTION calculate_enhanced_features_batch()
RETURNS TABLE(
  batch_timestamp TIMESTAMP WITH TIME ZONE,
  records_processed INTEGER,
  success BOOLEAN
) AS $$
BEGIN
  -- Update extended lag features (6h, 12h, 168h) 
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
    AND t.timestamp = lag168.timestamp;

  -- Update rolling price quantiles (10th, 50th, 90th percentiles over 24h window)
  UPDATE aeso_training_data t
  SET
    price_quantile_10th_24h = quantiles.q10,
    price_quantile_50th_24h = quantiles.q50,
    price_quantile_90th_24h = quantiles.q90
  FROM (
    SELECT 
      t1.timestamp,
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
  ) quantiles
  WHERE t.timestamp = quantiles.timestamp;

  -- Update demand quantile (90th percentile over 24h window)
  UPDATE aeso_training_data t
  SET demand_quantile_90th_24h = demand_quantiles.q90
  FROM (
    SELECT 
      t1.timestamp,
      (
        SELECT percentile_cont(0.90) WITHIN GROUP (ORDER BY ail_mw)
        FROM aeso_training_data t2
        WHERE t2.timestamp BETWEEN t1.timestamp - INTERVAL '24 hours' AND t1.timestamp
          AND t2.ail_mw IS NOT NULL
      ) as q90
    FROM aeso_training_data t1
  ) demand_quantiles
  WHERE t.timestamp = demand_quantiles.timestamp;

  -- Update day_type (0=weekday, 1=weekend, 2=holiday)
  UPDATE aeso_training_data
  SET day_type = CASE
    WHEN is_weekend THEN 1
    -- New Year's Day (Jan 1)
    WHEN EXTRACT(MONTH FROM timestamp) = 1 AND EXTRACT(DAY FROM timestamp) = 1 THEN 2
    -- Canada Day (Jul 1)
    WHEN EXTRACT(MONTH FROM timestamp) = 7 AND EXTRACT(DAY FROM timestamp) = 1 THEN 2
    -- Christmas (Dec 25)
    WHEN EXTRACT(MONTH FROM timestamp) = 12 AND EXTRACT(DAY FROM timestamp) = 25 THEN 2
    -- Boxing Day (Dec 26)
    WHEN EXTRACT(MONTH FROM timestamp) = 12 AND EXTRACT(DAY FROM timestamp) = 26 THEN 2
    ELSE 0
  END;

  -- Return summary
  RETURN QUERY
  SELECT 
    NOW() as batch_timestamp,
    (SELECT COUNT(*)::INTEGER FROM aeso_training_data) as records_processed,
    true as success;
END;
$$ LANGUAGE plpgsql;