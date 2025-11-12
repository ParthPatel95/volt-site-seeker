-- Update calculate_enhanced_features_batch function to include Phase 2 features
CREATE OR REPLACE FUNCTION public.calculate_enhanced_features_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Update all records with Phase 1, Phase 3, AND Phase 2 advanced features
  UPDATE aeso_training_data
  SET
    -- ===== PHASE 1: Basic Enhanced Features =====
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
    
    -- ===== PHASE 3: Advanced Market Features =====
    net_demand = CASE 
      WHEN aeso_training_data.ail_mw IS NOT NULL 
      THEN aeso_training_data.ail_mw - COALESCE(aeso_training_data.generation_wind, 0) - COALESCE(aeso_training_data.generation_solar, 0)
      ELSE NULL 
    END,
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
    hour_of_week = EXTRACT(DOW FROM aeso_training_data.timestamp)::integer * 24 + EXTRACT(HOUR FROM aeso_training_data.timestamp)::integer,
    heating_degree_days = CASE 
      WHEN ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2) < 18
      THEN 18 - ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2)
      ELSE 0 
    END,
    cooling_degree_days = CASE 
      WHEN ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2) > 18
      THEN ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2) - 18
      ELSE 0 
    END,
    demand_ramp_rate = CASE 
      WHEN lag_data.demand_lag_1h IS NOT NULL AND aeso_training_data.ail_mw IS NOT NULL
      THEN aeso_training_data.ail_mw - lag_data.demand_lag_1h
      ELSE NULL 
    END,
    wind_ramp_rate = CASE 
      WHEN lag_data.wind_lag_1h IS NOT NULL AND aeso_training_data.generation_wind IS NOT NULL
      THEN aeso_training_data.generation_wind - lag_data.wind_lag_1h
      ELSE NULL 
    END,
    price_ramp_rate = CASE 
      WHEN lag_data.lag_1h IS NOT NULL AND aeso_training_data.pool_price IS NOT NULL
      THEN aeso_training_data.pool_price - lag_data.lag_1h
      ELSE NULL 
    END,
    
    -- ===== PHASE 2: Deep Feature Engineering =====
    -- Extended lag features
    price_lag_48h = lag_data.lag_48h,
    price_lag_72h = lag_data.lag_72h,
    demand_lag_3h = lag_data.demand_lag_3h,
    demand_lag_6h = lag_data.demand_lag_6h,
    wind_lag_3h = lag_data.wind_lag_3h,
    wind_lag_6h = lag_data.wind_lag_6h,
    
    -- Rolling volatility windows
    price_volatility_3h = lag_data.volatility_3h,
    price_volatility_6h = lag_data.volatility_6h,
    price_volatility_12h = lag_data.volatility_12h,
    demand_volatility_6h = lag_data.demand_volatility_6h,
    wind_volatility_6h = lag_data.wind_volatility_6h,
    
    -- Advanced interaction terms
    temp_demand_hour_interaction = CASE 
      WHEN aeso_training_data.temperature_calgary IS NOT NULL 
        AND aeso_training_data.temperature_edmonton IS NOT NULL 
        AND aeso_training_data.ail_mw IS NOT NULL
        AND aeso_training_data.hour_of_day IS NOT NULL
      THEN ((aeso_training_data.temperature_calgary + aeso_training_data.temperature_edmonton) / 2) * aeso_training_data.ail_mw * aeso_training_data.hour_of_day
      ELSE NULL 
    END,
    wind_solar_demand_interaction = CASE 
      WHEN aeso_training_data.generation_wind IS NOT NULL 
        AND aeso_training_data.generation_solar IS NOT NULL 
        AND aeso_training_data.ail_mw IS NOT NULL
      THEN (aeso_training_data.generation_wind + aeso_training_data.generation_solar) * aeso_training_data.ail_mw
      ELSE NULL 
    END,
    price_demand_ratio = CASE 
      WHEN aeso_training_data.ail_mw IS NOT NULL AND aeso_training_data.ail_mw > 0
      THEN aeso_training_data.pool_price / aeso_training_data.ail_mw
      ELSE NULL 
    END,
    renewable_capacity_factor = CASE 
      WHEN (aeso_training_data.generation_wind IS NOT NULL OR aeso_training_data.generation_solar IS NOT NULL)
      THEN (COALESCE(aeso_training_data.generation_wind, 0) + COALESCE(aeso_training_data.generation_solar, 0)) / 
           NULLIF((COALESCE(aeso_training_data.generation_coal, 0) + 
                   COALESCE(aeso_training_data.generation_gas, 0) + 
                   COALESCE(aeso_training_data.generation_wind, 0) + 
                   COALESCE(aeso_training_data.generation_solar, 0) + 
                   COALESCE(aeso_training_data.generation_hydro, 0)), 0) * 100
      ELSE NULL 
    END,
    
    -- Day-ahead indicators
    price_acceleration = CASE 
      WHEN lag_data.lag_1h IS NOT NULL AND lag_data.lag_2h IS NOT NULL
      THEN (aeso_training_data.pool_price - lag_data.lag_1h) - (lag_data.lag_1h - lag_data.lag_2h)
      ELSE NULL 
    END,
    volatility_trend = CASE 
      WHEN lag_data.volatility_6h IS NOT NULL AND lag_data.volatility_12h IS NOT NULL AND lag_data.volatility_12h > 0
      THEN ((lag_data.volatility_6h - lag_data.volatility_12h) / lag_data.volatility_12h) * 100
      ELSE NULL 
    END,
    demand_forecast_error = CASE 
      WHEN aeso_training_data.ail_mw IS NOT NULL AND lag_data.rolling_avg_demand_24h IS NOT NULL
      THEN aeso_training_data.ail_mw - lag_data.rolling_avg_demand_24h
      ELSE NULL 
    END,
    supply_cushion = CASE 
      WHEN aeso_training_data.ail_mw IS NOT NULL
      THEN (COALESCE(aeso_training_data.generation_coal, 0) + 
            COALESCE(aeso_training_data.generation_gas, 0) + 
            COALESCE(aeso_training_data.generation_wind, 0) + 
            COALESCE(aeso_training_data.generation_solar, 0) + 
            COALESCE(aeso_training_data.generation_hydro, 0)) - aeso_training_data.ail_mw
      ELSE NULL 
    END,
    
    -- Market stress indicators
    market_stress_score = CASE 
      WHEN aeso_training_data.pool_price > 100 
        AND COALESCE(aeso_training_data.generation_wind, 0) < 2000 
        AND aeso_training_data.ail_mw > 10000
      THEN LEAST(((aeso_training_data.pool_price / 100) + (aeso_training_data.ail_mw / 120) - (COALESCE(aeso_training_data.generation_wind, 0) / 50)), 100)
      ELSE LEAST((aeso_training_data.pool_price / 5), 100)
    END,
    price_spike_probability = CASE 
      WHEN lag_data.volatility_3h > 20 
        AND aeso_training_data.pool_price > lag_data.rolling_avg_24h * 1.5
      THEN LEAST(((lag_data.volatility_3h / 50) + ((aeso_training_data.pool_price - lag_data.rolling_avg_24h) / lag_data.rolling_avg_24h)) * 50, 100)
      WHEN lag_data.volatility_3h > 10
      THEN LEAST((lag_data.volatility_3h / 100) * 100, 100)
      ELSE 0
    END
    
  FROM (
    SELECT 
      id,
      -- Phase 1 lags
      LAG(pool_price, 1) OVER (ORDER BY timestamp) as lag_1h,
      LAG(pool_price, 2) OVER (ORDER BY timestamp) as lag_2h,
      LAG(pool_price, 3) OVER (ORDER BY timestamp) as lag_3h,
      LAG(pool_price, 24) OVER (ORDER BY timestamp) as lag_24h,
      AVG(pool_price) OVER (ORDER BY timestamp ROWS BETWEEN 24 PRECEDING AND 1 PRECEDING) as rolling_avg_24h,
      STDDEV(pool_price) OVER (ORDER BY timestamp ROWS BETWEEN 24 PRECEDING AND 1 PRECEDING) as rolling_std_24h,
      LAG(ail_mw, 1) OVER (ORDER BY timestamp) as demand_lag_1h,
      LAG(generation_wind, 1) OVER (ORDER BY timestamp) as wind_lag_1h,
      
      -- Phase 2 extended lags
      LAG(pool_price, 48) OVER (ORDER BY timestamp) as lag_48h,
      LAG(pool_price, 72) OVER (ORDER BY timestamp) as lag_72h,
      LAG(ail_mw, 3) OVER (ORDER BY timestamp) as demand_lag_3h,
      LAG(ail_mw, 6) OVER (ORDER BY timestamp) as demand_lag_6h,
      LAG(generation_wind, 3) OVER (ORDER BY timestamp) as wind_lag_3h,
      LAG(generation_wind, 6) OVER (ORDER BY timestamp) as wind_lag_6h,
      
      -- Phase 2 rolling volatility
      STDDEV(pool_price) OVER (ORDER BY timestamp ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) as volatility_3h,
      STDDEV(pool_price) OVER (ORDER BY timestamp ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as volatility_6h,
      STDDEV(pool_price) OVER (ORDER BY timestamp ROWS BETWEEN 12 PRECEDING AND CURRENT ROW) as volatility_12h,
      STDDEV(ail_mw) OVER (ORDER BY timestamp ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as demand_volatility_6h,
      STDDEV(generation_wind) OVER (ORDER BY timestamp ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as wind_volatility_6h,
      
      -- For demand forecast error calculation
      AVG(ail_mw) OVER (ORDER BY timestamp ROWS BETWEEN 24 PRECEDING AND 1 PRECEDING) as rolling_avg_demand_24h
      
    FROM aeso_training_data
  ) as lag_data
  WHERE aeso_training_data.id = lag_data.id;
  
  RAISE NOTICE 'Phase 1, 2, and 3 enhanced features calculated for all records';
END;
$function$;

COMMENT ON FUNCTION calculate_enhanced_features_batch IS 'Calculates Phase 1, 2, and 3 enhanced features including extended lags, rolling volatility, advanced interactions, and market stress indicators';
