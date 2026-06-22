-- Lightweight RPC that updates ONLY lag features on aeso_training_data.
-- The existing calculate_enhanced_features_batch() recomputes percentile_cont
-- quantile subqueries over the entire training table on every call, which
-- exceeds the 60s PostgREST statement timeout. This split keeps the cheap
-- lag updates available on every orchestrator tick, while heavy quantile
-- recalculation can be scheduled separately.

CREATE OR REPLACE FUNCTION public.calculate_lag_features_fast()
RETURNS TABLE(batch_timestamp timestamp with time zone, records_updated integer, success boolean)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- Single window-function pass: compute all lags in one CTE, then update.
  WITH lagged AS (
    SELECT
      id,
      LAG(pool_price, 1)   OVER (ORDER BY "timestamp") AS lag1,
      LAG(pool_price, 2)   OVER (ORDER BY "timestamp") AS lag2,
      LAG(pool_price, 3)   OVER (ORDER BY "timestamp") AS lag3,
      LAG(pool_price, 6)   OVER (ORDER BY "timestamp") AS lag6,
      LAG(pool_price, 12)  OVER (ORDER BY "timestamp") AS lag12,
      LAG(pool_price, 24)  OVER (ORDER BY "timestamp") AS lag24,
      LAG(pool_price, 168) OVER (ORDER BY "timestamp") AS lag168
    FROM aeso_training_data
  )
  UPDATE aeso_training_data t
  SET
    price_lag_1h   = lagged.lag1,
    price_lag_2h   = COALESCE(lagged.lag2,   t.price_lag_2h),
    price_lag_3h   = COALESCE(lagged.lag3,   t.price_lag_3h),
    price_lag_6h   = COALESCE(lagged.lag6,   t.price_lag_6h),
    price_lag_12h  = COALESCE(lagged.lag12,  t.price_lag_12h),
    price_lag_24h  = COALESCE(lagged.lag24,  t.price_lag_24h),
    price_lag_168h = COALESCE(lagged.lag168, t.price_lag_168h)
  FROM lagged
  WHERE t.id = lagged.id
    AND (t.price_lag_1h IS DISTINCT FROM lagged.lag1
      OR t.price_lag_2h IS NULL
      OR t.price_lag_3h IS NULL
      OR t.price_lag_6h IS NULL
      OR t.price_lag_12h IS NULL
      OR t.price_lag_24h IS NULL
      OR t.price_lag_168h IS NULL);

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RETURN QUERY SELECT NOW(), updated_count, TRUE;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.calculate_lag_features_fast() TO service_role;