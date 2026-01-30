import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MarketNewsFeed } from './MarketNewsFeed';
import { MarketVolatilityBanner } from './MarketVolatilityBanner';
import { useMarketIntelligence, PriceTrend, NewsArticle } from '../hooks/useMarketIntelligence';

interface MarketIntelligencePanelProps {
  className?: string;
}

export function MarketIntelligencePanel({ className }: MarketIntelligencePanelProps) {
  const {
    trends,
    fluctuation,
    news,
    isLoading,
    error,
    getVolatileMetals,
    getMaxVolatility,
  } = useMarketIntelligence();

  const [volatilityDismissed, setVolatilityDismissed] = useState(false);

  const volatileMetals = getVolatileMetals();
  const maxVolatility = getMaxVolatility();

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  const hasTrends = Object.keys(trends).length > 0;
  const hasNews = news.length > 0;
  const hasVolatility = volatileMetals.length > 0 && !volatilityDismissed;

  // Don't show panel if no data
  if (!hasTrends && !hasNews && !hasVolatility) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <Activity className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Market Intelligence</h2>
      </div>

      {/* Volatility Warning */}
      {hasVolatility && (
        <MarketVolatilityBanner
          volatileMetals={volatileMetals}
          maxVolatility={maxVolatility}
          onDismiss={() => setVolatilityDismissed(true)}
        />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Price Trends Card */}
        {hasTrends && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                7-Day Price Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {Object.entries(trends).map(([metal, trend]) => (
                <TrendRow key={metal} metal={metal} trend={trend} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* News Feed */}
        {hasNews && (
          <MarketNewsFeed news={news} isLoading={isLoading} defaultOpen={false} />
        )}
      </div>
    </div>
  );
}

interface TrendRowProps {
  metal: string;
  trend: PriceTrend;
}

const METAL_DISPLAY_NAMES: Record<string, string> = {
  copper: 'Copper',
  aluminum: 'Aluminum',
  steel: 'Steel',
  stainless: 'Stainless',
  iron: 'Iron',
  gold: 'Gold',
  silver: 'Silver',
  platinum: 'Platinum',
  palladium: 'Palladium',
};

function TrendRow({ metal, trend }: TrendRowProps) {
  const isPositive = trend.changePercent > 0;
  const isNegative = trend.changePercent < 0;
  const displayName = METAL_DISPLAY_NAMES[metal] || metal;

  // Mini sparkline from trend prices
  const sparklinePoints = trend.prices.length > 1 
    ? generateSparklinePath(trend.prices)
    : null;

  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-accent/50 transition-colors">
      <span className="text-sm font-medium w-20 truncate text-foreground">{displayName}</span>
      
      {/* Sparkline */}
      <div className="flex-1 h-6 relative">
        {sparklinePoints && (
          <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
            <path
              d={sparklinePoints}
              fill="none"
              stroke={isPositive ? 'hsl(var(--data-positive))' : isNegative ? 'hsl(var(--data-negative))' : 'hsl(var(--muted-foreground))'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Change Percentage */}
      <div
        className={cn(
          "flex items-center gap-1 text-xs font-medium min-w-[60px] justify-end",
          isPositive && "text-emerald-600",
          isNegative && "text-red-600",
          !isPositive && !isNegative && "text-muted-foreground"
        )}
      >
        {isPositive && <TrendingUp className="w-3 h-3" />}
        {isNegative && <TrendingDown className="w-3 h-3" />}
        <span className="tabular-nums">
          {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function generateSparklinePath(prices: number[]): string {
  if (prices.length < 2) return '';

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * 100;
    const y = 24 - ((price - min) / range) * 20 - 2;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}
