// VoltBuild Phase 3 Types - Field Ops, Verification, Forecasting & Utility Automation

// =====================================================
// DAILY LOGS MODULE
// =====================================================

export interface DailyLog {
  id: string;
  project_id: string;
  date: string;
  created_by: string | null;
  weather_summary: string | null;
  work_completed: string | null;
  blockers: string | null;
  next_day_plan: string | null;
  labor_count: number;
  equipment_on_site: string | null;
  hours_worked: number | null;
  created_at: string;
  updated_at: string;
}

export interface DailyLogMedia {
  id: string;
  daily_log_id: string;
  type: 'photo' | 'video' | 'file';
  file_url: string;
  caption: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface DailyLogFormData {
  date: string;
  weather_summary?: string;
  work_completed?: string;
  blockers?: string;
  next_day_plan?: string;
  labor_count?: number;
  equipment_on_site?: string;
  hours_worked?: number;
}

// =====================================================
// FIELD CHECK-INS MODULE
// =====================================================

export interface FieldCheckin {
  id: string;
  project_id: string;
  user_id: string | null;
  user_name: string | null;
  checkin_time: string;
  checkout_time: string | null;
  coarse_location: string | null;
  method: 'manual' | 'device';
  notes: string | null;
  created_at: string;
}

export interface FieldCheckinFormData {
  user_name?: string;
  coarse_location?: string;
  method?: 'manual' | 'device';
  notes?: string;
}

// =====================================================
// PROGRESS VERIFICATION MODULE
// =====================================================

export type VerificationStatus = 'submitted' | 'approved' | 'rejected';
export type VerificationType = 'photo' | 'video' | 'document' | 'inspection';

export interface TaskVerification {
  id: string;
  project_id: string;
  phase_id: string | null;
  task_id: string | null;
  verification_type: VerificationType;
  file_url: string;
  notes: string | null;
  submitted_by: string | null;
  submitted_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  status: VerificationStatus;
  created_at: string;
}

export interface VerificationTemplate {
  id: string;
  project_id: string | null;
  name: string;
  phase_id: string | null;
  required_evidence: RequiredEvidence[];
  created_at: string;
}

export interface RequiredEvidence {
  type: VerificationType;
  description: string;
  required: boolean;
}

export interface VerificationFormData {
  task_id: string;
  phase_id?: string;
  verification_type: VerificationType;
  file_url: string;
  notes?: string;
}

// =====================================================
// FORECASTING MODULE
// =====================================================

export interface ProjectForecast {
  id: string;
  project_id: string;
  forecast_date: string;
  projected_rfs_date: string | null;
  schedule_slip_days: number;
  projected_grand_total: number | null;
  capex_overrun_pct: number | null;
  confidence_pct: number | null;
  primary_drivers: ForecastDriver[];
  recommended_actions: RecommendedAction[];
  created_at: string;
}

export interface ForecastDriver {
  type: 'schedule' | 'budget' | 'procurement' | 'blockers';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  value?: number;
}

export interface RecommendedAction {
  priority: 'high' | 'medium' | 'low';
  action: string;
  expected_impact: string;
}

export interface ForecastSnapshot {
  id: string;
  project_id: string;
  snapshot_date: string;
  tasks_completed_pct: number | null;
  blockers_open_count: number;
  procurement_delayed_count: number;
  change_orders_total: number;
  capex_to_date: number;
  leadtime_red_milestones: number;
  created_at: string;
}

// =====================================================
// UTILITY MONITOR MODULE
// =====================================================

export type UtilityStatus = 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'delayed';
export type AlertSeverity = 'low' | 'medium' | 'high';
export type UtilityAlertType = 'rfs_risk' | 'delay' | 'no_update';

export interface UtilityStatusUpdate {
  id: string;
  project_id: string;
  utility: string;
  milestone: string;
  status: UtilityStatus;
  last_update_date: string | null;
  evidence_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UtilityAlertRule {
  id: string;
  project_id: string;
  alert_type: UtilityAlertType;
  threshold_days: number;
  is_enabled: boolean;
  created_at: string;
}

export interface UtilityAlert {
  id: string;
  project_id: string;
  alert_type: string;
  message: string;
  severity: AlertSeverity;
  created_at: string;
  resolved_at: string | null;
}

export interface UtilityStatusFormData {
  utility: string;
  milestone: string;
  status?: UtilityStatus;
  evidence_url?: string;
  notes?: string;
}

// =====================================================
// COMPLIANCE & SAFETY MODULE
// =====================================================

export type IncidentSeverity = 'near_miss' | 'minor' | 'major';
export type IncidentStatus = 'open' | 'closed';
export type PermitStatus = 'draft' | 'submitted' | 'approved' | 'expired';

export interface SafetyToolboxTalk {
  id: string;
  project_id: string;
  date: string;
  topic: string;
  conducted_by: string | null;
  conducted_by_name: string | null;
  attendees: Attendee[];
  notes: string | null;
  attachments: Attachment[];
  created_at: string;
}

export interface Attendee {
  name: string;
  role?: string;
  signature?: boolean;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface SafetyIncident {
  id: string;
  project_id: string;
  date: string;
  severity: IncidentSeverity;
  description: string;
  immediate_actions: string | null;
  reported_by: string | null;
  reported_by_name: string | null;
  attachments: Attachment[];
  status: IncidentStatus;
  closed_at: string | null;
  created_at: string;
}

export interface PermitLog {
  id: string;
  project_id: string;
  permit_name: string;
  authority: string | null;
  submitted_date: string | null;
  approved_date: string | null;
  expiry_date: string | null;
  status: PermitStatus;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface ToolboxTalkFormData {
  date: string;
  topic: string;
  conducted_by_name?: string;
  attendees?: Attendee[];
  notes?: string;
}

export interface IncidentFormData {
  date: string;
  severity: IncidentSeverity;
  description: string;
  immediate_actions?: string;
  reported_by_name?: string;
}

export interface PermitFormData {
  permit_name: string;
  authority?: string;
  submitted_date?: string;
  approved_date?: string;
  expiry_date?: string;
  status?: PermitStatus;
  file_url?: string;
  notes?: string;
}

// =====================================================
// STATUS CONFIGURATIONS
// =====================================================

export const UTILITY_STATUS_CONFIG: Record<UtilityStatus, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-600' },
  submitted: { label: 'Submitted', color: 'bg-amber-500/20 text-amber-600' },
  approved: { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-600' },
  delayed: { label: 'Delayed', color: 'bg-red-500/20 text-red-600' },
};

export const VERIFICATION_STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string }> = {
  submitted: { label: 'Pending Review', color: 'bg-amber-500/20 text-amber-600' },
  approved: { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-600' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-600' },
};

export const INCIDENT_SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; color: string }> = {
  near_miss: { label: 'Near Miss', color: 'bg-amber-500/20 text-amber-600' },
  minor: { label: 'Minor', color: 'bg-orange-500/20 text-orange-600' },
  major: { label: 'Major', color: 'bg-red-500/20 text-red-600' },
};

export const PERMIT_STATUS_CONFIG: Record<PermitStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  submitted: { label: 'Submitted', color: 'bg-amber-500/20 text-amber-600' },
  approved: { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-600' },
  expired: { label: 'Expired', color: 'bg-red-500/20 text-red-600' },
};

export const ALERT_SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-blue-500/20 text-blue-600' },
  medium: { label: 'Medium', color: 'bg-amber-500/20 text-amber-600' },
  high: { label: 'High', color: 'bg-red-500/20 text-red-600' },
};
