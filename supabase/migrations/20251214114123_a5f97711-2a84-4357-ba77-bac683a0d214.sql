-- Add link_name column to secure_links table for better link identification
ALTER TABLE public.secure_links ADD COLUMN IF NOT EXISTS link_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.secure_links.link_name IS 'User-defined descriptive name for the link';