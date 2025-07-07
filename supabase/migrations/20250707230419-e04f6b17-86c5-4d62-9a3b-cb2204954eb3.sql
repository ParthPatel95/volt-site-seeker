-- Create contact messages table to replace the messaging system
CREATE TABLE IF NOT EXISTS public.voltmarket_contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.voltmarket_listings(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  listing_owner_id UUID NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.voltmarket_contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit contact messages" ON public.voltmarket_contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Listing owners can view messages for their listings" ON public.voltmarket_contact_messages
  FOR SELECT USING (auth.uid() = listing_owner_id);

CREATE POLICY "Listing owners can update message read status" ON public.voltmarket_contact_messages
  FOR UPDATE USING (auth.uid() = listing_owner_id);

-- Add trigger for updated_at
CREATE TRIGGER update_voltmarket_contact_messages_updated_at
  BEFORE UPDATE ON public.voltmarket_contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fix LOI table issues - ensure it exists with proper structure
CREATE TABLE IF NOT EXISTS public.voltmarket_lois (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.voltmarket_listings(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS for LOI table
ALTER TABLE public.voltmarket_lois ENABLE ROW LEVEL SECURITY;

-- Create LOI policies
CREATE POLICY "Buyers and sellers can view their LOIs" ON public.voltmarket_lois
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create LOIs" ON public.voltmarket_lois
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update LOI status" ON public.voltmarket_lois
  FOR UPDATE USING (auth.uid() = seller_id);

-- Add trigger for LOI updated_at
CREATE TRIGGER update_voltmarket_lois_updated_at
  BEFORE UPDATE ON public.voltmarket_lois
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();