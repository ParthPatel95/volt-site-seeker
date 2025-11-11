-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule old training jobs if they exist
SELECT cron.unschedule('aeso-daily-model-retraining') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'aeso-daily-model-retraining');
SELECT cron.unschedule('aeso-daily-model-training') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'aeso-daily-model-training');

-- Create NEW cron job to run intelligent retraining check daily at 2:00 AM MT (9:00 AM UTC)
-- This checks model performance and triggers retraining ONLY if needed based on drift detection
SELECT cron.schedule(
  'aeso-intelligent-daily-retraining',
  '0 9 * * *', -- Every day at 9:00 AM UTC (2:00 AM MT)
  $$
  SELECT
    net.http_post(
        url:='https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-scheduled-retraining',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- To view all scheduled jobs:
-- SELECT jobid, jobname, schedule, active, command FROM cron.job;

-- To manually unschedule this job if needed:
-- SELECT cron.unschedule('aeso-intelligent-daily-retraining');
