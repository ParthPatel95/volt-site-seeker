
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, TrendingUp, Wind, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';

export const LiveAESOData = () => {
  const { pricing, loadData, generationMix, loading, connectionStatus } = useAESOData();
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate when data updates
  useEffect(() => {
    if (pricing || loadData || generationMix) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [pricing, loadData, generationMix]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'neon-green';
      case 'error': return 'red-500';
      default: return 'slate-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Live';
      case 'error': return 'Error';
      default: return 'Connecting';
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-electric-blue/30 transition-all duration-300 group h-full">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-electric-blue group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-white text-base sm:text-lg md:text-xl">AESO Alberta Market</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 bg-${getStatusColor()} rounded-full ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}></div>
            <Badge className={`bg-${getStatusColor()}/20 text-${getStatusColor()} text-xs border-${getStatusColor()}/30`}>
              {getStatusText()}
            </Badge>
          </div>
        </div>
        <p className="text-slate-300 text-xs sm:text-sm">Real-time Alberta electricity market data</p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 transition-all duration-500 border border-slate-700/30 hover:border-electric-blue/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-blue/50' : ''}`}>
            <div className="flex items-center space-x-1 mb-1">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-electric-blue flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Current Price</span>
            </div>
            <div className="text-sm sm:text-base lg:text-lg font-bold text-electric-blue break-words">
              {pricing?.current_price ? `$${pricing.current_price.toFixed(2)}/MWh` : '$N/A/MWh'}
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-yellow/50' : ''}`}>
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-electric-yellow flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">System Load</span>
            </div>
            <div className="text-sm sm:text-base lg:text-lg font-bold text-electric-yellow break-words">
              {loadData ? `${(loadData.current_demand_mw / 1000).toFixed(1)} GW` : 'N/A'}
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-neon-green/50' : ''}`}>
            <div className="flex items-center space-x-1 mb-1">
              <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-neon-green flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Wind Power</span>
            </div>
            <div className="text-sm sm:text-base lg:text-lg font-bold text-neon-green break-words">
              {generationMix ? `${(generationMix.wind_mw / 1000).toFixed(1)} GW` : 'N/A GW'}
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-warm-orange/50' : ''}`}>
            <div className="flex items-center space-x-1 mb-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-warm-orange flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Renewables</span>
            </div>
            <div className="text-sm sm:text-base lg:text-lg font-bold text-warm-orange break-words">
              {generationMix?.renewable_percentage ? `${generationMix.renewable_percentage.toFixed(1)}%` : 'N/A%'}
            </div>
          </div>
        </div>

        {/* Market Status Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-200">Market Status</h4>
            <Badge className={`bg-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/20 text-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'} text-xs border-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/30`}>
              {pricing?.market_conditions?.replace('_', ' ').toUpperCase() || 'NORMAL'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-800/20 rounded border border-slate-700/20 min-w-0">
              <span className="text-slate-400 truncate mr-2">Reserve Margin:</span>
              <span className="text-electric-blue font-semibold flex-shrink-0">
                {loadData?.reserve_margin ? `${loadData.reserve_margin.toFixed(1)}%` : 'N/A%'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-800/20 rounded border border-slate-700/20 min-w-0">
              <span className="text-slate-400 truncate mr-2">Peak Forecast:</span>
              <span className="text-electric-yellow font-semibold flex-shrink-0">
                {loadData ? `${(loadData.peak_forecast_mw / 1000).toFixed(1)} GW` : 'N/A GW'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-800/20 rounded border border-slate-700/20 min-w-0">
              <span className="text-slate-400 truncate mr-2">Total Generation:</span>
              <span className="text-neon-green font-semibold flex-shrink-0">
                {generationMix ? `${(generationMix.total_generation_mw / 1000).toFixed(1)} GW` : 'N/A GW'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-800/20 rounded border border-slate-700/20 min-w-0">
              <span className="text-slate-400 truncate mr-2">Natural Gas:</span>
              <span className="text-warm-orange font-semibold flex-shrink-0">
                {generationMix ? `${(generationMix.natural_gas_mw / 1000).toFixed(1)} GW` : 'N/A GW'}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus === 'error' && (
          <div className="flex items-center justify-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
            <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-red-400 text-xs">Unable to connect to AESO API</span>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/30">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <span>* Alberta Electric System Operator data</span>
        </div>
      </CardContent>
    </Card>
  );
};
