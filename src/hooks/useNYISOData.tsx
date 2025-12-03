import { useQuery } from '@tanstack/react-query';
import { UNIFIED_ENERGY_QUERY_KEY, fetchUnifiedEnergyData } from '@/hooks/useUnifiedEnergyData';

export interface NYISOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  source: string;
}

export interface NYISOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  timestamp: string;
  source: string;
}

export interface NYISOGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  nuclear_mw: number;
  hydro_mw: number;
  wind_mw: number;
  solar_mw: number;
  coal_mw: number;
  other_mw: number;
  renewable_percentage: number;
  timestamp: string;
  source: string;
}

export const useNYISOData = () => {
  const { data, isLoading, refetch: queryRefetch } = useQuery({
    queryKey: UNIFIED_ENERGY_QUERY_KEY,
    queryFn: fetchUnifiedEnergyData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const nyisoData = data?.nyiso;

  const refetch = async () => {
    await queryRefetch();
  };

  return {
    pricing: nyisoData?.pricing as NYISOPricing | undefined,
    loadData: nyisoData?.loadData as NYISOLoadData | undefined,
    generationMix: nyisoData?.generationMix as NYISOGenerationMix | undefined,
    loading: isLoading,
    refetch
  };
};
