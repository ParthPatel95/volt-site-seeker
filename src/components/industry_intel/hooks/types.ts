
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
  coordinates?: [number, number];
  estimatedPowerMW: number;
  distressScore: number;
  aiInsights: string;
  sources: string[];
  lastUpdated: string;
  status: 'active' | 'closed' | 'monitoring';
}
