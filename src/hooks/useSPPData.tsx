import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SPPPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  source: string;
}

export interface SPPLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  timestamp: string;
  source: string;
}

export interface SPPGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  coal_mw: number;
  wind_mw: number;
  nuclear_mw: number;
  solar_mw: number;
  hydro_mw: number;
  other_mw: number;
  renewable_percentage: number;
  timestamp: string;
  source: string;
}

export const useSPPData = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['spp-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('energy-data-integration');
      
      if (error) {
        console.error('Error fetching SPP data:', error);
        throw error;
      }
      
      return data?.spp || null;
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  return {
    pricing: data?.pricing as SPPPricing | undefined,
    loadData: data?.loadData as SPPLoadData | undefined,
    generationMix: data?.generationMix as SPPGenerationMix | undefined,
    loading: isLoading,
    refetch
  };
};
