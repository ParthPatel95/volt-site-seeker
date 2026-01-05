-- =====================================================
-- VOLTBUILD ADVANCED: CAPEX, LEAD-TIME & AI ADVISOR
-- =====================================================

-- =====================================================
-- MODULE 1: VOLTCAPEX TABLES
-- =====================================================

-- CAPEX Catalog Items (master list of cost items)
CREATE TABLE public.capex_catalog_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('Civil', 'Electrical', 'Mechanical', 'IT', 'Other')),
  item_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  default_unit_cost NUMERIC NOT NULL DEFAULT 0,
  source_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CAPEX Phase Lines (cost line items per phase)
CREATE TABLE public.capex_phase_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL,
  task_id UUID,
  catalog_item_id UUID REFERENCES public.capex_catalog_items(id),
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'ea',
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CAPEX Project Summary (project-level cost rollup settings)
CREATE TABLE public.capex_project_summary (
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE PRIMARY KEY,
  currency TEXT NOT NULL DEFAULT 'USD',
  contingency_pct NUMERIC NOT NULL DEFAULT 10,
  tax_pct NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- MODULE 2: VOLTLEADTIME TABLES
-- =====================================================

-- Lead Time Baselines (reference timelines by jurisdiction/utility)
CREATE TABLE public.leadtime_baselines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction TEXT NOT NULL,
  utility TEXT,
  milestone TEXT NOT NULL,
  baseline_min_days INTEGER NOT NULL,
  baseline_max_days INTEGER NOT NULL,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead Time Project Inputs (user inputs for a specific project)
CREATE TABLE public.leadtime_project_inputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE UNIQUE,
  jurisdiction TEXT,
  utility TEXT,
  requested_mw NUMERIC,
  voltage_level TEXT,
  interconnection_type TEXT CHECK (interconnection_type IN ('BTM', 'Distribution', 'Transmission')),
  transformer_required BOOLEAN DEFAULT false,
  substation_upgrade_required BOOLEAN DEFAULT false,
  permitting_complexity TEXT CHECK (permitting_complexity IN ('Low', 'Medium', 'High')),
  site_type TEXT CHECK (site_type IN ('Greenfield', 'Brownfield', 'Operational')),
  target_rfs_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead Time Project Forecasts (calculated forecasts per milestone)
CREATE TABLE public.leadtime_project_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  milestone TEXT NOT NULL,
  predicted_min_days INTEGER NOT NULL,
  predicted_max_days INTEGER NOT NULL,
  confidence_pct INTEGER NOT NULL DEFAULT 60,
  key_risk_factors TEXT[] DEFAULT '{}',
  mitigation_actions TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, milestone)
);

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.capex_catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capex_phase_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capex_project_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadtime_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadtime_project_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadtime_project_forecasts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- CAPEX Catalog Items: All authenticated users can read, only admin can write
CREATE POLICY "Authenticated users can view catalog items"
  ON public.capex_catalog_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert catalog items"
  ON public.capex_catalog_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- CAPEX Phase Lines: Users can manage their own project lines
CREATE POLICY "Users can view their project CAPEX lines"
  ON public.capex_phase_lines FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert CAPEX lines for their projects"
  ON public.capex_phase_lines FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project CAPEX lines"
  ON public.capex_phase_lines FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project CAPEX lines"
  ON public.capex_phase_lines FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

-- CAPEX Project Summary: Users can manage their own project summaries
CREATE POLICY "Users can view their project CAPEX summary"
  ON public.capex_project_summary FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert CAPEX summary for their projects"
  ON public.capex_project_summary FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project CAPEX summary"
  ON public.capex_project_summary FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

-- Lead Time Baselines: All authenticated users can read
CREATE POLICY "Authenticated users can view lead time baselines"
  ON public.leadtime_baselines FOR SELECT
  TO authenticated
  USING (true);

-- Lead Time Project Inputs: Users can manage their own project inputs
CREATE POLICY "Users can view their project lead time inputs"
  ON public.leadtime_project_inputs FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lead time inputs for their projects"
  ON public.leadtime_project_inputs FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project lead time inputs"
  ON public.leadtime_project_inputs FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

