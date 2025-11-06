-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a cron job to retrain the AESO AI model every 24 hours at 2 AM MST
SELECT cron.schedule(
  'aeso-daily-model-retraining',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT
    net.http_post(
      url:='https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-model-trainer',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
      body:='{"auto_retrain": true}'::jsonb
    ) as request_id;
  $$
);

-- Create a cron job to collect current data every hour
SELECT cron.schedule(
  'aeso-hourly-data-collection',
  '0 * * * *', -- Every hour on the hour
  $$
  SELECT
    net.http_post(
      url:='https://ktgosplhknmnyagxrgbe.supabase.co/functions/v1/aeso-data-collector',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE"}'::jsonb,
      body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);