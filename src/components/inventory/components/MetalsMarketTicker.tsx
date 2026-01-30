import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export type MetalCategory = 'precious' | 'steel' | 'industrial' | 'alloy' | 'specialty';

export interface MetalPrice {
  symbol: string;
  name: string;
  shortName: string;
  price: number | null;
  unit: string;
  change?: number;
  category: MetalCategory;
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

const CATEGORY_CONFIG: Record<MetalCategory, { icon: string; label: string; gradient: string }> = {
  precious: { 
    icon: '✨', 
    label: 'Precious', 
    gradient: 'from-amber-500/20 to-amber-500/5' 
  },
  steel: { 
    icon: '🏗️', 
    label: 'Steel', 
    gradient: 'from-slate-600/20 to-slate-600/5' 
  },
  industrial: { 
    icon: '⚙️', 
    label: 'Industrial', 
    gradient: 'from-slate-500/20 to-slate-500/5' 
  },
  alloy: { 
    icon: '🔗', 
    label: 'Alloys', 
    gradient: 'from-orange-500/20 to-orange-500/5' 
  },
  specialty: { 
    icon: '💎', 
    label: 'Specialty', 
    gradient: 'from-purple-500/20 to-purple-500/5' 
  },
};

const CATEGORY_ORDER: MetalCategory[] = ['precious', 'steel', 'industrial', 'alloy', 'specialty'];

const SOURCE_CONFIG = {
  live: { icon: Wifi, label: 'Live', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  cached: { icon: Clock, label: 'Cached', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  default: { icon: WifiOff, label: 'Offline', color: 'text-muted-foreground', bgColor: 'bg-muted' },
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

  // Group metals by category
  const metalsByCategory = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = metals.filter(m => m.category === category);
    return acc;
  }, {} as Record<MetalCategory, MetalPrice[]>);

  const SourceIcon = SOURCE_CONFIG[source].icon;

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[1, 2, 3, 4].map(j => (
                  <Skeleton key={j} className="h-16 w-24 flex-shrink-0 rounded-lg" />
                ))}
              </div>
            </div>
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
              <Badge variant="secondary" className={cn("text-xs px-1.5 py-0", SOURCE_CONFIG[source].bgColor)}>
                <SourceIcon className={cn("w-3 h-3 mr-1", SOURCE_CONFIG[source].color)} />
                <span className={SOURCE_CONFIG[source].color}>{SOURCE_CONFIG[source].label}</span>
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
            {CATEGORY_ORDER.map(category => {
              const categoryMetals = metalsByCategory[category];
              if (categoryMetals.length === 0) return null;
              
              const config = CATEGORY_CONFIG[category];
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <span className="text-xs">{config.icon}</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {config.label}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3">
                    {categoryMetals.map(metal => (
                      <MetalChip key={metal.symbol} metal={metal} gradient={config.gradient} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function MetalChip({ metal, gradient }: { metal: MetalPrice; gradient: string }) {
  const isPositive = metal.change && metal.change > 0;
  const isNegative = metal.change && metal.change < 0;

  // Format price based on value
  const formatPrice = (price: number) => {
    if (price >= 100) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 4 })}`;
    }
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 flex flex-col min-w-[90px] p-2 rounded-lg border border-border/60",
        "bg-gradient-to-br hover:shadow-md-soft transition-all duration-200",
        gradient
      )}
    >
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
        {metal.shortName}
      </span>
      
      {metal.price !== null ? (
        <>
          <span className="text-sm font-bold tabular-nums text-foreground mt-0.5">
            {formatPrice(metal.price)}
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