-- Lead Time Project Forecasts: Users can manage their own project forecasts
CREATE POLICY "Users can view their project lead time forecasts"
  ON public.leadtime_project_forecasts FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lead time forecasts for their projects"
  ON public.leadtime_project_forecasts FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project lead time forecasts"
  ON public.leadtime_project_forecasts FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project lead time forecasts"
  ON public.leadtime_project_forecasts FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.voltbuild_projects 
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- SEED DATA: CAPEX CATALOG ITEMS
-- =====================================================

INSERT INTO public.capex_catalog_items (category, item_name, unit, default_unit_cost, source_note) VALUES
-- Civil
('Civil', 'Site Grading & Preparation', 'acre', 25000, 'Industry average'),
('Civil', 'Concrete Foundation', 'cu yd', 450, 'Industry average'),
('Civil', 'Perimeter Fencing (Chain Link)', 'lin ft', 45, 'Industry average'),
('Civil', 'Security Fencing (Anti-Climb)', 'lin ft', 85, 'Industry average'),
('Civil', 'Access Road Construction', 'lin ft', 125, 'Industry average'),
('Civil', 'Stormwater Management', 'acre', 35000, 'Industry average'),
('Civil', 'Landscaping & Screening', 'sq ft', 8, 'Industry average'),
('Civil', 'Parking Area', 'sq ft', 12, 'Industry average'),

-- Electrical
('Electrical', 'Main Power Transformer (10MVA)', 'ea', 450000, 'Vendor quote'),
('Electrical', 'Main Power Transformer (20MVA)', 'ea', 750000, 'Vendor quote'),
('Electrical', 'Medium Voltage Switchgear', 'ea', 85000, 'Vendor quote'),
('Electrical', 'Low Voltage Switchgear', 'ea', 35000, 'Vendor quote'),
('Electrical', 'UPS System (500kVA)', 'ea', 175000, 'Vendor quote'),
('Electrical', 'Backup Generator (2MW)', 'ea', 450000, 'Vendor quote'),
('Electrical', 'Power Distribution Unit (PDU)', 'ea', 8500, 'Vendor quote'),
('Electrical', 'Medium Voltage Cable', 'lin ft', 45, 'Industry average'),
('Electrical', 'Low Voltage Cable Tray', 'lin ft', 35, 'Industry average'),
('Electrical', 'Grounding System', 'sq ft', 15, 'Industry average'),
('Electrical', 'Lightning Protection', 'ea', 45000, 'Industry average'),

-- Mechanical
('Mechanical', 'Chiller (500 ton)', 'ea', 350000, 'Vendor quote'),
('Mechanical', 'Cooling Tower (500 ton)', 'ea', 125000, 'Vendor quote'),
('Mechanical', 'CRAH Unit', 'ea', 45000, 'Vendor quote'),
('Mechanical', 'Chilled Water Piping', 'lin ft', 85, 'Industry average'),
('Mechanical', 'Water Treatment System', 'ea', 75000, 'Industry average'),
('Mechanical', 'Fire Suppression System', 'sq ft', 18, 'Industry average'),
('Mechanical', 'HVAC Ductwork', 'lin ft', 55, 'Industry average'),
('Mechanical', 'Pumping Station', 'ea', 95000, 'Industry average'),

-- IT
('IT', 'Server Rack (42U)', 'ea', 3500, 'Vendor quote'),
('IT', 'Network Cabinet', 'ea', 2500, 'Vendor quote'),
('IT', 'Structured Cabling (per drop)', 'ea', 350, 'Industry average'),
('IT', 'Fiber Optic Backbone', 'lin ft', 15, 'Industry average'),
('IT', 'BMS/DCIM System', 'ea', 125000, 'Vendor quote'),
('IT', 'Security System (CCTV + Access)', 'ea', 85000, 'Industry average'),
('IT', 'Network Switch (Core)', 'ea', 25000, 'Vendor quote'),
('IT', 'Network Switch (Distribution)', 'ea', 8500, 'Vendor quote'),

-- Other
('Other', 'Engineering & Design', 'pct', 1, 'Percentage of direct costs'),
('Other', 'Project Management', 'pct', 1, 'Percentage of direct costs'),
('Other', 'Permitting & Regulatory', 'ls', 75000, 'Industry average'),
('Other', 'Environmental Studies', 'ls', 45000, 'Industry average'),
('Other', 'Commissioning & Testing', 'pct', 1, 'Percentage of direct costs'),
('Other', 'Owner Contingency', 'pct', 1, 'Percentage of direct costs'),
('Other', 'Insurance & Bonding', 'pct', 1, 'Percentage of direct costs');

