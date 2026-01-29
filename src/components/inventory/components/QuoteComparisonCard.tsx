import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriceTrend {
  prices: number[];
  dates: string[];
  changePercent: number;
}

interface QuoteComparisonCardProps {
  currentQuoteValue: number;
  trends: Record<string, PriceTrend>;
  metalBreakdown?: { metalType: string; weight: number; currentPrice: number }[];
  className?: string;
}

export function QuoteComparisonCard({
  currentQuoteValue,
  trends,
  metalBreakdown = [],
  className,
}: QuoteComparisonCardProps) {
  if (Object.keys(trends).length === 0 || currentQuoteValue <= 0) {
    return null;
  }

  // Calculate what the quote would have been 7 days ago
  const calculateHistoricalValue = (): number => {
    if (metalBreakdown.length === 0) return currentQuoteValue;

    let historicalValue = 0;
    
    for (const item of metalBreakdown) {
      const trend = trends[item.metalType];
      if (trend && trend.prices.length >= 2) {
        // First price is 7 days ago
        const oldPrice = trend.prices[0];
        const currentPrice = trend.prices[trend.prices.length - 1];
        const ratio = currentPrice > 0 ? oldPrice / currentPrice : 1;
        historicalValue += item.weight * item.currentPrice * ratio;
      } else {
        // No trend data, assume same value
        historicalValue += item.weight * item.currentPrice;
      }
    }

    return historicalValue;
  };

  // Calculate average change across all metals with trends
  const getAverageChange = (): number => {
    const changes = Object.values(trends).map(t => t.changePercent);
    if (changes.length === 0) return 0;
    return changes.reduce((sum, c) => sum + c, 0) / changes.length;
  };

  const historicalValue = calculateHistoricalValue();
  const averageChange = getAverageChange();
  const valueChange = currentQuoteValue - historicalValue;
  const percentChange = historicalValue > 0 ? (valueChange / historicalValue) * 100 : 0;

  const isPositive = percentChange > 0;
  const isNeutral = Math.abs(percentChange) < 1;
  
  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  // Determine market timing recommendation
  const getMarketTiming = (): { label: string; variant: 'success' | 'warning' | 'error' | 'muted'; description: string } => {
    if (percentChange > 5) {
      return {
        label: 'FAVORABLE',
        variant: 'success',
        description: 'Prices are higher than recent average. Good time to sell.',
      };
    } else if (percentChange > 0) {
      return {
        label: 'SLIGHTLY FAVORABLE',
        variant: 'success',
        description: 'Prices are slightly above recent average.',
      };
    } else if (percentChange > -5) {
      return {
        label: 'NEUTRAL',
        variant: 'muted',
        description: 'Prices are near recent average.',
      };
    } else {
      return {
        label: 'UNFAVORABLE',
        variant: 'warning',
        description: 'Prices are below recent average. Consider waiting.',
      };
    }
  };

  const marketTiming = getMarketTiming();

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Quote Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current vs Historical */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Today's Quote</p>
            <p className="text-xl font-bold">
              ${currentQuoteValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              7 Days Ago
            </p>
            <p className="text-xl font-bold text-muted-foreground">
              ${historicalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Change indicator */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background/80">
          <div className="flex items-center gap-2">
            <TrendIcon className={cn(
              "w-5 h-5",
              isNeutral ? "text-muted-foreground" : isPositive ? "text-data-positive" : "text-data-negative"
            )} />
            <div>
              <p className={cn(
                "text-lg font-bold",
                isNeutral ? "text-foreground" : isPositive ? "text-data-positive" : "text-data-negative"
              )}>
                {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {isPositive ? '+' : ''}${valueChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <Badge variant={marketTiming.variant}>
            {marketTiming.label}
          </Badge>
        </div>

        {/* Market timing description */}
        <p className="text-xs text-muted-foreground">
          {marketTiming.description}
        </p>

        {/* Individual metal trends */}
        {metalBreakdown.length > 0 && (
          <div className="pt-2 border-t border-border/40">
            <p className="text-xs font-medium text-muted-foreground mb-2">Metal Trends (7 days)</p>
            <div className="space-y-1">
              {metalBreakdown.slice(0, 3).map(item => {
                const trend = trends[item.metalType];
                if (!trend) return null;
                
                const change = trend.changePercent;
                const isUp = change > 0;
                const Icon = Math.abs(change) < 0.5 ? Minus : isUp ? TrendingUp : TrendingDown;
                
                return (
                  <div key={item.metalType} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-muted-foreground">{item.metalType}</span>
                    <span className={cn(
                      "flex items-center gap-1 font-medium",
                      Math.abs(change) < 0.5 ? "text-muted-foreground" : isUp ? "text-data-positive" : "text-data-negative"
                    )}>
                      <Icon className="w-3 h-3" />
                      {isUp ? '+' : ''}{change.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
