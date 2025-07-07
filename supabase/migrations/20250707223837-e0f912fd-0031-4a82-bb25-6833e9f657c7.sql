-- Create VoltMarket core tables

-- First, create the voltmarket_profiles table
CREATE TABLE IF NOT EXISTS public.voltmarket_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'broker', 'investor', 'developer')),
  company_type TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  location TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_id_verified BOOLEAN DEFAULT false,
  verification_documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_profiles
ALTER TABLE public.voltmarket_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_profiles
CREATE POLICY "Users can view all profiles" ON public.voltmarket_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.voltmarket_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.voltmarket_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create voltmarket_listings table
CREATE TABLE IF NOT EXISTS public.voltmarket_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.voltmarket_profiles(user_id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  asking_price DECIMAL(15, 2),
  lot_size_acres DECIMAL(10, 2),
  power_capacity_mw DECIMAL(10, 3),
  substation_distance_miles DECIMAL(8, 2),
  transmission_access BOOLEAN DEFAULT false,
  year_built INTEGER,
  zoning TEXT,
  utilities JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'pending', 'sold', 'withdrawn')),
  featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_listings
ALTER TABLE public.voltmarket_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_listings
CREATE POLICY "Anyone can view active listings" ON public.voltmarket_listings FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "Sellers can manage own listings" ON public.voltmarket_listings FOR ALL USING (auth.uid() = seller_id);

-- Create voltmarket_watchlist table
CREATE TABLE IF NOT EXISTS public.voltmarket_watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.voltmarket_listings(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, listing_id)
);

-- Enable RLS on voltmarket_watchlist
ALTER TABLE public.voltmarket_watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_watchlist
CREATE POLICY "Users can manage own watchlist" ON public.voltmarket_watchlist FOR ALL USING (auth.uid() = user_id);

-- Create voltmarket_conversations table
CREATE TABLE IF NOT EXISTS public.voltmarket_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.voltmarket_listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_conversations
ALTER TABLE public.voltmarket_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_conversations
CREATE POLICY "Users can view own conversations" ON public.voltmarket_conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create conversations" ON public.voltmarket_conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own conversations" ON public.voltmarket_conversations FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create voltmarket_messages table
CREATE TABLE IF NOT EXISTS public.voltmarket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.voltmarket_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'document', 'image', 'offer')),
  attachments JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_messages
ALTER TABLE public.voltmarket_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_messages
CREATE POLICY "Users can view messages in their conversations" ON public.voltmarket_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.voltmarket_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update message read status" ON public.voltmarket_messages FOR UPDATE USING (auth.uid() = recipient_id);

-- Create voltmarket_portfolios table
CREATE TABLE IF NOT EXISTS public.voltmarket_portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  portfolio_type TEXT NOT NULL CHECK (portfolio_type IN ('investment', 'development', 'trading', 'research')),
  target_allocation JSONB DEFAULT '{}'::jsonb,
  risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive', 'speculative')),
  total_value DECIMAL(15, 2) DEFAULT 0,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_portfolios
ALTER TABLE public.voltmarket_portfolios ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_portfolios
CREATE POLICY "Users can manage own portfolios" ON public.voltmarket_portfolios FOR ALL USING (auth.uid() = user_id);

-- Create voltmarket_portfolio_items table
CREATE TABLE IF NOT EXISTS public.voltmarket_portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.voltmarket_portfolios(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.voltmarket_listings(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'investment', 'opportunity', 'research')),
  name TEXT NOT NULL,
  acquisition_price DECIMAL(15, 2),
  current_value DECIMAL(15, 2),
  acquisition_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending', 'archived')),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_portfolio_items
ALTER TABLE public.voltmarket_portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_portfolio_items
CREATE POLICY "Users can manage items in own portfolios" ON public.voltmarket_portfolio_items 
  FOR ALL USING (
    portfolio_id IN (
      SELECT id FROM public.voltmarket_portfolios WHERE user_id = auth.uid()
    )
  );

-- Create voltmarket_documents table
CREATE TABLE IF NOT EXISTS public.voltmarket_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.voltmarket_listings(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('financial', 'legal', 'technical', 'marketing', 'due_diligence', 'other')),
  is_confidential BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'registered', 'verified', 'private')),
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on voltmarket_documents
ALTER TABLE public.voltmarket_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for voltmarket_documents
CREATE POLICY "Public documents are viewable by all" ON public.voltmarket_documents FOR SELECT USING (access_level = 'public');
CREATE POLICY "Users can view own documents" ON public.voltmarket_documents FOR SELECT USING (auth.uid() = uploader_id);
CREATE POLICY "Users can upload documents" ON public.voltmarket_documents FOR INSERT WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "Users can update own documents" ON public.voltmarket_documents FOR UPDATE USING (auth.uid() = uploader_id);
CREATE POLICY "Users can delete own documents" ON public.voltmarket_documents FOR DELETE USING (auth.uid() = uploader_id);

-- Create triggers to auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_voltmarket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for auto-updating timestamps
CREATE TRIGGER update_voltmarket_profiles_updated_at
    BEFORE UPDATE ON public.voltmarket_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_listings_updated_at
    BEFORE UPDATE ON public.voltmarket_listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_conversations_updated_at
    BEFORE UPDATE ON public.voltmarket_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_portfolios_updated_at
    BEFORE UPDATE ON public.voltmarket_portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_portfolio_items_updated_at
    BEFORE UPDATE ON public.voltmarket_portfolio_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_documents_updated_at
    BEFORE UPDATE ON public.voltmarket_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_voltmarket_updated_at();