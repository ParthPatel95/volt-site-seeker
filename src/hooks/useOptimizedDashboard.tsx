import { useMemo } from 'react';
import { useERCOTData } from '@/hooks/useERCOTData';
import { useAESOData } from '@/hooks/useAESOData';
import { useMISOData } from '@/hooks/useMISOData';

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

  const { 
    pricing: misoPricing, 
    loadData: misoLoad, 
    generationMix: misoGeneration,
    loading: misoLoading,
    refetch: refetchMISO
  } = useMISOData();

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
      aesoTrend: aesoPricing ? getMarketTrend(aesoPricing.current_price, aesoPricing.average_price) : null,
      misoTrend: misoPricing ? getMarketTrend(misoPricing.current_price, misoPricing.average_price) : null
    };
  }, [ercotPricing, aesoPricing, misoPricing]);

  const refreshData = async () => {
    await Promise.all([refetchERCOT(), refetchAESO(), refetchMISO()]);
  };

  return {
    ercotPricing,
    ercotLoad,
    ercotGeneration,
    aesoPricing,
    aesoLoad,
    aesoGeneration,
    misoPricing,
    misoLoad,
    misoGeneration,
    isLoading: ercotLoading || aesoLoading || misoLoading,
    marketMetrics,
    refreshData
  };
};