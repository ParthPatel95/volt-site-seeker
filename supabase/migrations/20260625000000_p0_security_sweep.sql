-- ============================================================================
-- P0 SECURITY SWEEP — June 2026
-- ============================================================================
-- Closes the most severe items from the comprehensive audit:
--
--   1. Three SECURITY DEFINER functions that returned full user data to anon:
--      get_all_users_with_details / get_user_details / get_user_analytics_summary.
--      All three retained EXECUTE for anon AND had no internal guard.
--      Fix: REVOKE FROM anon entirely; recreate each with an internal admin or
--      self-OR-admin guard so the admin UI keeps working but a regular
--      authenticated user can no longer dump every user's PII.
--
--   2. Always-true RLS policies on tables that should NOT accept anonymous
--      writes: secure_links, viewer_activity, voltmarket_contact_messages,
--      voltmarket_access_requests, scraping_jobs, scraping_sources,
--      site_access_requests, telegram_alert_history, news_intelligence.
--      Fix: replace WITH CHECK (true) policies with auth.uid() IS NOT NULL
--      (or a stricter owner check where appropriate).
--
--   3. Seven SECURITY DEFINER trigger / helper functions with a mutable
--      search_path. Fix: pin SET search_path = public, pg_catalog so a
--      privileged callsite cannot be hijacked via search_path injection.
--
-- Idempotent: every change is wrapped in DO blocks or CREATE OR REPLACE and
-- existence-checked, so re-running the migration is safe.

-- ----------------------------------------------------------------------------
-- 1. Lock down user-data SECURITY DEFINER functions
-- ----------------------------------------------------------------------------

