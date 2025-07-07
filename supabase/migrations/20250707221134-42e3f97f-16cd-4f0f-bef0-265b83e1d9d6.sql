-- Add missing tables for VoltMarket comprehensive features
-- Only create tables that don't already exist

-- Document permissions for granular access control
CREATE TABLE IF NOT EXISTS public.voltmarket_document_permissions (
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

-- Verification documents
CREATE TABLE IF NOT EXISTS public.voltmarket_verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID NOT NULL REFERENCES voltmarket_verifications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- LOI supporting documents
CREATE TABLE IF NOT EXISTS public.voltmarket_loi_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loi_id UUID NOT NULL REFERENCES voltmarket_lois(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_loi_docs_uploader FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Portfolio Management System
CREATE TABLE IF NOT EXISTS public.voltmarket_portfolios (
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
CREATE TABLE IF NOT EXISTS public.voltmarket_portfolio_items (
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

-- Advanced Search Filters (saved searches enhancement)
CREATE TABLE IF NOT EXISTS public.voltmarket_search_filters (
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

-- Analytics and Market Intelligence
CREATE TABLE IF NOT EXISTS public.voltmarket_market_analytics (
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
CREATE TABLE IF NOT EXISTS public.voltmarket_user_analytics (
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

-- Due Diligence Enhancement (extending existing)
CREATE TABLE IF NOT EXISTS public.voltmarket_due_diligence_tasks (
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

-- Enable RLS on new tables
ALTER TABLE public.voltmarket_document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_loi_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_search_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_market_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltmarket_due_diligence_tasks ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for Verification Documents
CREATE POLICY "Users can view their own verification documents" ON public.voltmarket_verification_documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM voltmarket_verifications WHERE id = verification_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can upload their own verification documents" ON public.voltmarket_verification_documents
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM voltmarket_verifications WHERE id = verification_id AND user_id = auth.uid())
    );

-- RLS Policies for LOI Documents
CREATE POLICY "LOI parties can view documents" ON public.voltmarket_loi_documents
    FOR SELECT USING (
        uploaded_by = auth.uid() OR
        EXISTS (SELECT 1 FROM voltmarket_lois WHERE id = loi_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
    );

CREATE POLICY "LOI parties can upload documents" ON public.voltmarket_loi_documents
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (SELECT 1 FROM voltmarket_lois WHERE id = loi_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
    );

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
CREATE INDEX IF NOT EXISTS idx_voltmarket_document_permissions_document_id ON voltmarket_document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_voltmarket_document_permissions_user_id ON voltmarket_document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_voltmarket_loi_documents_loi_id ON voltmarket_loi_documents(loi_id);
CREATE INDEX IF NOT EXISTS idx_voltmarket_portfolios_user_id ON voltmarket_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_voltmarket_portfolio_items_portfolio_id ON voltmarket_portfolio_items(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_voltmarket_search_filters_user_id ON voltmarket_search_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_voltmarket_user_analytics_user_id ON voltmarket_user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_voltmarket_user_analytics_event_type ON voltmarket_user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_voltmarket_due_diligence_tasks_listing_id ON voltmarket_due_diligence_tasks(listing_id);
CREATE INDEX IF NOT EXISTS idx_voltmarket_due_diligence_tasks_assigned_to ON voltmarket_due_diligence_tasks(assigned_to);

-- Create update function if not exists
CREATE OR REPLACE FUNCTION update_voltmarket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_voltmarket_portfolios_updated_at ON voltmarket_portfolios;
CREATE TRIGGER update_voltmarket_portfolios_updated_at
    BEFORE UPDATE ON voltmarket_portfolios
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

DROP TRIGGER IF EXISTS update_voltmarket_portfolio_items_updated_at ON voltmarket_portfolio_items;
CREATE TRIGGER update_voltmarket_portfolio_items_updated_at
    BEFORE UPDATE ON voltmarket_portfolio_items
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

DROP TRIGGER IF EXISTS update_voltmarket_search_filters_updated_at ON voltmarket_search_filters;
CREATE TRIGGER update_voltmarket_search_filters_updated_at
    BEFORE UPDATE ON voltmarket_search_filters
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();

DROP TRIGGER IF EXISTS update_voltmarket_due_diligence_tasks_updated_at ON voltmarket_due_diligence_tasks;
CREATE TRIGGER update_voltmarket_due_diligence_tasks_updated_at
    BEFORE UPDATE ON voltmarket_due_diligence_tasks
    FOR EACH ROW EXECUTE FUNCTION update_voltmarket_updated_at();