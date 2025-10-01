import { useState, useEffect, useCallback } from 'react';

export interface ERCOTAlert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
}

export interface ERCOTWindSolarForecast {
  wind_forecast: Array<{ time: string; mw: number }>;
  solar_forecast: Array<{ time: string; mw: number }>;
  timestamp: string;
}

export interface ERCOTAssetOutages {
  total_outages: number;
  total_capacity_mw: number;
  outages_by_type: Array<{ type: string; count: number; capacity_mw: number }>;
  timestamp: string;
}

export interface ERCOTHistoricalPrices {
  hourly: Array<{ time: string; price: number }>;
  daily: Array<{ date: string; avg_price: number; max_price: number; min_price: number }>;
  timestamp: string;
}

export interface ERCOTMarketAnalytics {
  market_stress_score: number;
  price_volatility: number;
  demand_trend: string;
  generation_stability: number;
  timestamp: string;
}

export const useERCOTEnhancedData = () => {
  const [windSolarForecast, setWindSolarForecast] = useState<ERCOTWindSolarForecast | null>(null);
  const [assetOutages, setAssetOutages] = useState<ERCOTAssetOutages | null>(null);
  const [historicalPrices, setHistoricalPrices] = useState<ERCOTHistoricalPrices | null>(null);
  const [marketAnalytics, setMarketAnalytics] = useState<ERCOTMarketAnalytics | null>(null);
  const [alerts, setAlerts] = useState<ERCOTAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMockData = useCallback(() => {
    // Generate mock wind/solar forecast
    const now = new Date();
    const windForecast = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(now.getTime() + i * 3600000).toISOString(),
      mw: Math.round(5000 + Math.random() * 10000 + Math.sin(i / 4) * 3000)
    }));
    
    const solarForecast = Array.from({ length: 24 }, (_, i) => {
      const hour = (now.getHours() + i) % 24;
      const daylight = hour >= 6 && hour <= 20;
      return {
        time: new Date(now.getTime() + i * 3600000).toISOString(),
        mw: daylight ? Math.round(Math.random() * 12000 * Math.sin((hour - 6) * Math.PI / 14)) : 0
      };
    });

    setWindSolarForecast({
      wind_forecast: windForecast,
      solar_forecast: solarForecast,
      timestamp: now.toISOString()
    });

    // Generate mock asset outages
    setAssetOutages({
      total_outages: Math.round(Math.random() * 15) + 5,
      total_capacity_mw: Math.round(Math.random() * 5000) + 2000,
      outages_by_type: [
        { type: 'Natural Gas', count: Math.round(Math.random() * 5) + 2, capacity_mw: Math.round(Math.random() * 2000) + 500 },
        { type: 'Wind', count: Math.round(Math.random() * 4) + 1, capacity_mw: Math.round(Math.random() * 1500) + 300 },
        { type: 'Solar', count: Math.round(Math.random() * 3) + 1, capacity_mw: Math.round(Math.random() * 1000) + 200 },
        { type: 'Coal', count: Math.round(Math.random() * 2), capacity_mw: Math.round(Math.random() * 800) }
      ],
      timestamp: now.toISOString()
    });

    // Generate mock historical prices
    const hourlyPrices = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(now.getTime() - (24 - i) * 3600000).toISOString(),
      price: 20 + Math.random() * 60 + Math.sin(i / 3) * 15
    }));

    const dailyPrices = Array.from({ length: 30 }, (_, i) => {
      const basePrice = 35 + Math.random() * 20;
      return {
        date: new Date(now.getTime() - (30 - i) * 86400000).toISOString().split('T')[0],
        avg_price: basePrice,
        max_price: basePrice + Math.random() * 30,
        min_price: basePrice - Math.random() * 15
      };
    });

    setHistoricalPrices({
      hourly: hourlyPrices,
      daily: dailyPrices,
      timestamp: now.toISOString()
    });

    // Generate mock market analytics
    const stressScore = Math.round(Math.random() * 100);
    setMarketAnalytics({
      market_stress_score: stressScore,
      price_volatility: Math.random() * 0.5 + 0.1,
      demand_trend: stressScore > 70 ? 'increasing' : stressScore > 40 ? 'stable' : 'decreasing',
      generation_stability: Math.random() * 0.3 + 0.7,
      timestamp: now.toISOString()
    });

    // Generate mock alerts
    const mockAlerts: ERCOTAlert[] = [];
    if (stressScore > 70) {
      mockAlerts.push({
        id: `alert-${Date.now()}-1`,
        type: 'market_stress',
        severity: 'high',
        message: 'High market stress detected - prices may be volatile',
        timestamp: now.toISOString()
      });
    }
    if (Math.random() > 0.7) {
      mockAlerts.push({
        id: `alert-${Date.now()}-2`,
        type: 'outage',
        severity: 'medium',
        message: 'Multiple generation units offline - monitor capacity',
        timestamp: now.toISOString()
      });
    }
    setAlerts(mockAlerts);

    setLoading(false);
  }, []);

  useEffect(() => {
    generateMockData();
    const interval = setInterval(generateMockData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [generateMockData]);

  const refetchAll = useCallback(() => {
    setLoading(true);
    generateMockData();
  }, [generateMockData]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    windSolarForecast,
    assetOutages,
    historicalPrices,
    marketAnalytics,
    alerts,
    loading,
    error,
    refetchAll,
    dismissAlert,
    clearAllAlerts
  };
};
