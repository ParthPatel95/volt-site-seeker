
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, MapPin, TrendingUp, Wind, AlertTriangle } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';

export const AESODashboard = () => {
  const { pricing, loadData, generationMix, loading, connectionStatus, error } = useAESOData();

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

  const renderContent = () => {
    if (connectionStatus === 'error') {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 mb-2">Unable to connect to AESO API</div>
          <div className="text-slate-500 text-sm">Please check API configuration and try again</div>
        </div>
      );
    }

    if (connectionStatus === 'connecting') {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue mx-auto mb-2"></div>
          <div className="text-slate-400">Connecting to AESO API...</div>
        </div>
      );
    }

    // Only show data if we have a successful connection
    if (connectionStatus === 'connected' && (pricing || loadData || generationMix)) {
      return (
        <>
          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 hover:border-electric-blue/30">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-electric-blue" />
                <span className="text-xs text-slate-400">Pool Price</span>
              </div>
              <div className="text-lg font-bold text-electric-blue">
                ${pricing?.current_price?.toFixed(2) || '--'}/MWh
              </div>
            </div>
            
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 hover:border-electric-yellow/30">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-electric-yellow" />
                <span className="text-xs text-slate-400">Demand</span>
              </div>
              <div className="text-lg font-bold text-electric-yellow">
                {loadData ? (loadData.current_demand_mw / 1000).toFixed(1) : '--'} GW
              </div>
            </div>
            
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 hover:border-neon-green/30">
              <div className="flex items-center space-x-2 mb-1">
                <Wind className="w-4 h-4 text-neon-green" />
                <span className="text-xs text-slate-400">Wind Power</span>
              </div>
              <div className="text-lg font-bold text-neon-green">
                {generationMix ? (generationMix.wind_mw / 1000).toFixed(1) : '--'} GW
              </div>
            </div>
            
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 hover:border-warm-orange/30">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-warm-orange" />
                <span className="text-xs text-slate-400">Renewables</span>
              </div>
              <div className="text-lg font-bold text-warm-orange">
                {generationMix?.renewable_percentage?.toFixed(1) || '--'}%
              </div>
            </div>
          </div>

          {/* Market Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">Market Status</h4>
              <Badge className={`bg-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/20 text-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'} text-xs border-${pricing?.market_conditions === 'high_demand' ? 'warm-orange' : 'neon-green'}/30`}>
                {pricing?.market_conditions?.replace('_', ' ').toUpperCase() || 'NORMAL'}
              </Badge>
            </div>
            
            <div className="p-3 bg-slate-800/20 rounded-lg border border-slate-700/20">
              <div className="text-sm text-slate-300">
                <div className="flex justify-between items-center mb-2">
                  <span>Reserve Margin:</span>
                  <span className="text-electric-blue font-semibold">
                    {loadData?.reserve_margin?.toFixed(1) || '--'}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Peak Forecast:</span>
                  <span className="text-electric-yellow font-semibold">
                    {loadData ? (loadData.peak_forecast_mw / 1000).toFixed(1) : '--'} GW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-neon-green/30 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-neon-green group-hover:scale-110 transition-transform duration-300" />
            <CardTitle className="text-white text-xl">AESO Live Data</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 bg-${getStatusColor()} rounded-full ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}></div>
            <Badge className={`bg-${getStatusColor()}/20 text-${getStatusColor()} text-xs border-${getStatusColor()}/30`}>
              {getStatusText()}
            </Badge>
          </div>
        </div>
        <p className="text-slate-300 text-sm">
          {connectionStatus === 'connected' 
            ? 'Real-time Alberta electricity market data' 
            : connectionStatus === 'error'
            ? 'Unable to connect to AESO API'
            : 'Connecting to Alberta electricity market data'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderContent()}

        <div className="text-xs text-slate-500 pt-3 border-t border-slate-700/30">
          * Alberta Electric System Operator real-time data. Updates every 5 minutes.
        </div>
      </CardContent>
    </Card>
  );
};