-- =====================================================
-- SEED DATA: LEAD TIME BASELINES
-- =====================================================

INSERT INTO public.leadtime_baselines (jurisdiction, utility, milestone, baseline_min_days, baseline_max_days, notes) VALUES
-- Generic baselines (no specific utility)
('Generic', NULL, 'Interconnection Application', 30, 60, 'Initial application and queue position'),
('Generic', NULL, 'Feasibility Study', 45, 90, 'Initial screening study'),
('Generic', NULL, 'System Impact Study', 90, 180, 'Detailed grid impact analysis'),
('Generic', NULL, 'Facilities Study', 60, 120, 'Engineering and cost estimates'),
('Generic', NULL, 'Interconnection Agreement', 30, 90, 'Contract negotiation and execution'),
('Generic', NULL, 'Transformer Procurement', 180, 365, 'Long-lead equipment'),
('Generic', NULL, 'Switchgear Procurement', 120, 240, 'Medium-lead equipment'),
('Generic', NULL, 'Permitting - Local', 60, 180, 'Municipal permits'),
('Generic', NULL, 'Permitting - State', 90, 270, 'State-level environmental'),
('Generic', NULL, 'Permitting - Federal', 180, 540, 'NEPA/Federal review if required'),
('Generic', NULL, 'Construction', 180, 365, 'Site construction duration'),
('Generic', NULL, 'Commissioning', 30, 60, 'Testing and energization'),
('Generic', NULL, 'Ready for Service', 0, 0, 'Project milestone'),

-- Texas/ERCOT specific
('Texas', 'ERCOT', 'Interconnection Application', 14, 30, 'ERCOT queue entry'),
('Texas', 'ERCOT', 'Feasibility Study', 30, 60, 'Screening study'),
('Texas', 'ERCOT', 'Full Interconnection Study', 120, 180, 'FIS completion'),
('Texas', 'ERCOT', 'Interconnection Agreement', 30, 60, 'IA execution'),
('Texas', 'ERCOT', 'Permitting - Local', 45, 120, 'County permits typically faster'),
('Texas', 'ERCOT', 'Construction', 180, 300, 'Site build'),

-- California specific
('California', 'CAISO', 'Interconnection Application', 30, 60, 'CAISO queue entry'),
('California', 'CAISO', 'Phase I Study', 120, 180, 'Cluster study'),
('California', 'CAISO', 'Phase II Study', 180, 270, 'Detailed analysis'),
('California', 'CAISO', 'Interconnection Agreement', 60, 120, 'GIA execution'),
('California', 'CAISO', 'Permitting - CEQA', 180, 365, 'Environmental review'),
('California', 'CAISO', 'Permitting - Local', 90, 180, 'County/city permits'),

-- PJM specific
('PJM', 'PJM', 'Interconnection Application', 30, 45, 'Queue position'),
('PJM', 'PJM', 'Feasibility Study', 60, 120, 'Initial study'),
('PJM', 'PJM', 'System Impact Study', 180, 360, 'Detailed study - queue delays'),
('PJM', 'PJM', 'Facilities Study', 90, 180, 'Engineering study'),
('PJM', 'PJM', 'Interconnection Agreement', 60, 120, 'ISA/WMPA execution');

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_capex_phase_lines_project ON public.capex_phase_lines(project_id);
CREATE INDEX idx_capex_phase_lines_phase ON public.capex_phase_lines(phase_id);
CREATE INDEX idx_leadtime_project_inputs_project ON public.leadtime_project_inputs(project_id);
CREATE INDEX idx_leadtime_project_forecasts_project ON public.leadtime_project_forecasts(project_id);
CREATE INDEX idx_leadtime_baselines_jurisdiction ON public.leadtime_baselines(jurisdiction);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_capex_project_summary_updated_at
  BEFORE UPDATE ON public.capex_project_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leadtime_baselines_updated_at
  BEFORE UPDATE ON public.leadtime_baselines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leadtime_project_forecasts_updated_at
  BEFORE UPDATE ON public.leadtime_project_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();