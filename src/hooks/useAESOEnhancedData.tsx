
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AESOWindSolarForecast {
  forecasts: Array<{
    datetime: string;
    wind_forecast_mw: number;
    solar_forecast_mw: number;
    total_renewable_forecast_mw: number;
  }>;
  timestamp: string;
  total_forecasts: number;
}

export interface AESOAssetOutages {
  outages: Array<{
    asset_name: string;
    outage_type: string;
    capacity_mw: number;
    start_date: string;
    end_date: string | null;
    status: string;
    reason: string;
  }>;
  total_outages: number;
  total_outage_capacity_mw: number;
  timestamp: string;
}

export interface AESOHistoricalPrices {
  prices: Array<{
    datetime: string;
    pool_price: number;
    forecast_pool_price: number;
  }>;
  statistics: {
    average_price: number;
    max_price: number;
    min_price: number;
    price_volatility: number;
    total_records: number;
  };
  timestamp: string;
}

export interface AESOMarketAnalytics {
  market_stress_score: number;
  price_prediction: {
    next_hour_prediction: number;
    confidence: number;
    trend_direction: string;
    predicted_range: {
      low: number;
      high: number;
    };
  };
  capacity_gap_analysis: {
    current_gap_mw: number;
    utilization_rate: number;
    status: string;
    recommendation: string;
  };
  investment_opportunities: Array<{
    type: string;
    priority: string;
    reason: string;
    potential_return: string;
  }>;
  risk_assessment: {
    risks: Array<{
      type: string;
      level: string;
      impact: string;
    }>;
    overall_risk_level: string;
  };
  market_timing_signals: Array<{
    type: string;
    strength: string;
    timeframe: string;
  }>;
  timestamp: string;
}

