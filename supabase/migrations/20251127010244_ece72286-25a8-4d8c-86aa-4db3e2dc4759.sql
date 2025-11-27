-- Drop the old policy that doesn't handle folders
DROP POLICY IF EXISTS "Users can create links for their bundles" ON public.secure_links;

-- Create new policy that handles documents, bundles, AND folders
CREATE POLICY "Users can create links for their content" ON public.secure_links
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = created_by AND
  (
    -- For documents
    (document_id IS NOT NULL AND bundle_id IS NULL AND folder_id IS NULL AND 
     EXISTS (
       SELECT 1 FROM secure_documents 
       WHERE id = secure_links.document_id 
       AND created_by = auth.uid()
     )
    ) OR
    -- For bundles
    (bundle_id IS NOT NULL AND document_id IS NULL AND folder_id IS NULL AND 
     EXISTS (
       SELECT 1 FROM document_bundles 
       WHERE id = secure_links.bundle_id 
       AND created_by = auth.uid()
     )
    ) OR
    -- For folders
    (folder_id IS NOT NULL AND document_id IS NULL AND bundle_id IS NULL AND 
     EXISTS (
       SELECT 1 FROM secure_folders 
       WHERE id = secure_links.folder_id 
       AND created_by = auth.uid()
     )
    )
  )
);