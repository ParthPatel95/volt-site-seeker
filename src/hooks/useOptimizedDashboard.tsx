import { useMemo } from 'react';
import { useERCOTData } from '@/hooks/useERCOTData';
import { useAESOData } from '@/hooks/useAESOData';

export const useOptimizedDashboard = () => {
  const { 
    pricing: ercotPricing, 
    loadData: ercotLoad, 
    generationMix: ercotGeneration,
    loading: ercotLoading,
    refetch: refetchERCOT
  } = useERCOTData();

  const { 
    pricing: aesoPricing, 
    loadData: aesoLoad, 
    generationMix: aesoGeneration,
    loading: aesoLoading,
    refetch: refetchAESO
  } = useAESOData();

  // Memoize expensive calculations
  const marketMetrics = useMemo(() => {
    const getMarketTrend = (current: number, average: number) => {
      const diff = ((current - average) / average) * 100;
      return {
        direction: diff > 0 ? 'up' : 'down',
        percentage: Math.abs(diff).toFixed(1),
        isPositive: diff <= 0
      };
    };

    return {
      ercotTrend: ercotPricing ? getMarketTrend(ercotPricing.current_price, ercotPricing.average_price) : null,
      aesoTrend: aesoPricing ? getMarketTrend(aesoPricing.current_price, aesoPricing.average_price) : null
    };
  }, [ercotPricing, aesoPricing]);

  const refreshData = async () => {
    await Promise.all([refetchERCOT(), refetchAESO()]);
  };

  return {
    ercotPricing,
    ercotLoad,
    ercotGeneration,
    aesoPricing,
    aesoLoad,
    aesoGeneration,
    isLoading: ercotLoading || aesoLoading,
    marketMetrics,
    refreshData
  };
};