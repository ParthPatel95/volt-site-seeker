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
  /** Converts a CAD amount to the active currency. Pass-through when CAD. */
  convert: (cadAmount: number) => number;
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

function readPersistedCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'USD' || v === 'CAD' ? v : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(readPersistedCurrency);
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
