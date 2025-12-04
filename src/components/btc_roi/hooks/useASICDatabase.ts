import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ASICMiner {
  id: string;
  manufacturer: string;
  model: string;
  hashrate_th: number;
  power_watts: number;
  efficiency_jth: number;
  cooling_type: 'air' | 'hydro' | 'immersion';
  release_date: string | null;
  msrp_usd: number | null;
  market_price_usd: number | null;
  algorithm: string;
  is_available: boolean;
  generation: 'current' | 'previous';
  notes: string | null;
}

export type CoolingType = 'all' | 'air' | 'hydro' | 'immersion';
export type Manufacturer = 'all' | 'Bitmain' | 'MicroBT' | 'Canaan' | 'Bitdeer' | 'iPollo';
export type SortBy = 'hashrate' | 'efficiency' | 'price' | 'power';

interface UseASICDatabaseOptions {
  manufacturer?: Manufacturer;
  coolingType?: CoolingType;
  generation?: 'all' | 'current' | 'previous';
  sortBy?: SortBy;
  searchQuery?: string;
}

export const useASICDatabase = (options: UseASICDatabaseOptions = {}) => {
  const {
    manufacturer = 'all',
    coolingType = 'all',
    generation = 'all',
    sortBy = 'hashrate',
    searchQuery = ''
  } = options;

  const { data: asics = [], isLoading, error, refetch } = useQuery({
    queryKey: ['asic-miners', manufacturer, coolingType, generation],
    queryFn: async () => {
      let query = supabase
        .from('asic_miners')
        .select('*')
        .eq('is_available', true);

      if (manufacturer !== 'all') {
        query = query.eq('manufacturer', manufacturer);
      }

      if (coolingType !== 'all') {
        query = query.eq('cooling_type', coolingType);
      }

      if (generation !== 'all') {
        query = query.eq('generation', generation);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ASICMiner[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Filter by search query
  const filteredASICs = asics.filter(asic => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      asic.model.toLowerCase().includes(search) ||
      asic.manufacturer.toLowerCase().includes(search)
    );
  });

  // Sort ASICs
  const sortedASICs = [...filteredASICs].sort((a, b) => {
    switch (sortBy) {
      case 'hashrate':
        return b.hashrate_th - a.hashrate_th;
      case 'efficiency':
        return a.efficiency_jth - b.efficiency_jth;
      case 'price':
        return (a.market_price_usd || 0) - (b.market_price_usd || 0);
      case 'power':
        return a.power_watts - b.power_watts;
      default:
        return 0;
    }
  });

  // Get unique manufacturers from data
  const manufacturers = [...new Set(asics.map(a => a.manufacturer))];

  return {
    asics: sortedASICs,
    allASICs: asics,
    manufacturers,
    isLoading,
    error,
    refetch
  };
};
