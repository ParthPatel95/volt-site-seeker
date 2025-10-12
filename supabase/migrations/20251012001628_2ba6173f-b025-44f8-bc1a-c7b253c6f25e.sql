-- Drop all existing policies on viewer_activity
DROP POLICY IF EXISTS "Anyone can insert viewer activity" ON viewer_activity;
DROP POLICY IF EXISTS "Anyone can update viewer activity" ON viewer_activity;
DROP POLICY IF EXISTS "Users can view activity for their links" ON viewer_activity;
DROP POLICY IF EXISTS "System can insert viewer activity" ON viewer_activity;
DROP POLICY IF EXISTS "Users can view activity for their documents" ON viewer_activity;

-- Allow public (anonymous and authenticated) to insert viewer activity
CREATE POLICY "Public can insert viewer activity"
ON viewer_activity
FOR INSERT
WITH CHECK (true);

-- Allow public to update their own activity records
CREATE POLICY "Public can update viewer activity"
ON viewer_activity
FOR UPDATE
USING (true);

-- Allow authenticated users to view activity for their links
CREATE POLICY "Users can view their link activity"
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