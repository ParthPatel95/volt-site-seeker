-- Create table for OCR extraction caching
CREATE TABLE IF NOT EXISTS public.ocr_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  extracted_text TEXT NOT NULL,
  ocr_method TEXT NOT NULL CHECK (ocr_method IN ('ai_vision', 'browser_tesseract')),
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, page_number, ocr_method)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ocr_extractions_lookup 
ON public.ocr_extractions(document_id, page_number);

-- Enable RLS
ALTER TABLE public.ocr_extractions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached OCR results (since secure_share already handles auth)
CREATE POLICY "Anyone can read OCR cache"
ON public.ocr_extractions
FOR SELECT
USING (true);

-- Allow anyone to insert OCR results
CREATE POLICY "Anyone can insert OCR cache"
ON public.ocr_extractions
FOR INSERT
WITH CHECK (true);