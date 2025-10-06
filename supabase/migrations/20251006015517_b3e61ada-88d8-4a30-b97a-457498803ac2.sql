-- Add public access policy for viewing secure links by token
-- This allows anyone with the link token to view the link and associated document
CREATE POLICY "Anyone can view link by token"
  ON public.secure_links FOR SELECT
  USING (true);

-- Add public read access for secure documents when accessed via valid link
CREATE POLICY "Public can view documents via valid link"
  ON public.secure_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.secure_links
      WHERE secure_links.document_id = secure_documents.id
      AND secure_links.status = 'active'
      AND (secure_links.expires_at IS NULL OR secure_links.expires_at > now())
    )
  );