import { useState, useEffect } from 'react';

interface ExchangeRateData {
  rate: number;
  lastUpdated: string;
  source: string;
}

// Hardcoded CAD to USD rate - updated periodically
// CAD/USD typically ranges 0.72-0.76, using 0.73 as reasonable average
const FALLBACK_RATE = 0.73;

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData>({
    rate: FALLBACK_RATE,
    lastUpdated: new Date().toISOString(),
    source: 'default'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try Open Exchange Rates (CORS-friendly, no auth for base rates)
      const response = await fetch('https://open.er-api.com/v6/latest/CAD', {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      
      const data = await response.json();
      
      if (data.rates && data.rates.USD) {
        setExchangeRate({
          rate: data.rates.USD,
          lastUpdated: new Date().toISOString(),
          source: 'open.er-api.com'
        });
        return;
      }
      
      throw new Error('Invalid exchange rate data');
    } catch (err) {
      console.warn('Exchange rate fetch failed, using fallback:', err);
      setError('Using fallback rate');
      // Keep existing rate or use fallback
      setExchangeRate(prev => ({
        rate: prev?.rate || FALLBACK_RATE,
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
    
    // Refresh exchange rate every hour (rate doesn't change much)
    const interval = setInterval(fetchExchangeRate, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const convertToUSD = (cadAmount: number): number => {
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