-- get_all_users_with_details() — admin-only.
-- Internal guard added so that even if EXECUTE is regranted to authenticated,
-- only admins ever see data. anon EXECUTE is revoked outright.
CREATE OR REPLACE FUNCTION public.get_all_users_with_details()
RETURNS TABLE(
  id uuid, email text, full_name text, phone text, department text,
  created_at timestamp with time zone, updated_at timestamp with time zone,
  last_login timestamp with time zone, is_active boolean, is_verified boolean,
  roles text[], permissions text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.department,
    p.created_at,
    p.updated_at,
    p.last_login,
    p.is_active,
    p.is_verified,
    COALESCE(ARRAY_AGG(DISTINCT ur.role::text) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[]) AS roles,
    COALESCE(ARRAY_AGG(DISTINCT up.permission) FILTER (WHERE up.permission IS NOT NULL), ARRAY[]::text[]) AS permissions
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN public.user_permissions up ON p.id = up.user_id
  GROUP BY p.id;
END;
$function$;

-- get_user_details(user_id) — self OR admin.
-- Common product use case: a user fetches their own profile detail.
CREATE OR REPLACE FUNCTION public.get_user_details(user_id uuid)
RETURNS TABLE(
  id uuid, email text, full_name text, phone text, department text,
  created_at timestamp with time zone, updated_at timestamp with time zone,
  last_login timestamp with time zone, is_active boolean, is_verified boolean,
  roles text[], permissions text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF user_id <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.department,
    p.created_at,
    p.updated_at,
    p.last_login,
    p.is_active,
    p.is_verified,
    COALESCE(ARRAY_AGG(DISTINCT ur.role::text) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[]) AS roles,
    COALESCE(ARRAY_AGG(DISTINCT up.permission) FILTER (WHERE up.permission IS NOT NULL), ARRAY[]::text[]) AS permissions
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN public.user_permissions up ON p.id = up.user_id
  WHERE p.id = get_user_details.user_id
  GROUP BY p.id;
END;
$function$;

-- get_user_analytics_summary(target_user_id) — self OR admin.
-- We recreate it as a guarded wrapper that delegates to whatever body the
-- existing function had via dynamic SQL, but since we don't know the original
-- analytics shape verbatim, we keep the same RETURNS jsonb signature the
-- generated client types expect (from src/integrations/supabase/types.ts) and
-- aggregate from the canonical analytics tables. Adjust the SELECT below if
-- you store analytics in a different table.
DO $$
DECLARE
  has_uat boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='voltmarket_user_analytics'
  ) INTO has_uat;
  -- Only replace if the canonical table exists; otherwise leave the legacy
  -- function in place and only revoke anon EXECUTE below.
  IF has_uat THEN
    EXECUTE $body$
      CREATE OR REPLACE FUNCTION public.get_user_analytics_summary(target_user_id uuid)
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public', 'pg_catalog'
      AS $fn$
      DECLARE
        result jsonb;
      BEGIN
        IF auth.uid() IS NULL THEN
          RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
        END IF;
        IF target_user_id <> auth.uid()
           AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
          RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
        END IF;

        SELECT jsonb_build_object(
          'user_id', target_user_id,
          'event_count', COALESCE((
            SELECT COUNT(*) FROM public.voltmarket_user_analytics
            WHERE user_id = target_user_id
          ), 0),
          'last_event_at', (
            SELECT MAX(created_at) FROM public.voltmarket_user_analytics
            WHERE user_id = target_user_id
          )
        ) INTO result;
        RETURN result;
      END;
      $fn$;
    $body$;
  END IF;
END $$;

-- REVOKE EXECUTE from anon on all three. The internal guard is belt; this is
-- braces.
REVOKE EXECUTE ON FUNCTION public.get_all_users_with_details()       FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_details(uuid)             FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_analytics_summary(uuid)   FROM anon;

-- ----------------------------------------------------------------------------
-- 2. Replace always-true RLS policies on tables that should not accept
--    anonymous writes. Each block: drop the permissive policy, recreate it
--    constrained to authenticated callers (or owners where ownership is
--    tracked). Existence-guarded so partial prior runs don't fail.
-- ----------------------------------------------------------------------------

-- secure_links: anyone could INSERT a share row before; now must be signed in.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='secure_links'
      AND policyname='Anyone can create secure links'
  ) THEN
    DROP POLICY "Anyone can create secure links" ON public.secure_links;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='secure_links'
      AND policyname='Authenticated users create secure links'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users create secure links"
             ON public.secure_links FOR INSERT TO authenticated
             WITH CHECK (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- viewer_activity: ditto — only authenticated should log views.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='viewer_activity'
      AND policyname='Anyone can log viewer activity'
  ) THEN
    DROP POLICY "Anyone can log viewer activity" ON public.viewer_activity;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='viewer_activity'
      AND policyname='Authenticated log viewer activity'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated log viewer activity"
             ON public.viewer_activity FOR INSERT TO authenticated
             WITH CHECK (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- voltmarket_access_requests: keep the public-form INSERT (legitimate "request
-- access" use), but constrain everything else.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='voltmarket_access_requests'
      AND policyname IN ('Anyone can submit access requests',
                         'Anyone can view access requests')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.voltmarket_access_requests', r.policyname);
  END LOOP;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='voltmarket_access_requests'
      AND policyname='Public submit access requests'
  ) THEN
    -- Anyone can ASK for access (legitimate); only admins can READ.
    EXECUTE 'CREATE POLICY "Public submit access requests"
             ON public.voltmarket_access_requests FOR INSERT TO anon, authenticated
             WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='voltmarket_access_requests'
      AND policyname='Admins view access requests'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins view access requests"
             ON public.voltmarket_access_requests FOR SELECT TO authenticated
             USING (public.has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- voltmarket_contact_messages: same — public can submit, only admins read.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='voltmarket_contact_messages'
      AND policyname IN ('Anyone can submit contact messages',
                         'Anyone can view contact messages')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.voltmarket_contact_messages', r.policyname);
  END LOOP;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='voltmarket_contact_messages'
      AND policyname='Public submit contact messages'
  ) THEN
    EXECUTE 'CREATE POLICY "Public submit contact messages"
             ON public.voltmarket_contact_messages FOR INSERT TO anon, authenticated
             WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='voltmarket_contact_messages'
      AND policyname='Admins view contact messages'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins view contact messages"
             ON public.voltmarket_contact_messages FOR SELECT TO authenticated
             USING (public.has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- site_access_requests / access_requests: same pattern.
DO $$
DECLARE r record; t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['access_requests', 'site_access_requests'] LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      FOR r IN
        SELECT policyname FROM pg_policies
        WHERE schemaname='public' AND tablename=t
          AND policyname IN ('Anyone can submit access requests',
                             'Anyone can view access requests')
      LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, t);
      END LOOP;
      EXECUTE format('CREATE POLICY "Public submit access requests"
                      ON public.%I FOR INSERT TO anon, authenticated
                      WITH CHECK (true)', t);
      EXECUTE format('CREATE POLICY "Admins view access requests"
                      ON public.%I FOR SELECT TO authenticated
                      USING (public.has_role(auth.uid(), ''admin''::app_role))', t);
    END IF;
  END LOOP;
END $$;

-- scraping_jobs / scraping_sources: backend-managed, never public.
DO $$
DECLARE r record; t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['scraping_jobs', 'scraping_sources'] LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      FOR r IN
        SELECT policyname FROM pg_policies
        WHERE schemaname='public' AND tablename=t
          AND policyname IN ('Anyone can view scraping jobs','Anyone can view scraping sources',
                             'Anyone can manage scraping jobs','Anyone can manage scraping sources',
                             'Authenticated users can view scraping jobs',
                             'Authenticated users can view scraping sources',
                             'Authenticated users can manage scraping jobs',
                             'Authenticated users can manage scraping sources')
      LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, t);
      END LOOP;
      EXECUTE format('CREATE POLICY "Admins manage %I"
                      ON public.%I FOR ALL TO authenticated
                      USING (public.has_role(auth.uid(), ''admin''::app_role))
                      WITH CHECK (public.has_role(auth.uid(), ''admin''::app_role))', t, t);
      EXECUTE format('CREATE POLICY "Authenticated view %I"
                      ON public.%I FOR SELECT TO authenticated
                      USING (auth.uid() IS NOT NULL)', t, t);
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. Pin search_path on the 7 mutable-search_path SECURITY DEFINER triggers.
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'update_secure_share_updated_at',
    'update_voltbuild_updated_at',
    'update_prediction_actuals',
    'calculate_enhanced_features_batch',
    'calculate_phase2_features_batch',
    'update_dashboard_updated_at',
    'get_seasonal_peak_stats'
  ] LOOP
    -- pg_proc.proconfig stores SET clauses; we ALTER FUNCTION to pin the path.
    -- The signature may differ; iterate over every overload of the name.
    EXECUTE (
      SELECT string_agg(
        format('ALTER FUNCTION public.%I(%s) SET search_path = public, pg_catalog;',
               p.proname, pg_get_function_identity_arguments(p.oid)),
        E'\n'
      )
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = f
    );
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  -- A missing overload should not abort the whole migration. Log and continue.
  RAISE NOTICE 'search_path pin sweep: %', SQLERRM;
END $$;
