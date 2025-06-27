
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Zap, MapPin, TrendingUp, Wind, Clock, Wifi, AlertTriangle, RotateCcw, CheckCircle } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';

export const LiveAESOData = () => {
  const { pricing, loadData, generationMix, loading, connectionStatus, dataStatus, refetch } = useAESOData();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (pricing || loadData || generationMix) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [pricing, loadData, generationMix]);

  const formatLastUpdate = () => {
    if (!dataStatus.lastUpdate) return '';
    const updateTime = new Date(dataStatus.lastUpdate);
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Edmonton',
      timeZoneName: 'short'
    };
    return updateTime.toLocaleTimeString('en-US', timeOptions);
  };

  const getFallbackDuration = () => {
    if (!dataStatus.fallbackSince) return '';
    const fallbackStart = new Date(dataStatus.fallbackSince);
    const now = new Date();
    const minutesDiff = Math.floor((now.getTime() - fallbackStart.getTime()) / (1000 * 60));
    
    if (minutesDiff < 60) {
      return `${minutesDiff}m`;
    } else {
      const hoursDiff = Math.floor(minutesDiff / 60);
      return `${hoursDiff}h ${minutesDiff % 60}m`;
    }
  };

  const getStatusBadge = () => {
    if (dataStatus.isLive) {
      return (
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-3 h-3 text-neon-green" />
          <Badge className="bg-neon-green/20 text-neon-green text-xs border-neon-green/30">
            Live Data
          </Badge>
        </div>
      );
    } else {
      const isStale = dataStatus.isStale;
      return (
        <div className="flex items-center space-x-2">
          {isStale ? (
            <AlertTriangle className="w-3 h-3 text-warm-orange" />
          ) : (
            <Clock className="w-3 h-3 text-blue-400" />
          )}
          <Badge className={`text-xs ${
            isStale 
              ? 'bg-warm-orange/20 text-warm-orange border-warm-orange/30' 
              : 'bg-blue-400/20 text-blue-400 border-blue-400/30'
          }`}>
            {isStale ? 'Stale Data' : 'Fallback Mode'}
          </Badge>
          {dataStatus.fallbackSince && (
            <span className="text-xs text-slate-400">
              ({getFallbackDuration()})
            </span>
          )}
        </div>
      );
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-neon-green/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-neon-green group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-white text-xl">AESO Live Data</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <div className="space-y-1">
          <p className="text-slate-300 text-sm">Real-time Alberta electricity market data</p>
          
          {dataStatus.errorMessage && (
            <div className="p-2 bg-blue-400/10 border border-blue-400/20 rounded text-xs text-blue-400">
              {dataStatus.errorMessage}
            </div>
          )}
          
          {dataStatus.lastUpdate && (
            <p className="text-xs text-slate-400">
              {dataStatus.isLive ? 'Live from' : 'Cached from'} AESO.ca – Updated {formatLastUpdate()}
            </p>
          )}
          
          {(dataStatus.isStale || connectionStatus === 'error') && (
            <div className="flex items-center space-x-2 mt-2">
              <Button 
                onClick={refetch} 
                size="sm" 
                variant="outline" 
                className="h-6 text-xs border-warm-orange/30 text-warm-orange hover:bg-warm-orange/10"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Retry Connection
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-blue/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-blue/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-electric-blue flex-shrink-0" />
              <span className="text-xs text-slate-400">Pool Price</span>
              {dataStatus.isLive && <div className="w-1 h-1 bg-neon-green rounded-full animate-pulse ml-auto"></div>}
            </div>
            <div className="text-lg font-bold text-electric-blue">
              {pricing?.current_price ? `$${pricing.current_price.toFixed(2)}/MWh` : 'Loading...'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              CAD {pricing?.cents_per_kwh ? `(${pricing.cents_per_kwh.toFixed(1)}¢/kWh)` : ''}
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-yellow/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-electric-yellow flex-shrink-0" />
              <span className="text-xs text-slate-400">Demand</span>
            </div>
            <div className="text-lg font-bold text-electric-yellow">
              {loadData?.current_demand_mw ? (loadData.current_demand_mw / 1000).toFixed(1) : 'Loading...'} GW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-neon-green/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Wind className="w-4 h-4 text-neon-green flex-shrink-0" />
              <span className="text-xs text-slate-400">Wind Power</span>
            </div>
            <div className="text-lg font-bold text-neon-green">
              {generationMix?.wind_mw ? (generationMix.wind_mw / 1000).toFixed(1) : 'Loading...'} GW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-warm-orange/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-warm-orange flex-shrink-0" />
              <span className="text-xs text-slate-400">Renewables</span>
            </div>
            <div className="text-lg font-bold text-warm-orange">
              {generationMix?.renewable_percentage ? generationMix.renewable_percentage.toFixed(1) : 'Loading...'}%
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">Market Status</h4>
            <Badge className={`${
              pricing?.market_conditions === 'high_demand' 
                ? 'bg-warm-orange/20 text-warm-orange border-warm-orange/30' 
                : 'bg-neon-green/20 text-neon-green border-neon-green/30'
            } text-xs`}>
              {pricing?.market_conditions?.replace('_', ' ').toUpperCase() || 'LOADING'}
            </Badge>
          </div>
          
          <div className="p-3 bg-slate-800/20 rounded-lg border border-slate-700/20">
            <div className="text-sm text-slate-300 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">System Load:</span>
                <span className="text-electric-blue font-semibold">
                  {loadData?.current_demand_mw ? `${(loadData.current_demand_mw / 1000).toFixed(1)} GW` : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Peak Forecast:</span>
                <span className="text-electric-yellow font-semibold">
                  {loadData?.peak_forecast_mw ? `${(loadData.peak_forecast_mw / 1000).toFixed(1)} GW` : 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-3 border-t border-slate-700/30">
          * Alberta Electric System Operator {dataStatus.isLive ? 'live' : 'cached'} data. 
          {dataStatus.isLive ? ' Updates every 2 minutes.' : ` Last updated: ${formatLastUpdate()}`}
        </div>
      </CardContent>
    </Card>
  );
};
