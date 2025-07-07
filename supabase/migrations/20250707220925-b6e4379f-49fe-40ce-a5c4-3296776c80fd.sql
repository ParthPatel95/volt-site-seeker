-- VoltMarket Comprehensive Features Database Schema
-- This migration adds all remaining tables for the complete VoltMarket system

-- 1. Document Management System
CREATE TABLE public.voltmarket_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('financial', 'legal', 'technical', 'marketing', 'due_diligence', 'other')),
    is_confidential BOOLEAN DEFAULT false,
    access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'registered', 'verified', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_documents_uploader FOREIGN KEY (uploader_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Document permissions for granular access control
CREATE TABLE public.voltmarket_document_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES voltmarket_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    permission_type TEXT NOT NULL CHECK (permission_type IN ('view', 'download', 'edit', 'admin')),
    granted_by UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(document_id, user_id, permission_type),
    CONSTRAINT fk_doc_permissions_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_permissions_grantor FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. User Verification System
CREATE TABLE public.voltmarket_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'company', 'financial', 'accredited_investor')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'expired')),
    submission_data JSONB NOT NULL DEFAULT '{}',
    verification_documents TEXT[] DEFAULT '{}',
    reviewer_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_verifications_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_verifications_reviewer FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Verification documents
CREATE TABLE public.voltmarket_verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID NOT NULL REFERENCES voltmarket_verifications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Notifications System
CREATE TABLE public.voltmarket_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('new_listing', 'price_change', 'message', 'loi_received', 'loi_response', 'document_shared', 'verification_update', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. LOI (Letter of Intent) System
CREATE TABLE public.voltmarket_lois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES voltmarket_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    offer_amount DECIMAL(15,2) NOT NULL,
    earnest_money DECIMAL(15,2),
    closing_timeline_days INTEGER,
    contingencies TEXT[],
    terms_and_conditions TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'counter_offered', 'withdrawn', 'expired')),
    response_message TEXT,
    counter_offer_amount DECIMAL(15,2),
    expires_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_lois_buyer FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_lois_seller FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- LOI supporting documents
CREATE TABLE public.voltmarket_loi_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loi_id UUID NOT NULL REFERENCES voltmarket_lois(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_loi_docs_uploader FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. Review and Rating System
CREATE TABLE public.voltmarket_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL,
    reviewed_user_id UUID NOT NULL,
    listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE SET NULL,
    transaction_type TEXT CHECK (transaction_type IN ('purchase', 'sale', 'lease', 'partnership')),
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    review_text TEXT,
    is_verified_transaction BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    response_text TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewed FOREIGN KEY (reviewed_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT no_self_review CHECK (reviewer_id != reviewed_user_id),
    UNIQUE(reviewer_id, reviewed_user_id, listing_id)
);

-- 6. Portfolio Management System
CREATE TABLE public.voltmarket_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    portfolio_type TEXT DEFAULT 'investment' CHECK (portfolio_type IN ('investment', 'development', 'trading', 'research')),
    total_value DECIMAL(15,2) DEFAULT 0,
    target_allocation JSONB DEFAULT '{}',
    risk_tolerance TEXT DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive', 'speculative')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_portfolios_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Portfolio items/holdings
CREATE TABLE public.voltmarket_portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES voltmarket_portfolios(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE SET NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'investment', 'opportunity', 'research')),
    name TEXT NOT NULL,
    acquisition_price DECIMAL(15,2),
    current_value DECIMAL(15,2),
    acquisition_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'under_contract', 'monitoring')),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Advanced Search Filters (saved searches enhancement)
CREATE TABLE public.voltmarket_search_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    base_criteria JSONB NOT NULL DEFAULT '{}',
    advanced_filters JSONB NOT NULL DEFAULT '{}',
    geographic_filters JSONB DEFAULT '{}',
    financial_filters JSONB DEFAULT '{}',
    infrastructure_filters JSONB DEFAULT '{}',
    is_alert_enabled BOOLEAN DEFAULT false,
    alert_frequency TEXT DEFAULT 'daily' CHECK (alert_frequency IN ('instant', 'daily', 'weekly', 'monthly')),
    last_run_at TIMESTAMP WITH TIME ZONE,
    results_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_search_filters_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 8. Analytics and Market Intelligence
