-- Add folder_id column to secure_links table to support folder-level sharing
ALTER TABLE public.secure_links
ADD COLUMN folder_id UUID REFERENCES public.secure_folders(id) ON DELETE CASCADE;

-- Add index for faster folder link lookups
CREATE INDEX idx_secure_links_folder_id ON public.secure_links(folder_id);

-- Add check constraint to ensure only one of document_id, bundle_id, or folder_id is set
ALTER TABLE public.secure_links
ADD CONSTRAINT secure_links_single_target_check 
CHECK (
  (document_id IS NOT NULL AND bundle_id IS NULL AND folder_id IS NULL) OR
  (document_id IS NULL AND bundle_id IS NOT NULL AND folder_id IS NULL) OR
  (document_id IS NULL AND bundle_id IS NULL AND folder_id IS NOT NULL)
);