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

  // hasData is now provided by the hook

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
    <Card className="bg-white backdrop-blur-sm border border-gray-200 hover:border-watt-success/30 transition-all duration-300 group shadow-institutional">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-watt-success group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-watt-navy text-xl">AESO Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {isRetrying ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <Badge className="bg-yellow-500/20 text-yellow-600 text-xs border-yellow-500/30">Retrying...</Badge>
              </>
            ) : hasData ? (
              <>
                <div className="w-2 h-2 bg-watt-success rounded-full animate-pulse"></div>
                <Badge className="bg-watt-success/20 text-watt-success text-xs border-watt-success/30">Live</Badge>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-4 h-4 text-watt-bitcoin" />
                <Badge className="bg-watt-bitcoin/20 text-watt-bitcoin text-xs border-watt-bitcoin/30">Unavailable</Badge>
              </>
            ) : (
              <Badge className="bg-gray-200 text-gray-600 text-xs">Loading...</Badge>
            )}
          </div>
        </div>
        <p className="text-watt-navy/70 text-sm">Alberta Electric System Operator</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-trust/30 ${isAnimating && pricing?.current_price ? 'scale-105 bg-watt-trust/5 border-watt-trust/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-watt-trust flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Current Price</span>
            </div>
            <div className="text-lg font-bold text-watt-trust">
              {formatPrice(pricing?.current_price)}/MWh
            </div>
          </div>
          
          <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-bitcoin/30 ${isAnimating && generationMix?.total_generation_mw ? 'scale-105 bg-watt-bitcoin/5 border-watt-bitcoin/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-watt-bitcoin flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Total Generation</span>
            </div>
            <div className="text-lg font-bold text-watt-bitcoin">
              {formatMW(generationMix?.total_generation_mw)} MW
            </div>
          </div>
          
          <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-success/30 ${isAnimating && generationMix?.renewable_percentage ? 'scale-105 bg-watt-success/5 border-watt-success/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-watt-success flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Renewables</span>
            </div>
            <div className="text-lg font-bold text-watt-success">
              {formatPercent(generationMix?.renewable_percentage)}
            </div>
          </div>
          
          <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-bitcoin/30 ${isAnimating && loadData?.current_demand_mw ? 'scale-105 bg-watt-bitcoin/5 border-watt-bitcoin/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-watt-bitcoin flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Current Demand</span>
            </div>
            <div className="text-lg font-bold text-watt-bitcoin">
              {formatMW(loadData?.current_demand_mw)} MW
            </div>
          </div>
        </div>

        {generationMix && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-watt-navy">Generation Mix</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-watt-navy/70">Natural Gas</span>
                <span className="text-sm font-medium text-watt-navy">{formatMW(generationMix.natural_gas_mw)} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-watt-navy/70">Wind</span>
                <span className="text-sm font-medium text-watt-success">{formatMW(generationMix.wind_mw)} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-watt-navy/70">Hydro</span>
                <span className="text-sm font-medium text-watt-trust">{formatMW(generationMix.hydro_mw)} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-watt-navy/70">Solar</span>
                <span className="text-sm font-medium text-watt-bitcoin">{formatMW(generationMix.solar_mw)} MW</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
