import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MISOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  source: string;
}

export interface MISOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  timestamp: string;
  source: string;
}

export interface MISOGenerationMix {
  total_generation_mw: number;
  coal_mw: number;
  natural_gas_mw: number;
  nuclear_mw: number;
  wind_mw: number;
  solar_mw: number;
  hydro_mw: number;
  other_mw: number;
  renewable_percentage: number;
  timestamp: string;
  source: string;
}

export const useMISOData = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['miso-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('energy-data-integration');
      
      if (error) {
        console.error('Error fetching MISO data:', error);
        throw error;
      }
      
      return data?.miso || null;
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });

  return {
    pricing: data?.pricing as MISOPricing | undefined,
    loadData: data?.loadData as MISOLoadData | undefined,
    generationMix: data?.generationMix as MISOGenerationMix | undefined,
    loading: isLoading,
    refetch
  };
};
