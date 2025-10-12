-- Drop existing RLS policies on viewer_activity
DROP POLICY IF EXISTS "Allow public insert viewer activity" ON public.viewer_activity;
DROP POLICY IF EXISTS "Allow public update viewer activity" ON public.viewer_activity;
DROP POLICY IF EXISTS "Allow authenticated select viewer activity" ON public.viewer_activity;

-- Disable RLS temporarily to allow all operations
ALTER TABLE public.viewer_activity DISABLE ROW LEVEL SECURITY;

-- Add a comment explaining this is for anonymous viewer tracking
COMMENT ON TABLE public.viewer_activity IS 'Anonymous viewer activity tracking - RLS disabled to allow public tracking';