
export interface SearchConfig {
  jurisdiction: string;
  enableIdleProperties: boolean;
  enableCorporateDistress: boolean;
  enableSatelliteAnalysis: boolean;
  enableSECFilings: boolean;
  enableBankruptcyData: boolean;
  enableNewsIntelligence: boolean;
  maxResults: number;
}

export interface ScanStats {
  distressedSites: number;
  idleProperties: number;
  totalMW: number;
  sourcesUsed: number;
}

export interface Opportunity {
  id: string;
  type: 'distressed' | 'idle' | 'corporate';
  name: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: [number, number];
  estimatedPowerMW: number;
  distressScore: number;
  aiInsights: string;
  sources: string[];
  lastUpdated: string;
  status: 'active' | 'closed' | 'monitoring';
  opportunityDetails?: any;
}

export interface StoredIntelResult {
  id: string;
  scan_session_id?: string;
  opportunity_type: 'distressed' | 'idle' | 'corporate';
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  coordinates?: any;
  estimated_power_mw: number;
  distress_score: number;
  ai_insights?: string;
  data_sources: string[];
  opportunity_details?: any;
  status: 'active' | 'closed' | 'monitoring';
  created_by?: string;
  created_at: string;
  updated_at: string;
}
