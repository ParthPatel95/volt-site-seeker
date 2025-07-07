-- Create additional VoltMarket tables that may be missing

-- Create voltmarket_loi table for LOI management
CREATE TABLE IF NOT EXISTS public.voltmarket_loi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.voltmarket_listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  offer_amount DECIMAL(15, 2) NOT NULL,
  terms TEXT,
  conditions JSONB DEFAULT '[]'::jsonb,
  financing_details JSONB DEFAULT '{}'::jsonb,
  closing_date DATE,
  expiration_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'expired')),
  counter_offer_amount DECIMAL(15, 2),
  counter_terms TEXT,
  notes TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_loi
ALTER TABLE public.voltmarket_loi ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_loi
CREATE POLICY "Users can view LOI involving them" ON public.voltmarket_loi FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create LOI" ON public.voltmarket_loi FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update LOI involving them" ON public.voltmarket_loi FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create voltmarket_reviews table
CREATE TABLE IF NOT EXISTS public.voltmarket_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewed_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.voltmarket_listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  transaction_type TEXT CHECK (transaction_type IN ('purchase', 'sale', 'rental', 'partnership')),
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(reviewer_id, reviewed_user_id, listing_id)
);

-- Enable RLS on voltmarket_reviews
ALTER TABLE public.voltmarket_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_reviews
CREATE POLICY "Anyone can view reviews" ON public.voltmarket_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.voltmarket_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON public.voltmarket_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Create voltmarket_saved_searches table
CREATE TABLE IF NOT EXISTS public.voltmarket_saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  email_alerts BOOLEAN DEFAULT false,
  alert_frequency TEXT DEFAULT 'daily' CHECK (alert_frequency IN ('immediate', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_saved_searches
ALTER TABLE public.voltmarket_saved_searches ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_saved_searches
CREATE POLICY "Users can manage own saved searches" ON public.voltmarket_saved_searches FOR ALL USING (auth.uid() = user_id);

-- Create voltmarket_document_permissions table
CREATE TABLE IF NOT EXISTS public.voltmarket_document_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.voltmarket_documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('view', 'download', 'edit', 'admin')),
  granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(document_id, user_id)
);

-- Enable RLS on voltmarket_document_permissions
ALTER TABLE public.voltmarket_document_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_document_permissions
CREATE POLICY "Users can view permissions for their documents" ON public.voltmarket_document_permissions 
  FOR SELECT USING (
    granted_by = auth.uid() OR 
    user_id = auth.uid() OR
    document_id IN (SELECT id FROM public.voltmarket_documents WHERE uploader_id = auth.uid())
  );

-- Create voltmarket_analytics table for tracking
CREATE TABLE IF NOT EXISTS public.voltmarket_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  listing_id UUID REFERENCES public.voltmarket_listings(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_analytics
ALTER TABLE public.voltmarket_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_analytics
CREATE POLICY "Users can view own analytics" ON public.voltmarket_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert analytics" ON public.voltmarket_analytics FOR INSERT WITH CHECK (true);

-- Add triggers for remaining tables
CREATE TRIGGER update_voltmarket_loi_updated_at
    BEFORE UPDATE ON public.voltmarket_loi
    FOR EACH ROW
    EXECUTE FUNCTION public.update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_reviews_updated_at
    BEFORE UPDATE ON public.voltmarket_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_saved_searches_updated_at
    BEFORE UPDATE ON public.voltmarket_saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_voltmarket_updated_at();