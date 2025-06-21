export interface EnhancedVerifiedSite {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  city: string;
  state: string;
  zip_code?: string;
  
  // Classification and identification
  naics_code?: string;
  industry_type: string;
  facility_type?: string;
  business_status: 'active' | 'operational' | 'inactive' | 'unknown';
  
  // Power and capacity information
  historical_peak_mw?: number;
  estimated_current_mw?: number;
  estimated_free_mw?: number;
  capacity_utilization?: number;
  substation_distance_km?: number;
  transmission_access: boolean;
  
  // Confidence and validation scores
  confidence_score: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  idle_score: number;
  power_potential: 'High' | 'Medium' | 'Low';
  
  // Source tracking and validation
  data_sources: string[];
  verified_sources_count: number;
  last_verified_at?: string;
  validation_status: 'verified' | 'pending' | 'failed';
  
  // Satellite and visual analysis
  satellite_image_url?: string;
  visual_status: 'Active' | 'Idle' | 'Likely Abandoned';
  satellite_analysis?: {
    visual_status: string;
    overgrowth_detected: boolean;
    empty_parking_lots: boolean;
    rusted_infrastructure: boolean;
    active_smokestacks: boolean;
    analysis_confidence: number;
    last_analyzed: string;
  };
  
  // Business and financial data
  listing_price?: number;
  price_per_sqft?: number;
  square_footage?: number;
  lot_size_acres?: number;
  year_built?: number;
  property_type?: string;
  zoning?: string;
  
  // Additional metadata
  environmental_permits?: string[];
  regulatory_status?: any;
  market_data?: any;
  risk_factors?: string[];
  
  // Audit and lifecycle
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by?: string;
  
  // Scan metadata
  scan_id?: string;
  jurisdiction: string;
  discovery_method?: string;
  last_scan_at: string;
}

export interface ScanSession {
  id: string;
  jurisdiction: string;
  city?: string | null;
  scan_type: string;
  status: string;
  progress: number;
  current_phase?: string | null;
  
  config: any;
  filters: any;
  
  sites_discovered: number;
  sites_verified: number;
  data_sources_used: string[];
  processing_time_minutes?: number | null;
  
  created_at: string;
  completed_at?: string | null;
  created_by?: string | null;
}

export interface EnhancedScanConfig {
  jurisdiction: string;
  city?: string;
  includeConfidenceThreshold: number;
  enableSatelliteAnalysis: boolean;
  enableGPTValidation: boolean;
  enableEPAData: boolean;
  enableFERCData: boolean;
  enableBusinessRegistry: boolean;
  enableGooglePlaces: boolean;
  enableCommercialRealEstate: boolean;
  maxResults: number;
  userId?: string;
}

export interface AdvancedFilters {
  minConfidenceScore: number;
  maxConfidenceScore: number;
  minIdleScore: number;
  maxIdleScore: number;
  minFreeMW: number;
  maxFreeMW: number;
  maxSubstationDistance: number;
  powerPotential: string[];
  visualStatus: string[];
  industryTypes: string[];
  businessStatus: string[];
  dataSourcesRequired: string[];
  hasEnvironmentalPermits: boolean | null;
  minSquareFootage: number | null;
  maxListingPrice: number | null;
  yearBuiltRange: [number, number] | null;
}

export interface ScanStats {
  totalSitesFound: number;
  verifiedSites: number;
  pendingVerification: number;
  highConfidenceSites: number;
  mediumConfidenceSites: number;
  lowConfidenceSites: number;
  dataSourcesUsed: string[];
  averageConfidenceScore: number;
  totalEstimatedFreeMW: number;
  processingTimeMinutes: number;
  lastScanDate: string;
}

export interface MapCluster {
  id: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  count: number;
  totalFreeMW: number;
  averageConfidence: number;
  sites: EnhancedVerifiedSite[];
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeDeleted: boolean;
  filters: Partial<AdvancedFilters>;
  fields: string[];
}
