import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Activity, DollarSign } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';

export const LiveAESOData = () => {
  const { pricing, generationMix, loadData, loading } = useAESOData();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white backdrop-blur-sm border border-gray-200 hover:border-watt-success/30 transition-all duration-300 group shadow-institutional">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-watt-success group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-watt-navy text-xl">AESO Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-watt-success rounded-full animate-pulse"></div>
            <Badge className="bg-watt-success/20 text-watt-success text-xs border-watt-success/30">Live</Badge>
          </div>
        </div>
        <p className="text-watt-navy/70 text-sm">Alberta Electricity System Operator</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-watt-success border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
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
                  <Zap className="w-4 h-4 text-watt-bitcoin flex-shrink-0" />
                  <span className="text-xs text-watt-navy/60">Total Generation</span>
                </div>
                <div className="text-lg font-bold text-watt-bitcoin">
                  {generationMix?.total_generation_mw?.toLocaleString() || '0'} MW
                </div>
              </div>
              
              <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-success/30 ${isAnimating ? 'scale-105 bg-watt-success/5 border-watt-success/50' : ''}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-watt-success flex-shrink-0" />
                  <span className="text-xs text-watt-navy/60">Renewables</span>
                </div>
                <div className="text-lg font-bold text-watt-success">
                  {generationMix?.renewable_percentage?.toFixed(1) || '0.0'}%
                </div>
              </div>
              
              <div className={`bg-watt-light rounded-lg p-4 transition-all duration-500 border border-gray-200 hover:border-watt-bitcoin/30 ${isAnimating ? 'scale-105 bg-watt-bitcoin/5 border-watt-bitcoin/50' : ''}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-watt-bitcoin flex-shrink-0" />
                  <span className="text-xs text-watt-navy/60">Current Demand</span>
                </div>
                <div className="text-lg font-bold text-watt-bitcoin">
                  {loadData?.current_demand_mw?.toLocaleString() || '0'} MW
                </div>
              </div>
            </div>

            {generationMix && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-watt-navy">Generation Mix</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-watt-navy/70">Natural Gas</span>
                    <span className="text-sm font-medium text-watt-navy">{generationMix.natural_gas_mw} MW</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-watt-navy/70">Wind</span>
                    <span className="text-sm font-medium text-watt-success">{generationMix.wind_mw} MW</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-watt-navy/70">Hydro</span>
                    <span className="text-sm font-medium text-watt-trust">{generationMix.hydro_mw} MW</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-watt-navy/70">Solar</span>
                    <span className="text-sm font-medium text-watt-bitcoin">{generationMix.solar_mw} MW</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};