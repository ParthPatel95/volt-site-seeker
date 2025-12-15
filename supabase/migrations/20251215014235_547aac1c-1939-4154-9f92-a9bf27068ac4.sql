-- Add RLS policy for secure_folders to allow anonymous access via active links
CREATE POLICY "Public can view folders via valid link" 
ON secure_folders
FOR SELECT 
TO public
USING (
  EXISTS (
    SELECT 1 FROM secure_links
    WHERE secure_links.folder_id = secure_folders.id
    AND secure_links.status = 'active'
    AND (secure_links.expires_at IS NULL OR secure_links.expires_at > now())
  )
);

-- Add RLS policy for secure_documents to allow viewing documents in shared folders
CREATE POLICY "Public can view documents in shared folders" 
ON secure_documents
FOR SELECT 
TO public  
USING (
  EXISTS (
    SELECT 1 FROM secure_links sl
    WHERE (
      -- Document is directly in the shared folder
      (sl.folder_id IS NOT NULL AND secure_documents.folder_id = sl.folder_id)
      -- OR document is part of a shared bundle
      OR (sl.bundle_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM bundle_documents bd 
        WHERE bd.bundle_id = sl.bundle_id 
        AND bd.document_id = secure_documents.id
      ))
    )
    AND sl.status = 'active'
    AND (sl.expires_at IS NULL OR sl.expires_at > now())
  )
);