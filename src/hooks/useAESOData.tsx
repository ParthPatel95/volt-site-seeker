
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AESOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  timestamp: string;
  market_conditions: string;
  cents_per_kwh: number;
}

export interface AESOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  forecast_date: string;
  capacity_margin: number;
  reserve_margin: number;
}

export interface AESOGenerationMix {
  natural_gas_mw: number;
  wind_mw: number;
  solar_mw: number;
  hydro_mw: number;
  coal_mw: number;
  other_mw: number;
  total_generation_mw: number;
  renewable_percentage: number;
  timestamp: string;
}

export type ConnectionStatus = 'connected' | 'fallback' | 'disconnected' | 'error';

export interface AESODataStatus {
  isLive: boolean;
  lastUpdate: string | null;
  errorMessage: string | null;
  retryCount: number;
  fallbackSince: string | null;
}

export function useAESOData() {
  const [pricing, setPricing] = useState<AESOPricing | null>(null);
  const [loadData, setLoadData] = useState<AESOLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<AESOGenerationMix | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [dataStatus, setDataStatus] = useState<AESODataStatus>({
    isLive: false,
    lastUpdate: null,
    errorMessage: null,
    retryCount: 0,
    fallbackSince: null
  });

  // Cache management for fallback data
  const [cachedData, setCachedData] = useState<{
    pricing?: AESOPricing;
    timestamp?: string;
  }>({});

  const fetchData = async () => {
    setLoading(true);
    console.log('🔌 Starting AESO data fetch with correct headers...');
    
    try {
      // Fetch pricing data with enhanced error handling
      const pricingResponse = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: 'fetch_current_prices' }
      });
      
      console.log('📊 AESO Pricing Response:', pricingResponse);
      
      if (pricingResponse.error) {
        console.error('❌ Supabase function error:', pricingResponse.error);
        throw new Error(`Function error: ${pricingResponse.error.message}`);
      }
      
      if (pricingResponse.data?.success && pricingResponse.data?.data) {
        console.log('✅ AESO Pricing data updated:', pricingResponse.data.data);
        setPricing(pricingResponse.data.data);
        
        const isLive = pricingResponse.data.source === 'aeso_api';
        setConnectionStatus(isLive ? 'connected' : 'fallback');
        
        // Cache successful data
        if (isLive) {
          setCachedData({
            pricing: pricingResponse.data.data,
            timestamp: pricingResponse.data.timestamp
          });
          console.log('🟢 AESO API is now LIVE - real pool price data retrieved!');
          console.log(`💰 Current Alberta Pool Price: $${pricingResponse.data.data.current_price}/MWh (CAD)`);
        } else {
          console.log('⚠️ Using fallback data - API authentication or connection failed');
          console.warn('🔧 Check AESO API key configuration and validity');
        }
        
        // Format timestamp for display
        const lastUpdateTime = pricingResponse.data.lastSuccessfulCall || 
                             pricingResponse.data.timestamp || 
                             new Date().toISOString();
        
        // Track fallback mode duration
        const currentFallbackSince = !isLive && dataStatus.fallbackSince === null 
          ? new Date().toISOString() 
          : (isLive ? null : dataStatus.fallbackSince);
        
        setDataStatus({
          isLive,
          lastUpdate: lastUpdateTime,
          errorMessage: pricingResponse.data.error || null,
          retryCount: isLive ? 0 : dataStatus.retryCount + 1,
          fallbackSince: currentFallbackSince
        });
      } else {
        console.error('❌ Invalid response structure from AESO function');
        throw new Error('Invalid response from AESO function');
      }

      // Fetch load data
      const loadResponse = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: 'fetch_load_forecast' }
      });
      
      if (loadResponse.data?.success && loadResponse.data?.data) {
        console.log('📈 Load data updated:', loadResponse.data.data);
        setLoadData(loadResponse.data.data);
      }

      // Fetch generation mix
      const generationResponse = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: 'fetch_generation_mix' }
      });
      
      if (generationResponse.data?.success && generationResponse.data?.data) {
        console.log('⚡ Generation data updated:', generationResponse.data.data);
        setGenerationMix(generationResponse.data.data);
      }

    } catch (error) {
      console.error('💥 Error fetching AESO data:', error);
      setConnectionStatus('error');
      
      // Use cached data if available
      if (cachedData.pricing) {
        console.log('🗄️ Using cached AESO data due to fetch error');
        setPricing(cachedData.pricing);
        setDataStatus(prev => ({
          ...prev,
          isLive: false,
          errorMessage: 'AESO API temporarily unavailable – showing cached data',
          retryCount: prev.retryCount + 1,
          fallbackSince: prev.fallbackSince || new Date().toISOString()
        }));
      } else {
        setDataStatus(prev => ({
          ...prev,
          isLive: false,
          errorMessage: 'AESO API key may be invalid or expired - check configuration',
          retryCount: prev.retryCount + 1,
          fallbackSince: prev.fallbackSince || new Date().toISOString()
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('🔄 Force refreshing AESO data with correct authentication...');
    fetchData();
  };

  // Check if fallback mode has been active for more than 1 hour
  const isFallbackStale = () => {
    if (!dataStatus.fallbackSince) return false;
    const fallbackStart = new Date(dataStatus.fallbackSince);
    const now = new Date();
    const hoursDiff = (now.getTime() - fallbackStart.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 1;
  };

  useEffect(() => {
    // Immediate fetch on mount
    fetchData();
    
    // Set up polling for live data updates every 2 minutes
    const interval = setInterval(fetchData, 120000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    pricing,
    loadData,
    generationMix,
    loading,
    connectionStatus,
    dataStatus: {
      ...dataStatus,
      isStale: isFallbackStale()
    },
    refetch
  };
}
