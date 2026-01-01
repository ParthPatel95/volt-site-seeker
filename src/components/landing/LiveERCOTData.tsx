import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Activity, DollarSign, AlertCircle } from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';
import { LiveMarketSkeleton } from './LiveMarketSkeleton';

export const LiveERCOTData = () => {
  const { pricing, loadData, loading, error } = useERCOTData();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Show skeleton during initial load
  if (loading && !pricing && !loadData) {
    return <LiveMarketSkeleton />;
  }

  // Check if we have any data to display
  const hasData = pricing || loadData;

  // Format value or show placeholder
  const formatPrice = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '--';
    return `$${value.toFixed(2)}`;
  };

  const formatMW = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '--';
    return value.toLocaleString();
  };

  return (
    <Card className="bg-card border border-border hover:border-primary/30 hover:shadow-md-soft transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-foreground text-lg font-semibold">ERCOT Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {hasData ? (
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
        <p className="text-muted-foreground text-sm">Electric Reliability Council of Texas</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Metrics Grid */}
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
          
          <div className={`bg-muted/50 rounded-lg p-4 transition-all duration-500 border border-border hover:border-data-warning/30 ${isAnimating && pricing?.average_price ? 'scale-[1.02] border-data-warning/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-data-warning flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">Average Price</span>
            </div>
            <div className="text-lg font-semibold text-data-warning tabular-nums">
              {formatPrice(pricing?.average_price)}/MWh
            </div>
          </div>
          
          <div className={`bg-muted/50 rounded-lg p-4 transition-all duration-500 border border-border hover:border-data-positive/30 ${isAnimating && loadData?.current_demand_mw ? 'scale-[1.02] border-data-positive/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-data-positive flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">Current Demand</span>
            </div>
            <div className="text-lg font-semibold text-data-positive tabular-nums">
              {formatMW(loadData?.current_demand_mw)} MW
            </div>
          </div>
          
          <div className={`bg-muted/50 rounded-lg p-4 transition-all duration-500 border border-border hover:border-data-warning/30 ${isAnimating && loadData?.peak_forecast_mw ? 'scale-[1.02] border-data-warning/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-data-warning flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">Peak Forecast</span>
            </div>
            <div className="text-lg font-semibold text-data-warning tabular-nums">
              {formatMW(loadData?.peak_forecast_mw)} MW
            </div>
          </div>
        </div>

        {/* Market Conditions */}
        {pricing && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Market Conditions</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge 
                className={`text-xs ${
                  pricing.market_conditions === 'high_demand' 
                    ? 'bg-data-negative/10 text-data-negative border-data-negative/20'
                    : 'bg-data-positive/10 text-data-positive border-data-positive/20'
                }`}
              >
                {pricing.market_conditions === 'high_demand' ? 'High Demand' : 'Normal'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak Price</span>
                <span className="text-sm font-medium text-foreground tabular-nums">{formatPrice(pricing.peak_price)}/MWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Off-Peak Price</span>
                <span className="text-sm font-medium text-foreground tabular-nums">{formatPrice(pricing.off_peak_price)}/MWh</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
