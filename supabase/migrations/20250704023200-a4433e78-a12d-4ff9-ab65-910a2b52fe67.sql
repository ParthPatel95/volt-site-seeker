-- Create VoltMarket listing images table
CREATE TABLE IF NOT EXISTS public.voltmarket_listing_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create VoltMarket due diligence documents table
CREATE TABLE IF NOT EXISTS public.voltmarket_due_diligence_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_size BIGINT,
  is_confidential BOOLEAN DEFAULT false,
  requires_nda BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.voltmarket_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_due_diligence_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for listing images (public viewing, authenticated modification)
CREATE POLICY "Anyone can view listing images" 
ON public.voltmarket_listing_images 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage listing images" 
ON public.voltmarket_listing_images 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create policies for due diligence documents (authenticated viewing/modification)
CREATE POLICY "Authenticated users can view due diligence documents" 
ON public.voltmarket_due_diligence_documents 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage due diligence documents" 
ON public.voltmarket_due_diligence_documents 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_voltmarket_listing_images_updated_at
BEFORE UPDATE ON public.voltmarket_listing_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voltmarket_due_diligence_documents_updated_at
BEFORE UPDATE ON public.voltmarket_due_diligence_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();