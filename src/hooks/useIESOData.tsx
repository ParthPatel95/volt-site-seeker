import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IESOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  source: string;
}

export interface IESOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  timestamp: string;
  source: string;
}

export interface IESOGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  nuclear_mw: number;
  hydro_mw: number;
  wind_mw: number;
  solar_mw: number;
  biofuel_mw: number;
  other_mw: number;
  renewable_percentage: number;
  timestamp: string;
  source: string;
}

export const useIESOData = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ieso-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('energy-data-integration');
      
      if (error) {
        console.error('Error fetching IESO data:', error);
        throw error;
      }
      
      return data?.ieso || null;
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const isUnavailable = !isLoading && data === null;

  return {
    pricing: data?.pricing as IESOPricing | undefined,
    loadData: data?.loadData as IESOLoadData | undefined,
    generationMix: data?.generationMix as IESOGenerationMix | undefined,
    loading: isLoading,
    isUnavailable,
    refetch
  };
};
