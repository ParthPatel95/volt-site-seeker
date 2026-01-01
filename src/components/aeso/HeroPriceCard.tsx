import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface HeroPriceCardProps {
  currentPrice: number;
  previousHourPrice: number;
  averagePrice: number;
  timestamp?: string;
  percentile?: number;
  uptimeData: {
    uptimeAverage: number;
    totalDataPoints: number;
    daysOfData: number;
    excludedPrices: number;
    isLive: boolean;
  };
  loading?: boolean;
}

export function HeroPriceCard({
  currentPrice,
  previousHourPrice,
  averagePrice,
  timestamp,
  percentile = 50,
  uptimeData,
  loading
}: HeroPriceCardProps) {
  const [displayPrice, setDisplayPrice] = useState(currentPrice);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (currentPrice !== displayPrice && !loading) {
      setIsFlashing(true);
      
      const duration = 600;
      const startPrice = displayPrice;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const newPrice = startPrice + (currentPrice - startPrice) * easeOut;
        
        setDisplayPrice(newPrice);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => setIsFlashing(false), 150);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [currentPrice, displayPrice, loading]);

  const hourlyChange = currentPrice - previousHourPrice;
  const hourlyChangePercent = previousHourPrice !== 0 
    ? (hourlyChange / previousHourPrice) * 100 
    : 0;

  const isPositive = hourlyChange > 0;
  const isNeutral = hourlyChange === 0;

  const getPriceLevel = (price: number): { label: string; variant: 'success' | 'warning' | 'error' | 'info' } => {
    if (price > 100) return { label: 'SPIKE', variant: 'error' };
    if (price > 60) return { label: 'HIGH', variant: 'warning' };
    if (price > 30) return { label: 'NORMAL', variant: 'success' };
    return { label: 'LOW', variant: 'info' };
  };

  const priceLevel = getPriceLevel(currentPrice);

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-48 bg-muted rounded animate-pulse mb-4" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "h-full transition-all duration-200",
      isFlashing && "ring-1 ring-primary/50"
    )}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-data-positive" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-data-positive animate-ping opacity-75" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Live Price
              </span>
            </div>
            {timestamp && (
              <span className="text-xs text-muted-foreground font-mono">
                {format(new Date(timestamp), 'HH:mm:ss')}
              </span>
            )}
          </div>
          <Badge variant={priceLevel.variant} className="font-mono text-xs">
            {priceLevel.label}
          </Badge>
        </div>

        {/* Main Price Display */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-medium text-muted-foreground">$</span>
            <span className={cn(
              "text-5xl sm:text-6xl font-bold font-mono tracking-tight text-foreground transition-transform duration-150",
              isFlashing && "scale-[1.02]"
            )}>
              {displayPrice.toFixed(2)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground mt-2 font-medium">CAD / MWh</span>
          
          {/* Hourly Change */}
          <div className={cn(
            "flex items-center gap-2 mt-4 px-3 py-1.5 rounded-md border",
            isNeutral ? "bg-muted/50 border-border" :
            isPositive ? "bg-data-negative/5 border-data-negative/20" : "bg-data-positive/5 border-data-positive/20"
          )}>
            {isNeutral ? (
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
            ) : isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-data-negative" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-data-positive" />
            )}
            <span className={cn(
              "text-sm font-mono font-medium",
              isNeutral ? "text-muted-foreground" :
              isPositive ? "text-data-negative" : "text-data-positive"
            )}>
              {isPositive ? '+' : ''}{hourlyChange.toFixed(2)} ({isPositive ? '+' : ''}{hourlyChangePercent.toFixed(1)}%)
            </span>
            <span className="text-xs text-muted-foreground">1h</span>
          </div>
        </div>

        {/* Percentile Indicator */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3" />
              30-Day Percentile
            </span>
            <span className="font-mono font-medium">{percentile.toFixed(0)}%</span>
          </div>
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-data-positive via-data-warning to-data-negative rounded-full transition-all duration-500"
              style={{ width: `${percentile}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {uptimeData.daysOfData > 0 ? `${uptimeData.daysOfData}d` : '30d'} Avg (95%)
              </span>
              {uptimeData.isLive && (
                <Badge variant="dot-success" className="h-1.5 w-1.5 p-0" />
              )}
            </div>
            <p className="text-xl font-bold font-mono">${uptimeData.uptimeAverage.toFixed(2)}</p>
            {uptimeData.totalDataPoints > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {uptimeData.totalDataPoints.toLocaleString()} hrs • {uptimeData.excludedPrices} spikes excluded
              </p>
            )}
          </div>
          
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">vs Average</span>
            <p className={cn(
              "text-xl font-bold font-mono",
              currentPrice > averagePrice ? "text-data-negative" : "text-data-positive"
            )}>
              {currentPrice > averagePrice ? '+' : ''}{(currentPrice - averagePrice).toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {Math.abs(((currentPrice - averagePrice) / averagePrice) * 100).toFixed(1)}% {currentPrice > averagePrice ? 'above' : 'below'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
