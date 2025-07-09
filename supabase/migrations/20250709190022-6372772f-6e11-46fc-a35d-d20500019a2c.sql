-- Add missing columns to existing voltmarket_lois table
ALTER TABLE public.voltmarket_lois 
ADD COLUMN IF NOT EXISTS additional_notes TEXT;