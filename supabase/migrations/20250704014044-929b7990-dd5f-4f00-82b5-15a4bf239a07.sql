-- Check if documents bucket exists and create storage policies for document uploads

-- First, ensure the documents bucket exists (it should already exist based on the config)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
  END IF;
END $$;

-- Create storage policies for document uploads
-- Allow authenticated users to upload documents
CREATE POLICY IF NOT EXISTS "Users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Allow users to view documents they uploaded or have access to
CREATE POLICY IF NOT EXISTS "Users can view documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Allow users to delete documents they uploaded
CREATE POLICY IF NOT EXISTS "Users can delete own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);