import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetalPrice, MetalCategory } from '../components/MetalsMarketTicker';

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
  // Precious (per oz)
  gold?: number;
  silver?: number;
  platinum?: number;
  palladium?: number;
  // Steel (per lb)
  steelHrc?: number;
  steelRebar?: number;
  steelScrap?: number;
  // Industrial (per lb)
  copper?: number;
  aluminum?: number;
  zinc?: number;
  tin?: number;
  lead?: number;
  nickel?: number;
  iron?: number;
  // Alloys (per lb)
  brass?: number;
  bronze?: number;
  // Specialty (per lb)
  titanium?: number;
  tungsten?: number;
  magnesium?: number;
  cobalt?: number;
  lithium?: number;
}

interface FluctuationData {
  [symbol: string]: { change: number; change_pct: number };
}

// Default prices (fallback)
const DEFAULT_SPOT_PRICES: SpotPrices = {
  // Precious metals (per oz)
  gold: 2347.80,
  silver: 27.45,
  platinum: 967.20,
  palladium: 1012.50,
  // Steel (per lb)
  steelHrc: 0.32,
  steelRebar: 0.28,
  steelScrap: 0.18,
  // Industrial (per lb)
  copper: 4.52,
  aluminum: 1.15,
  zinc: 1.25,
  tin: 14.50,
  lead: 0.95,
  nickel: 8.00,
  iron: 0.055,
  // Alloys (per lb)
  brass: 2.40,
  bronze: 2.20,
  // Specialty (per lb)
  titanium: 12.00,
  tungsten: 18.50,
  magnesium: 1.80,
  cobalt: 15.00,
  lithium: 8.50,
};

const METAL_CONFIGS: Array<{
  symbol: string;
  name: string;
  shortName: string;
  key: keyof SpotPrices;
  unit: string;
  category: MetalCategory;
  apiSymbol: string;
}> = [
  // Precious metals
  { symbol: 'XAU', name: 'Gold', shortName: 'Gold', key: 'gold', unit: 'oz', category: 'precious', apiSymbol: 'XAU' },
  { symbol: 'XAG', name: 'Silver', shortName: 'Silver', key: 'silver', unit: 'oz', category: 'precious', apiSymbol: 'XAG' },
  { symbol: 'XPT', name: 'Platinum', shortName: 'Platinum', key: 'platinum', unit: 'oz', category: 'precious', apiSymbol: 'XPT' },
  { symbol: 'XPD', name: 'Palladium', shortName: 'Palladium', key: 'palladium', unit: 'oz', category: 'precious', apiSymbol: 'XPD' },
  // Steel
  { symbol: 'STEEL-HR', name: 'Steel HRC', shortName: 'HRC', key: 'steelHrc', unit: 'lb', category: 'steel', apiSymbol: 'STEEL-HR' },
  { symbol: 'STEEL-RE', name: 'Steel Rebar', shortName: 'Rebar', key: 'steelRebar', unit: 'lb', category: 'steel', apiSymbol: 'STEEL-RE' },
  { symbol: 'STEEL-SC', name: 'Steel Scrap', shortName: 'Scrap', key: 'steelScrap', unit: 'lb', category: 'steel', apiSymbol: 'STEEL-SC' },
  // Industrial
  { symbol: 'XCU', name: 'Copper', shortName: 'Copper', key: 'copper', unit: 'lb', category: 'industrial', apiSymbol: 'XCU' },
  { symbol: 'ALU', name: 'Aluminum', shortName: 'Aluminum', key: 'aluminum', unit: 'lb', category: 'industrial', apiSymbol: 'ALU' },
  { symbol: 'ZNC', name: 'Zinc', shortName: 'Zinc', key: 'zinc', unit: 'lb', category: 'industrial', apiSymbol: 'ZNC' },
  { symbol: 'TIN', name: 'Tin', shortName: 'Tin', key: 'tin', unit: 'lb', category: 'industrial', apiSymbol: 'TIN' },
  { symbol: 'LEAD', name: 'Lead', shortName: 'Lead', key: 'lead', unit: 'lb', category: 'industrial', apiSymbol: 'LEAD' },
  { symbol: 'NI', name: 'Nickel', shortName: 'Nickel', key: 'nickel', unit: 'lb', category: 'industrial', apiSymbol: 'NI' },
  { symbol: 'IRON', name: 'Iron Ore', shortName: 'Iron', key: 'iron', unit: 'lb', category: 'industrial', apiSymbol: 'IRON' },
  // Alloys
  { symbol: 'BRASS', name: 'Brass', shortName: 'Brass', key: 'brass', unit: 'lb', category: 'alloy', apiSymbol: 'BRASS' },
  { symbol: 'BRONZE', name: 'Bronze', shortName: 'Bronze', key: 'bronze', unit: 'lb', category: 'alloy', apiSymbol: 'BRONZE' },
  // Specialty
  { symbol: 'TITANIUM', name: 'Titanium', shortName: 'Titanium', key: 'titanium', unit: 'lb', category: 'specialty', apiSymbol: 'TITANIUM' },
  { symbol: 'TUNGSTEN', name: 'Tungsten', shortName: 'Tungsten', key: 'tungsten', unit: 'lb', category: 'specialty', apiSymbol: 'TUNGSTEN' },
  { symbol: 'MG', name: 'Magnesium', shortName: 'Magnesium', key: 'magnesium', unit: 'lb', category: 'specialty', apiSymbol: 'MG' },
  { symbol: 'LCO', name: 'Cobalt', shortName: 'Cobalt', key: 'cobalt', unit: 'lb', category: 'specialty', apiSymbol: 'LCO' },
  { symbol: 'LITHIUM', name: 'Lithium', shortName: 'Lithium', key: 'lithium', unit: 'lb', category: 'specialty', apiSymbol: 'LITHIUM' },
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
      // Use API price if available and > 0, otherwise fall back to defaults
      const apiPrice = spotPrices[config.key];
      const price = (apiPrice && apiPrice > 0) ? apiPrice : DEFAULT_SPOT_PRICES[config.key] ?? null;
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
