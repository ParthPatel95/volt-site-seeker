// =============================================
// VoltBuild Phase 2: Type Definitions
// =============================================

// =============================================
// MODULE 1: BIDS & VENDORS
// =============================================

export type VendorTrade = 'Civil' | 'Electrical' | 'Mechanical' | 'IT' | 'Commissioning' | 'Other';

export interface Vendor {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  trade: VendorTrade;
  regions: string[];
  certifications: string[];
  insurance_docs_url: string | null;
  notes: string | null;
  created_at: string;
}

export type BidRequestStatus = 'draft' | 'sent' | 'closed' | 'awarded';

export interface BidRequest {
  id: string;
  project_id: string;
  phase_id: string | null;
  task_id: string | null;
  title: string;
  scope_of_work: string | null;
  attachments: { name: string; url: string }[];
  due_date: string | null;
  status: BidRequestStatus;
  invited_vendor_ids: string[];
  created_at: string;
}

export type BidStatus = 'submitted' | 'shortlisted' | 'rejected' | 'awarded';

export interface Bid {
  id: string;
  bid_request_id: string;
  vendor_id: string;
  amount: number;
  currency: string;
  timeline_days: number | null;
  assumptions: string | null;
  exclusions: string | null;
  attachments: { name: string; url: string }[];
  status: BidStatus;
  created_at: string;
  // Joined fields
  vendor?: Vendor;
}

export interface ContractAward {
  id: string;
  project_id: string;
  bid_request_id: string;
  vendor_id: string;
  awarded_amount: number;
  start_date: string | null;
  end_date: string | null;
  terms_url: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  vendor?: Vendor;
  bid_request?: BidRequest;
}

// =============================================
// MODULE 2: PROCUREMENT
// =============================================

export type ProcurementCategory = 
  | 'Transformers' 
  | 'Switchgear' 
  | 'PDU' 
  | 'Containers' 
  | 'HVAC' 
  | 'Fiber' 
  | 'Other';

export type ProcurementStatus = 
  | 'planned' 
  | 'ordered' 
  | 'in_transit' 
  | 'delivered' 
  | 'delayed';

export interface ProcurementItem {
  id: string;
  project_id: string;
  category: ProcurementCategory;
  item_name: string;
  vendor: string | null;
  qty: number;
  unit_cost: number;
  total_cost: number;
  order_date: string | null;
  promised_ship_date: string | null;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  status: ProcurementStatus;
  linked_phase_id: string | null;
  linked_task_id: string | null;
  notes: string | null;
  created_at: string;
}

export type PurchaseOrderStatus = 'draft' | 'sent' | 'accepted' | 'paid' | 'closed';

export interface PurchaseOrder {
  id: string;
  project_id: string;
  po_number: string;
  vendor: string;
  amount: number;
  currency: string;
  po_doc_url: string | null;
  status: PurchaseOrderStatus;
  notes: string | null;
  created_at: string;
}

// =============================================
// MODULE 3: CHANGE ORDERS
// =============================================

export type ChangeOrderStatus = 
  | 'draft' 
  | 'submitted' 
  | 'approved' 
  | 'rejected' 
  | 'implemented';

export interface ChangeOrder {
  id: string;
  project_id: string;
  change_order_number: string | null;
  title: string;
  description: string | null;
  reason: string | null;
  requested_by: string | null;
  phase_id: string | null;
  task_id: string | null;
  cost_delta: number;
  schedule_delta_days: number;
  status: ChangeOrderStatus;
  attachments: { name: string; url: string }[];
  approved_by: string | null;
  approved_at: string | null;
  implemented_at: string | null;
  created_at: string;
}

// =============================================
// MODULE 4: QUALITY & COMMISSIONING
// =============================================

export type CommissioningStatus = 'not_started' | 'in_progress' | 'complete';

export interface ChecklistItem {
  description: string;
  required: boolean;
  requires_evidence: boolean;
  completed: boolean;
}

export interface CommissioningChecklist {
  id: string;
  project_id: string;
  phase_id: string | null;
  checklist_name: string;
  checklist_type: string;
  items: ChecklistItem[];
  status: CommissioningStatus;
  completed_at: string | null;
  created_at: string;
}

export interface CommissioningEvidence {
  id: string;
  checklist_id: string;
  item_index: number;
  evidence_url: string;
  notes: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export type EnergizationGateStatus = 'blocked' | 'ready';

export interface EnergizationGate {
  id: string;
  project_id: string;
  gate_name: string;
  required_checklists: string[];
  status: EnergizationGateStatus;
  notes: string | null;
  updated_at: string;
  created_at: string;
}

// =============================================
// MODULE 5: REPORTING
// =============================================

export type ReportType = 'weekly' | 'monthly';

export interface ReportKPIs {
  completion_percentage: number;
  tasks_completed: number;
  tasks_total: number;
  open_blockers: number;
  capex_spent: number;
  capex_budget: number;
  days_to_rfs: number;
  change_orders_approved: number;
  total_cost_delta: number;
  total_schedule_delta: number;
}

export interface ProjectReport {
  id: string;
  project_id: string;
  report_type: ReportType;
  period_start: string;
  period_end: string;
  generated_summary: string | null;
  kpis: ReportKPIs;
  snapshot_data: Record<string, unknown>;
  exported_pdf_url: string | null;
  created_at: string;
}

// =============================================
// STATUS CONFIGURATIONS
// =============================================

export const BID_REQUEST_STATUS_CONFIG: Record<BidRequestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  sent: { label: 'Sent', variant: 'default' },
  closed: { label: 'Closed', variant: 'outline' },
  awarded: { label: 'Awarded', variant: 'default' },
};

