import { useState, useEffect } from 'react';

interface ExchangeRateData {
  rate: number;
  /** ISO timestamp of the most recent successful upstream fetch, or null if
   *  we have never had a live rate for this session (the rate is the
   *  hardcoded fallback). Consumers should pass this into <DataFreshnessBadge>
   *  so a stale rate is visually distinguishable from a fresh one. */
  lastUpdated: string | null;
  source: 'open.er-api.com' | 'fallback' | 'fallback_estimated' | 'default';
}

// Hardcoded CAD to USD rate - updated periodically
// CAD/USD typically ranges 0.72-0.76, using 0.73 as reasonable average
const FALLBACK_RATE = 0.73;

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData>({
    rate: FALLBACK_RATE,
    // Null until first successful fetch — prevents <DataFreshnessBadge> from
    // labelling the hardcoded fallback as "Live · 0s ago" on cold start.
    lastUpdated: null,
    source: 'default',
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
          source: 'open.er-api.com',
        });
        return;
      }

      throw new Error('Invalid exchange rate data');
    } catch (err) {
      console.warn('Exchange rate fetch failed, using fallback:', err);
      setError('Using fallback rate');
      // Preserve the previous successful `lastUpdated` (if any) so
      // <DataFreshnessBadge> reflects the *actual* rate age, not the time
      // the failure occurred. Source is suffixed with `_estimated` so the
      // badge switches to its amber "Estimated" tone.
      setExchangeRate(prev => ({
        rate: prev?.rate || FALLBACK_RATE,
        lastUpdated: prev?.lastUpdated ?? null,
        source: 'fallback_estimated',
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
