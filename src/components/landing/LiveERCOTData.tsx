
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';

export const LiveERCOTData = () => {
  const { pricingData, loadData } = useERCOTData();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-electric-blue/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-electric-blue group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-white text-xl">ERCOT Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></div>
            <Badge className="bg-electric-blue/20 text-electric-blue text-xs border-electric-blue/30">Live</Badge>
          </div>
        </div>
        <p className="text-slate-300 text-sm">Electric Reliability Council of Texas</p>
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
              ${pricingData?.current_price?.toFixed(2) || '0.00'}/MWh
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-yellow/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-electric-yellow flex-shrink-0" />
              <span className="text-xs text-slate-400">Average Price</span>
            </div>
            <div className="text-lg font-bold text-electric-yellow">
              ${pricingData?.average_price?.toFixed(2) || '0.00'}/MWh
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-neon-green/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-neon-green flex-shrink-0" />
              <span className="text-xs text-slate-400">Current Demand</span>
            </div>
            <div className="text-lg font-bold text-neon-green">
              {loadData?.current_demand_mw?.toLocaleString() || '0'} MW
            </div>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg p-4 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-warm-orange/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-warm-orange flex-shrink-0" />
              <span className="text-xs text-slate-400">Peak Forecast</span>
            </div>
            <div className="text-lg font-bold text-warm-orange">
              {loadData?.peak_forecast_mw?.toLocaleString() || '0'} MW
            </div>
          </div>
        </div>

        {/* Market Conditions */}
        {pricingData && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Market Conditions</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Status</span>
              <Badge 
                className={`text-xs ${
                  pricingData.market_conditions === 'high_demand' 
                    ? 'bg-warm-orange/20 text-warm-orange border-warm-orange/30'
                    : 'bg-neon-green/20 text-neon-green border-neon-green/30'
                }`}
              >
                {pricingData.market_conditions === 'high_demand' ? 'High Demand' : 'Normal'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Peak Price</span>
                <span className="text-sm font-medium text-slate-200">${pricingData.peak_price?.toFixed(2)}/MWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Off-Peak Price</span>
                <span className="text-sm font-medium text-slate-200">${pricingData.off_peak_price?.toFixed(2)}/MWh</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
