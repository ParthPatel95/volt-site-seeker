
import { useState, useEffect } from 'react';

interface AESOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  qa_metadata?: any;
}

interface AESOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  capacity_margin: number;
  forecast_date: string;
}

interface AESOGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  wind_mw: number;
  hydro_mw: number;
  solar_mw: number;
  coal_mw: number;
  other_mw: number;
  renewable_percentage: number;
  timestamp: string;
}

export const useAESOData = () => {
  const [pricing, setPricing] = useState<AESOPricing | null>(null);
  const [loadData, setLoadData] = useState<AESOLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<AESOGenerationMix | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus] = useState<'connected' | 'fallback'>('fallback');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate realistic AESO data
        const mockPricing: AESOPricing = {
          current_price: 45.67,
          average_price: 42.31,
          peak_price: 89.45,
          off_peak_price: 28.92,
          market_conditions: 'normal',
          timestamp: new Date().toISOString(),
          qa_metadata: {
            source: 'simulated',
            confidence: 0.9
          }
        };

        const mockLoadData: AESOLoadData = {
          current_demand_mw: 8450,
          peak_forecast_mw: 11200,
          reserve_margin: 18.5,
          capacity_margin: 15.2,
          forecast_date: new Date().toISOString()
        };

        const mockGenerationMix: AESOGenerationMix = {
          total_generation_mw: 9100,
          natural_gas_mw: 4550,
          wind_mw: 2730,
          hydro_mw: 1365,
          solar_mw: 455,
          coal_mw: 820,
          other_mw: 180,
          renewable_percentage: 54.2,
          timestamp: new Date().toISOString()
        };

        setPricing(mockPricing);
        setLoadData(mockLoadData);
        setGenerationMix(mockGenerationMix);
      } catch (error) {
        console.error('Error fetching AESO data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const refetch = () => {
    setLoading(true);
    // Trigger data refresh
    setTimeout(() => setLoading(false), 1000);
  };

  return {
    pricing,
    loadData,
    generationMix,
    loading,
    connectionStatus,
    refetch
  };
};
