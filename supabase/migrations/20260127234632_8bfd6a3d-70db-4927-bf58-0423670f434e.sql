-- Create function to get top 12 peaks per year for 12CP analysis
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
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_peaks AS (
    SELECT 
      EXTRACT(YEAR FROM timestamp)::integer as yr,
      timestamp as ts,
      ail_mw,
      pool_price,
      hour_of_day,
      EXTRACT(DOW FROM timestamp)::integer as dow,
      ROW_NUMBER() OVER (
        PARTITION BY EXTRACT(YEAR FROM timestamp) 
        ORDER BY ail_mw DESC NULLS LAST
      ) as rn
    FROM aeso_training_data
    WHERE ail_mw IS NOT NULL
  )
  SELECT 
    yr,
    rn::integer,
    ts,
    ail_mw,
    pool_price,
    hour_of_day,
    dow
  FROM ranked_peaks
  WHERE rn <= 12
  ORDER BY yr DESC, rn ASC;
END;
$$;