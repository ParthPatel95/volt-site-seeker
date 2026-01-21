
-- Drop and recreate the training function with fixed R² calculation
DROP FUNCTION IF EXISTS public.train_aeso_model();

CREATE OR REPLACE FUNCTION public.train_aeso_model()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_model_version text;
  v_global_mean numeric;
  v_global_std numeric;
  v_hourly_factors jsonb;
  v_dow_factors jsonb;
  v_monthly_factors jsonb;
  v_regime_params jsonb;
  v_feature_weights jsonb;
  v_training_records integer;
  v_mae numeric;
  v_rmse numeric;
  v_smape numeric;
  v_r_squared numeric;
  v_ss_res numeric;
  v_ss_tot numeric;
  v_val_mean numeric;
BEGIN
  -- Generate model version
  v_model_version := 'db_v' || to_char(now(), 'YYYYMMDD_HH24MI');
  
  RAISE NOTICE 'Starting database-side training for model %', v_model_version;
  
  -- Count training records
  SELECT COUNT(*) INTO v_training_records
  FROM aeso_training_data
  WHERE pool_price IS NOT NULL AND pool_price > 0;
  
  RAISE NOTICE 'Training on % records', v_training_records;
  
  -- Calculate global statistics
  SELECT 
    AVG(pool_price),
    STDDEV(pool_price)
  INTO v_global_mean, v_global_std
  FROM aeso_training_data
  WHERE pool_price IS NOT NULL AND pool_price > 0;
  
  RAISE NOTICE 'Global mean: %, std: %', v_global_mean, v_global_std;
  
  -- Calculate hourly factors (ratio to global mean)
  WITH hourly_stats AS (
    SELECT 
      hour_of_day,
      AVG(pool_price) as avg_price,
      COUNT(*) as cnt
    FROM aeso_training_data
    WHERE pool_price IS NOT NULL AND pool_price > 0 AND hour_of_day IS NOT NULL
    GROUP BY hour_of_day
  )
  SELECT jsonb_object_agg(
    hour_of_day::text, 
    ROUND((avg_price / NULLIF(v_global_mean, 0))::numeric, 4)
  ) INTO v_hourly_factors
  FROM hourly_stats;
  
  -- Calculate day of week factors
  WITH dow_stats AS (
    SELECT 
      day_of_week,
      AVG(pool_price) as avg_price
    FROM aeso_training_data
    WHERE pool_price IS NOT NULL AND pool_price > 0 AND day_of_week IS NOT NULL
    GROUP BY day_of_week
  )
  SELECT jsonb_object_agg(
    day_of_week::text,
    ROUND((avg_price / NULLIF(v_global_mean, 0))::numeric, 4)
  ) INTO v_dow_factors
  FROM dow_stats;
  
  -- Calculate monthly factors
  WITH monthly_stats AS (
    SELECT 
      month,
      AVG(pool_price) as avg_price
    FROM aeso_training_data
    WHERE pool_price IS NOT NULL AND pool_price > 0 AND month IS NOT NULL
    GROUP BY month
  )
  SELECT jsonb_object_agg(
    month::text,
    ROUND((avg_price / NULLIF(v_global_mean, 0))::numeric, 4)
  ) INTO v_monthly_factors
  FROM monthly_stats;
  
  -- Calculate regime-based parameters (price ranges)
  WITH regime_stats AS (
    SELECT
      CASE 
        WHEN pool_price < 30 THEN 'low'
        WHEN pool_price < 100 THEN 'normal'
        WHEN pool_price < 300 THEN 'elevated'
        ELSE 'spike'
      END as regime,
      AVG(pool_price) as avg_price,
      STDDEV(pool_price) as std_price,
      COUNT(*) as cnt,
      AVG(ail_mw) as avg_demand,
      AVG(generation_wind) as avg_wind
    FROM aeso_training_data
    WHERE pool_price IS NOT NULL AND pool_price > 0
    GROUP BY 1
  )
  SELECT jsonb_object_agg(
    regime,
    jsonb_build_object(
      'mean', ROUND(avg_price::numeric, 2),
      'std', ROUND(COALESCE(std_price, 0)::numeric, 2),
      'count', cnt,
      'avg_demand', ROUND(COALESCE(avg_demand, 0)::numeric, 0),
      'avg_wind', ROUND(COALESCE(avg_wind, 0)::numeric, 0)
    )
  ) INTO v_regime_params
  FROM regime_stats;
  
  -- Calculate feature weights using correlation analysis
  WITH feature_correlations AS (
    SELECT
      CORR(pool_price, COALESCE(price_lag_1h, pool_price)) as lag1h_corr,
      CORR(pool_price, COALESCE(price_lag_24h, pool_price)) as lag24h_corr,
      CORR(pool_price, COALESCE(ail_mw, 0)) as demand_corr,
      CORR(pool_price, COALESCE(generation_wind, 0)) as wind_corr,
      CORR(pool_price, COALESCE(temperature_calgary, 0)) as temp_corr
    FROM aeso_training_data
    WHERE pool_price IS NOT NULL AND pool_price > 0
  )
  SELECT jsonb_build_object(
    'lag1h', ROUND(COALESCE(ABS(lag1h_corr), 0.5)::numeric, 4),
    'lag24h', ROUND(COALESCE(ABS(lag24h_corr), 0.3)::numeric, 4),
    'demand', ROUND(COALESCE(ABS(demand_corr), 0.2)::numeric, 4),
    'wind', ROUND(COALESCE(ABS(wind_corr), 0.1)::numeric, 4),
    'temperature', ROUND(COALESCE(ABS(temp_corr), 0.1)::numeric, 4)
  ) INTO v_feature_weights
  FROM feature_correlations;
  
  -- Calculate validation metrics using holdout (last 20%)
  -- First get the mean of actual values for R² calculation
  SELECT AVG(pool_price) INTO v_val_mean
  FROM (
    SELECT pool_price
    FROM aeso_training_data
    WHERE pool_price IS NOT NULL AND pool_price > 0
    ORDER BY timestamp DESC
    LIMIT (v_training_records * 0.2)::integer
  ) val_data;
  
  -- Now calculate metrics without window functions in aggregates
  WITH validation_set AS (
    SELECT 
      pool_price as actual,
      v_global_mean * 
        COALESCE((v_hourly_factors->>hour_of_day::text)::numeric, 1.0) *
        COALESCE((v_dow_factors->>day_of_week::text)::numeric, 1.0) *
        COALESCE((v_monthly_factors->>month::text)::numeric, 1.0) *
        (0.3 + 0.7 * COALESCE(price_lag_1h / NULLIF(v_global_mean, 1), 1.0))
      as predicted
    FROM aeso_training_data
    WHERE pool_price IS NOT NULL AND pool_price > 0
    ORDER BY timestamp DESC
    LIMIT (v_training_records * 0.2)::integer
  )
  SELECT
    AVG(ABS(actual - predicted)),
    SQRT(AVG(POWER(actual - predicted, 2))),
    AVG(2.0 * ABS(actual - predicted) / NULLIF(ABS(actual) + ABS(predicted), 0)) * 100,
    SUM(POWER(actual - predicted, 2)),
    SUM(POWER(actual - v_val_mean, 2))
  INTO v_mae, v_rmse, v_smape, v_ss_res, v_ss_tot
  FROM validation_set
  WHERE predicted IS NOT NULL;
  
  -- Calculate R² separately
  v_r_squared := CASE 
    WHEN v_ss_tot > 0 THEN 1 - (v_ss_res / v_ss_tot)
    ELSE 0 
  END;
  
  RAISE NOTICE 'Validation - MAE: %, RMSE: %, sMAPE: %, R²: %', 
    ROUND(v_mae::numeric, 2), ROUND(v_rmse::numeric, 2), 
    ROUND(v_smape::numeric, 2), ROUND(COALESCE(v_r_squared, 0)::numeric, 4);
  
  -- Store the trained model
  INSERT INTO aeso_db_model_params (
    model_version,
    global_mean,
    global_std,
    hourly_factors,
    dow_factors,
    monthly_factors,
    regime_params,
    feature_weights,
    training_records,
    mae,
    rmse,
    smape,
    r_squared
  ) VALUES (
    v_model_version,
    v_global_mean,
    v_global_std,
    v_hourly_factors,
    v_dow_factors,
    v_monthly_factors,
    v_regime_params,
    v_feature_weights,
    v_training_records,
    v_mae,
    v_rmse,
    v_smape,
    v_r_squared
  );
  
  -- Return training summary
  RETURN jsonb_build_object(
    'success', true,
    'model_version', v_model_version,
    'training_records', v_training_records,
    'global_mean', ROUND(v_global_mean::numeric, 2),
    'metrics', jsonb_build_object(
      'mae', ROUND(v_mae::numeric, 2),
      'rmse', ROUND(v_rmse::numeric, 2),
      'smape', ROUND(v_smape::numeric, 2),
      'r_squared', ROUND(COALESCE(v_r_squared, 0)::numeric, 4)
    ),
    'hourly_factors_count', jsonb_array_length(jsonb_path_query_array(v_hourly_factors, '$.*')),
    'regime_params', v_regime_params
  );
END;
$$;
