-- VoltBuild Phase 3: Field Ops, Verification, Forecasting & Utility Automation

-- =====================================================
-- DAILY LOGS MODULE
-- =====================================================

-- Daily Logs Table
CREATE TABLE public.voltbuild_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  weather_summary TEXT,
  work_completed TEXT,
  blockers TEXT,
  next_day_plan TEXT,
  labor_count INTEGER DEFAULT 0,
  equipment_on_site TEXT,
  hours_worked NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Log Media Table
CREATE TABLE public.voltbuild_daily_log_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES public.voltbuild_daily_logs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'file')),
  file_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FIELD CHECK-INS MODULE
-- =====================================================

CREATE TABLE public.voltbuild_field_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  checkin_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checkout_time TIMESTAMPTZ,
  coarse_location TEXT,
  method TEXT CHECK (method IN ('manual', 'device')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROGRESS VERIFICATION MODULE
-- =====================================================

CREATE TABLE public.voltbuild_task_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  phase_id TEXT,
  task_id UUID REFERENCES public.voltbuild_tasks(id) ON DELETE SET NULL,
  verification_type TEXT CHECK (verification_type IN ('photo', 'video', 'document', 'inspection')),
  file_url TEXT NOT NULL,
  notes TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.voltbuild_verification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phase_id TEXT,
  required_evidence JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FORECASTING MODULE
-- =====================================================

CREATE TABLE public.voltbuild_project_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL DEFAULT CURRENT_DATE,
  projected_rfs_date DATE,
  schedule_slip_days INTEGER DEFAULT 0,
  projected_grand_total NUMERIC(14,2),
  capex_overrun_pct NUMERIC(5,2),
  confidence_pct NUMERIC(5,2),
  primary_drivers JSONB DEFAULT '[]',
  recommended_actions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.voltbuild_forecast_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tasks_completed_pct NUMERIC(5,2),
  blockers_open_count INTEGER DEFAULT 0,
  procurement_delayed_count INTEGER DEFAULT 0,
  change_orders_total NUMERIC(14,2) DEFAULT 0,
  capex_to_date NUMERIC(14,2) DEFAULT 0,
  leadtime_red_milestones INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- UTILITY MONITOR MODULE
-- =====================================================

CREATE TABLE public.voltbuild_utility_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  utility TEXT NOT NULL,
  milestone TEXT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'approved', 'delayed')),
  last_update_date DATE,
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.voltbuild_utility_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('rfs_risk', 'delay', 'no_update')),
  threshold_days INTEGER DEFAULT 30,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.voltbuild_utility_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- =====================================================
-- COMPLIANCE & SAFETY MODULE
-- =====================================================

CREATE TABLE public.voltbuild_safety_toolbox_talks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topic TEXT NOT NULL,
  conducted_by UUID REFERENCES auth.users(id),
  conducted_by_name TEXT,
  attendees JSONB DEFAULT '[]',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.voltbuild_safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  severity TEXT CHECK (severity IN ('near_miss', 'minor', 'major')),
  description TEXT NOT NULL,
  immediate_actions TEXT,
  reported_by UUID REFERENCES auth.users(id),
  reported_by_name TEXT,
  attachments JSONB DEFAULT '[]',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.voltbuild_permit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.voltbuild_projects(id) ON DELETE CASCADE,
  permit_name TEXT NOT NULL,
  authority TEXT,
  submitted_date DATE,
  approved_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'expired')),
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.voltbuild_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_daily_log_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_field_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_task_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_verification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_project_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_forecast_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_utility_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_utility_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_utility_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_safety_toolbox_talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voltbuild_permit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - Project Members Only
-- =====================================================

-- Daily Logs Policies
CREATE POLICY "Users can view daily logs for their projects" ON public.voltbuild_daily_logs
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create daily logs for their projects" ON public.voltbuild_daily_logs
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update daily logs for their projects" ON public.voltbuild_daily_logs
  FOR UPDATE USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete daily logs for their projects" ON public.voltbuild_daily_logs
  FOR DELETE USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
  );

