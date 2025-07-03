
-- Real-time messaging and notifications tables
CREATE TABLE public.voltmarket_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES voltmarket_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews and ratings system
CREATE TABLE public.voltmarket_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES voltmarket_listings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  transaction_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Identity verification system
CREATE TABLE public.voltmarket_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('id_document', 'business_license', 'utility_bill', 'bank_statement')),
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES voltmarket_profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment transactions
CREATE TABLE public.voltmarket_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES voltmarket_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  transaction_fee DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Market analytics
CREATE TABLE public.voltmarket_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User activity tracking
CREATE TABLE public.voltmarket_user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved searches
CREATE TABLE public.voltmarket_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
  search_name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email templates
CREATE TABLE public.voltmarket_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.voltmarket_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON public.voltmarket_conversations
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM voltmarket_profiles WHERE id IN (buyer_id, seller_id)
  )
);

CREATE POLICY "Users can create conversations" ON public.voltmarket_conversations
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM voltmarket_profiles WHERE id IN (buyer_id, seller_id)
  )
);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.voltmarket_reviews
FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.voltmarket_reviews
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM voltmarket_profiles WHERE id = reviewer_id
  )
);

-- RLS Policies for verifications
CREATE POLICY "Users can view own verifications" ON public.voltmarket_verifications
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_verifications.user_id
  )
);

CREATE POLICY "Users can create own verifications" ON public.voltmarket_verifications
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_verifications.user_id
  )
);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.voltmarket_transactions
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM voltmarket_profiles WHERE id IN (buyer_id, seller_id)
  )
);

-- RLS Policies for analytics (admin only for now)
CREATE POLICY "Authenticated users can view analytics" ON public.voltmarket_analytics
FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for user activity
CREATE POLICY "Users can view own activity" ON public.voltmarket_user_activity
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_user_activity.user_id
  )
);

CREATE POLICY "Users can create activity logs" ON public.voltmarket_user_activity
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_user_activity.user_id
  )
);

-- RLS Policies for saved searches
CREATE POLICY "Users can manage own saved searches" ON public.voltmarket_saved_searches
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM voltmarket_profiles WHERE id = voltmarket_saved_searches.user_id
  )
);

-- RLS Policies for email templates (admin only)
CREATE POLICY "Authenticated users can view email templates" ON public.voltmarket_email_templates
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Enable realtime for conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE voltmarket_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE voltmarket_messages;

-- Add indexes for performance
CREATE INDEX idx_voltmarket_conversations_participants ON voltmarket_conversations(buyer_id, seller_id);
CREATE INDEX idx_voltmarket_reviews_listing ON voltmarket_reviews(listing_id);
CREATE INDEX idx_voltmarket_reviews_user ON voltmarket_reviews(reviewed_user_id);
CREATE INDEX idx_voltmarket_verifications_user ON voltmarket_verifications(user_id);
CREATE INDEX idx_voltmarket_transactions_listing ON voltmarket_transactions(listing_id);
CREATE INDEX idx_voltmarket_user_activity_user ON voltmarket_user_activity(user_id);
CREATE INDEX idx_voltmarket_saved_searches_user ON voltmarket_saved_searches(user_id);

-- Insert default email templates
INSERT INTO public.voltmarket_email_templates (template_type, subject, html_content, variables) VALUES
('new_message', 'New Message on VoltMarket', '<h1>You have a new message</h1><p>{{sender_name}} sent you a message about listing "{{listing_title}}"</p><p>{{message_preview}}</p>', '["sender_name", "listing_title", "message_preview"]'),
('listing_interest', 'Someone is interested in your listing', '<h1>New Interest in Your Listing</h1><p>{{buyer_name}} has shown interest in your listing "{{listing_title}}"</p>', '["buyer_name", "listing_title"]'),
('verification_approved', 'Verification Approved', '<h1>Verification Approved</h1><p>Your {{verification_type}} verification has been approved. You now have enhanced trust on the platform.</p>', '["verification_type"]'),
('verification_rejected', 'Verification Rejected', '<h1>Verification Rejected</h1><p>Your {{verification_type}} verification was rejected. Reason: {{reason}}</p>', '["verification_type", "reason"]');
