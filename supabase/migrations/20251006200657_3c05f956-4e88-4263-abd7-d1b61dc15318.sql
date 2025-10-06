-- Add bundle_id column to secure_links table to support bundle sharing
ALTER TABLE secure_links ADD COLUMN IF NOT EXISTS bundle_id uuid REFERENCES document_bundles(id) ON DELETE CASCADE;

-- Make document_id nullable since we can share either a document or a bundle
ALTER TABLE secure_links ALTER COLUMN document_id DROP NOT NULL;

-- Add constraint to ensure either document_id or bundle_id is set, but not both
ALTER TABLE secure_links ADD CONSTRAINT check_document_or_bundle 
CHECK (
  (document_id IS NOT NULL AND bundle_id IS NULL) OR 
  (document_id IS NULL AND bundle_id IS NOT NULL)
);

-- Update RLS policy to allow users to create links for their bundles
CREATE POLICY "Users can create links for their bundles"
ON secure_links FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    (document_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM secure_documents 
      WHERE id = document_id AND created_by = auth.uid()
    )) OR
    (bundle_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM document_bundles 
      WHERE id = bundle_id AND created_by = auth.uid()
    ))
  )
);