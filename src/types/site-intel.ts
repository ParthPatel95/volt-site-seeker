// Response shapes for Site Intelligence edge functions.
// Keep these in sync with:
//   supabase/functions/osm-power-infrastructure/index.ts
//   supabase/functions/site-asset-vision/index.ts
//
// Nullable everywhere — these come from public OSM tags / external imagery and
// missing values are surfaced as null rather than invented.

export type VoltageClass = '≥240 kV' | '138–230 kV' | '69–138 kV' | '<69 kV';

export interface OsmSubstation {
  osm_id: string;
  osm_type: string;
  power: string;
  name: string | null;
  operator: string | null;
  voltage_raw: string | null;
  voltages_kv: number[];
  max_kv: number | null;
  voltage_class: VoltageClass | null;
  substation_type: string | null;
  frequency: string | null;
  location: string | null;
  gas_insulated: string | null;
  ref: string | null;
  start_date: string | null;
  wikidata: string | null;
  wikipedia: string | null;
  lat: number;
  lng: number;
  distance_km: number;
  bearing_deg: number;
  source_url: string;
  openinframap_url: string;
}

export interface OsmPowerLine {
  osm_id: string;
  osm_type: string;
  power: string;
  name: string | null;
  operator: string | null;
  voltage_raw: string | null;
  voltages_kv: number[];
  max_kv: number | null;
  voltage_class: VoltageClass | null;
  cables: string | null;
  circuits: string | null;
  wires: string | null;
  location: string | null;
  frequency: string | null;
  distance_km: number;
  centroid_distance_km: number;
  bearing_deg: number;
  source_url: string;
  openinframap_url: string;
}

export interface OsmGenerationAsset {
  osm_id: string;
  osm_type: string;
  power: string;
  name: string | null;
  operator: string | null;
  source: string | null;
  method: string | null;
  output_mw: number | null;
  output_raw: string | null;
  start_date: string | null;
  lat: number;
  lng: number;
  distance_km: number;
  bearing_deg: number;
  source_url: string;
  openinframap_url: string;
}

export interface OsmVoltageProfileBucket {
  bucket: VoltageClass;
  substations: number;
  lines: number;
  total: number;
  nearest_substation_km: number | null;
  nearest_line_km: number | null;
  nearest_substation_name: string | null;
}

export interface OsmBearingDialSector {
  sector: number;
  angle_from: number;
  angle_to: number;
  count: number;
}

export interface OsmDistanceDecay {
  nearest_km: number | null;
  median_km: number | null;
  p90_km: number | null;
  count: number;
}

export interface OsmInterconnectCandidate extends OsmSubstation {
  score: number;
  rationale: string;
}

export interface OsmPowerResponse {
  lat: number;
  lng: number;
  radius_m: number;
  queried_at: string;
  source: string;
  attribution: string;
  substations: OsmSubstation[];
  generation: OsmGenerationAsset[];
  power_lines: OsmPowerLine[];
  counts: {
    substations: number;
    transmission_substations: number;
    distribution_substations: number;
    generation: number;
    power_lines: number;
  };
  summary: {
    max_voltage_kv: number | null;
    nearest_substation_km: number | null;
    nearest_transmission_substation: {
      name: string | null;
      distance_km: number;
      max_kv: number | null;
      operator: string | null;
      bearing_deg: number;
    } | null;
    nearest_distribution_substation: {
      name: string | null;
      distance_km: number;
      max_kv: number | null;
      operator: string | null;
      bearing_deg: number;
    } | null;
    nearest_line_km: number | null;
    total_generation_mw: number | null;
    data_completeness_pct: number;
  };
  voltage_profile: OsmVoltageProfileBucket[];
  bearing_dial: OsmBearingDialSector[];
  distance_decay: {
    transmission_substations: OsmDistanceDecay;
    distribution_substations: OsmDistanceDecay;
    power_lines: OsmDistanceDecay;
    generation: OsmDistanceDecay;
  };
  interconnect_candidates: OsmInterconnectCandidate[];
  error?: string;
}

// site-asset-vision response shape (Google Static Maps + Gemini analysis).
export type SiteAssetDetectionType =
  | 'substation'
  | 'transmission_line'
  | 'gas_regulator'
  | 'distribution_pole'
  | 'industrial_facility'
  | 'storage_tank'
  | 'solar_array'
  | 'wind_turbine'
  | 'other';

export interface SiteAssetDetection {
  type: SiteAssetDetectionType;
  label: string;
  confidence: 'high' | 'medium' | 'low';
  approx_bearing_deg: number | null;
  approx_distance_m: number | null;
  notes: string;
}

export interface SiteAssetVisionResponse {
  lat: number;
  lng: number;
  zoom: number;
  analyzed_at: string;
  image_quality: 'good' | 'cloudy' | 'low_detail';
  summary: string;
  detections: SiteAssetDetection[];
  error?: string;
}
