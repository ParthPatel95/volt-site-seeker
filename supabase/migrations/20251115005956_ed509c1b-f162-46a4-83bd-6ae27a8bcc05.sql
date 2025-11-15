-- Create user_sessions table for tracking login sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_page_visits table for tracking page navigation
CREATE TABLE IF NOT EXISTS public.user_page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT,
  visit_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_feature_usage table for tracking feature interactions
CREATE TABLE IF NOT EXISTS public.user_feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_start ON public.user_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_user_page_visits_user_id ON public.user_page_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_page_visits_session_id ON public.user_page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_user_page_visits_timestamp ON public.user_page_visits(visit_timestamp);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_user_id ON public.user_feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_session_id ON public.user_feature_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_timestamp ON public.user_feature_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_feature_name ON public.user_feature_usage(feature_name);

-- Enable RLS on all analytics tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can insert their own sessions"
  ON public.user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_page_visits
CREATE POLICY "Users can insert their own page visits"
  ON public.user_page_visits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own page visits"
  ON public.user_page_visits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all page visits"
  ON public.user_page_visits
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_feature_usage
CREATE POLICY "Users can insert their own feature usage"
  ON public.user_feature_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feature usage"
  ON public.user_feature_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feature usage"
  ON public.user_feature_usage
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION public.get_user_analytics_summary(target_user_id UUID)
RETURNS TABLE(
  total_sessions BIGINT,
  total_login_count BIGINT,
  avg_session_duration_minutes NUMERIC,
  total_page_visits BIGINT,
  unique_pages_visited BIGINT,
  total_feature_uses BIGINT,
  unique_features_used BIGINT,
  last_login TIMESTAMP WITH TIME ZONE,
  most_visited_pages JSONB,
  most_used_features JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH session_stats AS (
    SELECT 
      COUNT(*) as session_count,
      AVG(EXTRACT(EPOCH FROM (COALESCE(session_end, NOW()) - session_start)) / 60) as avg_duration,
      MAX(session_start) as last_login_time
    FROM user_sessions
    WHERE user_id = target_user_id
  ),
  page_stats AS (
    SELECT 
      COUNT(*) as visit_count,
      COUNT(DISTINCT page_path) as unique_count,
      jsonb_agg(
        jsonb_build_object(
          'page', page_path,
          'visits', visit_count
        ) ORDER BY visit_count DESC
      ) FILTER (WHERE row_num <= 5) as top_pages
    FROM (
      SELECT 
        page_path,
        COUNT(*) as visit_count,
        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as row_num
      FROM user_page_visits
      WHERE user_id = target_user_id
      GROUP BY page_path
    ) ranked_pages
  ),
  feature_stats AS (
    SELECT 
      COUNT(*) as usage_count,
      COUNT(DISTINCT feature_name) as unique_count,
      jsonb_agg(
        jsonb_build_object(
          'feature', feature_name,
          'uses', use_count
        ) ORDER BY use_count DESC
      ) FILTER (WHERE row_num <= 5) as top_features
    FROM (
      SELECT 
        feature_name,
        COUNT(*) as use_count,
        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as row_num
      FROM user_feature_usage
      WHERE user_id = target_user_id
      GROUP BY feature_name
    ) ranked_features
  )
  SELECT 
    COALESCE(ss.session_count, 0)::BIGINT,
    COALESCE(ss.session_count, 0)::BIGINT,
    COALESCE(ss.avg_duration, 0)::NUMERIC,
    COALESCE(ps.visit_count, 0)::BIGINT,
    COALESCE(ps.unique_count, 0)::BIGINT,
    COALESCE(fs.usage_count, 0)::BIGINT,
    COALESCE(fs.unique_count, 0)::BIGINT,
    ss.last_login_time,
    COALESCE(ps.top_pages, '[]'::jsonb),
    COALESCE(fs.top_features, '[]'::jsonb)
  FROM session_stats ss
  CROSS JOIN page_stats ps
  CROSS JOIN feature_stats fs;
END;
$$;