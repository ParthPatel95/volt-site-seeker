
export interface FinderResult {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  confidence_score: number;
  source: string;
  voltage_level: string;
  capacity_estimate: string;
  utility_owner?: string;
  validation_status: 'pending' | 'confirmed' | 'rejected';
  infrastructure_features: string[];
  discovery_method: string;
  rate_estimation?: {
    estimated_rate_per_kwh: number;
    demand_charge_per_kw: number;
    monthly_cost_estimate: number;
    annual_cost_estimate: number;
    rate_tier: string;
    utility_market: string;
  };
}

export interface SearchStats {
  total_found: number;
  regulatory_sources: number;
  satellite_detections: number;
  validated_locations: number;
  high_confidence: number;
}

export interface StoredSubstation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity_mva: number;
  voltage_level: string;
  utility_owner: string;
  city: string;
  state: string;
  status: string;
  coordinates_source: string;
  created_at: string;
  updated_at: string;
  commissioning_date?: string;
  upgrade_potential?: number;
  interconnection_type: string;
  load_factor: number;
}

export const TEXAS_CITIES = [
  'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso',
  'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Laredo', 'Irving',
  'Garland', 'Frisco', 'McKinney', 'Grand Prairie', 'Amarillo', 'Mesquite',
  'Killeen', 'Brownsville', 'Pasadena', 'McAllen', 'Carrollton', 'Beaumont',
  'Abilene', 'Round Rock', 'Richardson', 'Waco', 'Denton', 'Midland',
  'Odessa', 'Lewisville', 'Tyler', 'College Station', 'Pearland', 'Sugar Land'
];

export const ALBERTA_CITIES = [
  'Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat',
  'Grande Prairie', 'Airdrie', 'Spruce Grove', 'Okotoks', 'Lloydminster',
  'Camrose', 'Brooks', 'Cold Lake', 'Wetaskiwin', 'Leduc', 'Fort Saskatchewan',
  'Stony Plain', 'Cochrane', 'Lacombe', 'Taber', 'Whitecourt', 'High River',
  'Hinton', 'Canmore', 'Sylvan Lake', 'Innisfail', 'Blackfalds', 'Didsbury',
  'Olds', 'Slave Lake', 'Drayton Valley', 'Sundre', 'Athabasca'
];
