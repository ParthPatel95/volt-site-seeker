
-- Create voltmarket_lois table for proper LOI storage
CREATE TABLE public.voltmarket_lois (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  offering_price NUMERIC NOT NULL,
  proposed_terms TEXT NOT NULL,
  due_diligence_period_days INTEGER NOT NULL DEFAULT 30,
  contingencies TEXT,
  financing_details TEXT,
  closing_timeline TEXT NOT NULL,
  buyer_qualifications TEXT NOT NULL,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voltmarket_watchlist table
CREATE TABLE public.voltmarket_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Create voltmarket_due_diligence_documents table
CREATE TABLE public.voltmarket_due_diligence_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('financial', 'technical', 'legal', 'environmental', 'regulatory')),
  file_url TEXT,
  file_size TEXT,
  description TEXT,
  requires_nda BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voltmarket_nda_signatures table
CREATE TABLE public.voltmarket_nda_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  UNIQUE(user_id, listing_id)
);

-- Add RLS policies for voltmarket_lois
ALTER TABLE public.voltmarket_lois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view LOIs they're involved in" ON public.voltmarket_lois
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM voltmarket_profiles WHERE id IN (buyer_id, seller_id)
    )
  );

CREATE POLICY "Users can create LOIs as buyers" ON public.voltmarket_lois
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM voltmarket_profiles WHERE id = buyer_id
    )
  );

CREATE POLICY "Sellers can update LOI status" ON public.voltmarket_lois
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM voltmarket_profiles WHERE id = seller_id
    )
  );

-- Add RLS policies for voltmarket_watchlist
ALTER TABLE public.voltmarket_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlist" ON public.voltmarket_watchlist
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_watchlist.user_id
    )
  );

-- Add RLS policies for voltmarket_due_diligence_documents
ALTER TABLE public.voltmarket_due_diligence_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view due diligence documents" ON public.voltmarket_due_diligence_documents
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage their listing documents" ON public.voltmarket_due_diligence_documents
  FOR ALL USING (
    listing_id IN (
      SELECT id FROM voltmarket_listings 
      WHERE auth.uid() IN (
        SELECT user_id FROM voltmarket_profiles WHERE id = seller_id
      )
    )
  );

-- Add RLS policies for voltmarket_nda_signatures
ALTER TABLE public.voltmarket_nda_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own NDA signatures" ON public.voltmarket_nda_signatures
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_nda_signatures.user_id
    )
  );

CREATE POLICY "Users can create their own NDA signatures" ON public.voltmarket_nda_signatures
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_nda_signatures.user_id
    )
  );
