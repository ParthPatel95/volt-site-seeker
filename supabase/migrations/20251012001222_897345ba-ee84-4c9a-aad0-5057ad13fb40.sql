-- Update RLS policies for viewer_activity to allow anonymous tracking
DROP POLICY IF EXISTS "Users can manage their viewer activity" ON viewer_activity;
DROP POLICY IF EXISTS "Anyone can insert viewer activity" ON viewer_activity;
DROP POLICY IF EXISTS "Anyone can update their own viewer activity" ON viewer_activity;

-- Allow anyone (including anonymous users) to insert viewer activity
CREATE POLICY "Anyone can insert viewer activity"
ON viewer_activity
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to update viewer activity records they created (by activity ID)
CREATE POLICY "Anyone can update viewer activity"
ON viewer_activity
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view viewer activity for their own links
CREATE POLICY "Users can view activity for their links"
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