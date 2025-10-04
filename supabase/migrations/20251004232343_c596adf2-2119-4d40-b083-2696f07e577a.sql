-- Phase 1: Core Infrastructure for VoltScout Secure Share (Fixed)
-- Create tables for secure document sharing system

-- Document categories enum (skip if exists)
DO $$ BEGIN
  CREATE TYPE document_category AS ENUM (
    'investor_deck',
    'energy_bill',
    'loi',
    'ppa',
    'land_title',
    'financial',
    'legal',
    'technical',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Link status enum
DO $$ BEGIN
  CREATE TYPE link_status AS ENUM (
    'active',
    'expired',
    'revoked',
    'pending'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Access level enum
DO $$ BEGIN
  CREATE TYPE access_level AS ENUM (
    'view_only',
    'download',
    'no_download'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Secure documents table
CREATE TABLE IF NOT EXISTS public.secure_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  category document_category NOT NULL DEFAULT 'other',
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  site_id UUID,
  thumbnail_url TEXT,
  page_count INTEGER,
  file_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Secure links table
CREATE TABLE IF NOT EXISTS public.secure_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.secure_documents(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_token TEXT UNIQUE NOT NULL,
  recipient_email TEXT,
  recipient_name TEXT,
  access_level access_level DEFAULT 'view_only',
  status link_status DEFAULT 'active',
  password_hash TEXT,
  allowed_domains TEXT[],
  allowed_ips TEXT[],
  require_otp BOOLEAN DEFAULT false,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  custom_branding JSONB,
  watermark_enabled BOOLEAN DEFAULT true,
  nda_required BOOLEAN DEFAULT false,
  nda_signed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Viewer activity table
CREATE TABLE IF NOT EXISTS public.viewer_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.secure_links(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.secure_documents(id) ON DELETE CASCADE,
  viewer_email TEXT,
  viewer_ip TEXT,
  viewer_location TEXT,
  device_type TEXT,
  browser TEXT,
  pages_viewed JSONB DEFAULT '[]',
  total_time_seconds INTEGER DEFAULT 0,
  scroll_depth JSONB DEFAULT '{}',
  engagement_score INTEGER DEFAULT 0,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Document bundles table
CREATE TABLE IF NOT EXISTS public.document_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  folder_structure JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bundle documents junction table
CREATE TABLE IF NOT EXISTS public.bundle_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.document_bundles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.secure_documents(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  folder_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(bundle_id, document_id)
);

-- Enable RLS
ALTER TABLE public.secure_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewer_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "VoltScout approved users can view documents" ON public.secure_documents;
DROP POLICY IF EXISTS "VoltScout approved users can create documents" ON public.secure_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.secure_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.secure_documents;

DROP POLICY IF EXISTS "VoltScout approved users can view links" ON public.secure_links;
DROP POLICY IF EXISTS "Users can create links for their documents" ON public.secure_links;
DROP POLICY IF EXISTS "Users can update their own links" ON public.secure_links;
DROP POLICY IF EXISTS "Users can delete their own links" ON public.secure_links;

DROP POLICY IF EXISTS "Users can view activity for their documents" ON public.viewer_activity;
DROP POLICY IF EXISTS "System can insert viewer activity" ON public.viewer_activity;

DROP POLICY IF EXISTS "VoltScout approved users can view bundles" ON public.document_bundles;
DROP POLICY IF EXISTS "Users can create bundles" ON public.document_bundles;
DROP POLICY IF EXISTS "Users can update their own bundles" ON public.document_bundles;
DROP POLICY IF EXISTS "Users can delete their own bundles" ON public.document_bundles;

DROP POLICY IF EXISTS "Users can view bundle documents" ON public.bundle_documents;
DROP POLICY IF EXISTS "Users can manage their bundle documents" ON public.bundle_documents;

-- RLS Policies for secure_documents
CREATE POLICY "VoltScout approved users can view documents"
  ON public.secure_documents FOR SELECT
  USING (is_voltscout_approved(auth.uid()));

CREATE POLICY "VoltScout approved users can create documents"
  ON public.secure_documents FOR INSERT
  WITH CHECK (is_voltscout_approved(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Users can update their own documents"
  ON public.secure_documents FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own documents"
  ON public.secure_documents FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for secure_links
CREATE POLICY "VoltScout approved users can view links"
  ON public.secure_links FOR SELECT
  USING (is_voltscout_approved(auth.uid()));

CREATE POLICY "Users can create links for their documents"
  ON public.secure_links FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (SELECT 1 FROM public.secure_documents WHERE id = document_id AND created_by = auth.uid())
  );

CREATE POLICY "Users can update their own links"
  ON public.secure_links FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own links"
  ON public.secure_links FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for viewer_activity
CREATE POLICY "Users can view activity for their documents"
  ON public.viewer_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.secure_documents 
      WHERE id = viewer_activity.document_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert viewer activity"
  ON public.viewer_activity FOR INSERT
  WITH CHECK (true);

-- RLS Policies for document_bundles
CREATE POLICY "VoltScout approved users can view bundles"
  ON public.document_bundles FOR SELECT
  USING (is_voltscout_approved(auth.uid()));

CREATE POLICY "Users can create bundles"
  ON public.document_bundles FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own bundles"
  ON public.document_bundles FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own bundles"
  ON public.document_bundles FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for bundle_documents
CREATE POLICY "Users can view bundle documents"
  ON public.bundle_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_bundles 
      WHERE id = bundle_documents.bundle_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage their bundle documents"
  ON public.bundle_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.document_bundles 
      WHERE id = bundle_documents.bundle_id AND created_by = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_secure_documents_created_by ON public.secure_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_secure_documents_category ON public.secure_documents(category);
CREATE INDEX IF NOT EXISTS idx_secure_documents_site_id ON public.secure_documents(site_id);
CREATE INDEX IF NOT EXISTS idx_secure_links_document_id ON public.secure_links(document_id);
CREATE INDEX IF NOT EXISTS idx_secure_links_token ON public.secure_links(link_token);
CREATE INDEX IF NOT EXISTS idx_secure_links_status ON public.secure_links(status);
CREATE INDEX IF NOT EXISTS idx_viewer_activity_link_id ON public.viewer_activity(link_id);
CREATE INDEX IF NOT EXISTS idx_viewer_activity_document_id ON public.viewer_activity(document_id);
CREATE INDEX IF NOT EXISTS idx_bundle_documents_bundle_id ON public.bundle_documents(bundle_id);

-- Create storage bucket for secure documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('secure-documents', 'secure-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "VoltScout users can upload secure documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own secure documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own secure documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own secure documents" ON storage.objects;

-- Storage policies for secure documents bucket
CREATE POLICY "VoltScout users can upload secure documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'secure-documents' AND 
    is_voltscout_approved(auth.uid())
  );

CREATE POLICY "Users can view their own secure documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'secure-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own secure documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'secure-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own secure documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'secure-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_secure_share_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_secure_documents_updated_at ON public.secure_documents;
DROP TRIGGER IF EXISTS update_secure_links_updated_at ON public.secure_links;
DROP TRIGGER IF EXISTS update_document_bundles_updated_at ON public.document_bundles;

-- Triggers for updated_at
CREATE TRIGGER update_secure_documents_updated_at
  BEFORE UPDATE ON public.secure_documents
  FOR EACH ROW EXECUTE FUNCTION update_secure_share_updated_at();

CREATE TRIGGER update_secure_links_updated_at
  BEFORE UPDATE ON public.secure_links
  FOR EACH ROW EXECUTE FUNCTION update_secure_share_updated_at();

CREATE TRIGGER update_document_bundles_updated_at
  BEFORE UPDATE ON public.document_bundles
  FOR EACH ROW EXECUTE FUNCTION update_secure_share_updated_at();