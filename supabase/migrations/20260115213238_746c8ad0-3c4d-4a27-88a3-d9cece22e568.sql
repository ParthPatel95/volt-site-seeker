-- Enable required extensions for cron jobs (may already exist)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule old job if it exists
SELECT cron.unschedule('aeso-telegram-alerts') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'aeso-telegram-alerts');

-- Schedule Telegram alerts to run every 5 minutes
-- This will check all active alert rules and send notifications when thresholds are met
SELECT cron.schedule(
  'aeso-telegram-alerts',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url:='https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-telegram-alerts',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verify the job was created
-- SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'aeso-telegram-alerts';