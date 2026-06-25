-- ============================================================================
-- CRON-SECRET GATE — June 2026
-- ============================================================================
-- The 7 scheduled AESO edge functions are called by pg_cron with the project
-- anon JWT in the Authorization header. That's the same token any public
-- visitor has, so "Authorization required" doesn't distinguish cron from
-- anonymous. (Audit-2026-06-25 PR4.)
--
-- This migration:
--   1. Reads a project-level secret from the Postgres setting
--      `app.cron_secret` (you set it ONCE via SQL — never in source — see
--      OPERATOR STEPS below).
--   2. Unschedules every active AESO cron job and reschedules each one with
--      an extra header `X-Cron-Secret: <the secret>` in addition to the
--      existing Authorization Bearer.
--   3. The corresponding edge functions (gated in this branch via
--      _shared/cronAuth.ts) accept the request only when X-Cron-Secret
--      matches EDGE_CRON_SECRET OR the bearer is the service-role token.
--      Public anon JWTs are rejected.
--
-- OPERATOR STEPS (do these BEFORE applying this migration):
--   1. Generate a strong random secret, e.g.:
--        openssl rand -hex 32
--   2. Set it as a Supabase edge-function secret named EDGE_CRON_SECRET
--      (project Settings → Edge Functions → Secrets).
--   3. Set the same value as a Postgres-level setting so the cron job body
--      can read it. Run this once in the SQL editor:
--        alter database postgres set app.cron_secret to '<the secret>';
--   4. Apply this migration.
--
-- VERIFICATION after apply:
--   * select jobname, schedule, active from cron.job order by jobname;
--   * select status, status_code from net._http_response order by id desc limit 5;
--     (should be 200, not 401)
--
-- ROLLBACK: re-run the previous cron migrations (2025-11-06, 2026-01-15)
-- and remove the X-Cron-Secret header line from the headers JSON.

do $$
declare
  v_secret text;
  v_anon_jwt constant text :=
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE';
  v_base constant text := 'https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1';
  v_hdr  text;
  r record;
begin
  -- Read the cron secret from the Postgres setting. If it's missing, abort
  -- with a clear message instead of silently scheduling jobs that will 401.
  begin
    v_secret := current_setting('app.cron_secret', true);
  exception when others then
    v_secret := null;
  end;
  if v_secret is null or length(v_secret) < 16 then
    raise exception
      'app.cron_secret is not set (or is too short). Set it once via: alter database postgres set app.cron_secret to ''<your secret>''; then re-apply this migration.';
  end if;

  -- Header JSON used by every reschedule below. We keep the existing anon
  -- bearer for Supabase's edge-function dispatch (it still needs to route
  -- the call), and add X-Cron-Secret which the function itself checks.
  v_hdr := format(
    '{"Content-Type": "application/json", "Authorization": "%s", "X-Cron-Secret": "%s"}',
    v_anon_jwt, v_secret
  );

  -- Unschedule any existing job with the names we manage, then reschedule.
  -- The `WHERE EXISTS` guards make this idempotent on a fresh / partially-
  -- applied database.
  for r in
    select unnest(array[
      'aeso-daily-gap-safety-net',
      'aeso-daily-model-retraining',
      'aeso-daily-model-training',
      'aeso-feature-calculation',
      'aeso-hourly-data-collection',
      'aeso-hourly-predictions',
      'aeso-hourly-prediction-validation',
      'aeso-hourly-validation',
      'aeso-telegram-alerts'
    ]) as jobname
  loop
    if exists (select 1 from cron.job where jobname = r.jobname) then
      perform cron.unschedule(r.jobname);
    end if;
  end loop;

  -- Reschedule each job with the X-Cron-Secret header.
  perform cron.schedule(
    'aeso-daily-gap-safety-net', '0 6 * * *',
    format($q$ select net.http_post(url := '%s/aeso-comprehensive-backfill', headers := '%s'::jsonb, body := '{"scheduled": true}'::jsonb) $q$, v_base, v_hdr)
  );
  perform cron.schedule(
    'aeso-daily-model-retraining', '0 2 * * *',
    format($q$ select net.http_post(url := '%s/aeso-model-trainer', headers := '%s'::jsonb, body := '{"auto_retrain": true}'::jsonb) $q$, v_base, v_hdr)
  );
  perform cron.schedule(
    'aeso-feature-calculation', '0 */6 * * *',
    format($q$ select net.http_post(url := '%s/aeso-feature-calculator', headers := '%s'::jsonb, body := '{"scheduled": true}'::jsonb) $q$, v_base, v_hdr)
  );
  perform cron.schedule(
    'aeso-hourly-data-collection', '0 * * * *',
    format($q$ select net.http_post(url := '%s/aeso-data-collector', headers := '%s'::jsonb, body := '{"scheduled": true}'::jsonb) $q$, v_base, v_hdr)
  );
  perform cron.schedule(
    'aeso-hourly-predictions', '5 * * * *',
    format($q$ select net.http_post(url := '%s/aeso-predictor', headers := '%s'::jsonb, body := '{"scheduled": true}'::jsonb) $q$, v_base, v_hdr)
  );
  perform cron.schedule(
    'aeso-hourly-prediction-validation', '0 * * * *',
    format($q$ select net.http_post(url := '%s/aeso-performance-tracker', headers := '%s'::jsonb, body := '{"scheduled": true}'::jsonb) $q$, v_base, v_hdr)
  );
  perform cron.schedule(
    'aeso-hourly-validation', '35 * * * *',
    format($q$ select net.http_post(url := '%s/aeso-validate-predictions', headers := '%s'::jsonb, body := '{"scheduled": true}'::jsonb) $q$, v_base, v_hdr)
  );
  perform cron.schedule(
    'aeso-telegram-alerts', '*/5 * * * *',
    format($q$ select net.http_post(url := '%s/aeso-telegram-alerts', headers := '%s'::jsonb, body := '{}'::jsonb) $q$, v_base, v_hdr)
  );
end $$;
