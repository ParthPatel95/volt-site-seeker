-- Add missing values to the document_category enum
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'investor_deck';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'energy_bill';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'loi';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'ppa';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'land_title';