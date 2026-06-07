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
    peering_hubs: { code: string; name: string; lat: number; lng: number }[];
  };
  transmission: {
    nearest_lines: LineFeature[];
    nearest_substations: any[];
  };
  gas_and_water: {
    nearest_gas_pipelines: LineFeature[];
    nearest_water_sources: PointFeature[];
  };
  logistics: {
    nearest_industrial_parks: PointFeature[];
    drive_times: { hub: string; code: string; distance_km: number; drive_hours_est: number }[];
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