-- Fix duplicate peaks in 12CP data by adding deduplication CTEs to all peak functions
-- This ensures each unique date+hour combination only appears once in results

-- Function 1: get_yearly_top12_peaks - Fixed with deduplication
CREATE OR REPLACE FUNCTION public.get_yearly_top12_peaks()
RETURNS TABLE (
  year integer,
  rank integer,
  peak_timestamp timestamp with time zone,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH deduplicated AS (
    SELECT 
      EXTRACT(YEAR FROM timestamp)::integer as yr,
      DATE(timestamp) as peak_date,
      hour_of_day,
      MAX(ail_mw) as max_ail_mw,
      MAX(pool_price) as max_pool_price,
      MIN(timestamp) as first_timestamp
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM timestamp)::integer, DATE(timestamp), hour_of_day
  ),
  ranked_peaks AS (
    SELECT 
      yr,
      first_timestamp as ts,
      max_ail_mw,
      max_pool_price,
      hour_of_day,
      EXTRACT(DOW FROM first_timestamp)::integer as dow,
      ROW_NUMBER() OVER (PARTITION BY yr ORDER BY max_ail_mw DESC) as rn
    FROM deduplicated
  )
  SELECT 
    yr as year,
    rn::integer as rank,
    ts as peak_timestamp,
    max_ail_mw as peak_demand_mw,
    max_pool_price as price_at_peak,
    hour_of_day as peak_hour,
    dow as day_of_week
  FROM ranked_peaks
  WHERE rn <= 12
  ORDER BY yr DESC, rn ASC;
END;
$$;

-- Function 2: get_top_peak_demands - Fixed with deduplication
CREATE OR REPLACE FUNCTION public.get_top_peak_demands(limit_count integer DEFAULT 50)
RETURNS TABLE (
  peak_timestamp timestamp with time zone,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH deduplicated AS (
    SELECT 
      DATE(timestamp) as peak_date,
      hour_of_day,
      MAX(ail_mw) as max_ail_mw,
      MAX(pool_price) as max_pool_price,
      MIN(timestamp) as first_timestamp
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
    GROUP BY DATE(timestamp), hour_of_day
  )
  SELECT 
    first_timestamp as peak_timestamp,
    max_ail_mw as peak_demand_mw,
    max_pool_price as price_at_peak,
    hour_of_day as peak_hour,
    EXTRACT(DOW FROM first_timestamp)::integer as day_of_week
  FROM deduplicated
  ORDER BY max_ail_mw DESC NULLS LAST
  LIMIT limit_count;
END;
$$;

-- Function 3: get_monthly_peak_demands - Fixed with deduplication
CREATE OR REPLACE FUNCTION public.get_monthly_peak_demands(
  start_date timestamp with time zone DEFAULT NULL,
  end_date timestamp with time zone DEFAULT NULL
)
RETURNS TABLE (
  month_key text,
  peak_timestamp timestamp with time zone,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH deduplicated AS (
    SELECT 
      to_char(timestamp, 'YYYY-MM') as m_key,
      DATE(timestamp) as peak_date,
      hour_of_day,
      MAX(ail_mw) as max_ail_mw,
      MAX(pool_price) as max_pool_price,
      MIN(timestamp) as first_timestamp
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
      AND (start_date IS NULL OR timestamp >= start_date)
      AND (end_date IS NULL OR timestamp <= end_date)
    GROUP BY to_char(timestamp, 'YYYY-MM'), DATE(timestamp), hour_of_day
  ),
  monthly_peaks AS (
    SELECT 
      m_key,
      first_timestamp as ts,
      max_ail_mw,
      max_pool_price,
      hour_of_day,
      EXTRACT(DOW FROM first_timestamp)::integer as dow,
      ROW_NUMBER() OVER (PARTITION BY m_key ORDER BY max_ail_mw DESC NULLS LAST) as rn
    FROM deduplicated
  )
  SELECT 
    m_key as month_key,
    ts as peak_timestamp,
    max_ail_mw as peak_demand_mw,
    max_pool_price as price_at_peak,
    hour_of_day as peak_hour,
    dow as day_of_week
  FROM monthly_peaks
  WHERE rn = 1
  ORDER BY m_key DESC;
END;
$$;

-- Function 4: get_yearly_peak_demands - Fixed with deduplication
CREATE OR REPLACE FUNCTION public.get_yearly_peak_demands()
RETURNS TABLE (
  year integer,
  peak_timestamp timestamp with time zone,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH deduplicated AS (
    SELECT 
      EXTRACT(YEAR FROM timestamp)::integer as yr,
      DATE(timestamp) as peak_date,
      hour_of_day,
      MAX(ail_mw) as max_ail_mw,
      MAX(pool_price) as max_pool_price,
      MIN(timestamp) as first_timestamp
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM timestamp)::integer, DATE(timestamp), hour_of_day
  ),
  yearly_peaks AS (
    SELECT 
      yr,
      first_timestamp as ts,
      max_ail_mw,
      max_pool_price,
      hour_of_day,
      EXTRACT(DOW FROM first_timestamp)::integer as dow,
      ROW_NUMBER() OVER (PARTITION BY yr ORDER BY max_ail_mw DESC NULLS LAST) as rn
    FROM deduplicated
  )
  SELECT 
    yr as year,
    ts as peak_timestamp,
    max_ail_mw as peak_demand_mw,
    max_pool_price as price_at_peak,
    hour_of_day as peak_hour,
    dow as day_of_week
  FROM yearly_peaks
  WHERE rn = 1
  ORDER BY yr DESC;
END;
$$;