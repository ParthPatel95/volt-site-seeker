import { useMemo } from 'react';
import { useERCOTData } from '@/hooks/useERCOTData';
import { useAESOData } from '@/hooks/useAESOData';
import { useMISOData } from '@/hooks/useMISOData';
import { useCAISOData } from '@/hooks/useCAISOData';
import { useNYISOData } from '@/hooks/useNYISOData';
import { usePJMData } from '@/hooks/usePJMData';
import { useSPPData } from '@/hooks/useSPPData';
import { useIESOData } from '@/hooks/useIESOData';

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

  const { 
    pricing: caisoPricing, 
    loadData: caisoLoad, 
    generationMix: caisoGeneration,
    loading: caisoLoading,
    refetch: refetchCAISO
  } = useCAISOData();

  const { 
    pricing: nyisoPricing, 
    loadData: nyisoLoad, 
    generationMix: nyisoGeneration,
    loading: nyisoLoading,
    refetch: refetchNYISO
  } = useNYISOData();

  const { 
    pricing: pjmPricing, 
    loadData: pjmLoad, 
    generationMix: pjmGeneration,
    loading: pjmLoading,
    refetch: refetchPJM
  } = usePJMData();

  const { 
    pricing: sppPricing, 
    loadData: sppLoad, 
    generationMix: sppGeneration,
    loading: sppLoading,
    isUnavailable: sppUnavailable,
    refetch: refetchSPP
  } = useSPPData();

  const { 
    pricing: iesoPricing, 
    loadData: iesoLoad, 
    generationMix: iesoGeneration,
    loading: iesoLoading,
    isUnavailable: iesoUnavailable,
    refetch: refetchIESO
  } = useIESOData();

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
      misoTrend: misoPricing ? getMarketTrend(misoPricing.current_price, misoPricing.average_price) : null,
      caisoTrend: caisoPricing ? getMarketTrend(caisoPricing.current_price, caisoPricing.average_price) : null,
      nyisoTrend: nyisoPricing ? getMarketTrend(nyisoPricing.current_price, nyisoPricing.average_price) : null,
      pjmTrend: pjmPricing ? getMarketTrend(pjmPricing.current_price, pjmPricing.average_price) : null,
      sppTrend: sppPricing ? getMarketTrend(sppPricing.current_price, sppPricing.average_price) : null,
      iesoTrend: iesoPricing ? getMarketTrend(iesoPricing.current_price, iesoPricing.average_price) : null
    };
  }, [ercotPricing, aesoPricing, misoPricing, caisoPricing, nyisoPricing, pjmPricing, sppPricing, iesoPricing]);

  const refreshData = async () => {
    await Promise.all([
      refetchERCOT(), 
      refetchAESO(), 
      refetchMISO(), 
      refetchCAISO(), 
      refetchNYISO(), 
      refetchPJM(), 
      refetchSPP(),
      refetchIESO()
    ]);
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
    caisoPricing,
    caisoLoad,
    caisoGeneration,
    nyisoPricing,
    nyisoLoad,
    nyisoGeneration,
    pjmPricing,
    pjmLoad,
    pjmGeneration,
    sppPricing,
    sppLoad,
    sppGeneration,
    sppUnavailable,
    iesoPricing,
    iesoLoad,
    iesoGeneration,
    iesoUnavailable,
    isLoading: ercotLoading || aesoLoading || misoLoading || caisoLoading || nyisoLoading || pjmLoading || (sppLoading && !sppUnavailable) || (iesoLoading && !iesoUnavailable),
    marketMetrics,
    refreshData
  };
};