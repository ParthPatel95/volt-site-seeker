// Enhanced Risk Types for VoltBuild Risk Management

export type RiskProbability = 'low' | 'medium' | 'high' | 'very_high';
export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskCategory = 'technical' | 'schedule' | 'financial' | 'regulatory' | 'utility' | 'supply_chain' | 'weather' | 'other';
export type RiskResponseType = 'avoid' | 'transfer' | 'mitigate' | 'accept';
// Must match the database enum: "open" | "mitigated" | "closed"
export type RiskStatus = 'open' | 'mitigated' | 'closed';
export type RiskSeverity = 'low' | 'medium' | 'high';

export interface EnhancedRisk {
  id: string;
  project_id: string;
  phase_id?: string | null;
  title: string;
  description?: string | null;
  severity: RiskSeverity;
  status: RiskStatus;
  mitigation_plan?: string | null;
  owner?: string | null;
  created_at: string;
  updated_at: string;
  
  // Enhanced fields
  probability: RiskProbability;
  impact: RiskImpact;
  risk_score: number;
  category?: RiskCategory | null;
  estimated_cost_impact?: number | null;
  cost_impact_range_min?: number | null;
  cost_impact_range_max?: number | null;
  estimated_days_delay?: number | null;
  response_type: RiskResponseType;
  linked_task_id?: string | null;
  identified_date?: string | null;
  target_resolution_date?: string | null;
  actual_resolution_date?: string | null;
  trigger_indicators?: string | null;
  last_review_date?: string | null;
  review_notes?: string | null;
}

export interface RiskHistory {
  id: string;
  risk_id: string;
  changed_by?: string | null;
  changed_at: string;
  field_changed: string;
  old_value?: string | null;
  new_value?: string | null;
  notes?: string | null;
}

export interface RiskComment {
  id: string;
  risk_id: string;
  user_id?: string | null;
  content: string;
  created_at: string;
}

export interface RiskMatrixCell {
  probability: RiskProbability;
  impact: RiskImpact;
  risks: EnhancedRisk[];
  score: number;
  level: 'low' | 'moderate' | 'significant' | 'critical';
}

export interface RiskAnalytics {
  totalRisks: number;
  openRisks: number;
  mitigatedRisks: number;
  closedRisks: number;
  criticalRisks: number;
  highRisks: number;
  averageRiskScore: number;
  risksWithoutMitigation: number;
  overdueReviews: number;
  totalCostImpact: number;
  totalDaysDelay: number;
  risksByCategory: Record<RiskCategory, number>;
  risksByPhase: Record<string, number>;
  riskTrend: { date: string; count: number; avgScore: number }[];
}

export interface RiskFilters {
  status?: RiskStatus[];
  category?: RiskCategory[];
  probability?: RiskProbability[];
  impact?: RiskImpact[];
  phaseId?: string;
  owner?: string;
  searchTerm?: string;
  showOverdueOnly?: boolean;
  showCriticalOnly?: boolean;
}

// Configuration for probability/impact labels and colors
export const PROBABILITY_CONFIG: Record<RiskProbability, { label: string; value: number; color: string }> = {
  low: { label: 'Low', value: 1, color: 'hsl(var(--success))' },
  medium: { label: 'Medium', value: 2, color: 'hsl(var(--warning))' },
  high: { label: 'High', value: 3, color: 'hsl(var(--destructive))' },
  very_high: { label: 'Very High', value: 4, color: 'hsl(var(--destructive))' },
};

export const IMPACT_CONFIG: Record<RiskImpact, { label: string; value: number; color: string }> = {
  low: { label: 'Low', value: 1, color: 'hsl(var(--success))' },
  medium: { label: 'Medium', value: 2, color: 'hsl(var(--warning))' },
  high: { label: 'High', value: 3, color: 'hsl(var(--destructive))' },
  critical: { label: 'Critical', value: 4, color: 'hsl(var(--destructive))' },
};

export const CATEGORY_CONFIG: Record<RiskCategory, { label: string; icon: string; color: string }> = {
  technical: { label: 'Technical', icon: 'Wrench', color: 'hsl(var(--primary))' },
  schedule: { label: 'Schedule', icon: 'Calendar', color: 'hsl(var(--warning))' },
  financial: { label: 'Financial', icon: 'DollarSign', color: 'hsl(var(--success))' },
  regulatory: { label: 'Regulatory', icon: 'FileText', color: 'hsl(var(--muted-foreground))' },
  utility: { label: 'Utility', icon: 'Zap', color: 'hsl(var(--primary))' },
  supply_chain: { label: 'Supply Chain', icon: 'Truck', color: 'hsl(var(--secondary))' },
  weather: { label: 'Weather', icon: 'Cloud', color: 'hsl(var(--muted-foreground))' },
  other: { label: 'Other', icon: 'MoreHorizontal', color: 'hsl(var(--muted-foreground))' },
};

export const RESPONSE_TYPE_CONFIG: Record<RiskResponseType, { label: string; description: string; color: string }> = {
  avoid: { label: 'Avoid', description: 'Eliminate the threat entirely', color: 'hsl(var(--success))' },
  transfer: { label: 'Transfer', description: 'Shift risk to third party', color: 'hsl(var(--primary))' },
  mitigate: { label: 'Mitigate', description: 'Reduce probability or impact', color: 'hsl(var(--warning))' },
  accept: { label: 'Accept', description: 'Acknowledge and monitor', color: 'hsl(var(--muted-foreground))' },
};

export const STATUS_CONFIG: Record<RiskStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: 'hsl(var(--destructive))' },
  mitigated: { label: 'Mitigated', color: 'hsl(var(--warning))' },
  closed: { label: 'Closed', color: 'hsl(var(--muted-foreground))' },
};

// Helper to get risk level from score
export function getRiskLevel(score: number): 'low' | 'moderate' | 'significant' | 'critical' {
  if (score <= 2) return 'low';
  if (score <= 6) return 'moderate';
  if (score <= 9) return 'significant';
  return 'critical';
}

export function getRiskLevelColor(level: 'low' | 'moderate' | 'significant' | 'critical'): string {
  switch (level) {
    case 'low': return 'bg-green-500/20 text-green-700 dark:text-green-400';
    case 'moderate': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    case 'significant': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
    case 'critical': return 'bg-red-500/20 text-red-700 dark:text-red-400';
  }
}
