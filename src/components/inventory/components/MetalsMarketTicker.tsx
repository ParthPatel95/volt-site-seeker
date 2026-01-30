import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface MetalPrice {
  symbol: string;
  name: string;
  shortName: string;
  price: number | null;
  unit: string;
  change?: number;
  category: 'precious' | 'industrial';
}

interface MetalsMarketTickerProps {
  metals: MetalPrice[];
  isLoading?: boolean;
  source: 'live' | 'cached' | 'default';
  lastUpdated?: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

const CATEGORY_COLORS = {
  precious: 'from-amber-500/20 to-amber-500/5',
  industrial: 'from-slate-500/20 to-slate-500/5',
};

const CATEGORY_ICONS = {
  precious: '✨',
  industrial: '⚙️',
};

export function MetalsMarketTicker({
  metals,
  isLoading = false,
  source,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  className,
}: MetalsMarketTickerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const preciousMetals = metals.filter(m => m.category === 'precious');
  const industrialMetals = metals.filter(m => m.category === 'industrial');

  const sourceConfig = {
    live: { icon: Wifi, label: 'Live', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    cached: { icon: Clock, label: 'Cached', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    default: { icon: WifiOff, label: 'Offline', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  };

  const SourceIcon = sourceConfig[source].icon;

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-16 w-28 flex-shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-sm font-semibold text-foreground">Live Metal Prices</span>
              <Badge variant="secondary" className={cn("text-xs px-1.5 py-0", sourceConfig[source].bgColor)}>
                <SourceIcon className={cn("w-3 h-3 mr-1", sourceConfig[source].color)} />
                <span className={sourceConfig[source].color}>{sourceConfig[source].label}</span>
              </Badge>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>

          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
              </span>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-7 w-7"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>

        <CollapsibleContent>
          <div className="p-3 space-y-3">
            {/* Precious Metals Row */}
            {preciousMetals.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <span className="text-xs">{CATEGORY_ICONS.precious}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Precious</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3">
                  {preciousMetals.map(metal => (
                    <MetalChip key={metal.symbol} metal={metal} category="precious" />
                  ))}
                </div>
              </div>
            )}

            {/* Industrial Metals Row */}
            {industrialMetals.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <span className="text-xs">{CATEGORY_ICONS.industrial}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Industrial</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3">
                  {industrialMetals.map(metal => (
                    <MetalChip key={metal.symbol} metal={metal} category="industrial" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function MetalChip({ metal, category }: { metal: MetalPrice; category: 'precious' | 'industrial' }) {
  const isPositive = metal.change && metal.change > 0;
  const isNegative = metal.change && metal.change < 0;

  return (
    <div
      className={cn(
        "flex-shrink-0 flex flex-col min-w-[100px] p-2.5 rounded-lg border border-border/60",
        "bg-gradient-to-br hover:shadow-md-soft transition-all duration-200",
        CATEGORY_COLORS[category]
      )}
    >
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
        {metal.shortName}
      </span>
      
      {metal.price !== null ? (
        <>
          <span className="text-sm font-bold tabular-nums text-foreground mt-0.5">
            ${metal.price.toLocaleString(undefined, { 
              minimumFractionDigits: metal.price >= 100 ? 0 : 2,
              maximumFractionDigits: metal.price >= 100 ? 0 : 2,
            })}
          </span>
          <span className="text-[9px] text-muted-foreground">/{metal.unit}</span>
          
          {metal.change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-[10px] font-medium mt-1",
                isPositive && "text-emerald-600",
                isNegative && "text-red-600",
                !isPositive && !isNegative && "text-muted-foreground"
              )}
            >
              {isPositive && <TrendingUp className="w-2.5 h-2.5" />}
              {isNegative && <TrendingDown className="w-2.5 h-2.5" />}
              <span className="tabular-nums">
                {metal.change > 0 ? '+' : ''}{metal.change.toFixed(1)}%
              </span>
            </div>
          )}
        </>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </div>
  );
}
