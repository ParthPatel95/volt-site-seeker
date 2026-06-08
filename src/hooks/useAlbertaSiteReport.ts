import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CarrierPop {
  id: string;
  carrier: string;
  facility_name: string;
  address: string | null;
  city: string;
  lat: number;
  lng: number;
  services: string[];
  latency_to_yyc_ms: number | null;
  latency_to_yeg_ms: number | null;
  latency_to_sea_ms: number | null;
  latency_to_ord_ms: number | null;
  source_url: string | null;
  distance_km?: number;
}

export interface LineFeature {
  id: string;
  name?: string;
  route_name?: string;
  carrier?: string;
  operator?: string;
  owner?: string;
  voltage_kv?: number;
  diameter_mm?: number;
  pressure_kpa?: number;
  route_type?: string;
  lit_dark?: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  source_url: string | null;
  distance_km?: number;
}

export interface PointFeature {
  id: string;
  name: string;
  type?: string;
  municipality?: string;
  lat: number;
  lng: number;
  notes?: string | null;
  available_power_mw?: number | null;
  zoning?: string | null;
  source_url: string | null;
  distance_km?: number;
}

export interface SiteReport {
  generated_at: string;
  location: { lat: number; lng: number; label: string | null };
  hyperscaler_score: {
    total: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    breakdown: Record<'fiber'|'power'|'climate'|'water'|'risk'|'sustainability'|'logistics', { score: number; max: number; detail: string }>;
  };
  methodology: Record<string, any>;
  fiber: {
    score: {
      total: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      breakdown: Record<'proximity' | 'carrier_diversity' | 'route_diversity' | 'latency', {
        score: number; max: number; detail: string;
      }>;
    };
    top_routes: Array<{
      rank: number; carrier: string; pop: string; pop_city: string;
      site_to_pop_km: number; hub: string; latency_ms: number | null; composite: number;
    }>;
    nearest_pops: CarrierPop[];
    nearest_long_haul_routes: LineFeature[];
    nearest_ixps: Array<{ id: string; name: string; city: string; lat: number; lng: number; participant_count: number | null; peak_traffic_gbps: number | null; source_url: string | null; distance_km?: number }>;
    cloud_reach: Array<{ provider: string; region_code: string; region_name: string; distance_km: number; modeled_latency_ms_one_way: number; source_url: string | null }>;
    peering_hubs: { code: string; name: string; lat: number; lng: number }[];
  };
  transmission: {
    nearest_lines: LineFeature[];
    nearest_substations: any[];
  };
  gas_and_water: {
    nearest_gas_pipelines: LineFeature[];
    nearest_water_sources: PointFeature[];
    nearest_water_licences: Array<{ id: string; licensee: string; source_water_body: string; lat: number; lng: number; licensed_m3_per_year: number | null; purpose: string | null; sub_basin: string | null; allocation_status: string | null; source_url: string | null; distance_km?: number }>;
  };
  climate: null | {
    station_name: string; station_id: string;
    mean_annual_dry_bulb_c: number | null;
    ashrae_04_design_db_c: number | null;
    ashrae_1_design_db_c: number | null;
    ashrae_04_mcwb_c: number | null;
    free_cooling_hours_below_18c: number | null;
    free_cooling_hours_below_10c: number | null;
    evap_hours_above_24c: number | null;
    ashrae_climate_zone: string | null;
    source_url: string | null;
    source_publisher: string | null;
    source_as_of: string | null;
  };
  risk: null | {
    region_name: string;
    seismic_pga_g: number | null; seismic_sa02_g: number | null;
    seismic_rating: string | null; wildfire_rating: string | null;
    flood_rating: string | null; tornado_rating: string | null;
    source_url: string | null; source_publisher: string | null;
  };
  sustainability: {
    generation_mix: Record<string, { mw: number; count: number }>;
    renewable_share_pct: number;
    nearby_generation: Array<{ id: string; asset_name: string; fuel_type: string; capacity_mw: number; operator: string | null; status: string; lat: number; lng: number; ppa_available: boolean; source_url: string | null; distance_km?: number }>;
    ppa_candidates: any[];
  };
  jurisdiction: null | {
    municipality: string;
    non_residential_mill_rate: number | null;
    machinery_equipment_mill_rate: number | null;
    incentive_summary: string | null;
    source_url: string | null; source_publisher: string | null;
  };
  logistics: {
    nearest_industrial_parks: PointFeature[];
    nearest_logistics_assets: Array<{ id: string; asset_type: string; name: string; operator: string | null; lat: number; lng: number; notes: string | null; source_url: string | null; distance_km?: number }>;
    nearest_population_centres: Array<{ id: string; name: string; population_2021: number; labour_force_2021: number | null; trades_workers_estimate: number | null; source_url: string | null; distance_km?: number }>;
    drive_times: { hub: string; code: string; distance_km: number; drive_hours_est: number }[];
  };
  workforce?: {
    nearest_centres: Array<{ id: string; centre_name: string; labour_force: number | null; unemployment_rate: number | null; pct_post_secondary: number | null; electricians_count: number | null; hvac_techs_count: number | null; it_workers_count: number | null; median_wage_electrician: number | null; median_wage_it: number | null; source_url: string | null; last_verified: string | null; distance_km?: number }>;
    post_secondary_within_200km: Array<{ id: string; institution_name: string; city: string | null; program_focus: string[] | null; annual_grads_relevant: number | null; source_url: string | null; distance_km?: number }>;
  };
  construction?: {
    epc_firms: Array<{ id: string; firm_name: string; hq_city: string | null; mega_project_capable: boolean; union_status: string | null; recent_projects: any; source_url: string | null }>;
    union_vs_open_wages: Array<{ id: string; trade: string; union_rate_cad_hr: number | null; open_shop_rate_cad_hr: number | null; benefits_loading_pct: number | null; source_url: string | null }>;
  };
  regulatory?: {
    nearest_zone: null | { id: string; municipality: string; mill_rate_non_residential: number | null; machinery_equipment_exempt: boolean | null; school_tax_rate: number | null; aer_region: string | null; auc_typical_permit_weeks: number | null; indigenous_consultation_required: boolean | null; treaty_area: string | null; source_url: string | null; distance_km?: number };
  };
  connectivity_depth?: {
    carrier_pop_details: Array<{ id: string; facility_name: string; city: string | null; facility_type: string | null; open_access: boolean | null; cross_connect_fee_estimate_cad: number | null; building_owner: string | null; carriers_on_net: string[] | null; source_url: string | null; distance_km?: number }>;
    last_mile_in_municipality: null | { id: string; population_centre: string; providers: Array<{ name: string; max_speed_gbps: number; technology: string }>; source_url: string | null; distance_km?: number };
    dark_fiber_segments_nearby: Array<{ id: string; segment_name: string; owner: string | null; lit_or_dark: string | null; conduit_owner: string | null; ifa_count_estimate: number | null; source_url: string | null; distance_km?: number }>;
  };
  data_provenance: { sources: string[]; notes: string };
}

export function useAlbertaLayers() {
  return useQuery({
    queryKey: ['alberta-layers'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [pops, fiber, trans, gas, water, parks] = await Promise.all([
        supabase.from('alberta_carrier_pops').select('*'),
        supabase.from('alberta_fiber_routes').select('*'),
        supabase.from('alberta_transmission_lines').select('*'),
        supabase.from('alberta_gas_pipelines').select('*'),
        supabase.from('alberta_water_sources').select('*'),
        supabase.from('alberta_industrial_parks').select('*'),
      ]);
      return {
        pops: pops.data ?? [],
        fiber: fiber.data ?? [],
        transmission: trans.data ?? [],
        gas: gas.data ?? [],
        water: water.data ?? [],
        parks: parks.data ?? [],
      };
    },
  });
}

export function useGenerateSiteReport() {
  return useMutation({
    mutationFn: async (input: { lat: number; lng: number; label?: string }) => {
      const { data, error } = await supabase.functions.invoke<{ report: SiteReport }>('alberta-site-report', {
        body: input,
      });
      if (error) throw error;
      if (!data?.report) throw new Error('No report returned');
      return data.report;
    },
  });
}