-- =============================================
-- VoltBuild Phase 2: Enterprise Execution Layer
-- 11 New Tables (Additive Only)
-- =============================================

-- =============================================
-- MODULE 1: BIDS & VENDORS
-- =============================================

-- Vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  trade TEXT NOT NULL DEFAULT 'Other',
  regions TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  insurance_docs_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vendors"
  ON public.vendors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendors"
  ON public.vendors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors"
  ON public.vendors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors"
  ON public.vendors FOR DELETE
  USING (auth.uid() = user_id);

-- Bid Requests table
CREATE TABLE public.bid_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE NOT NULL,
  phase_id TEXT,
  task_id UUID,
  title TEXT NOT NULL,
  scope_of_work TEXT,
  attachments JSONB DEFAULT '[]',
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  invited_vendor_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bid_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bid requests for their projects"
  ON public.bid_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = bid_requests.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create bid requests for their projects"
  ON public.bid_requests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = bid_requests.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update bid requests for their projects"
  ON public.bid_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = bid_requests.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete bid requests for their projects"
  ON public.bid_requests FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = bid_requests.project_id AND p.user_id = auth.uid()
  ));

-- Bids table
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_request_id UUID REFERENCES public.bid_requests(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  timeline_days INTEGER,
  assumptions TEXT,
  exclusions TEXT,
  attachments JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bids for their bid requests"
  ON public.bids FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bid_requests br
    JOIN public.voltbuild_projects p ON p.id = br.project_id
    WHERE br.id = bids.bid_request_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create bids for their bid requests"
  ON public.bids FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.bid_requests br
    JOIN public.voltbuild_projects p ON p.id = br.project_id
    WHERE br.id = bids.bid_request_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update bids for their bid requests"
  ON public.bids FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.bid_requests br
    JOIN public.voltbuild_projects p ON p.id = br.project_id
    WHERE br.id = bids.bid_request_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete bids for their bid requests"
  ON public.bids FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.bid_requests br
    JOIN public.voltbuild_projects p ON p.id = br.project_id
    WHERE br.id = bids.bid_request_id AND p.user_id = auth.uid()
  ));

-- Contract Awards table
CREATE TABLE public.contract_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE NOT NULL,
  bid_request_id UUID REFERENCES public.bid_requests(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  awarded_amount NUMERIC NOT NULL,
  start_date DATE,
  end_date DATE,
  terms_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contract awards for their projects"
  ON public.contract_awards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = contract_awards.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create contract awards for their projects"
  ON public.contract_awards FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = contract_awards.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update contract awards for their projects"
  ON public.contract_awards FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = contract_awards.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete contract awards for their projects"
  ON public.contract_awards FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = contract_awards.project_id AND p.user_id = auth.uid()
  ));

-- =============================================
-- MODULE 2: PROCUREMENT
-- =============================================

-- Procurement Items table
CREATE TABLE public.procurement_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  item_name TEXT NOT NULL,
  vendor TEXT,
  qty NUMERIC DEFAULT 1,
  unit_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (qty * unit_cost) STORED,
  order_date DATE,
  promised_ship_date DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'planned',
  linked_phase_id TEXT,
  linked_task_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.procurement_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view procurement items for their projects"
  ON public.procurement_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = procurement_items.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create procurement items for their projects"
  ON public.procurement_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = procurement_items.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update procurement items for their projects"
  ON public.procurement_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = procurement_items.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete procurement items for their projects"
  ON public.procurement_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = procurement_items.project_id AND p.user_id = auth.uid()
  ));

-- Purchase Orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE NOT NULL,
  po_number TEXT NOT NULL,
  vendor TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  po_doc_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view purchase orders for their projects"
  ON public.purchase_orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = purchase_orders.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create purchase orders for their projects"
  ON public.purchase_orders FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = purchase_orders.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update purchase orders for their projects"
  ON public.purchase_orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = purchase_orders.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete purchase orders for their projects"
  ON public.purchase_orders FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = purchase_orders.project_id AND p.user_id = auth.uid()
  ));

-- =============================================
-- MODULE 3: CHANGE ORDERS
-- =============================================

CREATE TABLE public.change_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE NOT NULL,
  change_order_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  requested_by TEXT,
  phase_id TEXT,
  task_id UUID,
  cost_delta NUMERIC DEFAULT 0,
  schedule_delta_days INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  attachments JSONB DEFAULT '[]',
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  implemented_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view change orders for their projects"
  ON public.change_orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = change_orders.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create change orders for their projects"
  ON public.change_orders FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = change_orders.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update change orders for their projects"
  ON public.change_orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = change_orders.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete change orders for their projects"
  ON public.change_orders FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = change_orders.project_id AND p.user_id = auth.uid()
  ));

