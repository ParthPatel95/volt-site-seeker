
export interface ScrapeRequest {
  location?: string;
  property_type?: string;
  budget_range?: string;
  power_requirements?: string;
  sources?: string[];
  test_mode?: boolean;
}

export interface BrokerageSite {
  name: string;
  id: string;
  baseUrl: string;
  searchPath: string;
  selectors: {
    listings: string;
    address: string;
    price: string;
    sqft: string;
    type: string;
  };
  strategy: string;
}

export interface ScrapingResult {
  site: string;
  properties_found: number;
  success: boolean;
  status: string;
  error?: string;
}
