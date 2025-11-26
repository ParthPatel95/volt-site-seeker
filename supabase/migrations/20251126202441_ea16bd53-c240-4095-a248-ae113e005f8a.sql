-- Create secure_folders table for organizing documents
CREATE TABLE public.secure_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.secure_folders(id) ON DELETE CASCADE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add folder_id column to secure_documents
ALTER TABLE public.secure_documents 
ADD COLUMN folder_id UUID REFERENCES public.secure_folders(id) ON DELETE SET NULL;

-- Enable RLS on secure_folders
ALTER TABLE public.secure_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for secure_folders
CREATE POLICY "Users can view own folders"
ON public.secure_folders
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can create own folders"
ON public.secure_folders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own folders"
ON public.secure_folders
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own folders"
ON public.secure_folders
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_secure_folders_updated_at
BEFORE UPDATE ON public.secure_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_secure_share_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_secure_folders_created_by ON public.secure_folders(created_by);
CREATE INDEX idx_secure_folders_parent ON public.secure_folders(parent_folder_id);
CREATE INDEX idx_secure_documents_folder ON public.secure_documents(folder_id);