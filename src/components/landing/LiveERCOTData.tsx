
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
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-electric-blue/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-electric-blue group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-white text-xl">ERCOT Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></div>
            <Badge className="bg-electric-blue/20 text-electric-blue text-xs border-electric-blue/30">Live</Badge>
          </div>
        </div>
        <p className="text-slate-300 text-sm">Real-time Texas grid operations and pricing</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`bg-slate-800/30 rounded-lg p-3 transition-all duration-500 border border-slate-700/30 hover:border-electric-blue/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-blue/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="w-4 h-4 text-electric-blue" />
              <span className="text-xs text-slate-400">RT Price</span>
            </div>
            <div className="text-lg font-bold text-electric-blue">
              ${pricing?.current_price?.toFixed(2) || '42.50'}/MWh
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-3 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-yellow/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-electric-yellow" />
              <span className="text-xs text-slate-400">Load</span>
            </div>
            <div className="text-lg font-bold text-electric-yellow">
              {loadData ? (loadData.current_demand_mw / 1000).toFixed(1) : '52.0'} GW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-3 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-neon-green/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-1">
              <Sun className="w-4 h-4 text-neon-green" />
              <span className="text-xs text-slate-400">Solar</span>
            </div>
            <div className="text-lg font-bold text-neon-green">
              {generationMix ? (generationMix.solar_mw / 1000).toFixed(1) : '4.5'} GW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-3 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-warm-orange/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="w-4 h-4 text-warm-orange" />
              <span className="text-xs text-slate-400">Renewables</span>
            </div>
            <div className="text-lg font-bold text-warm-orange">
              {generationMix?.renewable_percentage?.toFixed(1) || '33.9'}%
            </div>
          </div>
        </div>

        {/* Generation Mix Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">Generation Mix</h4>
            <Badge className={`bg-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/20 text-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'} text-xs border-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/30`}>
              {pricing?.market_conditions?.replace('_', ' ').toUpperCase() || 'NORMAL'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between p-2 bg-slate-800/20 rounded border border-slate-700/20">
              <span className="text-slate-400">Natural Gas:</span>
              <span className="text-electric-blue font-semibold">
                {generationMix ? (generationMix.natural_gas_mw / 1000).toFixed(1) : '28.0'} GW
              </span>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/20 rounded border border-slate-700/20">
              <span className="text-slate-400">Wind:</span>
              <span className="text-neon-green font-semibold">
                {generationMix ? (generationMix.wind_mw / 1000).toFixed(1) : '15.0'} GW
              </span>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/20 rounded border border-slate-700/20">
              <span className="text-slate-400">Nuclear:</span>
              <span className="text-electric-yellow font-semibold">
                {generationMix ? (generationMix.nuclear_mw / 1000).toFixed(1) : '5.0'} GW
              </span>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/20 rounded border border-slate-700/20">
              <span className="text-slate-400">Coal:</span>
              <span className="text-warm-orange font-semibold">
                {generationMix ? (generationMix.coal_mw / 1000).toFixed(1) : '3.5'} GW
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-3 border-t border-slate-700/30">
          * Electric Reliability Council of Texas real-time data. Updates every 5 minutes.
        </div>
      </CardContent>
    </Card>
  );
};
