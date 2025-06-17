
export interface FreeDataRequest {
  source: 'county_records' | 'google_places' | 'yelp' | 'openstreetmap' | 'census' | 'auction_com' | 'biggerpockets' | 'public_auctions';
  location: string;
  property_type?: string;
  radius?: number;
}

export interface PropertyData {
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  property_type: string;
  source: string;
  listing_url?: string;
  description?: string;
  square_footage?: number;
  asking_price?: number;
  lot_size_acres?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  auction_date?: string;
  auction_type?: string;
  roi_estimate?: number;
  census_data?: {
    industry: string;
    employees: number;
    establishments: number;
  };
}

export interface ScrapingResponse {
  properties: PropertyData[];
  message: string;
}
