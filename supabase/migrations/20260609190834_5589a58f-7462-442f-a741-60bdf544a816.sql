
-- 1) Dedupe aeso_training_data by canonical (top-of-hour) bucket.
-- Keep the row in each bucket with the most non-null measurements; tiebreak by latest timestamp.
WITH ranked AS (
  SELECT
    id,
    date_trunc('hour', "timestamp") AS bucket,
    ROW_NUMBER() OVER (
      PARTITION BY date_trunc('hour', "timestamp")
      ORDER BY
        (CASE WHEN ail_mw IS NOT NULL THEN 1 ELSE 0 END
          + CASE WHEN system_marginal_price IS NOT NULL THEN 1 ELSE 0 END
          + CASE WHEN pool_price IS NOT NULL AND pool_price <> 0 THEN 1 ELSE 0 END
          + CASE WHEN temperature_calgary IS NOT NULL THEN 1 ELSE 0 END) DESC,
        "timestamp" DESC
    ) AS rn
  FROM public.aeso_training_data
)
DELETE FROM public.aeso_training_data t
USING ranked r
WHERE t.id = r.id
  AND r.rn > 1;

-- 2) Snap remaining timestamps to the exact top-of-hour.
UPDATE public.aeso_training_data
SET "timestamp" = date_trunc('hour', "timestamp")
WHERE "timestamp" <> date_trunc('hour', "timestamp");

-- 3) Re-derive hour_of_day / day_of_week / month / is_weekend so they match the canonical UTC bucket.
UPDATE public.aeso_training_data
SET
  hour_of_day = EXTRACT(HOUR FROM "timestamp")::int,
  day_of_week = EXTRACT(DOW FROM "timestamp")::int,
  month = EXTRACT(MONTH FROM "timestamp")::int,
  is_weekend = EXTRACT(DOW FROM "timestamp") IN (0,6);

-- 4) Dedup index for raw observations so repeated backfill calls are idempotent
--    on (observed_for, source_endpoint, COALESCE(revision_id, '')).
CREATE UNIQUE INDEX IF NOT EXISTS uq_aeso_raw_obs_dedup
  ON public.aeso_raw_price_observations (observed_for, source_endpoint, (COALESCE(revision_id, '')));

