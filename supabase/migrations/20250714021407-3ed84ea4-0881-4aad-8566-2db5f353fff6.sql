-- Add listing_id column to due_diligence_reports table
ALTER TABLE public.due_diligence_reports 
ADD COLUMN listing_id UUID REFERENCES public.voltmarket_listings(id);

-- Make company_id optional since we're linking to listings instead
ALTER TABLE public.due_diligence_reports 
ALTER COLUMN company_id DROP NOT NULL;