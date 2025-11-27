-- Drop the old constraint that doesn't handle folders
ALTER TABLE public.secure_links
DROP CONSTRAINT IF EXISTS check_document_or_bundle;