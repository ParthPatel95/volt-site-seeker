-- Update the enhanced features calculation function to include Phase 3 features
CREATE OR REPLACE FUNCTION public.calculate_enhanced_features_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update all records with lag features, rolling averages, interaction terms, AND Phase 3 features
  UPDATE aeso_training_data
  SET
    -- Existing features
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
    END,
    
    -- PHASE 3: NEW FEATURES
    -- Net demand = Total demand - Wind - Solar (key predictor of price)
    net_demand = CASE 
      WHEN aeso_training_data.ail_mw IS NOT NULL 
      THEN aeso_training_data.ail_mw - COALESCE(aeso_training_data.generation_wind, 0) - COALESCE(aeso_training_data.generation_solar, 0)
      ELSE NULL 
    END,
    
    -- Renewable penetration = (Wind + Solar) / Total generation
    renewable_penetration = CASE 
      WHEN (COALESCE(aeso_training_data.generation_coal, 0) + 
            COALESCE(aeso_training_data.generation_gas, 0) + 
            COALESCE(aeso_training_data.generation_wind, 0) + 
            COALESCE(aeso_training_data.generation_solar, 0) + 
            COALESCE(aeso_training_data.generation_hydro, 0)) > 0
      THEN ((COALESCE(aeso_training_data.generation_wind, 0) + COALESCE(aeso_training_data.generation_solar, 0)) / 
            (COALESCE(aeso_training_data.generation_coal, 0) + 
             COALESCE(aeso_training_data.generation_gas, 0) + 
             COALESCE(aeso_training_data.generation_wind, 0) + 
             COALESCE(aeso_training_data.generation_solar, 0) + 
             COALESCE(aeso_training_data.generation_hydro, 0))) * 100
      ELSE NULL 
    END,
    
    -- Hour of week (0-167: Monday 12am = 0, Sunday 11pm = 167)
    hour_of_week = EXTRACT(DOW FROM aeso_training_data.timestamp)::integer * 24 + EXTRACT(HOUR FROM aeso_training_data.timestamp)::integer,
    
    -- Heating degree days (base 18°C)
    heating_degree_days = CASE 
      WHEN ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2) < 18
      THEN 18 - ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2)
      ELSE 0 
    END,
    
    -- Cooling degree days (base 18°C)
    cooling_degree_days = CASE 
      WHEN ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2) > 18
      THEN ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2) - 18
      ELSE 0 
    END,
    
    -- Demand ramp rate (MW per hour)
    demand_ramp_rate = CASE 
      WHEN lag_data.demand_lag_1h IS NOT NULL AND aeso_training_data.ail_mw IS NOT NULL
      THEN aeso_training_data.ail_mw - lag_data.demand_lag_1h
      ELSE NULL 
    END,
    
    -- Wind ramp rate (MW per hour)
    wind_ramp_rate = CASE 
      WHEN lag_data.wind_lag_1h IS NOT NULL AND aeso_training_data.generation_wind IS NOT NULL
      THEN aeso_training_data.generation_wind - lag_data.wind_lag_1h
      ELSE NULL 
    END,
    
    -- Price ramp rate ($/MWh per hour)
    price_ramp_rate = CASE 
      WHEN lag_data.lag_1h IS NOT NULL AND aeso_training_data.pool_price IS NOT NULL
      THEN aeso_training_data.pool_price - lag_data.lag_1h
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
      STDDEV(pool_price) OVER (ORDER BY timestamp ROWS BETWEEN 24 PRECEDING AND 1 PRECEDING) as rolling_std_24h,
      LAG(ail_mw, 1) OVER (ORDER BY timestamp) as demand_lag_1h,
      LAG(generation_wind, 1) OVER (ORDER BY timestamp) as wind_lag_1h
    FROM aeso_training_data
  ) as lag_data
  WHERE aeso_training_data.id = lag_data.id;
  
  RAISE NOTICE 'Enhanced features (including Phase 3) calculated for all records';
END;
$$;