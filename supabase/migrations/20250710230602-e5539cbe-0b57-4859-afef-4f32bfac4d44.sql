-- Make listing_id nullable in voltmarket_documents table
ALTER TABLE public.voltmarket_documents 
ALTER COLUMN listing_id DROP NOT NULL;