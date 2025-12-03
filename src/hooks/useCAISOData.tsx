import { useQuery } from '@tanstack/react-query';
import { UNIFIED_ENERGY_QUERY_KEY, fetchUnifiedEnergyData } from '@/hooks/useUnifiedEnergyData';

export interface CAISOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  source: string;
}

export interface CAISOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  timestamp: string;
  source: string;
}

export interface CAISOGenerationMix {
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

export const useCAISOData = () => {
  const { data, isLoading, refetch: queryRefetch } = useQuery({
    queryKey: UNIFIED_ENERGY_QUERY_KEY,
    queryFn: fetchUnifiedEnergyData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const caisoData = data?.caiso;

  const refetch = async () => {
    await queryRefetch();
  };

  return {
    pricing: caisoData?.pricing as CAISOPricing | undefined,
    loadData: caisoData?.loadData as CAISOLoadData | undefined,
    generationMix: caisoData?.generationMix as CAISOGenerationMix | undefined,
    loading: isLoading,
    refetch
  };
};
