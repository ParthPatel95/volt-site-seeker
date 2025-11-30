-- Create table for caching translated document content
CREATE TABLE IF NOT EXISTS public.document_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.secure_documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  source_language TEXT DEFAULT 'en' NOT NULL,
  target_language TEXT NOT NULL,
  original_text TEXT,
  translated_text TEXT NOT NULL,
  text_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_translation UNIQUE(document_id, page_number, target_language, text_hash)
);

-- Enable RLS
ALTER TABLE public.document_translations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view translations for documents they have access to
CREATE POLICY "Users can view translations for accessible documents"
  ON public.document_translations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.secure_documents sd
      WHERE sd.id = document_translations.document_id
      AND sd.created_by = auth.uid()
    )
  );

-- Policy: Users can insert translations for their own documents
CREATE POLICY "Users can insert translations for own documents"
  ON public.document_translations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.secure_documents sd
      WHERE sd.id = document_translations.document_id
      AND sd.created_by = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_document_translations_lookup 
  ON public.document_translations(document_id, page_number, target_language);

CREATE INDEX IF NOT EXISTS idx_document_translations_hash 
  ON public.document_translations(text_hash);