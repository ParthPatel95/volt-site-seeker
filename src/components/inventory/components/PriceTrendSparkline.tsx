import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface PriceTrendSparklineProps {
  prices: number[];
  changePercent: number;
  metalName: string;
  compact?: boolean;
  className?: string;
}

export function PriceTrendSparkline({
  prices,
  changePercent,
  metalName,
  compact = false,
  className,
}: PriceTrendSparklineProps) {
  if (prices.length < 2) {
    return null;
  }

  // Normalize prices for sparkline (0-100 scale)
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const normalizedPrices = prices.map(p => ((p - min) / range) * 100);

  // Generate SVG path for sparkline
  const width = compact ? 40 : 60;
  const height = compact ? 16 : 24;
  const points = normalizedPrices.map((p, i) => {
    const x = (i / (normalizedPrices.length - 1)) * width;
    const y = height - (p / 100) * height;
    return `${x},${y}`;
  }).join(' ');

  const isPositive = changePercent > 0;
  const isNeutral = Math.abs(changePercent) < 0.5;

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral 
    ? 'text-muted-foreground' 
    : isPositive 
      ? 'text-data-positive' 
      : 'text-data-negative';

  const sparklineColor = isNeutral
    ? 'stroke-muted-foreground'
    : isPositive
      ? 'stroke-data-positive'
      : 'stroke-data-negative';

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              <svg width={width} height={height} className="overflow-visible">
                <polyline
                  points={points}
                  fill="none"
                  className={cn("stroke-[1.5]", sparklineColor)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={cn("text-xs font-medium tabular-nums", trendColor)}>
                {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{metalName} 7-Day Trend</p>
              <p className="text-xs text-muted-foreground">
                {isPositive ? 'Up' : isNeutral ? 'Stable' : 'Down'} {Math.abs(changePercent).toFixed(1)}% this week
              </p>
              <p className="text-xs text-muted-foreground">
                Range: ${min.toFixed(2)} - ${max.toFixed(2)}/lb
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          className={cn("stroke-2", sparklineColor)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex items-center gap-1">
        <TrendIcon className={cn("w-3.5 h-3.5", trendColor)} />
        <Badge 
          variant={isNeutral ? 'muted' : isPositive ? 'success' : 'error'}
          size="sm"
          className="tabular-nums"
        >
          {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
        </Badge>
      </div>
    </div>
  );
}

// Inline badge version for table cells
export function PriceChangeBadge({
  changePercent,
  className,
}: {
  changePercent: number;
  className?: string;
}) {
  const isPositive = changePercent > 0;
  const isNeutral = Math.abs(changePercent) < 0.5;

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  
  return (
    <Badge
      variant={isNeutral ? 'muted' : isPositive ? 'success' : 'error'}
      size="sm"
      className={cn("gap-0.5 tabular-nums", className)}
    >
      <TrendIcon className="w-3 h-3" />
      {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
    </Badge>
  );
}
