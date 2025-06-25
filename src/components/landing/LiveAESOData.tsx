
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, MapPin, TrendingUp, Wind, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';

export const LiveAESOData = () => {
  const { pricing, loadData, generationMix, loading, connectionStatus, error, qaMetrics, refetch } = useAESOData();
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

  const hasAnyData = pricing || loadData || generationMix;

  const renderDataQualityIndicator = () => {
    const dataQualities = Object.values(qaMetrics).map(m => m.data_quality);
    const worstQuality = dataQualities.includes('stale') ? 'stale' : 
                        dataQualities.includes('moderate') ? 'moderate' : 'fresh';
    
    if (connectionStatus === 'connected' && dataQualities.length > 0) {
      const qualityColors = {
        fresh: 'text-neon-green',
        moderate: 'text-electric-yellow',
        stale: 'text-warm-orange'
      };
      
      return (
        <span className={`text-xs ${qualityColors[worstQuality]}`}>
          {worstQuality} data
        </span>
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
            {connectionStatus === 'error' && (
              <button
                onClick={refetch}
                className="p-1 hover:bg-slate-700/50 rounded-full transition-colors"
                title="Retry connection"
              >
                <RefreshCw className={`w-3 h-3 text-slate-400 hover:text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <p className="text-slate-300 text-sm">
            {connectionStatus === 'connected' 
              ? 'Real-time Alberta electricity market data' 
              : connectionStatus === 'error'
              ? error || 'Unable to connect to AESO API'
              : 'Connecting to Alberta electricity market data'}
          </p>
          {renderDataQualityIndicator()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {connectionStatus === 'connecting' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue mx-auto mb-2"></div>
            <div className="text-slate-400">Connecting to AESO API...</div>
          </div>
        )}

        {connectionStatus === 'error' && !hasAnyData && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <div className="text-red-400 mb-2">Unable to connect to AESO API</div>
            <div className="text-slate-500 text-sm mb-4">
              {error?.includes('API key') 
                ? 'API configuration required' 
                : 'Network connectivity issue - trying to reconnect...'}
            </div>
            <button
              onClick={refetch}
              disabled={loading}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Retrying...' : 'Retry Connection'}
            </button>
          </div>
        )}

        {(connectionStatus === 'connected' || hasAnyData) && (
          <>
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`bg-slate-800/30 rounded-lg p-3 transition-all duration-500 border border-slate-700/30 hover:border-electric-blue/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-blue/50' : ''}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-electric-blue" />
                  <span className="text-xs text-slate-400">Pool Price</span>
                </div>
                <div className="text-lg font-bold text-electric-blue">
                  ${pricing?.current_price?.toFixed(2) || '--'}/MWh
                </div>
              </div>
              
              <div className={`bg-slate-800/30 rounded-lg p-3 transition-all duration-500 border border-slate-700/30 hover:border-electric-yellow/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-electric-yellow/50' : ''}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-electric-yellow" />
                  <span className="text-xs text-slate-400">Demand</span>
                </div>
                <div className="text-lg font-bold text-electric-yellow">
                  {loadData ? (loadData.current_demand_mw / 1000).toFixed(1) : '--'} GW
                </div>
              </div>
              
              <div className={`bg-slate-800/30 rounded-lg p-3 transition-all duration-500 border border-slate-700/30 hover:border-neon-green/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-neon-green/50' : ''}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Wind className="w-4 h-4 text-neon-green" />
                  <span className="text-xs text-slate-400">Wind Power</span>
                </div>
                <div className="text-lg font-bold text-neon-green">
                  {generationMix ? (generationMix.wind_mw / 1000).toFixed(1) : '--'} GW
                </div>
              </div>
              
              <div className={`bg-slate-800/30 rounded-lg p-3 transition-all duration-500 border border-slate-700/30 hover:border-warm-orange/30 ${isAnimating ? 'scale-105 bg-slate-800/50 border-warm-orange/50' : ''}`}>
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
        )}

        <div className="text-xs text-slate-500 pt-3 border-t border-slate-700/30">
          * Alberta Electric System Operator real-time data. Updates every 5 minutes.
          {connectionStatus === 'connected' && Object.keys(qaMetrics).length > 0 && (
            <div className="mt-1">
              Response times: {Object.values(qaMetrics).map(m => `${m.response_time_ms}ms`).join(', ')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