CREATE TABLE public.voltmarket_market_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL,
    property_type TEXT NOT NULL,
    analysis_period TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}', -- avg_price, median_price, listings_count, days_on_market, etc.
    trends JSONB DEFAULT '{}',
    forecasts JSONB DEFAULT '{}',
    data_sources TEXT[] DEFAULT '{}',
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- User analytics tracking
CREATE TABLE public.voltmarket_user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    listing_id UUID REFERENCES voltmarket_listings(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_user_analytics_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 9. Due Diligence Enhancement (extending existing)
CREATE TABLE public.voltmarket_due_diligence_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES voltmarket_listings(id) ON DELETE CASCADE,
    assigned_to UUID,
    task_type TEXT NOT NULL CHECK (task_type IN ('financial_review', 'legal_review', 'technical_inspection', 'environmental_check', 'title_search', 'survey', 'appraisal', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
    due_date DATE,
    completion_notes TEXT,
    attachments TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL,
    completed_by UUID,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_dd_tasks_assigned FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_dd_tasks_creator FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dd_tasks_completer FOREIGN KEY (completed_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on all new tables
ALTER TABLE public.voltmarket_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_lois ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_loi_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_search_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_market_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_due_diligence_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Documents
CREATE POLICY "Users can view documents they have access to" ON public.voltmarket_documents
    FOR SELECT USING (
        uploader_id = auth.uid() OR
        access_level = 'public' OR
        (access_level = 'registered' AND auth.uid() IS NOT NULL) OR
        EXISTS (
            SELECT 1 FROM voltmarket_document_permissions 
            WHERE document_id = voltmarket_documents.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload documents" ON public.voltmarket_documents
    FOR INSERT WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Document owners can update their documents" ON public.voltmarket_documents
    FOR UPDATE USING (uploader_id = auth.uid());

CREATE POLICY "Document owners can delete their documents" ON public.voltmarket_documents
    FOR DELETE USING (uploader_id = auth.uid());

-- RLS Policies for Document Permissions
CREATE POLICY "Users can view permissions for their documents" ON public.voltmarket_document_permissions
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM voltmarket_documents WHERE id = document_id AND uploader_id = auth.uid())
    );

CREATE POLICY "Document owners can manage permissions" ON public.voltmarket_document_permissions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM voltmarket_documents WHERE id = document_id AND uploader_id = auth.uid())
    );

-- RLS Policies for Verifications
CREATE POLICY "Users can view their own verifications" ON public.voltmarket_verifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own verifications" ON public.voltmarket_verifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own verifications" ON public.voltmarket_verifications
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications" ON public.voltmarket_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.voltmarket_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for LOIs
CREATE POLICY "Users can view LOIs they're involved in" ON public.voltmarket_lois
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Buyers can create LOIs" ON public.voltmarket_lois
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Involved parties can update LOIs" ON public.voltmarket_lois
    FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- RLS Policies for Reviews
CREATE POLICY "Users can view public reviews" ON public.voltmarket_reviews
    FOR SELECT USING (is_public = true OR reviewer_id = auth.uid() OR reviewed_user_id = auth.uid());

CREATE POLICY "Users can create reviews" ON public.voltmarket_reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Reviewers can update their own reviews" ON public.voltmarket_reviews
    FOR UPDATE USING (reviewer_id = auth.uid());

-- RLS Policies for Portfolios
CREATE POLICY "Users can manage their own portfolios" ON public.voltmarket_portfolios
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own portfolio items" ON public.voltmarket_portfolio_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM voltmarket_portfolios WHERE id = portfolio_id AND user_id = auth.uid())
    );

-- RLS Policies for Search Filters
CREATE POLICY "Users can manage their own search filters" ON public.voltmarket_search_filters
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for Market Analytics
CREATE POLICY "Market analytics are publicly readable" ON public.voltmarket_market_analytics
    FOR SELECT USING (true);

-- RLS Policies for User Analytics
CREATE POLICY "Users can view their own analytics" ON public.voltmarket_user_analytics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert user analytics" ON public.voltmarket_user_analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for Due Diligence Tasks
CREATE POLICY "Users can view DD tasks for their listings or assigned tasks" ON public.voltmarket_due_diligence_tasks
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM voltmarket_listings WHERE id = listing_id AND created_by = auth.uid())
    );

CREATE POLICY "Users can create DD tasks for their listings" ON public.voltmarket_due_diligence_tasks
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (SELECT 1 FROM voltmarket_listings WHERE id = listing_id AND created_by = auth.uid())
    );

CREATE POLICY "Task assignees and creators can update DD tasks" ON public.voltmarket_due_diligence_tasks
    FOR UPDATE USING (assigned_to = auth.uid() OR created_by = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_voltmarket_documents_listing_id ON voltmarket_documents(listing_id);
CREATE INDEX idx_voltmarket_documents_uploader_id ON voltmarket_documents(uploader_id);
CREATE INDEX idx_voltmarket_notifications_user_id ON voltmarket_notifications(user_id);
CREATE INDEX idx_voltmarket_notifications_is_read ON voltmarket_notifications(is_read);
CREATE INDEX idx_voltmarket_lois_listing_id ON voltmarket_lois(listing_id);
CREATE INDEX idx_voltmarket_lois_buyer_seller ON voltmarket_lois(buyer_id, seller_id);
CREATE INDEX idx_voltmarket_reviews_reviewer_id ON voltmarket_reviews(reviewer_id);
CREATE INDEX idx_voltmarket_reviews_reviewed_user_id ON voltmarket_reviews(reviewed_user_id);
CREATE INDEX idx_voltmarket_portfolios_user_id ON voltmarket_portfolios(user_id);
CREATE INDEX idx_voltmarket_user_analytics_user_id ON voltmarket_user_analytics(user_id);
CREATE INDEX idx_voltmarket_user_analytics_event_type ON voltmarket_user_analytics(event_type);

-- Create functions for triggers
CREATE OR REPLACE FUNCTION update_voltmarket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_voltmarket_documents_updated_at
    BEFORE UPDATE ON voltmarket_documents
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_verifications_updated_at
    BEFORE UPDATE ON voltmarket_verifications
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_lois_updated_at
    BEFORE UPDATE ON voltmarket_lois
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_reviews_updated_at
    BEFORE UPDATE ON voltmarket_reviews
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_portfolios_updated_at
    BEFORE UPDATE ON voltmarket_portfolios
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_portfolio_items_updated_at
    BEFORE UPDATE ON voltmarket_portfolio_items
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_search_filters_updated_at
    BEFORE UPDATE ON voltmarket_search_filters
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

CREATE TRIGGER update_voltmarket_due_diligence_tasks_updated_at
    BEFORE UPDATE ON voltmarket_due_diligence_tasks
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

-- Enable realtime for key tables
ALTER TABLE public.voltmarket_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.voltmarket_lois REPLICA IDENTITY FULL;
ALTER TABLE public.voltmarket_reviews REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.voltmarket_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voltmarket_lois;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voltmarket_reviews;