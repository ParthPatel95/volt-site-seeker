-- Create inventory workspaces table for standalone inventory feature
CREATE TABLE public.inventory_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Package',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.inventory_workspaces ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_workspaces
CREATE POLICY "Users can view own workspaces" ON public.inventory_workspaces
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY "Users can create workspaces" ON public.inventory_workspaces
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workspaces" ON public.inventory_workspaces
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own workspaces" ON public.inventory_workspaces
  FOR DELETE USING (user_id = auth.uid());

-- Add workspace_id column to inventory tables (nullable for migration period)
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.inventory_workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_categories ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.inventory_workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_groups ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.inventory_workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.inventory_workspaces(id) ON DELETE CASCADE;

-- Create updated_at trigger for inventory_workspaces
CREATE TRIGGER update_inventory_workspaces_updated_at
  BEFORE UPDATE ON public.inventory_workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();