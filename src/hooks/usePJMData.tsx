import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PJMPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  source: string;
}

export interface PJMLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  timestamp: string;
  source: string;
}

export interface PJMGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  coal_mw: number;
  nuclear_mw: number;
  wind_mw: number;
  solar_mw: number;
  hydro_mw: number;
  other_mw: number;
  renewable_percentage: number;
  timestamp: string;
  source: string;
}

export const usePJMData = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pjm-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('energy-data-integration');
      
      if (error) {
        console.error('Error fetching PJM data:', error);
        throw error;
      }
      
      return data?.pjm || null;
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  return {
    pricing: data?.pricing as PJMPricing | undefined,
    loadData: data?.loadData as PJMLoadData | undefined,
    generationMix: data?.generationMix as PJMGenerationMix | undefined,
    loading: isLoading,
    refetch
  };
};