// Fetch REAL wind/solar generation data from database
const fetchRealWindSolarData = async (): Promise<AESOWindSolarForecast | null> => {
  try {
    console.log('[useAESOEnhancedData] Fetching REAL wind/solar from aeso_training_data...');
    const { data, error } = await supabase
      .from('aeso_training_data')
      .select('timestamp, generation_wind, generation_solar')
      .order('timestamp', { ascending: false })
      .limit(24);
    
    if (error) {
      console.error('[useAESOEnhancedData] Wind/solar query error:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.warn('[useAESOEnhancedData] No wind/solar data in database');
      return null;
    }
    
    // Reverse to chronological order and map to forecast format
    const forecasts = data.reverse().map(row => ({
      datetime: row.timestamp,
      wind_forecast_mw: row.generation_wind || 0,
      solar_forecast_mw: row.generation_solar || 0,
      total_renewable_forecast_mw: (row.generation_wind || 0) + (row.generation_solar || 0)
    }));
    
    console.log(`[useAESOEnhancedData] Got ${forecasts.length} real wind/solar records`);
    
    return {
      forecasts,
      timestamp: new Date().toISOString(),
      total_forecasts: forecasts.length
    };
  } catch (err) {
    console.error('[useAESOEnhancedData] Wind/solar fetch error:', err);
    return null;
  }
};

// Fetch real data from aeso_training_data table as fallback
const fetchFromDatabase = async (): Promise<AESOHistoricalPrices | null> => {
  try {
    console.log('[useAESOEnhancedData] Fetching from aeso_training_data database...');
    const { data, error } = await supabase
      .from('aeso_training_data')
      .select('timestamp, pool_price, ail_mw')
      .order('timestamp', { ascending: false })
      .limit(720); // Get up to 30 days of hourly data
    
    if (error) {
      console.error('[useAESOEnhancedData] Database query error:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.warn('[useAESOEnhancedData] No data in aeso_training_data');
      return null;
    }
    
    // Deduplicate by hour (there can be duplicate entries per hour)
    const hourlyMap = new Map<string, { timestamp: string; pool_price: number; ail_mw?: number }>();
    data.forEach(row => {
      const hourKey = row.timestamp.substring(0, 13); // YYYY-MM-DDTHH
      if (!hourlyMap.has(hourKey)) {
        hourlyMap.set(hourKey, row);
      }
    });
    
    const prices = Array.from(hourlyMap.values())
      .map(row => ({
        datetime: row.timestamp,
        pool_price: row.pool_price,
        forecast_pool_price: row.pool_price, // No separate forecast in training data
        ail_mw: row.ail_mw
      }))
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    
    const priceValues = prices.map(p => p.pool_price);
    const avgPrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
    const maxPrice = Math.max(...priceValues);
    const minPrice = Math.min(...priceValues);
    const volatility = Math.sqrt(priceValues.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / priceValues.length);
    
    console.log(`[useAESOEnhancedData] Got ${prices.length} real data points from database`);
    
    return {
      prices,
      statistics: {
        average_price: avgPrice,
        max_price: maxPrice,
        min_price: minPrice,
        price_volatility: volatility,
        total_records: prices.length
      },
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('[useAESOEnhancedData] Database fetch error:', err);
    return null;
  }
};

// No more fake market analytics - getMarketAnalytics calculates from real data only

export function useAESOEnhancedData() {
  const [windSolarForecast, setWindSolarForecast] = useState<AESOWindSolarForecast | null>(null);
  const [assetOutages, setAssetOutages] = useState<AESOAssetOutages | null>(null);
  const [historicalPrices, setHistoricalPrices] = useState<AESOHistoricalPrices | null>(null);
  const [marketAnalytics, setMarketAnalytics] = useState<AESOMarketAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    timestamp: string;
  }>>([]);
  const { toast } = useToast();
  void toast;
  const fetchAESOEnhancedData = async (dataType: string) => {
    setLoading(true);
    try {
      console.log('Fetching AESO enhanced data:', dataType);
      
      const { data, error } = await supabase.functions.invoke('energy-data-integration');

      if (error) {
        console.error('AESO Enhanced API error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch AESO enhanced data');
      }

      console.log('AESO enhanced data received:', data);
      // Extract AESO data from unified response
      return data?.aeso || data?.data || data;

    } catch (error: any) {
      console.error('Error fetching AESO enhanced data:', error);
      // Don't show toast for fallback data - just use fallback silently
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getWindSolarForecast = async () => {
    // Fetch REAL wind/solar generation data from aeso_training_data database
    const data = await fetchRealWindSolarData();
    if (data) {
      setWindSolarForecast(data);
      return data;
    }
    setWindSolarForecast(null);
    return null;
  };

  const getAssetOutages = async () => {
    // NOTE: AESO asset outage data requires authentication and is not in public API
    // No fake data - return null when real data not available
    setAssetOutages(null);
    return null;
  };

  const getHistoricalPrices = async () => {
    // Strategy: Try API first, then fallback to database
    try {
      console.log('[useAESOEnhancedData] Fetching historical prices from API...');
      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: { timeframe: 'monthly' }
      });

      if (!error && data && data.rawHourlyData && data.rawHourlyData.length > 0) {
        console.log(`[useAESOEnhancedData] API returned ${data.rawHourlyData.length} records`);
        const historicalData: AESOHistoricalPrices = {
          prices: data.rawHourlyData.map((item: any) => ({
            datetime: item.datetime || item.ts,
            pool_price: item.price ?? item.pool_price,
            // Only use forecast_pool_price if it's a valid number, don't fallback to pool_price
            forecast_pool_price: typeof item.forecast_pool_price === 'number' && item.forecast_pool_price !== null 
              ? item.forecast_pool_price 
              : null,
            rolling_30day_avg: item.rolling_30day_avg ?? null,
            ail_mw: item.ail_mw
          })),
          statistics: {
            average_price: data.statistics?.average || 0,
            max_price: data.statistics?.peak || 0,
            min_price: data.statistics?.low || 0,
            price_volatility: data.statistics?.volatility || 0,
            total_records: data.rawHourlyData.length
          },
          timestamp: new Date().toISOString()
        };
        setHistoricalPrices(historicalData);
        checkForAlerts('historical_prices', historicalData);
        return historicalData;
      }
      
      // API failed or returned no data, fallback to database
      console.log('[useAESOEnhancedData] API failed or no data, trying database fallback...');
      throw new Error('API returned no data');
    } catch (e) {
      console.warn('[useAESOEnhancedData] API error, using database fallback:', e);
      
      // Fallback to direct database query
      const dbData = await fetchFromDatabase();
      if (dbData) {
        console.log(`[useAESOEnhancedData] Database fallback successful: ${dbData.prices.length} records`);
        setHistoricalPrices(dbData);
        checkForAlerts('historical_prices', dbData);
        return dbData;
      }
      
      console.error('[useAESOEnhancedData] Both API and database failed');
      setHistoricalPrices(null);
      return null;
    }
  };

  const getMarketAnalytics = async () => {
    const data = await fetchAESOEnhancedData('fetch_market_analytics');
    if (data?.pricing && data?.loadData) {
      // Calculate REAL analytics based on actual AESO market data
      const currentPrice = data.pricing.current_price || 0;
      const currentDemand = data.loadData.current_demand_mw || 0;
      const peakForecast = data.loadData.peak_forecast_mw || 0;
      const reserveMargin = data.loadData.reserve_margin || 0;
      
      // Calculate market stress based on real metrics
      const demandRatio = peakForecast > 0 ? (currentDemand / peakForecast) * 100 : 50;
      const priceStress = Math.min(100, (currentPrice / 100) * 100); // Normalize to 100
      const reserveStress = Math.max(0, (15 - reserveMargin) * 10); // Low reserve = higher stress
      const stressScore = Math.round((demandRatio * 0.4 + priceStress * 0.4 + reserveStress * 0.2));

      const analyticsData: AESOMarketAnalytics = {
        market_stress_score: Math.min(100, Math.max(0, stressScore)),
        price_prediction: {
          next_hour_prediction: currentPrice, // Simple persistence model
          confidence: 65, // Lower confidence for simple model
          trend_direction: currentPrice > (data.pricing.average_price || currentPrice) ? 'increasing' : 'decreasing',
          predicted_range: {
            low: Math.round(currentPrice * 0.85 * 100) / 100,
            high: Math.round(currentPrice * 1.15 * 100) / 100
          }
        },
        capacity_gap_analysis: {
          current_gap_mw: Math.round(peakForecast - currentDemand),
          utilization_rate: Math.round(demandRatio),
          status: demandRatio > 90 ? 'critical' : demandRatio > 80 ? 'tight' : 'adequate',
          recommendation: demandRatio > 90 ? 'conservation_measures' : 'normal_operations'
        },
        investment_opportunities: [], // Remove synthetic investment recommendations
        risk_assessment: {
          risks: [
            ...(currentPrice > 100 ? [{ type: 'price_spike', level: 'high', impact: 'significant' }] : []),
            ...(reserveMargin < 10 ? [{ type: 'low_reserve', level: 'high', impact: 'reliability_concern' }] : []),
            ...(demandRatio > 85 ? [{ type: 'high_demand', level: 'medium', impact: 'moderate' }] : [])
          ],
          overall_risk_level: stressScore > 70 ? 'high' : stressScore > 50 ? 'medium' : 'low'
        },
        market_timing_signals: [], // Remove synthetic trading signals
        timestamp: new Date().toISOString()
      };
      setMarketAnalytics(analyticsData);
      checkForAlerts('market_analytics', analyticsData);
      return analyticsData;
    }
    setMarketAnalytics(null);
    return null;
  };

  const checkForAlerts = (dataType: string, data: any) => {
    const newAlerts: any[] = [];
    const alertId = () => `${dataType}-${Date.now()}-${Math.random()}`;

    switch (dataType) {
      case 'asset_outages':
        if (data.total_outage_capacity_mw > 1000) {
          newAlerts.push({
            id: alertId(),
            type: 'outage',
            severity: 'high',
            message: `High capacity outages: ${data.total_outage_capacity_mw.toFixed(0)} MW offline`,
            timestamp: new Date().toISOString()
          });
        }
        break;
      case 'historical_prices':
        if (data.statistics.price_volatility > 75) {
          newAlerts.push({
            id: alertId(),
            type: 'price_volatility',
            severity: 'medium',
            message: `High price volatility detected: ${data.statistics.price_volatility.toFixed(1)}`,
            timestamp: new Date().toISOString()
          });
        }
        break;
      case 'market_analytics':
        if (data.market_stress_score > 70) {
          newAlerts.push({
            id: alertId(),
            type: 'market_stress',
            severity: 'high',
            message: `High market stress level: ${data.market_stress_score}/100`,
            timestamp: new Date().toISOString()
          });
        }
        if (data.risk_assessment.overall_risk_level === 'high') {
          newAlerts.push({
            id: alertId(),
            type: 'risk',
            severity: 'high',
            message: 'High overall market risk detected',
            timestamp: new Date().toISOString()
          });
        }
        break;
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
      // Toast popups disabled per UX request
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Auto-fetch enhanced data on component mount - REAL DATA ONLY
  useEffect(() => {
    const fetchAllEnhancedData = async () => {
      await Promise.all([
        getWindSolarForecast(),
        getAssetOutages(),
        getHistoricalPrices(),
        getMarketAnalytics()
      ]);
    };

    fetchAllEnhancedData();
    
    // Set up interval to refresh data every 10 minutes
    const interval = setInterval(fetchAllEnhancedData, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    windSolarForecast,
    assetOutages,
    historicalPrices,
    marketAnalytics,
    alerts,
    loading,
    getWindSolarForecast,
    getAssetOutages,
    getHistoricalPrices,
    getMarketAnalytics,
    dismissAlert,
    clearAllAlerts,
    refetchAll: () => {
      getWindSolarForecast();
      getAssetOutages();
      getHistoricalPrices();
      getMarketAnalytics();
    }
  };
}
