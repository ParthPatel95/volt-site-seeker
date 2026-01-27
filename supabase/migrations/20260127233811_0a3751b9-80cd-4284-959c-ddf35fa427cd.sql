-- Create function to get monthly peak demand records (aggregated on server)
CREATE OR REPLACE FUNCTION get_monthly_peak_demands(start_date timestamptz DEFAULT NULL, end_date timestamptz DEFAULT NULL)
RETURNS TABLE (
  month_key text,
  peak_timestamp timestamptz,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_peaks AS (
    SELECT 
      to_char(timestamp, 'YYYY-MM') as m_key,
      timestamp as ts,
      ail_mw,
      pool_price,
      hour_of_day,
      EXTRACT(DOW FROM timestamp)::integer as dow,
      ROW_NUMBER() OVER (PARTITION BY to_char(timestamp, 'YYYY-MM') ORDER BY ail_mw DESC NULLS LAST) as rn
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
      AND (start_date IS NULL OR timestamp >= start_date)
      AND (end_date IS NULL OR timestamp <= end_date)
  )
  SELECT 
    m_key,
    ts,
    ail_mw,
    pool_price,
    hour_of_day,
    dow
  FROM monthly_peaks
  WHERE rn = 1
  ORDER BY m_key DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get top N all-time peaks
CREATE OR REPLACE FUNCTION get_top_peak_demands(limit_count integer DEFAULT 50)
RETURNS TABLE (
  peak_timestamp timestamptz,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    timestamp,
    ail_mw,
    pool_price,
    hour_of_day,
    EXTRACT(DOW FROM timestamp)::integer
  FROM aeso_training_data
  WHERE ail_mw IS NOT NULL
  ORDER BY ail_mw DESC NULLS LAST
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get yearly peak demands
CREATE OR REPLACE FUNCTION get_yearly_peak_demands()
RETURNS TABLE (
  year integer,
  peak_timestamp timestamptz,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer
) AS $$
BEGIN
  RETURN QUERY
  WITH yearly_peaks AS (
    SELECT 
      EXTRACT(YEAR FROM timestamp)::integer as yr,
      timestamp as ts,
      ail_mw,
      pool_price,
      hour_of_day,
      EXTRACT(DOW FROM timestamp)::integer as dow,
      ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM timestamp) ORDER BY ail_mw DESC NULLS LAST) as rn
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
  )
  SELECT 
    yr,
    ts,
    ail_mw,
    pool_price,
    hour_of_day,
    dow
  FROM yearly_peaks
  WHERE rn = 1
  ORDER BY yr DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get winter/summer average peaks
CREATE OR REPLACE FUNCTION get_seasonal_peak_stats()
RETURNS TABLE (
  season text,
  avg_peak_mw numeric,
  max_peak_mw numeric,
  record_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH categorized AS (
    SELECT 
      ail_mw,
      CASE 
        WHEN EXTRACT(MONTH FROM timestamp) IN (11, 12, 1, 2) THEN 'winter'
        WHEN EXTRACT(MONTH FROM timestamp) IN (6, 7, 8) THEN 'summer'
        ELSE 'shoulder'
      END as szn
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
  )
  SELECT 
    szn,
    ROUND(AVG(ail_mw)::numeric, 0),
    ROUND(MAX(ail_mw)::numeric, 0),
    COUNT(*)
  FROM categorized
  GROUP BY szn
  ORDER BY MAX(ail_mw) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;