-- Daily Log Media Policies
CREATE POLICY "Users can view daily log media" ON public.voltbuild_daily_log_media
  FOR SELECT USING (
    daily_log_id IN (
      SELECT dl.id FROM public.voltbuild_daily_logs dl
      WHERE dl.project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
      OR dl.project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert daily log media" ON public.voltbuild_daily_log_media
  FOR INSERT WITH CHECK (
    daily_log_id IN (
      SELECT dl.id FROM public.voltbuild_daily_logs dl
      WHERE dl.project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
      OR dl.project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete daily log media" ON public.voltbuild_daily_log_media
  FOR DELETE USING (
    daily_log_id IN (
      SELECT dl.id FROM public.voltbuild_daily_logs dl
      WHERE dl.project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    )
  );

-- Field Check-ins Policies
CREATE POLICY "Users can view check-ins for their projects" ON public.voltbuild_field_checkins
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create check-ins" ON public.voltbuild_field_checkins
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own check-ins" ON public.voltbuild_field_checkins
  FOR UPDATE USING (user_id = auth.uid());

-- Task Verifications Policies
CREATE POLICY "Users can view verifications for their projects" ON public.voltbuild_task_verifications
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can submit verifications" ON public.voltbuild_task_verifications
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Project owners can update verifications" ON public.voltbuild_task_verifications
  FOR UPDATE USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
  );

-- Verification Templates Policies
CREATE POLICY "Users can view verification templates" ON public.voltbuild_verification_templates
  FOR SELECT USING (
    project_id IS NULL
    OR project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Project owners can manage templates" ON public.voltbuild_verification_templates
  FOR ALL USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
  );

-- Project Forecasts Policies
CREATE POLICY "Users can view forecasts" ON public.voltbuild_project_forecasts
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create forecasts" ON public.voltbuild_project_forecasts
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

-- Forecast Snapshots Policies
CREATE POLICY "Users can view forecast snapshots" ON public.voltbuild_forecast_snapshots
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create forecast snapshots" ON public.voltbuild_forecast_snapshots
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

-- Utility Status Policies
CREATE POLICY "Users can view utility status" ON public.voltbuild_utility_status
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage utility status" ON public.voltbuild_utility_status
  FOR ALL USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

-- Utility Alert Rules Policies
CREATE POLICY "Users can view alert rules" ON public.voltbuild_utility_alert_rules
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Project owners can manage alert rules" ON public.voltbuild_utility_alert_rules
  FOR ALL USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
  );

-- Utility Alerts Policies
CREATE POLICY "Users can view alerts" ON public.voltbuild_utility_alerts
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage alerts" ON public.voltbuild_utility_alerts
  FOR ALL USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

-- Safety Toolbox Talks Policies
CREATE POLICY "Users can view toolbox talks" ON public.voltbuild_safety_toolbox_talks
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage toolbox talks" ON public.voltbuild_safety_toolbox_talks
  FOR ALL USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

-- Safety Incidents Policies
CREATE POLICY "Users can view incidents" ON public.voltbuild_safety_incidents
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage incidents" ON public.voltbuild_safety_incidents
  FOR ALL USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

-- Permit Logs Policies
CREATE POLICY "Users can view permits" ON public.voltbuild_permit_logs
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage permits" ON public.voltbuild_permit_logs
  FOR ALL USING (
    project_id IN (SELECT id FROM public.voltbuild_projects WHERE user_id = auth.uid())
    OR project_id IN (SELECT project_id FROM public.voltbuild_approved_users WHERE user_id = auth.uid())
  );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_daily_logs_project_date ON public.voltbuild_daily_logs(project_id, date);
CREATE INDEX idx_daily_log_media_log ON public.voltbuild_daily_log_media(daily_log_id);
CREATE INDEX idx_field_checkins_project ON public.voltbuild_field_checkins(project_id, checkin_time);
CREATE INDEX idx_task_verifications_project ON public.voltbuild_task_verifications(project_id);
CREATE INDEX idx_task_verifications_task ON public.voltbuild_task_verifications(task_id);
CREATE INDEX idx_forecasts_project ON public.voltbuild_project_forecasts(project_id, forecast_date);
CREATE INDEX idx_utility_status_project ON public.voltbuild_utility_status(project_id);
CREATE INDEX idx_utility_alerts_project ON public.voltbuild_utility_alerts(project_id, created_at);
CREATE INDEX idx_safety_talks_project ON public.voltbuild_safety_toolbox_talks(project_id, date);
CREATE INDEX idx_safety_incidents_project ON public.voltbuild_safety_incidents(project_id, date);
CREATE INDEX idx_permit_logs_project ON public.voltbuild_permit_logs(project_id);