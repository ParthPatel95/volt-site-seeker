import { useState, useEffect } from 'react';

interface ExchangeRates {
  CAD_to_USD: number;
  lastUpdated: string;
}

export function useCurrencyConversion() {
  const [exchangeRate, setExchangeRate] = useState<number>(0.74); // Fallback rate ~0.74 USD per CAD
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try multiple exchange rate APIs
      const apis = [
        'https://api.exchangerate-api.io/v4/latest/CAD',
        'https://api.fxapi.com/v1/latest?base=CAD&symbols=USD',
        'https://open.er-api.com/v6/latest/CAD'
      ];

      let rateFound = false;
      
      for (const apiUrl of apis) {
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            
            let rate = 0.74; // fallback
            if (data.rates?.USD) {
              rate = data.rates.USD;
            } else if (data.USD) {
              rate = data.USD;
            }
            
            if (rate > 0.5 && rate < 1.0) { // Sanity check for CAD to USD
              setExchangeRate(rate);
              rateFound = true;
              break;
            }
          }
        } catch (apiError) {
          console.warn(`Exchange rate API failed: ${apiUrl}`, apiError);
          continue;
        }
      }
      
      if (!rateFound) {
        console.warn('All exchange rate APIs failed, using fallback rate');
        // Keep the fallback rate of 0.74
      }
      
    } catch (fetchError) {
      console.error('Currency conversion error:', fetchError);
      setError('Failed to fetch exchange rate');
      // Keep using fallback rate
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const convertCADtoUSD = (cadAmount: number): number => {
    return cadAmount * exchangeRate;
  };

  const formatCurrency = (amount: number, currency: 'CAD' | 'USD' = 'CAD'): string => {
    const symbol = currency === 'USD' ? '$' : 'CA$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  return {
    exchangeRate,
    loading,
    error,
    convertCADtoUSD,
    formatCurrency,
    refreshRate: fetchExchangeRate
  };
}
