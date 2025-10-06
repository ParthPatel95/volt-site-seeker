-- Allow public updates to secure_links for view counting
CREATE POLICY "Public can update view count"
  ON public.secure_links FOR UPDATE
  USING (true)
  WITH CHECK (true);