-- Update voltmarket_loi table to match the expected schema
ALTER TABLE public.voltmarket_loi RENAME TO voltmarket_lois;

-- Add missing columns to voltmarket_lois table
ALTER TABLE public.voltmarket_lois 
ADD COLUMN IF NOT EXISTS offering_price DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS due_diligence_period_days INTEGER,
ADD COLUMN IF NOT EXISTS contingencies TEXT,
ADD COLUMN IF NOT EXISTS financing_details TEXT,
ADD COLUMN IF NOT EXISTS closing_timeline TEXT,
ADD COLUMN IF NOT EXISTS buyer_qualifications TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Update the offer_amount column name to match expected schema
ALTER TABLE public.voltmarket_lois RENAME COLUMN offer_amount TO offering_price;

-- Update the due_diligence_conditions column name to match expected schema  
ALTER TABLE public.voltmarket_lois RENAME COLUMN due_diligence_conditions TO due_diligence_period_days;
ALTER TABLE public.voltmarket_lois ALTER COLUMN due_diligence_period_days TYPE INTEGER USING due_diligence_period_days::INTEGER;

-- Update the closing_date column name to match expected schema
ALTER TABLE public.voltmarket_lois RENAME COLUMN closing_date TO closing_timeline;
ALTER TABLE public.voltmarket_lois ALTER COLUMN closing_timeline TYPE TEXT;