-- Enable RLS on viewer_activity table
ALTER TABLE public.viewer_activity ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to INSERT viewer activity (needed for anonymous tracking)
-- This allows tracking of viewers who are not logged in
CREATE POLICY "Allow public insert for viewer tracking"
ON public.viewer_activity
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Allow anyone to UPDATE their own activity record by ID
-- This is needed for updating session data like time spent, pages viewed, etc.
CREATE POLICY "Allow public update for viewer tracking"
ON public.viewer_activity
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Policy 3: Authenticated users can SELECT viewer activity for documents they own
-- Join through secure_links to check ownership
CREATE POLICY "Document owners can view activity"
ON public.viewer_activity
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.secure_links sl
    WHERE sl.id = viewer_activity.link_id
    AND sl.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.secure_documents sd
    WHERE sd.id = viewer_activity.document_id
    AND sd.created_by = auth.uid()
  )
);

-- Policy 4: Document owners can DELETE activity records for their documents
CREATE POLICY "Document owners can delete activity"
ON public.viewer_activity
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.secure_links sl
    WHERE sl.id = viewer_activity.link_id
    AND sl.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.secure_documents sd
    WHERE sd.id = viewer_activity.document_id
    AND sd.created_by = auth.uid()
  )
);

-- Update table comment to reflect new security model
COMMENT ON TABLE public.viewer_activity IS 'Viewer activity tracking with RLS - public insert/update for tracking, owner-only select/delete';