import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PriceSource } from '../types/demolition.types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { PriceChangeBadge } from './PriceTrendSparkline';

interface LivePriceIndicatorProps {
  source: PriceSource;
  lastUpdated: string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
  compact?: boolean;
  priceChangePercent?: number; // Add price change from market data
}

const SOURCE_CONFIG: Record<PriceSource, {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  live: {
    icon: Wifi,
    label: 'Live',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    description: 'Prices fetched from live market data within the last hour',
  },
  cached: {
    icon: Clock,
    label: 'Cached',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
    description: 'Using cached prices. Click refresh to update.',
  },
  default: {
    icon: WifiOff,
    label: 'Offline',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted-foreground',
    description: 'Using default prices. Live pricing unavailable.',
  },
};

export function LivePriceIndicator({
  source,
  lastUpdated,
  isLoading = false,
  onRefresh,
  className,
  compact = false,
  priceChangePercent,
}: LivePriceIndicatorProps) {
  const config = SOURCE_CONFIG[source];
  const Icon = config.icon;
  
  const formattedTime = lastUpdated 
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })
    : 'Unknown';

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1.5", className)}>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", config.bgColor)} />
              <span className={cn("text-xs font-medium", config.color)}>
                {config.label}
              </span>
              {priceChangePercent !== undefined && (
                <PriceChangeBadge changePercent={priceChangePercent} />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{config.description}</p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {formattedTime}
                </p>
              )}
              {priceChangePercent !== undefined && (
                <p className="text-xs text-muted-foreground">
                  7-day change: {priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg border bg-card",
      className
    )}>
      <div className="flex items-center gap-2 flex-1">
        <div className={cn(
          "w-2.5 h-2.5 rounded-full",
          source === 'live' && "animate-pulse",
          config.bgColor
        )} />
        <Icon className={cn("w-4 h-4", config.color)} />
        <div className="flex flex-col">
          <span className={cn("text-sm font-medium", config.color)}>
            {config.label} Prices
          </span>
          <span className="text-xs text-muted-foreground">
            Updated {formattedTime}
          </span>
        </div>
      </div>
      
      {onRefresh && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn(
                  "w-4 h-4",
                  isLoading && "animate-spin"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh prices</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// Inline badge version for use in tables
export function PriceSourceBadge({ 
  source, 
  className 
}: { 
  source: PriceSource; 
  className?: string; 
}) {
  const config = SOURCE_CONFIG[source];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[10px] gap-1",
        source === 'live' && "border-green-300 text-green-600 bg-green-50",
        source === 'cached' && "border-yellow-300 text-yellow-600 bg-yellow-50",
        source === 'default' && "border-muted text-muted-foreground",
        className
      )}
    >
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        config.bgColor
      )} />
      {config.label}
    </Badge>
  );
}
