import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ScrapMetalPrices, 
  MetalType, 
  PriceSource,
  DEFAULT_SCRAP_PRICES 
} from '../types/demolition.types';

interface UseScrapMetalPricingResult {
  prices: ScrapMetalPrices | null;
  isLoading: boolean;
  error: string | null;
  source: PriceSource;
  lastUpdated: string | null;
  refreshPrices: () => Promise<void>;
  getPriceForMetal: (metalType: MetalType, grade?: string) => number;
}

// Default prices to use when API is unavailable
const getDefaultPrices = (): ScrapMetalPrices => ({
  copper: {
    bareBright: 4.00,
    number1: 3.60,
    number2: 3.40,
    insulated: 2.00,
    pipe: 3.40,
  },
  aluminum: {
    sheet: 0.95,
    cast: 0.60,
    extrusion: 0.70,
    cans: 0.50,
    dirty: 0.40,
  },
  steel: {
    hms1: 0.13,
    hms2: 0.11,
    structural: 0.14,
    sheet: 0.11,
    rebar: 0.12,
    galvanized: 0.08,
  },
  brass: {
    yellow: 2.40,
    red: 2.60,
    mixed: 2.10,
  },
  stainless: {
    ss304: 0.65,
    ss316: 0.85,
    mixed: 0.50,
  },
  iron: {
    cast: 0.09,
    wrought: 0.11,
  },
  lastUpdated: new Date().toISOString(),
  source: 'default',
});

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;
const CACHE_KEY = 'scrap_metal_prices';

interface CachedPrices {
  prices: ScrapMetalPrices;
  timestamp: number;
}

export function useScrapMetalPricing(): UseScrapMetalPricingResult {
  const [prices, setPrices] = useState<ScrapMetalPrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<PriceSource>('default');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  // Load cached prices from localStorage
  const loadCachedPrices = useCallback((): CachedPrices | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      console.warn('Failed to load cached prices');
    }
    return null;
  }, []);

  // Save prices to cache
  const saveCachedPrices = useCallback((prices: ScrapMetalPrices) => {
    try {
      const cached: CachedPrices = {
        prices,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      console.warn('Failed to cache prices');
    }
  }, []);

  // Fetch live prices from edge function
  const fetchLivePrices = useCallback(async (): Promise<ScrapMetalPrices | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('scrap-metal-pricing', {
        body: { action: 'get-prices' }
      });

      if (fnError) throw fnError;
      
      if (data?.prices) {
        return {
          ...data.prices,
          source: 'live' as PriceSource,
          lastUpdated: new Date().toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch live prices:', err);
      return null;
    }
  }, []);

  // Main refresh function
  const refreshPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get live prices first
      const livePrices = await fetchLivePrices();
      
      if (livePrices) {
        setPrices(livePrices);
        setSource('live');
        setLastUpdated(livePrices.lastUpdated);
        saveCachedPrices(livePrices);
        return;
      }

      // Fall back to cached prices
      const cached = loadCachedPrices();
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 24) { // Allow stale cache up to 24 hours
        setPrices({
          ...cached.prices,
          source: 'cached',
        });
        setSource('cached');
        setLastUpdated(cached.prices.lastUpdated);
        return;
      }

      // Fall back to defaults
      const defaultPrices = getDefaultPrices();
      setPrices(defaultPrices);
      setSource('default');
      setLastUpdated(defaultPrices.lastUpdated);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prices';
      setError(errorMessage);
      
      // Use defaults on error
      const defaultPrices = getDefaultPrices();
      setPrices(defaultPrices);
      setSource('default');
      setLastUpdated(defaultPrices.lastUpdated);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLivePrices, loadCachedPrices, saveCachedPrices]);

  // Get price for a specific metal type and grade
  const getPriceForMetal = useCallback((metalType: MetalType, grade?: string): number => {
    if (!prices) {
      // Fall back to static defaults
      const staticPrice = DEFAULT_SCRAP_PRICES.find(
        p => p.metalType === metalType && (!grade || p.grade.toLowerCase().includes(grade.toLowerCase()))
      );
      if (staticPrice) {
        return (staticPrice.pricePerLb.low + staticPrice.pricePerLb.high) / 2;
      }
      return 0;
    }

    const gradeKey = grade?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    
    switch (metalType) {
      case 'copper':
        if (gradeKey.includes('bare') || gradeKey.includes('bright')) return prices.copper.bareBright;
        if (gradeKey.includes('1') && !gradeKey.includes('2')) return prices.copper.number1;
        if (gradeKey.includes('2')) return prices.copper.number2;
        if (gradeKey.includes('insul') || gradeKey.includes('wire')) return prices.copper.insulated;
        if (gradeKey.includes('pipe') || gradeKey.includes('tube')) return prices.copper.pipe;
        return prices.copper.number2; // default copper
        
      case 'aluminum':
        if (gradeKey.includes('sheet') || gradeKey.includes('clean')) return prices.aluminum.sheet;
        if (gradeKey.includes('cast')) return prices.aluminum.cast;
        if (gradeKey.includes('extru')) return prices.aluminum.extrusion;
        if (gradeKey.includes('can')) return prices.aluminum.cans;
        if (gradeKey.includes('dirty')) return prices.aluminum.dirty;
        return prices.aluminum.cast; // default aluminum
        
      case 'steel':
        if (gradeKey.includes('hms1') || (gradeKey.includes('hms') && gradeKey.includes('1'))) return prices.steel.hms1;
        if (gradeKey.includes('hms2') || gradeKey.includes('hms')) return prices.steel.hms2;
        if (gradeKey.includes('struct')) return prices.steel.structural;
        if (gradeKey.includes('sheet')) return prices.steel.sheet;
        if (gradeKey.includes('rebar')) return prices.steel.rebar;
        if (gradeKey.includes('galv')) return prices.steel.galvanized;
        return prices.steel.hms2; // default steel
        
      case 'brass':
        if (gradeKey.includes('yellow')) return prices.brass.yellow;
        if (gradeKey.includes('red')) return prices.brass.red;
        return prices.brass.mixed;
        
      case 'stainless':
        if (gradeKey.includes('304')) return prices.stainless.ss304;
        if (gradeKey.includes('316')) return prices.stainless.ss316;
        return prices.stainless.mixed;
        
      case 'iron':
        if (gradeKey.includes('wrought')) return prices.iron.wrought;
        return prices.iron.cast;
        
      case 'mixed':
      case 'unknown':
      default:
        return 0.15; // General mixed metal price
    }
  }, [prices]);

  // Initial load
  useEffect(() => {
    // Check cache first for immediate display
    const cached = loadCachedPrices();
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setPrices({
        ...cached.prices,
        source: 'cached',
      });
      setSource('cached');
      setLastUpdated(cached.prices.lastUpdated);
      setIsLoading(false);
    } else {
      // Set defaults immediately while fetching
      const defaultPrices = getDefaultPrices();
      setPrices(defaultPrices);
      setSource('default');
      setLastUpdated(defaultPrices.lastUpdated);
    }

    // Fetch fresh prices in background
    refreshPrices();
  }, [loadCachedPrices, refreshPrices]);

  return {
    prices,
    isLoading,
    error,
    source,
    lastUpdated,
    refreshPrices,
    getPriceForMetal,
  };
}
