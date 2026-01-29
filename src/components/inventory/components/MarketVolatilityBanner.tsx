import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MarketVolatilityBannerProps {
  volatileMetals: string[];
  maxVolatility: { metal: string; percent: number } | null;
  onDismiss?: () => void;
  className?: string;
}

const METAL_DISPLAY_NAMES: Record<string, string> = {
  copper: 'Copper',
  aluminum: 'Aluminum',
  steel: 'Steel',
  stainless: 'Stainless Steel',
  brass: 'Brass',
  iron: 'Iron',
};

export function MarketVolatilityBanner({
  volatileMetals,
  maxVolatility,
  onDismiss,
  className,
}: MarketVolatilityBannerProps) {
  if (volatileMetals.length === 0 || !maxVolatility) {
    return null;
  }

  const isPositive = maxVolatility.percent > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const metalName = METAL_DISPLAY_NAMES[maxVolatility.metal] || maxVolatility.metal;
  const otherMetals = volatileMetals
    .filter(m => m !== maxVolatility.metal)
    .map(m => METAL_DISPLAY_NAMES[m] || m);

  return (
    <Alert 
      className={cn(
        "border-data-warning/50 bg-data-warning/10",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 text-data-warning" />
      <AlertTitle className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          High Market Volatility
          <TrendIcon className={cn(
            "w-4 h-4",
            isPositive ? "text-data-positive" : "text-data-negative"
          )} />
        </span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDismiss}
            className="h-6 w-6 -mr-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-1">
        <span className="font-medium">{metalName}</span> prices have{' '}
        <span className={cn(
          "font-bold",
          isPositive ? "text-data-positive" : "text-data-negative"
        )}>
          {isPositive ? 'increased' : 'decreased'} {Math.abs(maxVolatility.percent).toFixed(1)}%
        </span>{' '}
        this week.
        {otherMetals.length > 0 && (
          <> {otherMetals.join(', ')} also showing significant movement.</>
        )}
        <span className="block mt-1 text-muted-foreground">
          Consider locking in prices quickly or waiting for market stabilization.
        </span>
      </AlertDescription>
    </Alert>
  );
}
