
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, TrendingUp, Wind, MapPin, Clock, AlertTriangle, Battery, ArrowUp, ArrowDown } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';

export const LiveAESOData = () => {
  const { pricing, loadData, generationMix, forecast, outageData, loading, connectionStatus } = useAESOData();
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
      case 'connected': return 'Live AESO API';
      case 'error': return 'API Error';
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
        <p className="text-slate-300 text-xs sm:text-sm">Real-time Alberta electricity market data via AESO API v1.1</p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Live Energy Rate - Main Display */}
        <div className={`bg-gradient-to-r from-electric-blue/20 to-electric-yellow/20 rounded-lg p-3 sm:p-4 transition-all duration-500 border border-electric-blue/30 ${isAnimating ? 'scale-105 border-electric-blue/50' : ''}`}>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">Live AESO Energy Rate</div>
            <div className="text-xl sm:text-2xl font-bold text-electric-blue">
              {pricing?.current_price_cents_kwh ? `${pricing.current_price_cents_kwh.toFixed(2)} ¢/kWh CAD` : 'Loading...'}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {pricing?.rates?.trailing12mo_avg ? `12-mo avg: ${pricing.rates.trailing12mo_avg.toFixed(2)} ¢/kWh` : 'Calculating averages...'}
            </div>
          </div>
        </div>

        {/* Tomorrow's Forecast */}
        {forecast && (
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {forecast.forecast.trend === 'increasing' ? 
                  <ArrowUp className="w-4 h-4 text-warm-orange" /> : 
                  <ArrowDown className="w-4 h-4 text-neon-green" />
                }
                <span className="text-sm text-slate-400">Tomorrow's Forecast:</span>
              </div>
              <span className="text-sm font-semibold text-electric-yellow">
                {forecast.forecast.tomorrow_avg_cents_kwh.toFixed(2)} ¢/kWh
              </span>
            </div>
          </div>
        )}

        {/* Grid Mix Display */}
        {generationMix && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">Alberta Grid Mix</h4>
            <div className="text-sm text-slate-300">
              {generationMix.fuel_mix.wind_percent}% Wind | {generationMix.fuel_mix.hydro_percent}% Hydro | {generationMix.fuel_mix.solar_percent}% Solar
            </div>
            <div className="text-xs text-slate-400">
              Total Renewables: {generationMix.fuel_mix.renewable_percent}% | Natural Gas: {generationMix.fuel_mix.gas_percent}%
            </div>
          </div>
        )}

        {/* System Load Display */}
        {loadData && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">System Load</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400">Peak:</span>
                <span className="text-electric-yellow font-semibold ml-2">{loadData.load.peak_gw} GW</span>
              </div>
              <div>
                <span className="text-slate-400">Avg:</span>
                <span className="text-neon-green font-semibold ml-2">{loadData.load.avg_gw} GW</span>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Current: {loadData.load.current_gw} GW | Capacity Margin: {loadData.capacity_margin.toFixed(1)}%
            </div>
          </div>
        )}

        {/* Market Insights */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">Market Status</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-slate-800/20 rounded border border-slate-700/20">
              <span className="text-slate-400">Market:</span>
              <Badge className={`text-xs ${pricing?.market_conditions === 'high_demand' ? 'bg-warm-orange/20 text-warm-orange border-warm-orange/30' : 'bg-neon-green/20 text-neon-green border-neon-green/30'}`}>
                {pricing?.market_conditions?.replace('_', ' ').toUpperCase() || 'NORMAL'}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-800/20 rounded border border-slate-700/20">
              <span className="text-slate-400">30-day Avg:</span>
              <span className="text-electric-blue font-semibold">
                {pricing?.rates?.monthly_avg ? `${pricing.rates.monthly_avg.toFixed(2)} ¢/kWh` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Outage Information */}
        {outageData && (
          <div className="bg-slate-800/20 rounded-lg p-3 border border-slate-700/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Battery className="w-4 h-4 text-electric-blue" />
                <span className="text-sm text-slate-400">Grid Status:</span>
              </div>
              <Badge className={`text-xs ${outageData.outages.risk_level === 'low' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : 'bg-warm-orange/20 text-warm-orange border-warm-orange/30'}`}>
                {outageData.outages.risk_level.toUpperCase()} RISK
              </Badge>
            </div>
            {outageData.outages.active_count > 0 && (
              <div className="text-xs text-slate-400 mt-1">
                Active outages: {outageData.outages.active_count} | Planned: {outageData.outages.planned_count}
              </div>
            )}
          </div>
        )}

        {/* Connection Status */}
        {connectionStatus === 'error' && (
          <div className="flex items-center justify-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
            <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-red-400 text-xs">Unable to connect to AESO API</span>
          </div>
        )}

        {/* Data Source Attribution */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/30">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <a 
            href="https://www.aeso.ca/market/market-and-system-reporting/aeso-application-programming-interface-api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-electric-blue transition-colors"
          >
            AESO API v1.1 ↗
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
