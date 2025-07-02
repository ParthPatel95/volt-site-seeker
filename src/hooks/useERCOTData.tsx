
import { useState, useEffect } from 'react';

interface ERCOTPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
}

interface ERCOTLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
}

interface ERCOTGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  wind_mw: number;
  solar_mw: number;
  nuclear_mw: number;
  renewable_percentage: number;
}

export const useERCOTData = () => {
  const [pricing, setPricing] = useState<ERCOTPricing | null>(null);
  const [loadData, setLoadData] = useState<ERCOTLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<ERCOTGenerationMix | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate realistic ERCOT data
        const mockPricing: ERCOTPricing = {
          current_price: 32.45,
          average_price: 29.87,
          peak_price: 67.23,
          off_peak_price: 18.56,
          market_conditions: 'normal'
        };

        const mockLoadData: ERCOTLoadData = {
          current_demand_mw: 52340,
          peak_forecast_mw: 78500,
          reserve_margin: 15.2
        };

        const mockGenerationMix: ERCOTGenerationMix = {
          total_generation_mw: 58750,
          natural_gas_mw: 28420,
          wind_mw: 15680,
          solar_mw: 8920,
          nuclear_mw: 5730,
          renewable_percentage: 41.8
        };

        setPricing(mockPricing);
        setLoadData(mockLoadData);
        setGenerationMix(mockGenerationMix);
      } catch (error) {
        console.error('Error fetching ERCOT data:', error);
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
    refetch
  };
};