-- =============================================
-- MODULE 4: QUALITY & COMMISSIONING
-- =============================================

-- Commissioning Checklists table
CREATE TABLE public.commissioning_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE NOT NULL,
  phase_id TEXT,
  checklist_name TEXT NOT NULL,
  checklist_type TEXT DEFAULT 'custom',
  items JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commissioning_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view commissioning checklists for their projects"
  ON public.commissioning_checklists FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = commissioning_checklists.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create commissioning checklists for their projects"
  ON public.commissioning_checklists FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = commissioning_checklists.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update commissioning checklists for their projects"
  ON public.commissioning_checklists FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = commissioning_checklists.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete commissioning checklists for their projects"
  ON public.commissioning_checklists FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = commissioning_checklists.project_id AND p.user_id = auth.uid()
  ));

-- Commissioning Evidence table
CREATE TABLE public.commissioning_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES public.commissioning_checklists(id) ON DELETE CASCADE NOT NULL,
  item_index INTEGER NOT NULL,
  evidence_url TEXT NOT NULL,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commissioning_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view commissioning evidence for their checklists"
  ON public.commissioning_evidence FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.commissioning_checklists cc
    JOIN public.voltbuild_projects p ON p.id = cc.project_id
    WHERE cc.id = commissioning_evidence.checklist_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create commissioning evidence for their checklists"
  ON public.commissioning_evidence FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.commissioning_checklists cc
    JOIN public.voltbuild_projects p ON p.id = cc.project_id
    WHERE cc.id = commissioning_evidence.checklist_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update commissioning evidence for their checklists"
  ON public.commissioning_evidence FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.commissioning_checklists cc
    JOIN public.voltbuild_projects p ON p.id = cc.project_id
    WHERE cc.id = commissioning_evidence.checklist_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete commissioning evidence for their checklists"
  ON public.commissioning_evidence FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.commissioning_checklists cc
    JOIN public.voltbuild_projects p ON p.id = cc.project_id
    WHERE cc.id = commissioning_evidence.checklist_id AND p.user_id = auth.uid()
  ));

-- Energization Gates table
CREATE TABLE public.energization_gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE NOT NULL,
  gate_name TEXT NOT NULL,
  required_checklists UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'blocked',
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.energization_gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view energization gates for their projects"
  ON public.energization_gates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = energization_gates.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create energization gates for their projects"
  ON public.energization_gates FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = energization_gates.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update energization gates for their projects"
  ON public.energization_gates FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = energization_gates.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete energization gates for their projects"
  ON public.energization_gates FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = energization_gates.project_id AND p.user_id = auth.uid()
  ));

-- =============================================
-- MODULE 5: REPORTING
-- =============================================

CREATE TABLE public.project_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'weekly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  generated_summary TEXT,
  kpis JSONB DEFAULT '{}',
  snapshot_data JSONB DEFAULT '{}',
  exported_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project reports for their projects"
  ON public.project_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = project_reports.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create project reports for their projects"
  ON public.project_reports FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = project_reports.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update project reports for their projects"
  ON public.project_reports FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = project_reports.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete project reports for their projects"
  ON public.project_reports FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.voltbuild_projects p 
    WHERE p.id = project_reports.project_id AND p.user_id = auth.uid()
  ));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX idx_vendors_trade ON public.vendors(trade);
CREATE INDEX idx_bid_requests_project_id ON public.bid_requests(project_id);
CREATE INDEX idx_bid_requests_status ON public.bid_requests(status);
CREATE INDEX idx_bids_bid_request_id ON public.bids(bid_request_id);
CREATE INDEX idx_bids_vendor_id ON public.bids(vendor_id);
CREATE INDEX idx_contract_awards_project_id ON public.contract_awards(project_id);
CREATE INDEX idx_procurement_items_project_id ON public.procurement_items(project_id);
CREATE INDEX idx_procurement_items_status ON public.procurement_items(status);
CREATE INDEX idx_procurement_items_category ON public.procurement_items(category);
CREATE INDEX idx_purchase_orders_project_id ON public.purchase_orders(project_id);
CREATE INDEX idx_change_orders_project_id ON public.change_orders(project_id);
CREATE INDEX idx_change_orders_status ON public.change_orders(status);
CREATE INDEX idx_commissioning_checklists_project_id ON public.commissioning_checklists(project_id);
CREATE INDEX idx_commissioning_evidence_checklist_id ON public.commissioning_evidence(checklist_id);
CREATE INDEX idx_energization_gates_project_id ON public.energization_gates(project_id);
CREATE INDEX idx_project_reports_project_id ON public.project_reports(project_id);