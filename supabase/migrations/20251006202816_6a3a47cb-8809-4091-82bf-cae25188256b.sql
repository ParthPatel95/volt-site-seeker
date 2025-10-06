-- Allow public access to bundles through secure links
CREATE POLICY "Public can view bundles through secure links"
ON public.document_bundles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.secure_links
    WHERE secure_links.bundle_id = document_bundles.id
    AND secure_links.status = 'active'
    AND (secure_links.expires_at IS NULL OR secure_links.expires_at > now())
  )
);

-- Allow public access to bundle documents through secure links
CREATE POLICY "Public can view bundle documents through secure links"
ON public.bundle_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.secure_links
    WHERE secure_links.bundle_id = bundle_documents.bundle_id
    AND secure_links.status = 'active'
    AND (secure_links.expires_at IS NULL OR secure_links.expires_at > now())
  )
);

-- Allow public access to secure documents when part of a shared bundle
CREATE POLICY "Public can view documents in shared bundles"
ON public.secure_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.bundle_documents bd
    JOIN public.secure_links sl ON sl.bundle_id = bd.bundle_id
    WHERE bd.document_id = secure_documents.id
    AND sl.status = 'active'
    AND (sl.expires_at IS NULL OR sl.expires_at > now())
  )
);