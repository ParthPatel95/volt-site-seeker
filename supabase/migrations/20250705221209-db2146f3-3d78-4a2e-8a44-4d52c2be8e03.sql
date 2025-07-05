-- Create missing VoltMarket tables for hooks and functionality

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.voltmarket_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewed_user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  transaction_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved searches table
CREATE TABLE IF NOT EXISTS public.voltmarket_saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_name TEXT NOT NULL,
  search_criteria JSONB NOT NULL DEFAULT '{}',
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activity table for analytics
CREATE TABLE IF NOT EXISTS public.voltmarket_user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.voltmarket_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

-- Enable RLS on all tables
ALTER TABLE public.voltmarket_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_saved_searches ENABLE ROLS LEVEL SECURITY;
ALTER TABLE public.voltmarket_user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.voltmarket_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.voltmarket_reviews FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = reviewer_id));
CREATE POLICY "Users can update own reviews" ON public.voltmarket_reviews FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = reviewer_id));

-- RLS Policies for saved searches
CREATE POLICY "Users can manage own saved searches" ON public.voltmarket_saved_searches FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_saved_searches.user_id));

-- RLS Policies for user activity
CREATE POLICY "Users can view own activity" ON public.voltmarket_user_activity FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_user_activity.user_id));
CREATE POLICY "Users can insert own activity" ON public.voltmarket_user_activity FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_user_activity.user_id));

-- RLS Policies for conversations  
CREATE POLICY "Users can view own conversations" ON public.voltmarket_conversations FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = buyer_id OR id = seller_id));
CREATE POLICY "Users can create conversations" ON public.voltmarket_conversations FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = buyer_id OR id = seller_id));
CREATE POLICY "Users can update own conversations" ON public.voltmarket_conversations FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM voltmarket_profiles WHERE id = buyer_id OR id = seller_id));

-- Add update triggers
CREATE TRIGGER update_voltmarket_reviews_updated_at
  BEFORE UPDATE ON public.voltmarket_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voltmarket_saved_searches_updated_at
  BEFORE UPDATE ON public.voltmarket_saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();