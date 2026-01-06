-- Add assigned_user_id column to voltbuild_tasks table
ALTER TABLE public.voltbuild_tasks 
ADD COLUMN assigned_user_id uuid REFERENCES public.profiles(id);

-- Create index for better query performance
CREATE INDEX idx_voltbuild_tasks_assigned_user ON public.voltbuild_tasks(assigned_user_id);

-- Add secure_document_id to voltbuild_documents for linking to SecureShare
ALTER TABLE public.voltbuild_documents 
ADD COLUMN secure_document_id uuid REFERENCES public.secure_documents(id);

-- Create index for document lookups
CREATE INDEX idx_voltbuild_documents_secure ON public.voltbuild_documents(secure_document_id);