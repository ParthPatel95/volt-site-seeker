import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketItem {
  id: string;
  name: string;
  shortName: string;
  price: number | null;
  change?: number;
  currency?: string;
  isLoading?: boolean;
}

interface MarketSummaryBarProps {
  markets: MarketItem[];
  className?: string;
  onMarketClick?: (marketId: string) => void;
}

const marketColors: Record<string, string> = {
  ercot: 'var(--market-ercot)',
  aeso: 'var(--market-aeso)',
  miso: 'var(--market-miso)',
  caiso: 'var(--market-caiso)',
  nyiso: 'var(--market-nyiso)',
  pjm: 'var(--market-pjm)',
  spp: 'var(--market-spp)',
  ieso: 'var(--market-ieso)',
};

export function MarketSummaryBar({ markets, className, onMarketClick }: MarketSummaryBarProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {markets.map((market) => {
          const accentColor = marketColors[market.id.toLowerCase()] || 'var(--primary)';
          const isPositive = market.change && market.change > 0;
          const isNegative = market.change && market.change < 0;

          return (
            <button
              key={market.id}
              onClick={() => onMarketClick?.(market.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card',
                'hover:shadow-md-soft hover:border-border/80 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
                'group cursor-pointer min-w-[140px] sm:min-w-[160px]'
              )}
            >
              {/* Color Indicator */}
              <div
                className="w-2 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: `hsl(${accentColor})` }}
              />

              <div className="flex flex-col items-start min-w-0">
                {/* Market Name */}
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {market.shortName}
                </span>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  {market.isLoading ? (
                    <span className="h-6 w-16 bg-muted rounded animate-pulse" />
                  ) : market.price !== null ? (
                    <>
                      <span className="text-lg font-semibold tabular-nums text-foreground">
                        {market.currency || '$'}{market.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>

                {/* Change */}
                {market.change !== undefined && market.price !== null && (
                  <div
                    className={cn(
                      'flex items-center gap-0.5 text-xs font-medium',
                      isPositive && 'text-data-negative', // Price going up is bad for buyers
                      isNegative && 'text-data-positive', // Price going down is good
                      !isPositive && !isNegative && 'text-muted-foreground'
                    )}
                  >
                    {isPositive && <TrendingUp className="w-3 h-3" />}
                    {isNegative && <TrendingDown className="w-3 h-3" />}
                    <span className="tabular-nums">
                      {market.change > 0 ? '+' : ''}{market.change.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MarketSummaryBar;
