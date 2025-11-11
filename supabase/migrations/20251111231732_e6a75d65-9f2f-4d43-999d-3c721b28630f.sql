-- Fix AESO Prediction System Schema Issues

-- 1. Add smape column to model_performance (it's using 'mape' but code expects 'smape')
ALTER TABLE aeso_model_performance 
ADD COLUMN IF NOT EXISTS smape numeric,
ADD COLUMN IF NOT EXISTS training_records integer,
ADD COLUMN IF NOT EXISTS training_quality_score numeric;

-- Update existing records to use mape as smape (they're the same - symmetric MAPE)
UPDATE aeso_model_performance SET smape = mape WHERE smape IS NULL;

-- 2. Add actual_price tracking to predictions table
ALTER TABLE aeso_price_predictions
ADD COLUMN IF NOT EXISTS actual_price numeric,
ADD COLUMN IF NOT EXISTS absolute_error numeric,
ADD COLUMN IF NOT EXISTS percent_error numeric,
ADD COLUMN IF NOT EXISTS symmetric_percent_error numeric;

-- 3. Update prediction_accuracy table to ensure symmetric_percent_error is calculated
UPDATE aeso_prediction_accuracy
SET symmetric_percent_error = percent_error
WHERE symmetric_percent_error IS NULL AND percent_error IS NOT NULL;

-- 4. Create a simplified model status view
CREATE OR REPLACE VIEW aeso_model_status AS
SELECT 
  mp.model_version,
  mp.created_at as trained_at,
  mp.mae,
  mp.rmse,
  COALESCE(mp.smape, mp.mape) as smape,
  mp.r_squared,
  mp.training_records,
  mp.predictions_evaluated,
  CASE 
    WHEN COALESCE(mp.smape, mp.mape) < 30 THEN 'excellent'
    WHEN COALESCE(mp.smape, mp.mape) < 50 THEN 'good'
    WHEN COALESCE(mp.smape, mp.mape) < 100 THEN 'fair'
    ELSE 'poor'
  END as model_quality,
  (SELECT COUNT(*) FROM aeso_training_data WHERE is_valid_record = true) as available_training_records,
  (SELECT COUNT(*) FROM aeso_training_data WHERE is_valid_record = true AND price_lag_1h IS NOT NULL) as records_with_features
FROM aeso_model_performance mp
WHERE mp.created_at = (SELECT MAX(created_at) FROM aeso_model_performance);

-- 5. Create function to update prediction actuals from pool prices
CREATE OR REPLACE FUNCTION update_prediction_actuals()
RETURNS TABLE(updated_count integer) AS $$
DECLARE
  update_count integer;
BEGIN
  -- Update predictions with actual prices from training data
  WITH updates AS (
    UPDATE aeso_price_predictions p
    SET 
      actual_price = t.pool_price,
      absolute_error = ABS(p.predicted_price - t.pool_price),
      percent_error = CASE 
        WHEN t.pool_price > 0 THEN (ABS(p.predicted_price - t.pool_price) / t.pool_price) * 100
        ELSE NULL
      END,
      symmetric_percent_error = CASE 
        WHEN (ABS(t.pool_price) + ABS(p.predicted_price)) > 0 
        THEN (ABS(p.predicted_price - t.pool_price) / ((ABS(t.pool_price) + ABS(p.predicted_price)) / 2)) * 100
        ELSE NULL
      END,
      validated_at = NOW()
    FROM aeso_training_data t
    WHERE p.target_timestamp = t.timestamp
      AND p.actual_price IS NULL
      AND t.pool_price IS NOT NULL
      AND t.pool_price > 0
    RETURNING p.id
  )
  SELECT COUNT(*)::integer INTO update_count FROM updates;
  
  RETURN QUERY SELECT update_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_prediction_actuals() IS 'Updates prediction records with actual prices and calculates error metrics';

-- 6. Create data quality summary view
CREATE OR REPLACE VIEW aeso_data_quality_summary AS
SELECT 
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_valid_record = true) as valid_records,
  COUNT(*) FILTER (WHERE price_lag_1h IS NOT NULL) as with_lag_features,
  COUNT(*) FILTER (WHERE net_demand IS NOT NULL) as with_net_demand,
  COUNT(*) FILTER (WHERE renewable_penetration IS NOT NULL) as with_renewable_pen,
  ROUND((COUNT(*) FILTER (WHERE is_valid_record = true)::numeric / NULLIF(COUNT(*), 0)) * 100, 1) as valid_percentage,
  MAX(timestamp) as latest_timestamp,
  MIN(timestamp) FILTER (WHERE timestamp > NOW() - INTERVAL '90 days') as oldest_recent
FROM aeso_training_data;
