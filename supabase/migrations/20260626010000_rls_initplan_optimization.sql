-- Optimize RLS policies flagged by Supabase's `auth_rls_initplan` advisor.
-- (Audit-2026-06-26.)
--
-- WHAT THIS FIXES
-- Policies that call `auth.uid()` / `auth.jwt()` / `auth.role()` /
-- `auth.email()` directly have those functions re-evaluated once PER ROW.
-- Wrapping the call in a scalar sub-select — `(select auth.uid())` — lets
-- Postgres evaluate it ONCE per statement (an InitPlan) and reuse the value.
-- The result is identical because these functions are STABLE within a
-- statement; only the query plan (and large-table performance) changes.
--
-- WHY THIS IS SAFE TO SHIP UN-BABYSAT
--   * It uses ALTER POLICY, which rewrites the policy expression IN PLACE.
--     No policy is ever dropped, so there is no window where a table is
--     unprotected.
--   * The whole thing runs in one transaction (the migration). If ANY
--     ALTER produces an invalid expression, the statement errors, the DO
--     block raises, and the entire migration rolls back — leaving every
--     policy exactly as it was. Worst case is "migration failed", never
--     "policy broken".
--   * It only rewrites bare `auth.*()` calls and skips any policy whose
--     expression already contains a wrapped `(select auth.…)` form, so it
--     is idempotent and safe to re-run.
--
-- RECOMMENDED: apply on a Supabase branch database first and re-run
-- `get_advisors` to confirm the `auth_rls_initplan` warnings clear and no
-- policy semantics changed, then promote. (The transform is provably
-- value-preserving, but verifying against the live advisor is good hygiene.)

DO $$
DECLARE
  r            record;
  v_new_qual   text;
  v_new_check  text;
  v_sql        text;
  v_changed    int := 0;
  v_scanned    int := 0;
  -- Wrap bare auth.uid()/jwt()/role()/email() in a scalar sub-select.
  c_pattern    text := 'auth\.(uid|jwt|role|email)\s*\(\s*\)';
  c_replace    text := '(select auth.\1())';
BEGIN
  FOR r IN
    SELECT
      schemaname,
      tablename,
      policyname,
      qual        AS using_expr,      -- text of USING (...), null if none
      with_check  AS check_expr       -- text of WITH CHECK (...), null if none
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    v_scanned := v_scanned + 1;

    -- Skip policies that are already optimized (contain a wrapped form) to
    -- avoid double-wrapping and keep this migration idempotent.
    IF (r.using_expr  IS NOT NULL AND r.using_expr  ~* '\(\s*select\s+auth\.')
    OR (r.check_expr  IS NOT NULL AND r.check_expr  ~* '\(\s*select\s+auth\.') THEN
      CONTINUE;
    END IF;

    v_new_qual  := CASE WHEN r.using_expr IS NOT NULL
                        THEN regexp_replace(r.using_expr, c_pattern, c_replace, 'gi')
                        ELSE NULL END;
    v_new_check := CASE WHEN r.check_expr IS NOT NULL
                        THEN regexp_replace(r.check_expr, c_pattern, c_replace, 'gi')
                        ELSE NULL END;

    -- Nothing matched -> leave the policy untouched.
    IF v_new_qual IS NOT DISTINCT FROM r.using_expr
       AND v_new_check IS NOT DISTINCT FROM r.check_expr THEN
      CONTINUE;
    END IF;

    -- Build an ALTER POLICY that restates only the clauses this policy has.
    v_sql := format('ALTER POLICY %I ON %I.%I',
                    r.policyname, r.schemaname, r.tablename);
    IF v_new_qual IS NOT NULL THEN
      v_sql := v_sql || format(' USING (%s)', v_new_qual);
    END IF;
    IF v_new_check IS NOT NULL THEN
      v_sql := v_sql || format(' WITH CHECK (%s)', v_new_check);
    END IF;

    EXECUTE v_sql;
    v_changed := v_changed + 1;
    RAISE NOTICE 'rls-initplan: rewrote %.% policy %',
                 r.schemaname, r.tablename, r.policyname;
  END LOOP;

  RAISE NOTICE 'rls-initplan: scanned % public policies, rewrote %',
               v_scanned, v_changed;
END;
$$;
