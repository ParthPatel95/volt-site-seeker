import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';

interface CurrencyToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Compact CAD/USD toggle. Reads / writes the shared currency context so
 * all consumers of `useCurrency` flip in sync. Outside a CurrencyProvider
 * the toggle is rendered but disabled so the surface stays consistent.
 */
export function CurrencyToggle({ className, size = 'sm' }: CurrencyToggleProps) {
  const { currency, setCurrency } = useCurrency();
  const isSm = size === 'sm';
  return (
    <div
      role="radiogroup"
      aria-label="Display currency"
      className={cn(
        'inline-flex rounded-md border border-border bg-muted/40 p-0.5',
        isSm ? 'text-[10px]' : 'text-xs',
        className
      )}
    >
      {(['CAD', 'USD'] as const).map((c) => {
        const active = currency === c;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setCurrency(c)}
            className={cn(
              'rounded px-2 font-medium transition-colors',
              isSm ? 'py-0.5' : 'py-1',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
