-- Create a function to calculate enhanced features efficiently using SQL
-- This processes all records in-database without loading into memory
CREATE OR REPLACE FUNCTION calculate_enhanced_features_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update all records with lag features, rolling averages, and interaction terms
  -- Using window functions for efficient calculation
  UPDATE aeso_training_data
  SET
    price_lag_1h = lag_data.lag_1h,
    price_lag_2h = lag_data.lag_2h,
    price_lag_3h = lag_data.lag_3h,
    price_lag_24h = lag_data.lag_24h,
    price_rolling_avg_24h = lag_data.rolling_avg_24h,
    price_rolling_std_24h = lag_data.rolling_std_24h,
    price_momentum_1h = CASE 
      WHEN lag_data.lag_1h IS NOT NULL AND lag_data.lag_1h > 0 
      THEN ((aeso_training_data.pool_price - lag_data.lag_1h) / lag_data.lag_1h) * 100 
      ELSE NULL 
    END,
    price_momentum_3h = CASE 
      WHEN lag_data.lag_3h IS NOT NULL AND lag_data.lag_3h > 0 
      THEN ((aeso_training_data.pool_price - lag_data.lag_3h) / lag_data.lag_3h) * 100 
      ELSE NULL 
    END,
    wind_hour_interaction = CASE 
      WHEN aeso_training_data.generation_wind IS NOT NULL AND aeso_training_data.hour_of_day IS NOT NULL 
      THEN aeso_training_data.generation_wind * aeso_training_data.hour_of_day 
      ELSE NULL 
    END,
    temp_demand_interaction = CASE 
      WHEN aeso_training_data.temperature_calgary IS NOT NULL 
        AND aeso_training_data.temperature_edmonton IS NOT NULL 
        AND aeso_training_data.ail_mw IS NOT NULL 
      THEN ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2) * aeso_training_data.ail_mw 
      ELSE NULL 
    END
  FROM (
    SELECT 
      id,
      LAG(pool_price, 1) OVER (ORDER BY timestamp) as lag_1h,
      LAG(pool_price, 2) OVER (ORDER BY timestamp) as lag_2h,
      LAG(pool_price, 3) OVER (ORDER BY timestamp) as lag_3h,
      LAG(pool_price, 24) OVER (ORDER BY timestamp) as lag_24h,
      AVG(pool_price) OVER (ORDER BY timestamp ROWS BETWEEN 24 PRECEDING AND 1 PRECEDING) as rolling_avg_24h,
      STDDEV(pool_price) OVER (ORDER BY timestamp ROWS BETWEEN 24 PRECEDING AND 1 PRECEDING) as rolling_std_24h
    FROM aeso_training_data
  ) as lag_data
  WHERE aeso_training_data.id = lag_data.id;
  
  RAISE NOTICE 'Enhanced features calculated for all records';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_enhanced_features_batch() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_enhanced_features_batch() TO service_role;
