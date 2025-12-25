
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

// Generate fallback data functions
const generateFallbackWindSolarForecast = (): AESOWindSolarForecast => {
  const forecasts = [];
  const baseWind = 2500;
  const baseSolar = 800;
  
  for (let i = 0; i < 24; i++) {
    const hour = new Date(Date.now() + i * 60 * 60 * 1000).getHours();
    const windVariation = Math.sin(i * 0.3) * 800 + Math.random() * 400;
    const solarVariation = hour >= 6 && hour <= 18 
      ? Math.sin((hour - 6) * Math.PI / 12) * 600 + Math.random() * 200
      : Math.random() * 50;
    
    const wind = Math.max(0, baseWind + windVariation);
    const solar = Math.max(0, baseSolar + solarVariation);
    
    forecasts.push({
      datetime: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
      wind_forecast_mw: Math.round(wind),
      solar_forecast_mw: Math.round(solar),
      total_renewable_forecast_mw: Math.round(wind + solar)
    });
  }
  
  return {
    forecasts,
    timestamp: new Date().toISOString(),
    total_forecasts: forecasts.length
  };
};

const generateFallbackAssetOutages = (): AESOAssetOutages => {
  const outageTypes = ['planned', 'forced', 'maintenance'];
  const outages = [];
  
  for (let i = 0; i < 8; i++) {
    const capacity = 50 + Math.floor(Math.random() * 400);
    const startDate = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
    const duration = Math.floor(Math.random() * 72) + 1;
    
    outages.push({
      asset_name: `ASSET_${String(i + 1).padStart(3, '0')}`,
      outage_type: outageTypes[Math.floor(Math.random() * outageTypes.length)],
      capacity_mw: capacity,
      start_date: startDate.toISOString(),
      end_date: new Date(startDate.getTime() + duration * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.3 ? 'active' : 'resolved',
      reason: Math.random() > 0.5 ? 'Scheduled maintenance' : 'Equipment failure'
    });
  }
  
  const totalCapacity = outages.reduce((sum, outage) => sum + outage.capacity_mw, 0);
  
  return {
    outages,
    total_outages: outages.length,
    total_outage_capacity_mw: totalCapacity,
    timestamp: new Date().toISOString()
  };
};

const generateFallbackHistoricalPrices = (): AESOHistoricalPrices => {
  const prices = [];
  const basePrice = 45.67;
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(Date.now() - i * 60 * 60 * 1000);
    const variation = Math.sin((Date.now() - i * 60 * 60 * 1000) / 100000) * 15;
    const price = Math.max(20, basePrice + variation + (Math.random() - 0.5) * 8);
    const forecast = Math.max(20, basePrice + variation + (Math.random() - 0.5) * 6);
    
    prices.push({
      datetime: time.toISOString(),
      pool_price: price,
      forecast_pool_price: forecast
    });
  }
  
  const priceValues = prices.map(p => p.pool_price);
  const avgPrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
  const maxPrice = Math.max(...priceValues);
  const minPrice = Math.min(...priceValues);
  const volatility = Math.sqrt(priceValues.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / priceValues.length);
  
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
};

const generateFallbackMarketAnalytics = (): AESOMarketAnalytics => {
  const stressScore = 35 + Math.floor(Math.random() * 30);
  const basePrice = 45.67;
  const variation = Math.sin(Date.now() / 100000) * 10;
  const nextHourPrice = basePrice + variation;
  
  return {
    market_stress_score: stressScore,
    price_prediction: {
      next_hour_prediction: nextHourPrice,
      confidence: 78 + Math.floor(Math.random() * 15),
      trend_direction: variation > 0 ? 'increasing' : 'decreasing',
      predicted_range: {
        low: nextHourPrice - 5,
        high: nextHourPrice + 8
      }
    },
    capacity_gap_analysis: {
      current_gap_mw: 850 + Math.floor(Math.random() * 400),
      utilization_rate: 72 + Math.floor(Math.random() * 15),
      status: 'adequate',
      recommendation: 'normal_operations'
    },
    investment_opportunities: [
      {
        type: 'generation_expansion',
        priority: 'high',
        reason: 'Strong market demand and pricing conditions',
        potential_return: 'high'
      },
      {
        type: 'renewable_development',
        priority: 'medium',
        reason: 'Government incentives and growing demand',
        potential_return: 'medium'
      }
    ],
    risk_assessment: {
      risks: [
        { type: 'price_volatility', level: 'medium', impact: 'moderate' },
        { type: 'supply_shortage', level: 'low', impact: 'minor' }
      ],
      overall_risk_level: 'medium'
    },
    market_timing_signals: [
      { type: 'price_momentum', strength: 'medium', timeframe: 'near_term' },
      { type: 'demand_growth', strength: 'strong', timeframe: 'medium_term' }
    ],
    timestamp: new Date().toISOString()
  };
};

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
    // NOTE: AESO does not provide public wind/solar forecast API
    // This feature requires a paid AESO subscription or alternate data source
    // For now, return null to indicate no real data available
    setWindSolarForecast(null);
    return null;
  };

  const getAssetOutages = async () => {
    // NOTE: AESO asset outage data requires authentication and is not in public API
    // This feature requires proper AESO market participant credentials
    // For now, return null to indicate no real data available
    setAssetOutages(null);
    return null;
  };

  const getHistoricalPrices = async () => {
    // Fetch REAL 30-day historical prices from AESO API via our edge function
    try {
      // Use 'monthly' timeframe to get ~30 days of hourly data for proper 95% uptime calculation
      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: { timeframe: 'monthly' }
      });

      if (error) throw error;

      if (data && data.statistics) {
        const historicalData: AESOHistoricalPrices = {
          prices: data.rawHourlyData?.map((item: any) => ({
            datetime: item.ts,
            pool_price: item.price,
            forecast_pool_price: item.price // AESO doesn't provide forecast in historical
          })) || [],
          statistics: {
            average_price: data.statistics.average,
            max_price: data.statistics.peak,
            min_price: data.statistics.low,
            price_volatility: data.statistics.volatility || 0,
            total_records: data.rawHourlyData?.length || 0
          },
          timestamp: new Date().toISOString()
        };
        setHistoricalPrices(historicalData);
        checkForAlerts('historical_prices', historicalData);
        return historicalData;
      }
    } catch (e) {
      console.error('Error fetching real AESO historical prices:', e);
    }
    setHistoricalPrices(null);
    return null;
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
