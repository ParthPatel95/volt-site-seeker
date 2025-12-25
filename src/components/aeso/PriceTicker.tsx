import React, { useMemo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface PriceDataPoint {
  timestamp?: string;
  datetime?: string;
  pool_price: number;
}

interface PriceTickerProps {
  currentPrice: number;
  previousPrice?: number;
  data: PriceDataPoint[];
  highPrice: number;
  lowPrice: number;
  averagePrice: number;
  loading?: boolean;
}

export function PriceTicker({ 
  currentPrice, 
  previousPrice = 0, 
  data, 
  highPrice, 
  lowPrice, 
  averagePrice,
  loading 
}: PriceTickerProps) {
  const [displayPrice, setDisplayPrice] = useState(currentPrice);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate price changes
  useEffect(() => {
    if (currentPrice !== displayPrice) {
      setIsAnimating(true);
      const duration = 500;
      const startPrice = displayPrice;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const newPrice = startPrice + (currentPrice - startPrice) * easeOut;
        
        setDisplayPrice(newPrice);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [currentPrice]);

  const change = currentPrice - previousPrice;
  const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  // Last 60 minutes sparkline data
  const sparklineData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    return data
      .filter(d => {
        const ts = d.timestamp || d.datetime;
        return ts ? new Date(ts) >= oneHourAgo : false;
      })
      .map(d => ({ price: d.pool_price }))
      .slice(-30); // Last 30 data points for sparkline
  }, [data]);

  const getTrendIcon = () => {
    if (isNeutral) return <Minus className="w-4 h-4" />;
    if (isPositive) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (isNeutral) return 'text-muted-foreground';
    // For energy markets: lower prices are good (green), higher prices are concerning (red)
    if (isPositive) return 'text-red-600 dark:text-red-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getSparklineColor = () => {
    if (isNeutral) return 'hsl(var(--muted-foreground))';
    if (isPositive) return 'hsl(0, 84%, 60%)';
    return 'hsl(var(--watt-success))';
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border-y border-border/50">
        <div className="flex items-center justify-center gap-2 py-2 px-4">
          <Activity className="w-4 h-4 animate-pulse text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-card via-card/95 to-card border-y border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-4 py-2.5 px-4 overflow-x-auto scrollbar-hide">
        {/* Live Price Section */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"></div>
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AESO Pool</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold tabular-nums transition-colors duration-200 ${
              isAnimating ? 'text-primary' : 'text-foreground'
            }`}>
              ${displayPrice.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">CAD/MWh</span>
          </div>
        </div>

        {/* Change Section */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md flex-shrink-0 ${
          isNeutral ? 'bg-muted/50' :
          isPositive ? 'bg-red-500/10' : 'bg-green-500/10'
        }`}>
          <span className={getTrendColor()}>{getTrendIcon()}</span>
          <span className={`text-sm font-semibold tabular-nums ${getTrendColor()}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)}
          </span>
          <span className={`text-xs ${getTrendColor()}`}>
            ({isPositive ? '+' : ''}{changePercent.toFixed(1)}%)
          </span>
        </div>

        {/* Sparkline */}
        <div className="w-24 h-8 flex-shrink-0 hidden sm:block">
          {sparklineData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={getSparklineColor()}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* High / Low / Avg Stats */}
        <div className="flex items-center gap-4 flex-shrink-0 hidden md:flex">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">H:</span>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums">
              ${highPrice.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">L:</span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 tabular-nums">
              ${lowPrice.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Avg:</span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              ${averagePrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 24h Label */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-muted-foreground">24h</span>
        </div>
      </div>
    </div>
  );
}
