import { useMemo } from 'react';
import { useUnifiedEnergyData } from '@/hooks/useUnifiedEnergyData';

// Helper to synthesize AESO pricing from load/generation data if missing
const synthesizeAESOPricing = (aesoData: any) => {
  if (aesoData?.pricing) return aesoData.pricing;
  
  const ld = aesoData?.loadData || {};
  const gm = aesoData?.generationMix || {};
  const reserve = typeof ld.reserve_margin === 'number' ? ld.reserve_margin : 12.5;
  const renewPct = typeof gm.renewable_percentage === 'number' ? gm.renewable_percentage : 20;
  const base = 55;
  let estimate = base + (12.5 - reserve) * 2 - (renewPct - 25) * 0.3;
  if (!Number.isFinite(estimate)) estimate = base;
  estimate = Math.max(5, Math.min(250, Math.round(estimate * 100) / 100));
  
  return {
    current_price: estimate,
    average_price: Math.round((estimate * 0.95) * 100) / 100,
    peak_price: Math.round((estimate * 1.8) * 100) / 100,
    off_peak_price: Math.round((estimate * 0.6) * 100) / 100,
    market_conditions: 'estimated',
    timestamp: new Date().toISOString(),
    source: 'aeso_estimated'
  };
};

export const useOptimizedDashboard = () => {
  const { data, isLoading, refetch } = useUnifiedEnergyData();

  // Extract market-specific data from unified response
  const ercotData = data?.ercot;
  const aesoData = data?.aeso;
  const misoData = data?.miso;
  const caisoData = data?.caiso;
  const nyisoData = data?.nyiso;
  const pjmData = data?.pjm;
  const sppData = data?.spp;
  const iesoData = data?.ieso;

  // Extract pricing, load, and generation for each market
  const ercotPricing = ercotData?.pricing;
  const ercotLoad = ercotData?.loadData;
  const ercotGeneration = ercotData?.generationMix;

  const aesoPricing = synthesizeAESOPricing(aesoData);
  const aesoLoad = aesoData?.loadData;
  const aesoGeneration = aesoData?.generationMix;

  const misoPricing = misoData?.pricing;
  const misoLoad = misoData?.loadData;
  const misoGeneration = misoData?.generationMix;

  const caisoPricing = caisoData?.pricing;
  const caisoLoad = caisoData?.loadData;
  const caisoGeneration = caisoData?.generationMix;

  const nyisoPricing = nyisoData?.pricing;
  const nyisoLoad = nyisoData?.loadData;
  const nyisoGeneration = nyisoData?.generationMix;

  const pjmPricing = pjmData?.pricing;
  const pjmLoad = pjmData?.loadData;
  const pjmGeneration = pjmData?.generationMix;

  const sppPricing = sppData?.pricing;
  const sppLoad = sppData?.loadData;
  const sppGeneration = sppData?.generationMix;

  const iesoPricing = iesoData?.pricing;
  const iesoLoad = iesoData?.loadData;
  const iesoGeneration = iesoData?.generationMix;

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
    await refetch();
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
    iesoPricing,
    iesoLoad,
    iesoGeneration,
    isLoading,
    marketMetrics,
    refreshData
  };
};
