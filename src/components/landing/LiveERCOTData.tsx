
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, MapPin, TrendingUp, Sun } from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';

export const LiveERCOTData = () => {
  const { pricing, loadData, generationMix, loading } = useERCOTData();
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate when data updates
  useEffect(() => {
    if (pricing || loadData || generationMix) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [pricing, loadData, generationMix]);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-electric-blue/30 transition-all duration-300 group h-full">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-electric-blue group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-white text-base sm:text-lg md:text-xl">ERCOT Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></div>
            <Badge className="bg-electric-blue/20 text-electric-blue text-xs border-electric-blue/30">Live</Badge>
          </div>
        </div>
        <p className="text-slate-300 text-xs sm:text-sm">Real-time Texas grid operations and pricing</p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Live Metrics Grid - Changed to 2 columns per row */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 transition-all duration-500 border border-slate-700/30 hover:border-electric-blue/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-blue/50' : ''}`}>
            <div className="flex items-center space-x-1 mb-1">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-electric-blue flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">RT Price</span>
            </div>
            <div className="text-sm sm:text-base lg:text-lg font-bold text-electric-blue break-words">
              ${pricing?.current_price?.toFixed(2) || '42.50'}/MWh
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-yellow/50' : ''}`}>
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-electric-yellow flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Load</span>
            </div>
            <div className="text-sm sm:text-base lg:text-lg font-bold text-electric-yellow break-words">
              {loadData ? (loadData.current_demand_mw / 1000).toFixed(1) : '52.0'} GW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-neon-green/50' : ''}`}>
            <div className="flex items-center space-x-1 mb-1">
              <Sun className="w-3 h-3 sm:w-4 sm:h-4 text-neon-green flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Solar</span>
            </div>
            <div className="text-sm sm:text-base lg:text-lg font-bold text-neon-green break-words">
              {generationMix ? (generationMix.solar_mw / 1000).toFixed(1) : '4.5'} GW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-2 sm:p-3 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-warm-orange/50' : ''}`}>
            <div className="flex items-center space-x-1 mb-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-warm-orange flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">Renewables</span>
            </div>
            <div className="text-sm sm:text-base lg:text-lg font-bold text-warm-orange break-words">
              {generationMix?.renewable_percentage?.toFixed(1) || '33.9'}%
            </div>
          </div>
        </div>

        {/* Generation Mix Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-200">Generation Mix</h4>
            <Badge className={`bg-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/20 text-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'} text-xs border-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/30`}>
              {pricing?.market_conditions?.replace('_', ' ').toUpperCase() || 'NORMAL'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-800/20 rounded border border-slate-700/20 min-w-0">
              <span className="text-slate-400 truncate mr-2">Natural Gas:</span>
              <span className="text-electric-blue font-semibold flex-shrink-0">
                {generationMix ? (generationMix.natural_gas_mw / 1000).toFixed(1) : '28.0'} GW
              </span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-800/20 rounded border border-slate-700/20 min-w-0">
              <span className="text-slate-400 truncate mr-2">Wind:</span>
              <span className="text-neon-green font-semibold flex-shrink-0">
                {generationMix ? (generationMix.wind_mw / 1000).toFixed(1) : '15.0'} GW
              </span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-800/20 rounded border border-slate-700/20 min-w-0">
              <span className="text-slate-400 truncate mr-2">Nuclear:</span>
              <span className="text-electric-yellow font-semibold flex-shrink-0">
                {generationMix ? (generationMix.nuclear_mw / 1000).toFixed(1) : '5.0'} GW
              </span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-800/20 rounded border border-slate-700/20 min-w-0">
              <span className="text-slate-400 truncate mr-2">Coal:</span>
              <span className="text-warm-orange font-semibold flex-shrink-0">
                {generationMix ? (generationMix.coal_mw / 1000).toFixed(1) : '3.5'} GW
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-2 border-t border-slate-700/30 break-words">
          * Electric Reliability Council of Texas real-time data. Updates every 5 minutes.
        </div>
      </CardContent>
    </Card>
  );
};
