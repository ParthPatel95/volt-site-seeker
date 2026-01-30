import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PriceTrend {
  prices: number[];
  dates: string[];
  changePercent: number;
}

export interface FluctuationData {
  change: number;
  change_pct: number;
  start_rate: number;
  end_rate: number;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
}

export interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MarketIntelligence {
  trends: Record<string, PriceTrend>;
  fluctuation: Record<string, FluctuationData>;
  news: NewsArticle[];
  ohlc: Record<string, OHLCData>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  apiCallsToday: number;
  maxCallsPerDay: number;
}

const METAL_SYMBOL_MAP: Record<string, string> = {
  'XAU': 'gold',
  'XAG': 'silver',
  'XPT': 'platinum',
  'XPD': 'palladium',
  'XCU': 'copper',
  'XAL': 'aluminum',
  'FE': 'steel',
  'NI': 'stainless',
};

const VOLATILITY_THRESHOLD = 5; // 5% change = high volatility

export function useMarketIntelligence() {
  const [data, setData] = useState<MarketIntelligence>({
    trends: {},
    fluctuation: {},
    news: [],
    ohlc: {},
    isLoading: true,
    error: null,
    lastUpdated: null,
    apiCallsToday: 0,
    maxCallsPerDay: 4,
  });
  const { toast } = useToast();

  const fetchMarketData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: response, error } = await supabase.functions.invoke('scrap-metal-pricing', {
        body: { action: 'get-market-data' }
      });

      if (error) throw error;

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to fetch market data');
      }

      const marketData = response.marketData || {};
      
      // Map API symbols to our metal types
      const mappedTrends: Record<string, PriceTrend> = {};
      const mappedFluctuation: Record<string, FluctuationData> = {};
      const mappedOhlc: Record<string, OHLCData> = {};

      if (marketData.timeseries?.processedTrends) {
        for (const [symbol, trend] of Object.entries(marketData.timeseries.processedTrends)) {
          const metalType = METAL_SYMBOL_MAP[symbol];
          if (metalType) {
            mappedTrends[metalType] = trend as PriceTrend;
          }
        }
      }

      if (marketData.fluctuation) {
        for (const [symbol, fluct] of Object.entries(marketData.fluctuation)) {
          const metalType = METAL_SYMBOL_MAP[symbol];
          if (metalType) {
            mappedFluctuation[metalType] = fluct as FluctuationData;
          }
        }
      }

      if (marketData.ohlc) {
        for (const [symbol, ohlc] of Object.entries(marketData.ohlc)) {
          const metalType = METAL_SYMBOL_MAP[symbol];
          if (metalType) {
            mappedOhlc[metalType] = ohlc as OHLCData;
          }
        }
      }

      setData({
        trends: mappedTrends,
        fluctuation: mappedFluctuation,
        news: marketData.news || [],
        ohlc: mappedOhlc,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
        apiCallsToday: response.apiCallsToday || 0,
        maxCallsPerDay: response.maxCallsPerDay || 4,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      console.error('Market intelligence error:', err);
      
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: 'Market Data Unavailable',
        description: 'Using cached data. Market intelligence may be outdated.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Utility functions for components
  const getVolatileMetals = useCallback((): string[] => {
    return Object.entries(data.fluctuation)
      .filter(([_, fluct]) => Math.abs(fluct.change_pct) > VOLATILITY_THRESHOLD)
      .map(([metal]) => metal);
  }, [data.fluctuation]);

  const isHighVolatility = useCallback((): boolean => {
    return getVolatileMetals().length > 0;
  }, [getVolatileMetals]);

  const getMaxVolatility = useCallback((): { metal: string; percent: number } | null => {
    const entries = Object.entries(data.fluctuation);
    if (entries.length === 0) return null;

    const maxEntry = entries.reduce((max, [metal, fluct]) => {
      return Math.abs(fluct.change_pct) > Math.abs(max[1].change_pct) ? [metal, fluct] : max;
    });

    return {
      metal: maxEntry[0],
      percent: maxEntry[1].change_pct,
    };
  }, [data.fluctuation]);

  const getTrendDirection = useCallback((metalType: string): 'up' | 'down' | 'stable' => {
    const trend = data.trends[metalType];
    if (!trend) return 'stable';
    
    if (trend.changePercent > 1) return 'up';
    if (trend.changePercent < -1) return 'down';
    return 'stable';
  }, [data.trends]);

  return {
    ...data,
    refetch: fetchMarketData,
    getVolatileMetals,
    isHighVolatility,
    getMaxVolatility,
    getTrendDirection,
  };
}
