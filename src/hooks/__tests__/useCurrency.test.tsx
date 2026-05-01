import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';

vi.mock('@/hooks/useExchangeRate', () => ({
  useExchangeRate: () => ({
    exchangeRate: {
      rate: 0.75,
      lastUpdated: '2026-04-22T12:00:00Z',
      source: 'open.er-api.com',
    },
    loading: false,
    error: null,
    convertToUSD: (cad: number) => cad * 0.75,
    refetch: () => Promise.resolve(),
  }),
}));

import { CurrencyProvider, useCurrency } from '../useCurrency';

const wrapper = ({ children }: { children: ReactNode }) => (
  <CurrencyProvider>{children}</CurrencyProvider>
);

describe('useCurrency', () => {
  it('defaults to CAD and pass-through convert', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    expect(result.current.currency).toBe('CAD');
    expect(result.current.convert(100)).toBe(100);
  });

  it('switches to USD via toggle and applies the rate', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => result.current.toggle());
    expect(result.current.currency).toBe('USD');
    expect(result.current.convert(100)).toBeCloseTo(75, 5);
    expect(result.current.format(100, { fractionDigits: 2, suffix: '/MWh' }))
      .toBe('$75.00/MWh USD');
  });

  it('honours setCurrency for direct selection', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => result.current.setCurrency('USD'));
    expect(result.current.currency).toBe('USD');
    act(() => result.current.setCurrency('CAD'));
    expect(result.current.currency).toBe('CAD');
  });

  it('outside a provider, falls back to CAD-only no-op', () => {
    const { result } = renderHook(() => useCurrency());
    expect(result.current.currency).toBe('CAD');
    expect(result.current.convert(50)).toBe(50);
    // Toggle is a no-op outside the provider
    act(() => result.current.toggle());
    expect(result.current.currency).toBe('CAD');
  });
});
