
export interface RealDataSource {
  name: string;
  verified: boolean;
  lastChecked: string;
  url?: string;
}

export interface RealDataValidation {
  addressMatches: number;
  sourcesFound: string[];
  googleSearchResults: number;
  openStreetMapMatch: boolean;
  isVerified: boolean;
}

export interface RealDataGPTAnalysis {
  powerPotential: 'Low' | 'Medium' | 'High';
  industrialStatus: 'Active' | 'Downsized' | 'Shut Down' | 'Unknown';
  summary: string;
  recentActivity: boolean;
  abandonedIndicators: string[];
  confidenceReasons: string[];
}

export interface RealDataSatelliteAnalysis {
  visualStatus: 'Active' | 'Idle' | 'Likely Abandoned';
  overgrowthDetected: boolean;
  emptyAreas: boolean;
  rustedInfrastructure: boolean;
  activeSmokestacks: boolean;
  imageUrl: string;
  analysisConfidence: number;
}

export interface RealDataConfidenceScore {
  total: number;
  breakdown: {
    verifiedAddress: number;
    apiOrigin: number;
    powerPotential: number;
    satelliteActive: number;
    businessOperating: number;
    googleRecency: number;
  };
  level: 'High' | 'Medium' | 'Low';
}

export interface VerifiedHeavyPowerSite {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  city: string;
  state: string;
  
  // Real data validation
  sources: RealDataSource[];
  validation: RealDataValidation;
  gptAnalysis: RealDataGPTAnalysis;
  satelliteAnalysis: RealDataSatelliteAnalysis;
  confidenceScore: RealDataConfidenceScore;
  
  // Additional metadata
  listingPrice?: number;
  squareFootage?: number;
  yearBuilt?: number;
  lastUpdated: string;
  scanTimestamp: string;
}

export interface RealDataScanConfig {
  jurisdiction: string;
  city?: string;
  includeConfidenceThreshold: number;
  enableSatelliteAnalysis: boolean;
  enableGPTValidation: boolean;
  maxResults: number;
}
