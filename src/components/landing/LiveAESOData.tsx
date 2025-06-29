
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, MapPin, TrendingUp, Wind } from 'lucide-react';
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

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-neon-green/30 transition-all duration-300 group">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
            <CardTitle className="text-white text-base sm:text-lg md:text-xl truncate">AESO Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            <Badge className="bg-neon-green/20 text-neon-green text-xs border-neon-green/30">
              Live
            </Badge>
          </div>
        </div>
        <p className="text-slate-300 text-xs sm:text-sm">Real-time Alberta electricity market data</p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Live Metrics Grid - Responsive 2x2 layout */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-blue/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-blue/50' : ''}`}>
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-electric-blue flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Pool Price</span>
            </div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-electric-blue break-words">
              {pricing?.current_price ? `$${pricing.current_price.toFixed(2)}/MWh` : 'Loading...'}
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-yellow/50' : ''}`}>
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-electric-yellow flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Demand</span>
            </div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-electric-yellow break-words">
              {loadData?.current_demand_mw ? (loadData.current_demand_mw / 1000).toFixed(1) : 'Loading...'} GW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-neon-green/50' : ''}`}>
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-neon-green flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Wind Power</span>
            </div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-neon-green break-words">
              {generationMix?.wind_mw ? (generationMix.wind_mw / 1000).toFixed(1) : 'Loading...'} GW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-warm-orange/50' : ''}`}>
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-warm-orange flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Renewables</span>
            </div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-warm-orange break-words">
              {generationMix?.renewable_percentage ? generationMix.renewable_percentage.toFixed(1) : 'Loading...'}%
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">Market Status</h4>
            <Badge className={`bg-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/20 text-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'} text-xs border-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/30 flex-shrink-0`}>
              {pricing?.market_conditions?.replace('_', ' ').toUpperCase() || 'LOADING'}
            </Badge>
          </div>
          
          <div className="p-2 sm:p-3 bg-slate-800/20 rounded-lg border border-slate-700/20">
            <div className="text-xs sm:text-sm text-slate-300 space-y-1 sm:space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400 truncate">System Load:</span>
                <span className="text-electric-blue font-semibold break-words text-right">
                  {loadData?.current_demand_mw ? `${(loadData.current_demand_mw / 1000).toFixed(1)} GW` : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-400 truncate">Peak Forecast:</span>
                <span className="text-electric-yellow font-semibold break-words text-right">
                  {loadData?.peak_forecast_mw ? `${(loadData.peak_forecast_mw / 1000).toFixed(1)} GW` : 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-2 sm:pt-3 border-t border-slate-700/30 leading-relaxed">
          * Alberta Electric System Operator real-time data. Updates every 5 minutes.
        </div>
      </CardContent>
    </Card>
  );
};
