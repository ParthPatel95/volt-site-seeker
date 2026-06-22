CREATE OR REPLACE FUNCTION public.calculate_lag_features_fast(p_hours_back integer DEFAULT 240)
RETURNS TABLE(batch_timestamp timestamp with time zone, records_updated integer, success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER := 0;
  v_cutoff timestamptz := NOW() - make_interval(hours => p_hours_back);
BEGIN
  WITH lagged AS (
    SELECT
      id,
      "timestamp",
      LAG(pool_price, 1)   OVER w AS lag1,
      LAG(pool_price, 2)   OVER w AS lag2,
      LAG(pool_price, 3)   OVER w AS lag3,
      LAG(pool_price, 6)   OVER w AS lag6,
      LAG(pool_price, 12)  OVER w AS lag12,
      LAG(pool_price, 24)  OVER w AS lag24,
      LAG(pool_price, 168) OVER w AS lag168
    FROM aeso_training_data
    WHERE "timestamp" >= v_cutoff - interval '8 days'
    WINDOW w AS (ORDER BY "timestamp")
  )
  UPDATE aeso_training_data t
  SET
    price_lag_1h   = COALESCE(lagged.lag1,   t.price_lag_1h),
    price_lag_2h   = COALESCE(lagged.lag2,   t.price_lag_2h),
    price_lag_3h   = COALESCE(lagged.lag3,   t.price_lag_3h),
    price_lag_6h   = COALESCE(lagged.lag6,   t.price_lag_6h),
    price_lag_12h  = COALESCE(lagged.lag12,  t.price_lag_12h),
    price_lag_24h  = COALESCE(lagged.lag24,  t.price_lag_24h),
    price_lag_168h = COALESCE(lagged.lag168, t.price_lag_168h)
  FROM lagged
  WHERE t.id = lagged.id
    AND lagged."timestamp" >= v_cutoff
    AND (t.price_lag_1h   IS DISTINCT FROM lagged.lag1
      OR t.price_lag_2h   IS NULL
      OR t.price_lag_3h   IS NULL
      OR t.price_lag_6h   IS NULL
      OR t.price_lag_12h  IS NULL
      OR t.price_lag_24h  IS NULL
      OR t.price_lag_168h IS NULL);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN QUERY SELECT NOW(), updated_count, TRUE;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.calculate_lag_features_fast(integer) TO service_role, authenticated;