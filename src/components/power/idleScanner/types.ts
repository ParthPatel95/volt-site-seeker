
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
  naicsCode: string;
  historicalPeakMW: number;
  estimatedFreeMW: number;
  capacityUtilization: number;
  facilitySize: number;
  idleScore: number;
  substationDistanceKm: number;
  recommendedStrategy: string;
  retrofitCostClass: string;
  discoveredAt: string;
  lastSatelliteUpdate: string;
  evidenceText: string;
  confidenceLevel: number;
  visionAnalysis?: {
    [key: string]: any;
  };
  operationalStatus?: string;
  yearBuilt?: number;
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
