-- =============================================
-- VoltBuild Enhancement: Core Tables (Clean)
-- =============================================

-- 1. Task Dependencies for Critical Path Method
CREATE TABLE IF NOT EXISTS public.voltbuild_task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  predecessor_task_id UUID NOT NULL REFERENCES public.voltbuild_tasks(id) ON DELETE CASCADE,
  successor_task_id UUID NOT NULL REFERENCES public.voltbuild_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'FS',
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(predecessor_task_id, successor_task_id)
);

-- 2. RFIs (Request for Information)
CREATE TABLE IF NOT EXISTS public.voltbuild_rfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.voltbuild_phases(id) ON DELETE SET NULL,
  rfi_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  submitted_by TEXT,
  submitted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  assigned_to TEXT,
  response TEXT,
  response_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  discipline TEXT,
  cost_impact NUMERIC,
  schedule_impact_days INTEGER,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, rfi_number)
);

-- 3. Labor Entries
CREATE TABLE IF NOT EXISTS public.voltbuild_labor_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.voltbuild_phases(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  trade_type TEXT NOT NULL,
  headcount INTEGER NOT NULL DEFAULT 0,
  hours_worked NUMERIC,
  contractor TEXT,
  shift TEXT DEFAULT 'day',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Equipment Usage
CREATE TABLE IF NOT EXISTS public.voltbuild_equipment_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  equipment_type TEXT NOT NULL,
  equipment_id TEXT,
  hours_used NUMERIC,
  status TEXT DEFAULT 'active',
  operator TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Punch List Items
CREATE TABLE IF NOT EXISTS public.voltbuild_punch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.voltbuild_phases(id) ON DELETE SET NULL,
  item_number TEXT,
  description TEXT NOT NULL,
  location TEXT,
  responsible_party TEXT,
  priority TEXT NOT NULL DEFAULT 'B',
  status TEXT NOT NULL DEFAULT 'open',
  identified_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_date DATE,
  verified_by TEXT,
  verified_date DATE,
  photos JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Commissioning Checklists
CREATE TABLE IF NOT EXISTS public.voltbuild_commissioning_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.voltbuild_phases(id) ON DELETE SET NULL,
  system_type TEXT NOT NULL,
  equipment_tag TEXT,
  equipment_name TEXT,
  checklist_template TEXT,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  started_date DATE,
  completed_date DATE,
  completed_by TEXT,
  witness TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Subcontractors
CREATE TABLE IF NOT EXISTS public.voltbuild_subcontractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  trade TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contract_value NUMERIC,
  contract_date DATE,
  contract_end_date DATE,
  insurance_expiry DATE,
  wcb_expiry DATE,
  safety_rating NUMERIC,
  performance_rating NUMERIC,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.voltbuild_task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_labor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_equipment_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_punch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_commissioning_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_subcontractors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "VoltBuild users can manage task dependencies"
  ON public.voltbuild_task_dependencies FOR ALL
  USING (public.is_voltbuild_approved(auth.uid()));

CREATE POLICY "VoltBuild users can manage RFIs"
  ON public.voltbuild_rfis FOR ALL
  USING (public.is_voltbuild_approved(auth.uid()));

CREATE POLICY "VoltBuild users can manage labor entries"
  ON public.voltbuild_labor_entries FOR ALL
  USING (public.is_voltbuild_approved(auth.uid()));

CREATE POLICY "VoltBuild users can manage equipment usage"
  ON public.voltbuild_equipment_usage FOR ALL
  USING (public.is_voltbuild_approved(auth.uid()));

CREATE POLICY "VoltBuild users can manage punch items"
  ON public.voltbuild_punch_items FOR ALL
  USING (public.is_voltbuild_approved(auth.uid()));

CREATE POLICY "VoltBuild users can manage commissioning checklists"
  ON public.voltbuild_commissioning_checklists FOR ALL
  USING (public.is_voltbuild_approved(auth.uid()));

CREATE POLICY "VoltBuild users can manage subcontractors"
  ON public.voltbuild_subcontractors FOR ALL
  USING (public.is_voltbuild_approved(auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vb_deps_project ON public.voltbuild_task_dependencies(project_id);
CREATE INDEX IF NOT EXISTS idx_vb_deps_pred ON public.voltbuild_task_dependencies(predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_vb_deps_succ ON public.voltbuild_task_dependencies(successor_task_id);
CREATE INDEX IF NOT EXISTS idx_vb_rfis_proj ON public.voltbuild_rfis(project_id);
CREATE INDEX IF NOT EXISTS idx_vb_rfis_stat ON public.voltbuild_rfis(status);
CREATE INDEX IF NOT EXISTS idx_vb_labor_proj_date ON public.voltbuild_labor_entries(project_id, date);
CREATE INDEX IF NOT EXISTS idx_vb_equip_proj_date ON public.voltbuild_equipment_usage(project_id, date);
CREATE INDEX IF NOT EXISTS idx_vb_punch_proj ON public.voltbuild_punch_items(project_id);
CREATE INDEX IF NOT EXISTS idx_vb_punch_stat ON public.voltbuild_punch_items(status);
CREATE INDEX IF NOT EXISTS idx_vb_comm_proj ON public.voltbuild_commissioning_checklists(project_id);
CREATE INDEX IF NOT EXISTS idx_vb_subs_proj ON public.voltbuild_subcontractors(project_id);

-- Triggers for updated_at
CREATE TRIGGER update_rfis_updated_at
  BEFORE UPDATE ON public.voltbuild_rfis
  FOR EACH ROW EXECUTE FUNCTION public.update_voltbuild_updated_at();

CREATE TRIGGER update_punch_items_updated_at
  BEFORE UPDATE ON public.voltbuild_punch_items
  FOR EACH ROW EXECUTE FUNCTION public.update_voltbuild_updated_at();

CREATE TRIGGER update_commissioning_updated_at
  BEFORE UPDATE ON public.voltbuild_commissioning_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_voltbuild_updated_at();

CREATE TRIGGER update_subcontractors_updated_at
  BEFORE UPDATE ON public.voltbuild_subcontractors
  FOR EACH ROW EXECUTE FUNCTION public.update_voltbuild_updated_at();