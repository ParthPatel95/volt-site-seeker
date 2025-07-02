
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Activity, DollarSign } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';

export const LiveAESOData = () => {
  const { pricing, generationMix, loadData } = useAESOData();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-neon-green/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-neon-green group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-white text-xl">AESO Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            <Badge className="bg-neon-green/20 text-neon-green text-xs border-neon-green/30">Live</Badge>
          </div>
        </div>
        <p className="text-slate-300 text-sm">Alberta Electricity System Operator</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-blue/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-blue/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-electric-blue flex-shrink-0" />
              <span className="text-xs text-slate-400">Current Price</span>
            </div>
            <div className="text-lg font-bold text-electric-blue">
              ${pricing?.current_price?.toFixed(2) || '0.00'}/MWh
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-yellow/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-electric-yellow flex-shrink-0" />
              <span className="text-xs text-slate-400">Total Generation</span>
            </div>
            <div className="text-lg font-bold text-electric-yellow">
              {generationMix?.total_generation_mw?.toLocaleString() || '0'} MW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-neon-green/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-neon-green flex-shrink-0" />
              <span className="text-xs text-slate-400">Renewables</span>
            </div>
            <div className="text-lg font-bold text-neon-green">
              {generationMix?.renewable_percentage?.toFixed(1) || '0.0'}%
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-warm-orange/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-warm-orange flex-shrink-0" />
              <span className="text-xs text-slate-400">Current Demand</span>
            </div>
            <div className="text-lg font-bold text-warm-orange">
              {loadData?.current_demand_mw?.toLocaleString() || '0'} MW
            </div>
          </div>
        </div>

        {/* Generation Mix */}
        {generationMix && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Generation Mix</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Natural Gas</span>
                <span className="text-sm font-medium text-slate-200">{generationMix.natural_gas_mw} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Wind</span>
                <span className="text-sm font-medium text-neon-green">{generationMix.wind_mw} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Hydro</span>
                <span className="text-sm font-medium text-electric-blue">{generationMix.hydro_mw} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Solar</span>
                <span className="text-sm font-medium text-electric-yellow">{generationMix.solar_mw} MW</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
