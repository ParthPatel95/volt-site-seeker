import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Activity, DollarSign, AlertCircle } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';
import { LiveMarketSkeleton } from './LiveMarketSkeleton';

export const LiveAESOData = () => {
  const { pricing, generationMix, loadData, loading, isFetching, hasData, error } = useAESOData();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Track if we're retrying (fetching but had previous data or had error)
  const isRetrying = isFetching && !loading;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Show skeleton during initial load
  if (loading && !pricing && !generationMix && !loadData) {
    return <LiveMarketSkeleton />;
  }

  // Format value or show placeholder
  const formatPrice = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '--';
    return `$${value.toFixed(2)}`;
  };

  const formatMW = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '--';
    return value.toLocaleString();
  };

  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '--';
    return `${value.toFixed(1)}%`;
  };

  return (
    <Card className="bg-card border border-border hover:border-data-positive/30 hover:shadow-md-soft transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-data-positive/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-data-positive" />
            </div>
            <CardTitle className="text-foreground text-lg font-semibold">AESO Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {isRetrying ? (
              <>
                <div className="w-2 h-2 bg-data-warning rounded-full animate-pulse"></div>
                <Badge className="bg-data-warning/10 text-data-warning text-xs border-data-warning/20">Retrying...</Badge>
              </>
            ) : hasData ? (
              <>
                <div className="w-2 h-2 bg-data-positive rounded-full animate-pulse"></div>
                <Badge className="bg-data-positive/10 text-data-positive text-xs border-data-positive/20">Live</Badge>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-4 h-4 text-data-negative" />
                <Badge className="bg-data-negative/10 text-data-negative text-xs border-data-negative/20">Unavailable</Badge>
              </>
            ) : (
              <Badge className="bg-muted text-muted-foreground text-xs">Loading...</Badge>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Alberta Electric System Operator</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className={`bg-muted/50 rounded-lg p-4 transition-all duration-500 border border-border hover:border-primary/30 ${isAnimating && pricing?.current_price ? 'scale-[1.02] border-primary/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">Current Price</span>
            </div>
            <div className="text-lg font-semibold text-primary tabular-nums">
              {formatPrice(pricing?.current_price)}/MWh
            </div>
          </div>
          
          <div className={`bg-muted/50 rounded-lg p-4 transition-all duration-500 border border-border hover:border-data-warning/30 ${isAnimating && generationMix?.total_generation_mw ? 'scale-[1.02] border-data-warning/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-data-warning flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">Total Generation</span>
            </div>
            <div className="text-lg font-semibold text-data-warning tabular-nums">
              {formatMW(generationMix?.total_generation_mw)} MW
            </div>
          </div>
          
          <div className={`bg-muted/50 rounded-lg p-4 transition-all duration-500 border border-border hover:border-data-positive/30 ${isAnimating && generationMix?.renewable_percentage ? 'scale-[1.02] border-data-positive/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-data-positive flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">Renewables</span>
            </div>
            <div className="text-lg font-semibold text-data-positive tabular-nums">
              {formatPercent(generationMix?.renewable_percentage)}
            </div>
          </div>
          
          <div className={`bg-muted/50 rounded-lg p-4 transition-all duration-500 border border-border hover:border-data-warning/30 ${isAnimating && loadData?.current_demand_mw ? 'scale-[1.02] border-data-warning/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-data-warning flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">Current Demand</span>
            </div>
            <div className="text-lg font-semibold text-data-warning tabular-nums">
              {formatMW(loadData?.current_demand_mw)} MW
            </div>
          </div>
        </div>

        {generationMix && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Generation Mix</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Natural Gas</span>
                <span className="text-sm font-medium text-foreground tabular-nums">{formatMW(generationMix.natural_gas_mw)} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Wind</span>
                <span className="text-sm font-medium text-data-positive tabular-nums">{formatMW(generationMix.wind_mw)} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hydro</span>
                <span className="text-sm font-medium text-primary tabular-nums">{formatMW(generationMix.hydro_mw)} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Solar</span>
                <span className="text-sm font-medium text-data-warning tabular-nums">{formatMW(generationMix.solar_mw)} MW</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
