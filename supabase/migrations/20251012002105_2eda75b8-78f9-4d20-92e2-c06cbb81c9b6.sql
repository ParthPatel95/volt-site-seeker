-- Fix RLS policies for viewer_activity table
-- Drop all existing policies
DROP POLICY IF EXISTS "Public can insert viewer activity" ON viewer_activity;
DROP POLICY IF EXISTS "Public can update viewer activity" ON viewer_activity;
DROP POLICY IF EXISTS "Users can view their link activity" ON viewer_activity;

-- Enable RLS
ALTER TABLE viewer_activity ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to insert viewer activity records
CREATE POLICY "Allow public insert viewer activity"
ON viewer_activity
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update viewer activity records
CREATE POLICY "Allow public update viewer activity"
ON viewer_activity
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow authenticated users to select viewer activity for their links
CREATE POLICY "Allow authenticated select viewer activity"
ON viewer_activity
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM secure_links
    WHERE secure_links.id = viewer_activity.link_id
    AND secure_links.created_by = auth.uid()
  )
);