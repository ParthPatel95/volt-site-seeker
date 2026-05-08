import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useExchangeRate } from '@/hooks/useExchangeRate';

export type CurrencyCode = 'CAD' | 'USD';

export interface CurrencyContextValue {
  /** Currently selected display currency. */
  currency: CurrencyCode;
  /** Sets the active currency (and persists to localStorage). */
  setCurrency: (next: CurrencyCode) => void;
  /** Toggles between CAD and USD. */
  toggle: () => void;
  /** Converts a CAD-denominated amount to the active currency.
   *  Pass-through when active currency is CAD. */
  convert: (cadAmount: number) => number;
  /** Converts a USD-denominated amount to the active currency.
   *  Use this for markets that publish prices natively in USD
   *  (ERCOT, MISO, CAISO, NYISO, PJM, SPP). Pass-through when USD. */
  convertFromUSD: (usdAmount: number) => number;
  /** "$" symbol for the active currency. */
  symbol: string;
  /** Formats `cadAmount` as a string with the active currency's symbol. */
  format: (cadAmount: number, options?: { fractionDigits?: number; suffix?: string }) => string;
  /** The CAD→USD rate currently in use. */
  rate: number;
  /** ISO timestamp of the most recent successful upstream rate fetch. */
  rateLastUpdated: string | null;
  rateSource: string;
}

const STORAGE_KEY = 'aeso-hub-currency';
const DEFAULT_CURRENCY: CurrencyCode = 'CAD';

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

function readPersistedCurrency(fallback: CurrencyCode): CurrencyCode {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'USD' || v === 'CAD' ? v : fallback;
  } catch {
    return fallback;
  }
}

interface CurrencyProviderProps {
  children: ReactNode;
  /**
   * The currency to use when nothing is stored in localStorage yet. Hubs
   * with native CAD pricing (AESO) leave this at the default of CAD; the
   * cross-market Dashboard, which has historically rendered every ISO in
   * USD, passes `'USD'` so the previous behaviour is preserved on first
   * visit. The user can still toggle, and that choice is persisted across
   * pages from then on.
   */
  initialCurrency?: CurrencyCode;
}

export function CurrencyProvider({ children, initialCurrency = DEFAULT_CURRENCY }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => readPersistedCurrency(initialCurrency));
  const { exchangeRate } = useExchangeRate();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, currency);
    } catch {
      /* ignore quota/private-mode errors */
    }
  }, [currency]);

  const setCurrency = useCallback((next: CurrencyCode) => setCurrencyState(next), []);
  const toggle = useCallback(() => setCurrencyState((c) => (c === 'CAD' ? 'USD' : 'CAD')), []);

  const value = useMemo<CurrencyContextValue>(() => {
    const rate = exchangeRate.rate;
    const convert = (cad: number) => (currency === 'USD' ? cad * rate : cad);
    const convertFromUSD = (usd: number) => (currency === 'CAD' && rate > 0 ? usd / rate : usd);
    const symbol = '$';
    const format = (cad: number, options?: { fractionDigits?: number; suffix?: string }) => {
      const digits = options?.fractionDigits ?? 2;
      const value = convert(cad);
      const sign = value < 0 ? '-' : '';
      const abs = Math.abs(value);
      return `${sign}${symbol}${abs.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })}${options?.suffix ?? ''} ${currency}`;
    };
    return {
      currency,
      setCurrency,
      toggle,
      convert,
      convertFromUSD,
      symbol,
      format,
      rate,
      rateLastUpdated: exchangeRate.lastUpdated,
      rateSource: exchangeRate.source,
    };
  }, [currency, setCurrency, toggle, exchangeRate]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/**
 * Hook to read / set the active display currency. Outside a CurrencyProvider
 * this falls back to a CAD-only no-op so legacy components keep rendering.
 */
export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (ctx) return ctx;
  return {
    currency: 'CAD',
    setCurrency: () => undefined,
    toggle: () => undefined,
    convert: (cad) => cad,
    convertFromUSD: (usd) => usd,
    symbol: '$',
    format: (cad, options) => `$${(cad ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: options?.fractionDigits ?? 2,
      maximumFractionDigits: options?.fractionDigits ?? 2,
    })}${options?.suffix ?? ''} CAD`,
    rate: 1,
    rateLastUpdated: null,
    rateSource: 'default',
  };
}
