
-- Create inventory_groups table for containers/boxes
CREATE TABLE public.inventory_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  
  -- Group identification
  name TEXT NOT NULL,
  description TEXT,
  group_code TEXT UNIQUE NOT NULL, -- Auto-generated unique code for QR
  
  -- Container info
  container_type TEXT DEFAULT 'box', -- box, bin, pallet, shelf, drawer
  location TEXT,
  storage_zone TEXT,
  bin_number TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table for items in groups
CREATE TABLE public.inventory_group_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.inventory_groups(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1, -- How many of this item in the group
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(group_id, item_id)
);

-- Enable RLS
ALTER TABLE public.inventory_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_group_items ENABLE ROW LEVEL SECURITY;

-- Policies for inventory_groups
CREATE POLICY "Users can view groups"
ON public.inventory_groups FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create groups"
ON public.inventory_groups FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update groups"
ON public.inventory_groups FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete groups"
ON public.inventory_groups FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Policies for inventory_group_items
CREATE POLICY "Users can view group items"
ON public.inventory_group_items FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can add items to groups"
ON public.inventory_group_items FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update group items"
ON public.inventory_group_items FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove items from groups"
ON public.inventory_group_items FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_inventory_groups_project_id ON public.inventory_groups(project_id);
CREATE INDEX idx_inventory_groups_group_code ON public.inventory_groups(group_code);
CREATE INDEX idx_inventory_group_items_group_id ON public.inventory_group_items(group_id);
CREATE INDEX idx_inventory_group_items_item_id ON public.inventory_group_items(item_id);
