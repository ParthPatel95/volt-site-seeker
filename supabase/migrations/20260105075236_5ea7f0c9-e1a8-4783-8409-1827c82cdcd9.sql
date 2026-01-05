-- VoltBuild: Construction & Build-Out Management Module
-- 6 new tables for managing infrastructure construction projects

-- Create enum types for status values
CREATE TYPE voltbuild_project_status AS ENUM ('planning', 'in_progress', 'delayed', 'complete');
CREATE TYPE voltbuild_phase_status AS ENUM ('not_started', 'in_progress', 'blocked', 'complete');
CREATE TYPE voltbuild_task_status AS ENUM ('not_started', 'in_progress', 'blocked', 'complete');
CREATE TYPE voltbuild_risk_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE voltbuild_risk_status AS ENUM ('open', 'mitigated', 'closed');
CREATE TYPE voltbuild_assigned_role AS ENUM ('owner', 'engineer', 'contractor', 'utility');

-- 1. VoltBuild Projects Table
CREATE TABLE public.voltbuild_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status voltbuild_project_status NOT NULL DEFAULT 'planning',
  linked_site_id UUID REFERENCES public.verified_heavy_power_sites(id) ON DELETE SET NULL,
  target_mw NUMERIC,
  cooling_type TEXT,
  utility_iso TEXT,
  location TEXT,
  estimated_start_date DATE,
  estimated_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  overall_progress NUMERIC DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. VoltBuild Phases Table
CREATE TABLE public.voltbuild_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status voltbuild_phase_status NOT NULL DEFAULT 'not_started',
  progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_start_date DATE,
  estimated_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. VoltBuild Tasks Table
CREATE TABLE public.voltbuild_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_id UUID NOT NULL REFERENCES public.voltbuild_phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status voltbuild_task_status NOT NULL DEFAULT 'not_started',
  assigned_role voltbuild_assigned_role DEFAULT 'owner',
  estimated_duration_days INTEGER,
  actual_start_date DATE,
  actual_end_date DATE,
  depends_on UUID[] DEFAULT '{}',
  is_critical_path BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. VoltBuild Task Comments Table
CREATE TABLE public.voltbuild_task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.voltbuild_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. VoltBuild Documents Table
CREATE TABLE public.voltbuild_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.voltbuild_phases(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.voltbuild_tasks(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  version INTEGER DEFAULT 1,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. VoltBuild Risks Table
CREATE TABLE public.voltbuild_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.voltbuild_phases(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity voltbuild_risk_severity NOT NULL DEFAULT 'medium',
  mitigation_plan TEXT,
  owner TEXT,
  status voltbuild_risk_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.voltbuild_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voltbuild_projects
CREATE POLICY "Users can view their own projects" ON public.voltbuild_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON public.voltbuild_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.voltbuild_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.voltbuild_projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for voltbuild_phases (based on project ownership)
CREATE POLICY "Users can view phases of their projects" ON public.voltbuild_phases
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create phases in their projects" ON public.voltbuild_phases
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update phases in their projects" ON public.voltbuild_phases
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete phases in their projects" ON public.voltbuild_phases
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

-- RLS Policies for voltbuild_tasks (based on phase -> project ownership)
CREATE POLICY "Users can view tasks in their projects" ON public.voltbuild_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_phases p
      JOIN public.voltbuild_projects proj ON p.project_id = proj.id
      WHERE p.id = phase_id AND proj.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their projects" ON public.voltbuild_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.voltbuild_phases p
      JOIN public.voltbuild_projects proj ON p.project_id = proj.id
      WHERE p.id = phase_id AND proj.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their projects" ON public.voltbuild_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_phases p
      JOIN public.voltbuild_projects proj ON p.project_id = proj.id
      WHERE p.id = phase_id AND proj.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their projects" ON public.voltbuild_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_phases p
      JOIN public.voltbuild_projects proj ON p.project_id = proj.id
      WHERE p.id = phase_id AND proj.user_id = auth.uid()
    )
  );

-- RLS Policies for voltbuild_task_comments
CREATE POLICY "Users can view comments on their project tasks" ON public.voltbuild_task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.voltbuild_tasks t
      JOIN public.voltbuild_phases p ON t.phase_id = p.id
      JOIN public.voltbuild_projects proj ON p.project_id = proj.id
      WHERE t.id = task_id AND proj.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on their project tasks" ON public.voltbuild_task_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.voltbuild_tasks t
      JOIN public.voltbuild_phases p ON t.phase_id = p.id
      JOIN public.voltbuild_projects proj ON p.project_id = proj.id
      WHERE t.id = task_id AND proj.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own comments" ON public.voltbuild_task_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for voltbuild_documents
CREATE POLICY "Users can view documents in their projects" ON public.voltbuild_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can upload documents to their projects" ON public.voltbuild_documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update documents in their projects" ON public.voltbuild_documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete documents in their projects" ON public.voltbuild_documents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

-- RLS Policies for voltbuild_risks
CREATE POLICY "Users can view risks in their projects" ON public.voltbuild_risks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create risks in their projects" ON public.voltbuild_risks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update risks in their projects" ON public.voltbuild_risks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete risks in their projects" ON public.voltbuild_risks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.voltbuild_projects WHERE id = project_id AND user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_voltbuild_projects_user_id ON public.voltbuild_projects(user_id);
CREATE INDEX idx_voltbuild_phases_project_id ON public.voltbuild_phases(project_id);
CREATE INDEX idx_voltbuild_tasks_phase_id ON public.voltbuild_tasks(phase_id);
CREATE INDEX idx_voltbuild_task_comments_task_id ON public.voltbuild_task_comments(task_id);
CREATE INDEX idx_voltbuild_documents_project_id ON public.voltbuild_documents(project_id);
CREATE INDEX idx_voltbuild_risks_project_id ON public.voltbuild_risks(project_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_voltbuild_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_voltbuild_projects_updated_at
  BEFORE UPDATE ON public.voltbuild_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_voltbuild_updated_at();

CREATE TRIGGER update_voltbuild_phases_updated_at
  BEFORE UPDATE ON public.voltbuild_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_voltbuild_updated_at();

CREATE TRIGGER update_voltbuild_tasks_updated_at
  BEFORE UPDATE ON public.voltbuild_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_voltbuild_updated_at();

CREATE TRIGGER update_voltbuild_risks_updated_at
  BEFORE UPDATE ON public.voltbuild_risks
  FOR EACH ROW EXECUTE FUNCTION public.update_voltbuild_updated_at();