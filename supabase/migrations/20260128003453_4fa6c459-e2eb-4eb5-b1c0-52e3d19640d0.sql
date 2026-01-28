-- Drop existing function first (return type is changing)
DROP FUNCTION IF EXISTS public.get_yearly_top12_peaks();

-- Recreate with weather data columns
CREATE OR REPLACE FUNCTION public.get_yearly_top12_peaks()
RETURNS TABLE (
  year integer,
  rank integer,
  peak_timestamp timestamp with time zone,
  peak_demand_mw numeric,
  price_at_peak numeric,
  peak_hour integer,
  day_of_week integer,
  temp_calgary numeric,
  temp_edmonton numeric,
  wind_speed numeric,
  cloud_cover numeric
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH deduplicated AS (
    SELECT 
      EXTRACT(YEAR FROM t.timestamp)::integer as yr,
      DATE(t.timestamp) as peak_date,
      t.hour_of_day,
      MAX(t.ail_mw) as max_ail_mw,
      MAX(t.pool_price) as max_pool_price,
      MIN(t.timestamp) as first_timestamp,
      MAX(t.temperature_calgary) as max_temp_calgary,
      MAX(t.temperature_edmonton) as max_temp_edmonton,
      MAX(t.wind_speed) as max_wind_speed,
      MAX(t.cloud_cover) as max_cloud_cover
    FROM aeso_training_data t
    WHERE t.ail_mw IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM t.timestamp)::integer, DATE(t.timestamp), t.hour_of_day
  ),
  ranked_peaks AS (
    SELECT 
      d.yr,
      d.first_timestamp as ts,
      d.max_ail_mw as ail_mw,
      d.max_pool_price as pool_price,
      d.hour_of_day,
      EXTRACT(DOW FROM d.first_timestamp)::integer as dow,
      d.max_temp_calgary as temp_c,
      d.max_temp_edmonton as temp_e,
      d.max_wind_speed as wind_s,
      d.max_cloud_cover as cloud_c,
      ROW_NUMBER() OVER (PARTITION BY d.yr ORDER BY d.max_ail_mw DESC) as rn
    FROM deduplicated d
  )
  SELECT 
    rp.yr as year,
    rp.rn::integer as rank,
    rp.ts as peak_timestamp,
    rp.ail_mw as peak_demand_mw,
    rp.pool_price as price_at_peak,
    rp.hour_of_day as peak_hour,
    rp.dow as day_of_week,
    rp.temp_c as temp_calgary,
    rp.temp_e as temp_edmonton,
    rp.wind_s as wind_speed,
    rp.cloud_c as cloud_cover
  FROM ranked_peaks rp
  WHERE rp.rn <= 12
  ORDER BY rp.yr DESC, rp.rn ASC;
END;
$$;