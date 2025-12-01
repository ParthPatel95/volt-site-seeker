import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';

export const LiveERCOTData = () => {
  const { pricing, loadData } = useERCOTData();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white backdrop-blur-sm border border-gray-200 hover:border-watt-trust/30 transition-all duration-300 group shadow-institutional">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-watt-trust group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-watt-navy text-xl">ERCOT Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-watt-trust rounded-full animate-pulse"></div>
            <Badge className="bg-watt-trust/20 text-watt-trust text-xs border-watt-trust/30">Live</Badge>
          </div>
        </div>
        <p className="text-watt-navy/70 text-sm">Electric Reliability Council of Texas</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-trust/30 ${isAnimating ? 'scale-105 bg-watt-trust/5 border-watt-trust/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-watt-trust flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Current Price</span>
            </div>
            <div className="text-lg font-bold text-watt-trust">
              ${pricing?.current_price?.toFixed(2) || '0.00'}/MWh
            </div>
          </div>
          
          <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-bitcoin/30 ${isAnimating ? 'scale-105 bg-watt-bitcoin/5 border-watt-bitcoin/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-watt-bitcoin flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Average Price</span>
            </div>
            <div className="text-lg font-bold text-watt-bitcoin">
              ${pricing?.average_price?.toFixed(2) || '0.00'}/MWh
            </div>
          </div>
          
          <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-success/30 ${isAnimating ? 'scale-105 bg-watt-success/5 border-watt-success/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-watt-success flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Current Demand</span>
            </div>
            <div className="text-lg font-bold text-watt-success">
              {loadData?.current_demand_mw?.toLocaleString() || '0'} MW
            </div>
          </div>
          
          <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-bitcoin/30 ${isAnimating ? 'scale-105 bg-watt-bitcoin/5 border-watt-bitcoin/50' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-watt-bitcoin flex-shrink-0" />
              <span className="text-xs text-watt-navy/60">Peak Forecast</span>
            </div>
            <div className="text-lg font-bold text-watt-bitcoin">
              {loadData?.peak_forecast_mw?.toLocaleString() || '0'} MW
            </div>
          </div>
        </div>

        {/* Market Conditions */}
        {pricing && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-watt-navy">Market Conditions</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-watt-navy/70">Status</span>
              <Badge 
                className={`text-xs ${
                  pricing.market_conditions === 'high_demand' 
                    ? 'bg-watt-bitcoin/20 text-watt-bitcoin border-watt-bitcoin/30'
                    : 'bg-watt-success/20 text-watt-success border-watt-success/30'
                }`}
              >
                {pricing.market_conditions === 'high_demand' ? 'High Demand' : 'Normal'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-watt-navy/70">Peak Price</span>
                <span className="text-sm font-medium text-watt-navy">${pricing.peak_price?.toFixed(2)}/MWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-watt-navy/70">Off-Peak Price</span>
                <span className="text-sm font-medium text-watt-navy">${pricing.off_peak_price?.toFixed(2)}/MWh</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};