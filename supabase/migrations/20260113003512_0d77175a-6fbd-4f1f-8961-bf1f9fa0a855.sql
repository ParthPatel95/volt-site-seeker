-- ===========================================
-- VoltBuild Inventory Management Tables
-- ===========================================

-- Inventory Categories
CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Package',
  color TEXT DEFAULT 'blue',
  parent_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory Items
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  
  -- Item identification
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  barcode TEXT,
  qr_code TEXT,
  
  -- Categorization
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  tags TEXT[],
  
  -- Quantity tracking
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'units',
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER,
  
  -- Location
  location TEXT,
  storage_zone TEXT,
  bin_number TEXT,
  
  -- Financial
  unit_cost DECIMAL(12,2) DEFAULT 0,
  
  -- Supplier info
  supplier_name TEXT,
  supplier_contact TEXT,
  purchase_order_ref TEXT,
  
  -- Dates
  received_date DATE,
  expiry_date DATE,
  last_counted_date TIMESTAMPTZ,
  
  -- Images
  primary_image_url TEXT,
  additional_images TEXT[],
  
  -- Metadata
  condition TEXT DEFAULT 'new',
  status TEXT DEFAULT 'in_stock',
  notes TEXT,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory Transactions (audit trail)
CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'transfer', 'count')),
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  
  -- Context
  reason TEXT,
  reference_number TEXT,
  related_task_id UUID REFERENCES public.voltbuild_tasks(id) ON DELETE SET NULL,
  destination_location TEXT,
  
  -- Audit
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_inventory_items_project ON public.inventory_items(project_id);
CREATE INDEX idx_inventory_items_barcode ON public.inventory_items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_inventory_items_sku ON public.inventory_items(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category_id);
CREATE INDEX idx_inventory_items_status ON public.inventory_items(status);
CREATE INDEX idx_inventory_transactions_item ON public.inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_project ON public.inventory_transactions(project_id);
CREATE INDEX idx_inventory_categories_project ON public.inventory_categories(project_id);

-- Enable RLS
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_categories
CREATE POLICY "Users can view inventory categories for their projects"
  ON public.inventory_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_categories.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

CREATE POLICY "Users can create inventory categories for their projects"
  ON public.inventory_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_categories.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

CREATE POLICY "Users can update inventory categories for their projects"
  ON public.inventory_categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_categories.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

CREATE POLICY "Users can delete inventory categories for their projects"
  ON public.inventory_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_categories.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

-- RLS Policies for inventory_items
CREATE POLICY "Users can view inventory items for their projects"
  ON public.inventory_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_items.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

CREATE POLICY "Users can create inventory items for their projects"
  ON public.inventory_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_items.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

CREATE POLICY "Users can update inventory items for their projects"
  ON public.inventory_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_items.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

CREATE POLICY "Users can delete inventory items for their projects"
  ON public.inventory_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_items.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

-- RLS Policies for inventory_transactions
CREATE POLICY "Users can view inventory transactions for their projects"
  ON public.inventory_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_transactions.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

CREATE POLICY "Users can create inventory transactions for their projects"
  ON public.inventory_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.voltbuild_projects p
      WHERE p.id = inventory_transactions.project_id
      AND p.user_id = auth.uid()
    )
    OR public.is_voltbuild_approved(auth.uid())
  );

-- Transactions should not be updated or deleted (audit trail)

-- Create triggers for updated_at
CREATE TRIGGER update_inventory_categories_updated_at
  BEFORE UPDATE ON public.inventory_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_voltbuild_updated_at();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_voltbuild_updated_at();

-- Create storage bucket for inventory images
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory-images', 'inventory-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for inventory-images bucket
CREATE POLICY "Anyone can view inventory images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inventory-images');

CREATE POLICY "Authenticated users can upload inventory images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'inventory-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own inventory images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'inventory-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own inventory images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'inventory-images' AND auth.uid()::text = (storage.foldername(name))[1]);