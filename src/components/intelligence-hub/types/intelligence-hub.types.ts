
export type OpportunityType = 'idle_facility' | 'distressed_company' | 'power_asset' | 'real_estate';
export type OpportunityStatus = 'active' | 'monitoring' | 'saved' | 'closed';

export interface IntelLocation {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number };
}

export interface IntelMetrics {
  powerCapacityMW?: number;
  distressScore?: number;
  confidenceLevel: number;
  financialHealthScore?: number;
  idleScore?: number;
  substationDistanceKm?: number;
  facilitySize?: number;
  yearBuilt?: number;
}

export interface IntelOpportunity {
  id: string;
  type: OpportunityType;
  name: string;
  location: IntelLocation;
  metrics: IntelMetrics;
  sources: string[];
  aiInsights?: string;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  // Extended fields
  industryType?: string;
  naicsCode?: string;
  ticker?: string;
  marketCap?: number;
  retrofitCostClass?: string;
  recommendedStrategy?: string;
  evidenceText?: string;
  operationalStatus?: string;
}

export interface IntelAlert {
  id: string;
  opportunityId?: string;
  type: 'price_change' | 'new_opportunity' | 'status_change' | 'distress_signal';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

export interface ScanConfig {
  jurisdiction: string;
  city?: string;
  enableIdleProperties: boolean;
  enableCorporateDistress: boolean;
  enableSatelliteAnalysis: boolean;
  enableSECFilings: boolean;
  enableBankruptcyData: boolean;
  enableNewsIntelligence: boolean;
  enableFERCData: boolean;
  enableEPARegistry: boolean;
  maxResults: number;
}

export interface ScanStats {
  totalSites: number;
  idleFacilities: number;
  distressedCompanies: number;
  totalMW: number;
  sourcesUsed: number;
  scanDuration?: number;
}

export interface IntelHubState {
  opportunities: IntelOpportunity[];
  savedOpportunities: IntelOpportunity[];
  alerts: IntelAlert[];
  watchlist: string[];
  isScanning: boolean;
  scanProgress: number;
  currentPhase: string;
  scanStats: ScanStats | null;
  error: string | null;
  activeTab: string;
}

export type IntelHubAction =
  | { type: 'SET_OPPORTUNITIES'; payload: IntelOpportunity[] }
  | { type: 'ADD_OPPORTUNITY'; payload: IntelOpportunity }
  | { type: 'SET_SAVED_OPPORTUNITIES'; payload: IntelOpportunity[] }
  | { type: 'SAVE_OPPORTUNITY'; payload: string }
  | { type: 'REMOVE_SAVED'; payload: string }
  | { type: 'SET_ALERTS'; payload: IntelAlert[] }
  | { type: 'ADD_ALERT'; payload: IntelAlert }
  | { type: 'MARK_ALERT_READ'; payload: string }
  | { type: 'ADD_TO_WATCHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: string }
  | { type: 'SET_SCANNING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: { progress: number; phase: string } }
  | { type: 'SET_SCAN_STATS'; payload: ScanStats }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'RESET_SCAN' };
