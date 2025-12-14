-- Add missing closed_at column to viewer_activity table
ALTER TABLE public.viewer_activity 
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;