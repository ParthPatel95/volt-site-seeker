
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

  const fetchAESOEnhancedData = async (dataType: string) => {
    setLoading(true);
    try {
      console.log('Fetching AESO enhanced data:', dataType);
      
      const { data, error } = await supabase.functions.invoke('aeso-data-integration', {
        body: {
          action: dataType
        }
      });

      if (error) {
        console.error('AESO Enhanced API error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch AESO enhanced data');
      }

      console.log('AESO enhanced data received:', data);
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching AESO enhanced data:', error);
      toast({
        title: "Data Fetch Error",
        description: `Failed to fetch ${dataType}: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getWindSolarForecast = async () => {
    const data = await fetchAESOEnhancedData('fetch_wind_solar_forecast');
    if (data) {
      setWindSolarForecast(data);
      checkForAlerts('wind_solar_forecast', data);
    }
    return data;
  };

  const getAssetOutages = async () => {
    const data = await fetchAESOEnhancedData('fetch_asset_outages');
    if (data) {
      setAssetOutages(data);
      checkForAlerts('asset_outages', data);
    }
    return data;
  };

  const getHistoricalPrices = async () => {
    const data = await fetchAESOEnhancedData('fetch_historical_prices');
    if (data) {
      setHistoricalPrices(data);
      checkForAlerts('historical_prices', data);
    }
    return data;
  };

  const getMarketAnalytics = async () => {
    const data = await fetchAESOEnhancedData('fetch_market_analytics');
    if (data) {
      setMarketAnalytics(data);
      checkForAlerts('market_analytics', data);
    }
    return data;
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
      newAlerts.forEach(alert => {
        toast({
          title: `Market Alert: ${alert.type}`,
          description: alert.message,
          variant: alert.severity === 'high' ? 'destructive' : 'default'
        });
      });
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Auto-fetch enhanced data on component mount
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