export const BID_STATUS_CONFIG: Record<BidStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  submitted: { label: 'Submitted', variant: 'secondary' },
  shortlisted: { label: 'Shortlisted', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  awarded: { label: 'Awarded', variant: 'default' },
};

export const PROCUREMENT_STATUS_CONFIG: Record<ProcurementStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  planned: { label: 'Planned', variant: 'secondary' },
  ordered: { label: 'Ordered', variant: 'default' },
  in_transit: { label: 'In Transit', variant: 'outline' },
  delivered: { label: 'Delivered', variant: 'default' },
  delayed: { label: 'Delayed', variant: 'destructive' },
};

export const PURCHASE_ORDER_STATUS_CONFIG: Record<PurchaseOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  sent: { label: 'Sent', variant: 'default' },
  accepted: { label: 'Accepted', variant: 'default' },
  paid: { label: 'Paid', variant: 'default' },
  closed: { label: 'Closed', variant: 'outline' },
};

export const CHANGE_ORDER_STATUS_CONFIG: Record<ChangeOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Submitted', variant: 'default' },
  approved: { label: 'Approved', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  implemented: { label: 'Implemented', variant: 'outline' },
};

export const COMMISSIONING_STATUS_CONFIG: Record<CommissioningStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  not_started: { label: 'Not Started', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'default' },
  complete: { label: 'Complete', variant: 'default' },
};

export const ENERGIZATION_GATE_STATUS_CONFIG: Record<EnergizationGateStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  blocked: { label: 'Blocked', variant: 'destructive' },
  ready: { label: 'Ready', variant: 'default' },
};

// =============================================
// CATEGORY CONFIGURATIONS
// =============================================

export const VENDOR_TRADES: VendorTrade[] = [
  'Civil',
  'Electrical',
  'Mechanical',
  'IT',
  'Commissioning',
  'Other',
];

export const PROCUREMENT_CATEGORIES: ProcurementCategory[] = [
  'Transformers',
  'Switchgear',
  'PDU',
  'Containers',
  'HVAC',
  'Fiber',
  'Other',
];

// =============================================
// CHECKLIST TEMPLATES
// =============================================

export const CHECKLIST_TEMPLATES: { name: string; type: string; items: ChecklistItem[] }[] = [
  {
    name: 'Electrical Pre-Energization Checklist',
    type: 'electrical',
    items: [
      { description: 'Verify all cable terminations are complete and torqued', required: true, requires_evidence: true, completed: false },
      { description: 'Confirm grounding system is connected and tested', required: true, requires_evidence: true, completed: false },
      { description: 'Check all breakers in OFF position', required: true, requires_evidence: false, completed: false },
      { description: 'Verify protective relay settings', required: true, requires_evidence: true, completed: false },
      { description: 'Complete insulation resistance testing', required: true, requires_evidence: true, completed: false },
      { description: 'Remove all construction debris from electrical rooms', required: true, requires_evidence: false, completed: false },
      { description: 'Confirm fire suppression system is operational', required: true, requires_evidence: true, completed: false },
    ],
  },
  {
    name: 'Mechanical Commissioning Checklist',
    type: 'mechanical',
    items: [
      { description: 'Verify all HVAC equipment is installed per specifications', required: true, requires_evidence: true, completed: false },
      { description: 'Confirm cooling system leak tests completed', required: true, requires_evidence: true, completed: false },
      { description: 'Check all valves and dampers for proper operation', required: true, requires_evidence: false, completed: false },
      { description: 'Verify BMS integration and control sequences', required: true, requires_evidence: true, completed: false },
      { description: 'Complete air balancing and document CFM readings', required: true, requires_evidence: true, completed: false },
    ],
  },
  {
    name: 'IT/Network Verification Checklist',
    type: 'it',
    items: [
      { description: 'Verify fiber connectivity to all cabinets', required: true, requires_evidence: true, completed: false },
      { description: 'Test network switch operation', required: true, requires_evidence: true, completed: false },
      { description: 'Confirm DCIM integration', required: true, requires_evidence: true, completed: false },
      { description: 'Verify remote access and monitoring', required: true, requires_evidence: false, completed: false },
      { description: 'Document IP addressing scheme', required: false, requires_evidence: false, completed: false },
    ],
  },
  {
    name: 'Safety Inspection Checklist',
    type: 'safety',
    items: [
      { description: 'Emergency exits clearly marked and unobstructed', required: true, requires_evidence: true, completed: false },
      { description: 'Fire extinguishers in place and inspected', required: true, requires_evidence: true, completed: false },
      { description: 'First aid kits stocked and accessible', required: true, requires_evidence: false, completed: false },
      { description: 'PPE requirements posted', required: true, requires_evidence: false, completed: false },
      { description: 'Emergency contact information displayed', required: true, requires_evidence: false, completed: false },
    ],
  },
  {
    name: 'Final Walkthrough Checklist',
    type: 'final',
    items: [
      { description: 'All punch list items completed', required: true, requires_evidence: true, completed: false },
      { description: 'As-built drawings delivered', required: true, requires_evidence: true, completed: false },
      { description: 'O&M manuals delivered', required: true, requires_evidence: false, completed: false },
      { description: 'Training completed for operations staff', required: true, requires_evidence: true, completed: false },
      { description: 'Warranty documentation received', required: true, requires_evidence: false, completed: false },
      { description: 'Final cleaning completed', required: true, requires_evidence: false, completed: false },
    ],
  },
];
