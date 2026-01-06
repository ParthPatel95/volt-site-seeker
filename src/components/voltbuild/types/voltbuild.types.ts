// VoltBuild Type Definitions

export type ProjectStatus = 'planning' | 'in_progress' | 'delayed' | 'complete';
export type PhaseStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';
export type RiskSeverity = 'low' | 'medium' | 'high';
export type RiskStatus = 'open' | 'mitigated' | 'closed';
export type AssignedRole = 'owner' | 'engineer' | 'contractor' | 'utility';

export interface VoltBuildProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  linked_site_id: string | null;
  target_mw: number | null;
  cooling_type: string | null;
  utility_iso: string | null;
  location: string | null;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  overall_progress: number;
  created_at: string;
  updated_at: string;
  // Joined data
  phases?: VoltBuildPhase[];
  linked_site?: {
    site_name: string;
    location: string;
    power_capacity_mw: number;
  } | null;
}

export interface VoltBuildPhase {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  order_index: number;
  status: PhaseStatus;
  progress: number;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  tasks?: VoltBuildTask[];
  risks?: VoltBuildRisk[];
}

export interface VoltBuildTask {
  id: string;
  phase_id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  assigned_role: AssignedRole;
  assigned_user_id: string | null;
  estimated_duration_days: number | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  depends_on: string[];
  is_critical_path: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  // Joined data
  comments?: VoltBuildTaskComment[];
  assigned_user?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface VoltBuildTaskComment {
  id: string;
  task_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export interface VoltBuildDocument {
  id: string;
  project_id: string;
  phase_id: string | null;
  task_id: string | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  version: number;
  uploaded_by: string | null;
  created_at: string;
  secure_document_id: string | null;
}

export interface VoltBuildRisk {
  id: string;
  project_id: string;
  phase_id: string | null;
  title: string;
  description: string | null;
  severity: RiskSeverity;
  mitigation_plan: string | null;
  owner: string | null;
  status: RiskStatus;
  created_at: string;
  updated_at: string;
}

// Default phases configuration
export const DEFAULT_PHASES = [
  {
    name: 'Pre-Construction & Permitting',
    description: 'Zoning, permits, and planning phase',
    tasks: [
      { name: 'Zoning review', description: 'Review local zoning requirements and restrictions' },
      { name: 'Environmental approvals', description: 'Obtain necessary environmental permits and assessments' },
      { name: 'Utility coordination', description: 'Coordinate with utility providers for interconnection' },
      { name: 'Engineering drawings', description: 'Complete engineering design and drawings' },
      { name: 'Contractor selection', description: 'Select and contract general and specialty contractors' },
    ],
  },
  {
    name: 'Site Preparation',
    description: 'Land preparation and foundation work',
    tasks: [
      { name: 'Land clearing', description: 'Clear site of vegetation and obstacles' },
      { name: 'Grading & drainage', description: 'Grade site and install drainage systems' },
      { name: 'Foundations & pads', description: 'Pour concrete foundations and equipment pads' },
      { name: 'Conduit trenches', description: 'Excavate and install underground conduit runs' },
    ],
  },
  {
    name: 'Electrical Infrastructure',
    description: 'Power systems and grid connection',
    tasks: [
      { name: 'Utility interconnection', description: 'Complete utility interconnection work' },
      { name: 'Substation build or tie-in', description: 'Construct or connect to substation' },
      { name: 'Transformers & switchgear', description: 'Install transformers and switchgear equipment' },
      { name: 'Grounding & protection', description: 'Install grounding systems and protective equipment' },
      { name: 'Commissioning tests', description: 'Perform electrical commissioning and testing' },
    ],
  },
  {
    name: 'Mechanical & Cooling',
    description: 'HVAC and cooling system installation',
    tasks: [
      { name: 'HVAC or immersion systems', description: 'Install primary cooling systems' },
      { name: 'Heat exchangers', description: 'Install heat exchangers and related equipment' },
      { name: 'Pumps & piping', description: 'Install pumps, piping, and fluid systems' },
      { name: 'Controls & sensors', description: 'Install control systems and environmental sensors' },
    ],
  },
  {
    name: 'IT / Container Deployment',
    description: 'Computing infrastructure installation',
    tasks: [
      { name: 'Container placement', description: 'Position and secure modular containers' },
      { name: 'Rack installation', description: 'Install server racks and mounting hardware' },
      { name: 'Power distribution (PDU)', description: 'Install PDUs and power distribution systems' },
      { name: 'Network cabling', description: 'Install network cabling and connectivity' },
    ],
  },
  {
    name: 'Testing & Commissioning',
    description: 'System testing and validation',
    tasks: [
      { name: 'Energization', description: 'Energize electrical systems and verify operation' },
      { name: 'Load testing', description: 'Perform load testing at various capacity levels' },
      { name: 'Thermal testing', description: 'Verify cooling system performance under load' },
      { name: 'Failover tests', description: 'Test redundancy and failover systems' },
    ],
  },
  {
    name: 'Go-Live & Handover',
    description: 'Final inspections and operations handover',
    tasks: [
      { name: 'Final inspections', description: 'Complete all required inspections and certifications' },
      { name: 'Documentation handover', description: 'Compile and deliver all project documentation' },
      { name: 'Operations checklist', description: 'Complete operations readiness checklist' },
    ],
  },
];

// Status display helpers
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  planning: { label: 'Planning', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'default' },
  delayed: { label: 'Delayed', variant: 'destructive' },
  complete: { label: 'Complete', variant: 'outline' },
};

export const PHASE_STATUS_CONFIG: Record<PhaseStatus, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400' },
  blocked: { label: 'Blocked', color: 'text-red-600 dark:text-red-400' },
  complete: { label: 'Complete', color: 'text-green-600 dark:text-green-400' },
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  not_started: { label: 'Not Started', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  in_progress: { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10' },
  blocked: { label: 'Blocked', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10' },
  complete: { label: 'Complete', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10' },
};

export const ROLE_CONFIG: Record<AssignedRole, { label: string; color: string }> = {
  owner: { label: 'Owner', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
  engineer: { label: 'Engineer', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  contractor: { label: 'Contractor', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  utility: { label: 'Utility', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
};

export const RISK_SEVERITY_CONFIG: Record<RiskSeverity, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10' },
  medium: { label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500/10' },
  high: { label: 'High', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10' },
};
