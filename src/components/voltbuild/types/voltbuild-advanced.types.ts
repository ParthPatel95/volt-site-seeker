// =====================================================
// VOLTBUILD ADVANCED TYPE DEFINITIONS
// CAPEX, Lead-Time & AI Advisor Modules
// =====================================================

// =====================================================
// CAPEX TYPES
// =====================================================

export type CapexCategory = 'Civil' | 'Electrical' | 'Mechanical' | 'IT' | 'Other';

export interface CapexCatalogItem {
  id: string;
  category: CapexCategory;
  item_name: string;
  unit: string;
  default_unit_cost: number;
  source_note: string | null;
  created_at: string;
}

export interface CapexPhaseLine {
  id: string;
  project_id: string;
  phase_id: string;
  task_id: string | null;
  catalog_item_id: string | null;
  item_name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
  // Joined data
  catalog_item?: CapexCatalogItem;
}

export interface CapexProjectSummary {
  project_id: string;
  currency: string;
  contingency_pct: number;
  tax_pct: number;
  updated_at: string;
}

export interface CapexCalculatedSummary {
  totalDirect: number;
  totalContingency: number;
  totalTax: number;
  grandTotal: number;
  costPerMw: number | null;
  byCategory: Record<CapexCategory, number>;
  byPhase: Record<string, number>;
}

// =====================================================
// LEAD TIME TYPES
// =====================================================

export type InterconnectionType = 'BTM' | 'Distribution' | 'Transmission';
export type PermittingComplexity = 'Low' | 'Medium' | 'High';
export type SiteType = 'Greenfield' | 'Brownfield' | 'Operational';

export interface LeadTimeBaseline {
  id: string;
  jurisdiction: string;
  utility: string | null;
  milestone: string;
  baseline_min_days: number;
  baseline_max_days: number;
  notes: string | null;
  updated_at: string;
}

export interface LeadTimeProjectInput {
  id: string;
  project_id: string;
  jurisdiction: string | null;
  utility: string | null;
  requested_mw: number | null;
  voltage_level: string | null;
  interconnection_type: InterconnectionType | null;
  transformer_required: boolean;
  substation_upgrade_required: boolean;
  permitting_complexity: PermittingComplexity | null;
  site_type: SiteType | null;
  target_rfs_date: string | null;
  created_at: string;
}

export interface LeadTimeProjectForecast {
  id: string;
  project_id: string;
  milestone: string;
  predicted_min_days: number;
  predicted_max_days: number;
  confidence_pct: number;
  key_risk_factors: string[];
  mitigation_actions: string[];
  updated_at: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface MilestoneWithRisk extends LeadTimeProjectForecast {
  riskLevel: RiskLevel;
  startDay: number;
  endDay: number;
}

// =====================================================
// AI ADVISOR TYPES
// =====================================================

export type AdvisorStatus = 'On Track' | 'At Risk' | 'Delayed';

export interface AdvisorOutput {
  healthScore: number;
  statusLabel: AdvisorStatus;
  criticalPath: CriticalPathItem[];
  topActions: ActionItem[];
  topRisks: RiskItem[];
}

export interface CriticalPathItem {
  taskId: string;
  taskName: string;
  phaseName: string;
  reason: string;
  riskDays: number;
  status: string;
  dueDate: string | null;
}

export interface ActionItem {
  id: string;
  title: string;
  why: string;
  impact: 'High' | 'Medium' | 'Low';
  effortHours: number;
  suggestedOwnerRole: string;
}

export interface RiskItem {
  id: string;
  risk: string;
  evidence: string;
  mitigation: string;
  source: 'task' | 'capex' | 'leadtime' | 'schedule';
}

export interface BlockedTaskInfo {
  taskId: string;
  taskName: string;
  phaseName: string;
  blockedBy: string[];
  downstreamImpact: number;
  daysBlocked: number;
}

// =====================================================
// CAPEX CATEGORY CONFIG
// =====================================================

export const CAPEX_CATEGORY_CONFIG: Record<CapexCategory, { label: string; color: string; bgColor: string }> = {
  Civil: { label: 'Civil', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  Electrical: { label: 'Electrical', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  Mechanical: { label: 'Mechanical', color: 'text-green-600', bgColor: 'bg-green-100' },
  IT: { label: 'IT', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  Other: { label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

// =====================================================
// LEAD TIME MILESTONE CONFIG
// =====================================================

export const MILESTONE_ORDER = [
  'Interconnection Application',
  'Feasibility Study',
  'System Impact Study',
  'Full Interconnection Study',
  'Phase I Study',
  'Phase II Study',
  'Facilities Study',
  'Interconnection Agreement',
  'Transformer Procurement',
  'Switchgear Procurement',
  'Permitting - Local',
  'Permitting - State',
  'Permitting - Federal',
  'Permitting - CEQA',
  'Construction',
  'Commissioning',
  'Ready for Service',
];

export const JURISDICTIONS = [
  'Generic',
  'Texas',
  'California',
  'PJM',
  'MISO',
  'SPP',
  'NYISO',
  'ISO-NE',
  'CAISO',
  'ERCOT',
];

export const VOLTAGE_LEVELS = [
  '12kV',
  '13.8kV',
  '34.5kV',
  '69kV',
  '115kV',
  '138kV',
  '230kV',
  '345kV',
  '500kV',
];

// =====================================================
// ADVISOR STATUS CONFIG
// =====================================================

export const ADVISOR_STATUS_CONFIG: Record<AdvisorStatus, { color: string; bgColor: string }> = {
  'On Track': { color: 'text-green-700', bgColor: 'bg-green-100' },
  'At Risk': { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  'Delayed': { color: 'text-red-700', bgColor: 'bg-red-100' },
};
