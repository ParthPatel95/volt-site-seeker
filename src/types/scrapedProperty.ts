
export interface ScrapedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  property_type: string;
  square_footage?: number;
  lot_size_acres?: number;
  asking_price?: number;
  price_per_sqft?: number;
  year_built?: number;
  power_capacity_mw?: number;
  substation_distance_miles?: number;
  transmission_access: boolean;
  zoning?: string;
  description?: string;
  listing_url?: string;
  source: string;
  scraped_at: string;
  moved_to_properties: boolean;
  ai_analysis?: any;
}
