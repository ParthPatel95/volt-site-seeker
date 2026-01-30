import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetalPrice } from '../components/MetalsMarketTicker';

export interface AllMetalPricesResult {
  metals: MetalPrice[];
  isLoading: boolean;
  error: string | null;
  source: 'live' | 'cached' | 'default';
  lastUpdated: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

interface SpotPrices {
  gold?: number;
  silver?: number;
  platinum?: number;
  palladium?: number;
  copper?: number;
  aluminum?: number;
  iron?: number;
  nickel?: number;
}

interface FluctuationData {
  [symbol: string]: { change: number; change_pct: number };
}

// Default prices (fallback)
const DEFAULT_SPOT_PRICES: SpotPrices = {
  gold: 2347.80,
  silver: 27.45,
  platinum: 967.20,
  palladium: 1012.50,
  copper: 4.52,
  aluminum: 1.15,
  iron: 0.055,
  nickel: 8.00,
};

const METAL_CONFIGS: Array<{
  symbol: string;
  name: string;
  shortName: string;
  key: keyof SpotPrices;
  unit: string;
  category: 'precious' | 'industrial';
  apiSymbol: string;
}> = [
  { symbol: 'XAU', name: 'Gold', shortName: 'Gold', key: 'gold', unit: 'oz', category: 'precious', apiSymbol: 'XAU' },
  { symbol: 'XAG', name: 'Silver', shortName: 'Silver', key: 'silver', unit: 'oz', category: 'precious', apiSymbol: 'XAG' },
  { symbol: 'XPT', name: 'Platinum', shortName: 'Platinum', key: 'platinum', unit: 'oz', category: 'precious', apiSymbol: 'XPT' },
  { symbol: 'XPD', name: 'Palladium', shortName: 'Palladium', key: 'palladium', unit: 'oz', category: 'precious', apiSymbol: 'XPD' },
  { symbol: 'XCU', name: 'Copper', shortName: 'Copper', key: 'copper', unit: 'lb', category: 'industrial', apiSymbol: 'XCU' },
  { symbol: 'XAL', name: 'Aluminum', shortName: 'Aluminum', key: 'aluminum', unit: 'lb', category: 'industrial', apiSymbol: 'XAL' },
  { symbol: 'FE', name: 'Iron', shortName: 'Iron', key: 'iron', unit: 'lb', category: 'industrial', apiSymbol: 'FE' },
  { symbol: 'NI', name: 'Nickel', shortName: 'Nickel', key: 'nickel', unit: 'lb', category: 'industrial', apiSymbol: 'NI' },
];

export function useAllMetalPrices(): AllMetalPricesResult {
  const [metals, setMetals] = useState<MetalPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'live' | 'cached' | 'default'>('default');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const buildMetalsFromPrices = useCallback((
    spotPrices: SpotPrices,
    fluctuation?: FluctuationData
  ): MetalPrice[] => {
    return METAL_CONFIGS.map(config => {
      const price = spotPrices[config.key] ?? DEFAULT_SPOT_PRICES[config.key] ?? null;
      const change = fluctuation?.[config.apiSymbol]?.change_pct;
      
      return {
        symbol: config.symbol,
        name: config.name,
        shortName: config.shortName,
        price,
        unit: config.unit,
        change: change !== undefined ? change : undefined,
        category: config.category,
      };
    });
  }, []);

  const fetchPrices = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefetching(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch all metals including precious
      const { data, error: fnError } = await supabase.functions.invoke('scrap-metal-pricing', {
        body: { action: 'get-all-metals' }
      });

      if (fnError) throw fnError;

      if (data?.success && data?.spotPrices) {
        const spotPrices = data.spotPrices as SpotPrices;
        const fluctuation = data.fluctuation as FluctuationData | undefined;
        
        const metalsList = buildMetalsFromPrices(spotPrices, fluctuation);
        setMetals(metalsList);
        setSource(data.source || 'live');
        setLastUpdated(data.lastUpdated || new Date().toISOString());
      } else {
        // Use defaults
        const metalsList = buildMetalsFromPrices(DEFAULT_SPOT_PRICES);
        setMetals(metalsList);
        setSource('default');
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to fetch all metal prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      
      // Fallback to defaults
      const metalsList = buildMetalsFromPrices(DEFAULT_SPOT_PRICES);
      setMetals(metalsList);
      setSource('default');
      setLastUpdated(new Date().toISOString());
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [buildMetalsFromPrices]);

  const refetch = useCallback(async () => {
    await fetchPrices(true);
  }, [fetchPrices]);

  useEffect(() => {
    // Set defaults immediately
    const defaultMetals = buildMetalsFromPrices(DEFAULT_SPOT_PRICES);
    setMetals(defaultMetals);
    
    // Then fetch live prices
    fetchPrices();
  }, [fetchPrices, buildMetalsFromPrices]);

  return {
    metals,
    isLoading,
    error,
    source,
    lastUpdated,
    refetch,
    isRefetching,
  };
}
