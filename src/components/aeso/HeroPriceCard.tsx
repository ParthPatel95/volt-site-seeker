import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

interface HeroPriceCardProps {
  currentPrice: number;
  previousHourPrice: number;
  averagePrice: number;
  timestamp?: string;
  percentile?: number; // How this price compares to historical (0-100)
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

  // Animated price counter
  useEffect(() => {
    if (currentPrice !== displayPrice && !loading) {
      setIsFlashing(true);
      
      const duration = 800;
      const startPrice = displayPrice;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const newPrice = startPrice + (currentPrice - startPrice) * easeOut;
        
        setDisplayPrice(newPrice);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => setIsFlashing(false), 200);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [currentPrice]);

  const hourlyChange = currentPrice - previousHourPrice;
  const hourlyChangePercent = previousHourPrice !== 0 
    ? (hourlyChange / previousHourPrice) * 100 
    : 0;

  const isPositive = hourlyChange > 0;
  const isNeutral = hourlyChange === 0;

  const getPriceLevel = (price: number): { label: string; color: string; bg: string } => {
    if (price > 100) return { label: 'SPIKE', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/20' };
    if (price > 60) return { label: 'HIGH', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/20' };
    if (price > 30) return { label: 'NORMAL', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/20' };
    return { label: 'LOW', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/20' };
  };

  const priceLevel = getPriceLevel(currentPrice);

  const getPercentileLabel = (p: number): string => {
    if (p >= 90) return 'Very High - Top 10%';
    if (p >= 75) return 'Above Average';
    if (p >= 50) return 'Average';
    if (p >= 25) return 'Below Average';
    return 'Very Low - Bottom 25%';
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg animate-pulse">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold">System Marginal Price</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-12 w-48 bg-muted/50 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden border-2 transition-all duration-500 bg-gradient-to-br from-card to-card/50 ${
      isFlashing ? 'border-primary shadow-lg shadow-primary/20' : 'hover:border-primary/50'
    }`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 opacity-50"></div>
      
      <CardHeader className="relative pb-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg transition-transform duration-300 ${
              isFlashing ? 'scale-110' : ''
            }`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">System Marginal Price</CardTitle>
              <p className="text-xs text-muted-foreground">Alberta Pool Price</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${priceLevel.color} ${priceLevel.bg} border-current text-xs font-bold px-2 py-0.5`}>
              ⚡ {priceLevel.label}
            </Badge>
            {timestamp && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(timestamp), 'HH:mm')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6 p-6">
        {/* Main Price Display */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-muted-foreground">$</span>
            <span className={`text-5xl sm:text-6xl font-bold tabular-nums bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent transition-all duration-300 ${
              isFlashing ? 'scale-105' : ''
            }`}>
              {displayPrice.toFixed(2)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground mt-1">CAD per MWh</span>
          
          {/* Hourly Change */}
          <div className={`flex items-center gap-2 mt-4 px-4 py-2 rounded-full ${
            isNeutral ? 'bg-muted/50' :
            isPositive ? 'bg-red-500/10' : 'bg-green-500/10'
          }`}>
            {isNeutral ? (
              <Minus className="w-4 h-4 text-muted-foreground" />
            ) : isPositive ? (
              <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
            <span className={`text-sm font-semibold ${
              isNeutral ? 'text-muted-foreground' :
              isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {isPositive ? '+' : ''}{hourlyChange.toFixed(2)} ({isPositive ? '+' : ''}{hourlyChangePercent.toFixed(1)}%)
            </span>
            <span className="text-xs text-muted-foreground">vs last hour</span>
          </div>
        </div>

        {/* Percentile Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Price Percentile (30-day)
            </span>
            <span className="font-medium">{getPercentileLabel(percentile)}</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-green-500 via-50% via-yellow-500 to-red-500 opacity-30"
              style={{ width: '100%' }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border-2 border-background shadow-md transition-all duration-500"
              style={{ left: `calc(${percentile}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Low</span>
            <span>Avg</span>
            <span>High</span>
          </div>
        </div>

        {/* 95% Uptime Average */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {uptimeData.daysOfData > 0 ? `${uptimeData.daysOfData}-Day` : '30-Day'} Avg (95% Uptime)
              </span>
              <Badge 
                variant={uptimeData.isLive ? 'default' : 'secondary'} 
                className="text-[9px] px-1 py-0 h-4"
              >
                {uptimeData.isLive ? 'LIVE' : 'EST'}
              </Badge>
            </div>
            <p className="text-2xl font-bold">${uptimeData.uptimeAverage.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">
              {uptimeData.totalDataPoints > 0 
                ? `${uptimeData.totalDataPoints.toLocaleString()} hrs analyzed • ${uptimeData.excludedPrices} spikes excluded`
                : 'Updating data...'}
            </p>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">vs Average</span>
            <p className={`text-2xl font-bold ${
              currentPrice > averagePrice ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {currentPrice > averagePrice ? '+' : ''}{(currentPrice - averagePrice).toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {currentPrice > averagePrice ? 'Above' : 'Below'} average by {Math.abs(((currentPrice - averagePrice) / averagePrice) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>

      {/* Live indicator pulse */}
      <div className="absolute top-4 right-4">
        <div className="relative flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
        </div>
      </div>
    </Card>
  );
}
