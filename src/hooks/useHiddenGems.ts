import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  rankHiddenGems,
  type FacilityRow,
  type GemContext,
  type GemFilters,
  type ScoredGem,
} from '@/lib/hidden-gems';

// industrial_facilities / gem_listings are newer than the generated Database
// types; cast the client for those tables until Lovable regenerates
// src/integrations/supabase/types.ts.
const untyped = supabase as unknown as {
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const EMPTY_SEGMENTS: GemContext['transmissionLines'] = [];
const EMPTY_POINTS: GemContext['waterSources'] = [];

async function fetchGemInputs(): Promise<{
  facilities: FacilityRow[];
  ctxByState: Record<string, GemContext>;
}> {
  const [facilities, subs, lines, gas, fiber, water] = await Promise.all([
    untyped.from('industrial_facilities').select('*'),
    supabase
      .from('substations')
      .select('name, state, latitude, longitude, voltage_level, capacity_mva, utility_owner')
      .in('state', ['AB', 'TX']),
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

  const allSubs = (subs.data ?? []) as Array<GemContext['substations'][number] & { state: string }>;

  // Alberta has the full curated layer set; Texas currently has substations
  // only — its gas/water/fiber factors score 0 (shown as '—'), they are not
  // backfilled with invented proximity.
  const ctxByState: Record<string, GemContext> = {
    AB: {
      substations: allSubs.filter((s) => s.state === 'AB'),
      transmissionLines: (lines.data ?? []) as GemContext['transmissionLines'],
      gasPipelines: (gas.data ?? []) as GemContext['gasPipelines'],
      fiberRoutes: (fiber.data ?? []) as GemContext['fiberRoutes'],
      waterSources: (water.data ?? []) as GemContext['waterSources'],
    },
    TX: {
      substations: allSubs.filter((s) => s.state === 'TX'),
      transmissionLines: EMPTY_SEGMENTS,
      gasPipelines: EMPTY_SEGMENTS,
      fiberRoutes: EMPTY_SEGMENTS,
      waterSources: EMPTY_POINTS,
    },
  };

  return {
    facilities: (facilities.data ?? []) as unknown as FacilityRow[],
    ctxByState,
  };
}

export function useHiddenGems(filters: GemFilters = {}) {
  const query = useQuery({
    queryKey: ['hidden-gems-inputs'],
    queryFn: fetchGemInputs,
    staleTime: 5 * 60 * 1000,
  });

  // Ranking is cheap (tens of rows × simple math) — recompute per render
  // from cached inputs so filter changes don't refetch. Facilities are scored
  // against their own state's curated context.
  let gems: ScoredGem[] = [];
  if (query.data) {
    const { facilities, ctxByState } = query.data;
    const byState = new Map<string, FacilityRow[]>();
    for (const f of facilities) {
      const st = f.state ?? 'AB';
      if (!byState.has(st)) byState.set(st, []);
      byState.get(st)!.push(f);
    }
    for (const [st, rows] of byState) {
      const ctx = ctxByState[st] ?? ctxByState.AB;
      gems.push(...rankHiddenGems(rows, ctx, filters));
    }
    gems = gems.sort((a, b) => b.total - a.total);
  }

  return {
    gems,
    ctxByState: query.data?.ctxByState ?? null,
    totalFacilities: query.data?.facilities.length ?? 0,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Scraped listing signals
// ────────────────────────────────────────────────────────────────────────────

export interface GemListing {
  id: string;
  listing_url: string;
  title: string | null;
  description_excerpt: string | null;
  price_text: string | null;
  address_text: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  gem_signals: string[];
  signal_score: number;
  search_query: string | null;
  source: string;
  scraped_at: string;
}

export function useGemListings() {
  const queryClient = useQueryClient();

  const listings = useQuery({
    queryKey: ['gem-listings'],
    queryFn: async () => {
      const { data, error } = await untyped
        .from('gem_listings')
        .select('*')
        .order('signal_score', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as GemListing[];
    },
    staleTime: 60 * 1000,
  });

  const scan = useMutation({
    mutationFn: async (region: 'alberta' | 'texas' | 'both') => {
      const { data, error } = await supabase.functions.invoke('gem-listing-scanner', {
        body: { region },
      });
      if (error) throw error;
      if (data?.success === false) throw new Error(data.error ?? 'Listing scan failed');
      return data as {
        queries_run: number;
        results_scanned: number;
        listings_stored: number;
        errors?: string[];
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gem-listings'] });
    },
  });

  return {
    listings: listings.data ?? [],
    isLoading: listings.isLoading,
    error: listings.error as Error | null,
    scan,
  };
}
