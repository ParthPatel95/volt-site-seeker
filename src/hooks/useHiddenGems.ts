import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  rankHiddenGems,
  type FacilityRow,
  type GemContext,
  type GemFilters,
  type ScoredGem,
} from '@/lib/hidden-gems';

// industrial_facilities is newer than the generated Database types; cast the
// client for that one table until Lovable regenerates
// src/integrations/supabase/types.ts.
const untyped = supabase as unknown as {
  from: (table: string) => ReturnType<typeof supabase.from>;
};

async function fetchGemInputs(): Promise<{ facilities: FacilityRow[]; ctx: GemContext }> {
  const [facilities, subs, lines, gas, fiber, water] = await Promise.all([
    untyped.from('industrial_facilities').select('*'),
    supabase
      .from('substations')
      .select('name, latitude, longitude, voltage_level, capacity_mva, utility_owner')
      .eq('state', 'AB'),
    supabase
      .from('alberta_transmission_lines')
      .select('name, voltage_kv, start_lat, start_lng, end_lat, end_lng'),
    supabase
      .from('alberta_gas_pipelines')
      .select('name, start_lat, start_lng, end_lat, end_lng'),
    supabase
      .from('alberta_fiber_routes')
      .select('route_name, start_lat, start_lng, end_lat, end_lng'),
    supabase.from('alberta_water_sources').select('name, lat, lng'),
  ]);

  const firstError =
    facilities.error ?? subs.error ?? lines.error ?? gas.error ?? fiber.error ?? water.error;
  if (firstError) throw firstError;

  return {
    facilities: (facilities.data ?? []) as unknown as FacilityRow[],
    ctx: {
      substations: subs.data ?? [],
      transmissionLines: (lines.data ?? []) as GemContext['transmissionLines'],
      gasPipelines: (gas.data ?? []) as GemContext['gasPipelines'],
      fiberRoutes: (fiber.data ?? []) as GemContext['fiberRoutes'],
      waterSources: (water.data ?? []) as GemContext['waterSources'],
    },
  };
}

export function useHiddenGems(filters: GemFilters = {}) {
  const query = useQuery({
    queryKey: ['hidden-gems-inputs'],
    queryFn: fetchGemInputs,
    staleTime: 5 * 60 * 1000,
  });

  // Ranking is cheap (tens of rows × simple math) — recompute per render
  // from cached inputs so filter changes don't refetch.
  const gems: ScoredGem[] = query.data
    ? rankHiddenGems(query.data.facilities, query.data.ctx, filters)
    : [];

  return {
    gems,
    totalFacilities: query.data?.facilities.length ?? 0,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
