-- Add viewer name and email columns to viewer_activity table
ALTER TABLE public.viewer_activity
ADD COLUMN IF NOT EXISTS viewer_name TEXT,
ADD COLUMN IF NOT EXISTS viewer_email TEXT;