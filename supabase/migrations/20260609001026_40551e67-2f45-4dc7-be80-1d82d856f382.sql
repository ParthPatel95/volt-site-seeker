
CREATE OR REPLACE FUNCTION public.get_aeso_raw_observations_cursor(
  p_page_size integer DEFAULT 100,
  p_cursor_observed_for timestamp with time zone DEFAULT NULL,
  p_cursor_id bigint DEFAULT NULL,
  p_hour_from timestamp with time zone DEFAULT NULL,
  p_hour_to timestamp with time zone DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_revision_id text DEFAULT NULL,
  p_endpoint text DEFAULT NULL
)
RETURNS TABLE(
  id bigint,
  observed_for timestamp with time zone,
  observed_at timestamp with time zone,
  pool_price numeric,
  system_marginal_price numeric,
  forecast_pool_price numeric,
  ail_demand_mw numeric,
  source text,
  source_endpoint text,
  revision_id text,
  api_response_status integer,
  request_id uuid,
  raw_payload jsonb,
  metadata jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.observed_for,
    r.observed_at,
    r.pool_price,
    r.system_marginal_price,
    r.forecast_pool_price,
    r.ail_demand_mw,
    r.source,
    r.source_endpoint,
    r.revision_id,
    r.api_response_status,
    r.request_id,
    r.raw_payload,
    r.metadata,
    r.created_at
  FROM aeso_raw_price_observations r
  WHERE
    (p_hour_from IS NULL OR r.observed_for >= p_hour_from)
    AND (p_hour_to IS NULL OR r.observed_for <= p_hour_to)
    AND (p_source IS NULL OR r.source = p_source)
    AND (p_revision_id IS NULL OR r.revision_id ILIKE '%' || p_revision_id || '%')
    AND (p_endpoint IS NULL OR r.source_endpoint ILIKE '%' || p_endpoint || '%')
    AND (
      p_cursor_observed_for IS NULL
      OR (r.observed_for, r.id) < (p_cursor_observed_for, p_cursor_id)
    )
  ORDER BY r.observed_for DESC, r.id DESC
  LIMIT p_page_size;
END;
$$;

CREATE OR REPLACE FUNCTION public.count_aeso_raw_observations(
  p_hour_from timestamp with time zone DEFAULT NULL,
  p_hour_to timestamp with time zone DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_revision_id text DEFAULT NULL,
  p_endpoint text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count bigint;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM aeso_raw_price_observations r
  WHERE
    (p_hour_from IS NULL OR r.observed_for >= p_hour_from)
    AND (p_hour_to IS NULL OR r.observed_for <= p_hour_to)
    AND (p_source IS NULL OR r.source = p_source)
    AND (p_revision_id IS NULL OR r.revision_id ILIKE '%' || p_revision_id || '%')
    AND (p_endpoint IS NULL OR r.source_endpoint ILIKE '%' || p_endpoint || '%');
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_aeso_raw_observations_cursor TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_aeso_raw_observations TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_aeso_raw_observations_cursor TO service_role;
GRANT EXECUTE ON FUNCTION public.count_aeso_raw_observations TO service_role;
