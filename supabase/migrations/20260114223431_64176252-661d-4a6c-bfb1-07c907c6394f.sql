-- Fix Security Definer Views by setting security_invoker = true
-- This ensures views respect the RLS policies of the querying user, not the view owner

-- Drop and recreate aeso_data_quality_summary with security_invoker = true
DROP VIEW IF EXISTS public.aeso_data_quality_summary;

CREATE VIEW public.aeso_data_quality_summary
WITH (security_invoker = true)
AS
SELECT 
  count(*) AS total_records,
  count(*) FILTER (WHERE aeso_training_data.is_valid_record = true) AS valid_records,
  count(*) FILTER (WHERE aeso_training_data.price_lag_1h IS NOT NULL) AS with_lag_features,
  count(*) FILTER (WHERE aeso_training_data.net_demand IS NOT NULL) AS with_net_demand,
  count(*) FILTER (WHERE aeso_training_data.renewable_penetration IS NOT NULL) AS with_renewable_pen,
  round(count(*) FILTER (WHERE aeso_training_data.is_valid_record = true)::numeric / NULLIF(count(*), 0)::numeric * 100::numeric, 1) AS valid_percentage,
  max(aeso_training_data."timestamp") AS latest_timestamp,
  min(aeso_training_data."timestamp") FILTER (WHERE aeso_training_data."timestamp" > (now() - '90 days'::interval)) AS oldest_recent
FROM aeso_training_data;

-- Drop and recreate aeso_model_status with security_invoker = true
DROP VIEW IF EXISTS public.aeso_model_status;

CREATE VIEW public.aeso_model_status
WITH (security_invoker = true)
AS
SELECT 
  mp.model_version,
  mp.created_at AS trained_at,
  mp.mae,
  mp.rmse,
  COALESCE(mp.smape, mp.mape) AS smape,
  mp.r_squared,
  mp.training_records,
  mp.predictions_evaluated,
  CASE
    WHEN COALESCE(mp.smape, mp.mape) < 30::numeric THEN 'excellent'::text
    WHEN COALESCE(mp.smape, mp.mape) < 50::numeric THEN 'good'::text
    WHEN COALESCE(mp.smape, mp.mape) < 100::numeric THEN 'fair'::text
    ELSE 'poor'::text
  END AS model_quality,
  (SELECT count(*) FROM aeso_training_data WHERE aeso_training_data.is_valid_record = true) AS available_training_records,
  (SELECT count(*) FROM aeso_training_data WHERE aeso_training_data.is_valid_record = true AND aeso_training_data.price_lag_1h IS NOT NULL) AS records_with_features
FROM aeso_model_performance mp
WHERE mp.created_at = (SELECT max(aeso_model_performance.created_at) FROM aeso_model_performance);

-- Add comments explaining the security model
COMMENT ON VIEW public.aeso_data_quality_summary IS 'AESO training data quality summary with security_invoker=true to respect RLS policies of querying user';
COMMENT ON VIEW public.aeso_model_status IS 'AESO model status summary with security_invoker=true to respect RLS policies of querying user';