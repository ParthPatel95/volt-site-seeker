
import { useState, useEffect } from 'react';

interface ExchangeRateData {
  rate: number;
  lastUpdated: string;
  source: string;
}

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using exchangerate-api.io free API (no auth required)
      const response = await fetch('https://api.exchangerate-api.io/v4/latest/CAD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      
      const data = await response.json();
      
      if (data.rates && data.rates.USD) {
        setExchangeRate({
          rate: data.rates.USD,
          lastUpdated: new Date().toISOString(),
          source: 'exchangerate-api.io'
        });
      } else {
        throw new Error('Invalid exchange rate data');
      }
    } catch (err) {
      console.error('Exchange rate fetch error:', err);
      setError('Failed to fetch exchange rate');
      
      // Fallback to a reasonable default rate
      setExchangeRate({
        rate: 0.73, // Approximate CAD to USD rate
        lastUpdated: new Date().toISOString(),
        source: 'fallback estimate'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
    
    // Refresh exchange rate every 30 minutes
    const interval = setInterval(fetchExchangeRate, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const convertToUSD = (cadAmount: number): number => {
    if (!exchangeRate) return 0;
    return cadAmount * exchangeRate.rate;
  };

  return {
    exchangeRate,
    loading,
    error,
    convertToUSD,
    refetch: fetchExchangeRate
  };
}