-- 5) Coverage audit RPC: per calendar month, expected vs covered hours (canonical, UTC).
CREATE OR REPLACE FUNCTION public.audit_aeso_hourly_coverage(
  p_from timestamptz DEFAULT NULL,
  p_to   timestamptz DEFAULT NULL
)
RETURNS TABLE(
  month_start         timestamptz,
  month_label         text,
  expected_hours      int,
  price_hours         int,
  ail_hours           int,
  smp_hours           int,
  raw_observation_rows int,
  duplicate_hour_buckets int,
  missing_price_hours int,
  is_elapsed          boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from timestamptz;
  v_to   timestamptz;
  v_now  timestamptz := date_trunc('hour', now());
BEGIN
  v_from := COALESCE(p_from, (SELECT date_trunc('month', MIN("timestamp")) FROM public.aeso_training_data));
  v_to   := COALESCE(p_to,   (SELECT date_trunc('month', MAX("timestamp")) + interval '1 month' - interval '1 hour'
                              FROM public.aeso_training_data));
  IF v_from IS NULL OR v_to IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH months AS (
    SELECT generate_series(date_trunc('month', v_from), date_trunc('month', v_to), interval '1 month') AS m_start
  ),
  td AS (
    SELECT
      date_trunc('month', "timestamp") AS m_start,
      date_trunc('hour',  "timestamp") AS h_bucket,
      pool_price, ail_mw, system_marginal_price
    FROM public.aeso_training_data
    WHERE "timestamp" >= date_trunc('month', v_from)
      AND "timestamp" < date_trunc('month', v_to) + interval '1 month'
  ),
  per_month AS (
    SELECT
      m_start,
      COUNT(DISTINCT h_bucket)                                                              AS distinct_hours,
      COUNT(DISTINCT h_bucket) FILTER (WHERE pool_price IS NOT NULL)                        AS price_hours,
      COUNT(DISTINCT h_bucket) FILTER (WHERE ail_mw IS NOT NULL)                            AS ail_hours,
      COUNT(DISTINCT h_bucket) FILTER (WHERE system_marginal_price IS NOT NULL)             AS smp_hours,
      (COUNT(*) - COUNT(DISTINCT h_bucket))                                                 AS dup_buckets
    FROM td
    GROUP BY m_start
  ),
  raw_per_month AS (
    SELECT date_trunc('month', observed_for) AS m_start, COUNT(*) AS raw_rows
    FROM public.aeso_raw_price_observations
    WHERE observed_for >= date_trunc('month', v_from)
      AND observed_for < date_trunc('month', v_to) + interval '1 month'
    GROUP BY 1
  )
  SELECT
    m.m_start                                                                            AS month_start,
    to_char(m.m_start, 'YYYY-MM')                                                        AS month_label,
    -- expected canonical hours: for in-progress month, count up to v_now; otherwise full month
    CASE
      WHEN m.m_start + interval '1 month' <= v_now
        THEN (EXTRACT(DAY FROM (m.m_start + interval '1 month - 1 day'))::int * 24)
      WHEN m.m_start > v_now
        THEN 0
      ELSE GREATEST(0, ((EXTRACT(EPOCH FROM (v_now - m.m_start)) / 3600)::int))
    END                                                                                  AS expected_hours,
    COALESCE(pm.price_hours, 0)::int                                                     AS price_hours,
    COALESCE(pm.ail_hours, 0)::int                                                       AS ail_hours,
    COALESCE(pm.smp_hours, 0)::int                                                       AS smp_hours,
    COALESCE(rpm.raw_rows, 0)::int                                                       AS raw_observation_rows,
    COALESCE(pm.dup_buckets, 0)::int                                                     AS duplicate_hour_buckets,
    GREATEST(
      0,
      (CASE
        WHEN m.m_start + interval '1 month' <= v_now
          THEN (EXTRACT(DAY FROM (m.m_start + interval '1 month - 1 day'))::int * 24)
        WHEN m.m_start > v_now
          THEN 0
        ELSE GREATEST(0, ((EXTRACT(EPOCH FROM (v_now - m.m_start)) / 3600)::int))
      END) - COALESCE(pm.price_hours, 0)
    )::int                                                                               AS missing_price_hours,
    (m.m_start + interval '1 month' <= v_now)                                            AS is_elapsed
  FROM months m
  LEFT JOIN per_month pm   ON pm.m_start = m.m_start
  LEFT JOIN raw_per_month rpm ON rpm.m_start = m.m_start
  ORDER BY m.m_start;
END;
$$;

GRANT EXECUTE ON FUNCTION public.audit_aeso_hourly_coverage(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_aeso_hourly_coverage(timestamptz, timestamptz) TO service_role;

-- 6) List missing canonical hours in a window (used by backfill + UI).
CREATE OR REPLACE FUNCTION public.list_missing_aeso_hours(
  p_from timestamptz,
  p_to   timestamptz
)
RETURNS TABLE(missing_hour timestamptz, missing_price boolean, missing_ail boolean, missing_smp boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH grid AS (
    SELECT generate_series(date_trunc('hour', p_from), date_trunc('hour', p_to), interval '1 hour') AS h
  ),
  present AS (
    SELECT date_trunc('hour', "timestamp") AS h,
           bool_or(pool_price IS NOT NULL) AS has_price,
           bool_or(ail_mw IS NOT NULL) AS has_ail,
           bool_or(system_marginal_price IS NOT NULL) AS has_smp
    FROM public.aeso_training_data
    WHERE "timestamp" >= date_trunc('hour', p_from)
      AND "timestamp" <= date_trunc('hour', p_to)
    GROUP BY 1
  )
  SELECT g.h, COALESCE(NOT p.has_price, TRUE),
              COALESCE(NOT p.has_ail,   TRUE),
              COALESCE(NOT p.has_smp,   TRUE)
  FROM grid g
  LEFT JOIN present p ON p.h = g.h
  WHERE COALESCE(NOT p.has_price, TRUE)
     OR COALESCE(NOT p.has_ail,   TRUE)
     OR COALESCE(NOT p.has_smp,   TRUE)
  ORDER BY g.h;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_missing_aeso_hours(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_missing_aeso_hours(timestamptz, timestamptz) TO service_role;
