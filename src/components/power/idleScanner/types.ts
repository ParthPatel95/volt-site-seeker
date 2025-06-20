
export interface IdleIndustrySite {
  id: string;
  name: string;
  industryCode: string;
  industryType: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  
  // Idle Analysis
  idleScore: number; // 0-100
  evidenceText: string;
  confidenceLevel: number;
  
  // Power Analysis
  historicalPeakMW: number;
  estimatedFreeMW: number;
  capacityUtilization: number;
  
  // Infrastructure
  substationDistanceKm: number;
  nearestSubstationName?: string;
  transmissionAccess: boolean;
  
  // Opportunity Assessment
  recommendedStrategy: 'buy_site' | 'lease_power' | 'ppa_agreement';
  retrofitCostClass: 'L' | 'M' | 'H'; // Low, Medium, High
  estimatedRetrofitCost?: number;
  
  // Metadata
  discoveredAt: string;
  lastSatelliteUpdate: string;
  naicsCode?: string;
  facilitySize?: number; // sq ft
}

export interface IdleIndustryScanFilters {
  minIdleScore: number;
  minFreeMW: number;
  maxSubstationDistance: number;
  industryTypes: string[];
  retrofitCostClasses: string[];
}

export interface IdleIndustryScanStats {
  industrialSitesScanned: number;
  satelliteImagesAnalyzed: number;
  mlAnalysisSuccessRate: number;
  processingTimeMinutes: number;
  dataSourcesUsed: string[];
  jurisdiction: string;
  scanCompletedAt: string;
}

export interface IndustrialSiteDiscovery {
  osmData: any[];
  epaData: any[];
  naicsData: any[];
  combinedSites: IdleIndustrySite[];
}

export interface SatelliteAnalysisResult {
  siteId: string;
  imageUrl: string;
  analysisResults: {
    vegetationOvergrowth: number; // 0-1
    parkingLotUtilization: number; // 0-1
    equipmentCondition: number; // 0-1
    inventoryLevels: number; // 0-1
    activityIndicators: number; // 0-1
  };
  idleScore: number;
  confidenceLevel: number;
  evidenceText: string;
}
