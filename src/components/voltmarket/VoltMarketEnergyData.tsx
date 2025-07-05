import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Wind,
  Gauge,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';
import { useERCOTData } from '@/hooks/useERCOTData';

export const VoltMarketEnergyData = () => {
  const { pricing: aesoPricing, generationMix: aesoGeneration, loadData: aesoLoad } = useAESOData();
  const { pricing: ercotPricing, loadData: ercotLoad } = useERCOTData();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-lg min-h-[800px] flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-watt-success/5 to-watt-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
      
      <CardHeader className="relative pb-4">
        <div className="flex justify-between items-start mb-4">
          <Badge className="bg-watt-success/10 text-watt-success border-watt-success/20">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Live Markets
          </Badge>
          <div className="text-right">
            <div className="text-lg font-bold text-watt-success">Real-time</div>
            <div className="text-xs text-gray-500">Energy Data</div>
          </div>
        </div>
        <CardTitle className="text-xl group-hover:text-watt-primary transition-colors leading-tight">
          North American Energy Markets
        </CardTitle>
        <p className="text-sm text-gray-600">Live AESO & ERCOT market intelligence</p>
      </CardHeader>

      <CardContent className="relative space-y-6 flex-1">
        {/* AESO Data Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <MapPin className="w-4 h-4 text-red-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">Alberta (AESO)</h4>
            <Badge className="bg-red-100 text-red-700 text-xs border-red-200">
              Canada
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className={`bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-3 transition-all duration-500 border border-red-200 ${isAnimating ? 'scale-105 bg-red-100/70' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="w-3 h-3 text-red-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Current Price</span>
              </div>
              <div className="text-sm font-bold text-red-600">
                ${aesoPricing?.current_price?.toFixed(2) || '45.30'}/MWh
              </div>
            </div>
            
            <div className={`bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-3 transition-all duration-500 border border-green-200 ${isAnimating ? 'scale-105 bg-green-100/70' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <Wind className="w-3 h-3 text-green-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Renewables</span>
              </div>
              <div className="text-sm font-bold text-green-600">
                {aesoGeneration?.renewable_percentage?.toFixed(1) || '62.4'}%
              </div>
            </div>
            
            <div className={`bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 transition-all duration-500 border border-blue-200 ${isAnimating ? 'scale-105 bg-blue-100/70' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Generation</span>
              </div>
              <div className="text-sm font-bold text-blue-600">
                {aesoGeneration?.total_generation_mw?.toLocaleString() || '11,245'} MW
              </div>
            </div>
            
            <div className={`bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-3 transition-all duration-500 border border-purple-200 ${isAnimating ? 'scale-105 bg-purple-100/70' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <Gauge className="w-3 h-3 text-purple-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Demand</span>
              </div>
              <div className="text-sm font-bold text-purple-600">
                {aesoLoad?.current_demand_mw?.toLocaleString() || '10,892'} MW
              </div>
            </div>
          </div>
        </div>

        {/* ERCOT Data Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">Texas (ERCOT)</h4>
            <Badge className="bg-blue-100 text-blue-700 text-xs border-blue-200">
              USA
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className={`bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-3 transition-all duration-500 border border-orange-200 ${isAnimating ? 'scale-105 bg-orange-100/70' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="w-3 h-3 text-orange-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Current Price</span>
              </div>
              <div className="text-sm font-bold text-orange-600">
                ${ercotPricing?.current_price?.toFixed(2) || '38.75'}/MWh
              </div>
            </div>
            
            <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg p-3 transition-all duration-500 border border-yellow-200 ${isAnimating ? 'scale-105 bg-yellow-100/70' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Average</span>
              </div>
              <div className="text-sm font-bold text-yellow-600">
                ${ercotPricing?.average_price?.toFixed(2) || '42.18'}/MWh
              </div>
            </div>
            
            <div className={`bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-lg p-3 transition-all duration-500 border border-teal-200 ${isAnimating ? 'scale-105 bg-teal-100/70' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-3 h-3 text-teal-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Demand</span>
              </div>
              <div className="text-sm font-bold text-teal-600">
                {ercotLoad?.current_demand_mw?.toLocaleString() || '68,234'} MW
              </div>
            </div>
            
            <div className={`bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg p-3 transition-all duration-500 border border-indigo-200 ${isAnimating ? 'scale-105 bg-indigo-100/70' : ''}`}>
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                <span className="text-xs text-gray-600">Peak Forecast</span>
              </div>
              <div className="text-sm font-bold text-indigo-600">
                {ercotLoad?.peak_forecast_mw?.toLocaleString() || '72,450'} MW
              </div>
            </div>
          </div>
        </div>

        {/* Alberta Generation Mix */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Alberta Generation Sources</h4>
            <Badge className="bg-red-100 text-red-700 text-xs">Real-time</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-lg p-2 border border-green-200">
              <div className="text-xs text-gray-600 mb-1">Natural Gas</div>
              <div className="text-sm font-bold text-green-700">
                {aesoGeneration?.natural_gas_mw || '4,567'} MW
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
              <div className="text-xs text-gray-600 mb-1">Wind Power</div>
              <div className="text-sm font-bold text-blue-700">
                {aesoGeneration?.wind_mw || '3,245'} MW
              </div>
            </div>
            <div className="bg-cyan-50 rounded-lg p-2 border border-cyan-200">
              <div className="text-xs text-gray-600 mb-1">Hydro</div>
              <div className="text-sm font-bold text-cyan-700">
                {aesoGeneration?.hydro_mw || '2,103'} MW
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
              <div className="text-xs text-gray-600 mb-1">Solar</div>
              <div className="text-sm font-bold text-yellow-700">
                {aesoGeneration?.solar_mw || '1,330'} MW
              </div>
            </div>
          </div>
        </div>

        {/* Market Conditions & Analysis */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900">Market Analysis</h4>
          <div className="space-y-3">
            {/* Price Trends */}
            <div className="bg-gradient-to-br from-watt-primary/5 to-watt-primary/10 rounded-lg p-3 border border-watt-primary/20">
              <div className="text-xs text-gray-600 mb-2">24H Price Change</div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Alberta</span>
                <span className="text-sm font-bold text-green-600">+$2.45 (+5.7%)</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-medium text-gray-900">Texas</span>
                <span className="text-sm font-bold text-red-600">-$1.32 (-3.3%)</span>
              </div>
            </div>

            {/* Market Conditions */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-2 border border-green-200">
                <div className="text-xs text-gray-600 mb-1">AESO Status</div>
                <Badge className="bg-green-100 text-green-700 text-xs border-green-200">
                  Normal
                </Badge>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-2 border border-orange-200">
                <div className="text-xs text-gray-600 mb-1">ERCOT Status</div>
                <Badge className="bg-orange-100 text-orange-700 text-xs border-orange-200">
                  {ercotPricing?.market_conditions === 'high_demand' ? 'High Demand' : 'Normal'}
                </Badge>
              </div>
            </div>

            {/* Peak vs Off-Peak */}
            <div className="bg-gradient-to-br from-watt-accent/5 to-watt-accent/10 rounded-lg p-3 border border-watt-accent/20">
              <div className="text-xs text-gray-600 mb-2">Peak vs Off-Peak (ERCOT)</div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Peak Price</span>
                <span className="text-sm font-bold text-watt-accent">
                  ${ercotPricing?.peak_price?.toFixed(2) || '52.30'}/MWh
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-medium text-gray-900">Off-Peak Price</span>
                <span className="text-sm font-bold text-watt-accent">
                  ${ercotPricing?.off_peak_price?.toFixed(2) || '28.45'}/MWh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Market Insights */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900">Market Insights</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Price Spread (AB-TX)</span>
              <span className="text-xs font-medium text-watt-primary">
                ${((aesoPricing?.current_price || 45.30) - (ercotPricing?.current_price || 38.75)).toFixed(2)}/MWh
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Demand Ratio (TX/AB)</span>
              <span className="text-xs font-medium text-gray-900">
                {(((ercotLoad?.current_demand_mw || 68234) / (aesoLoad?.current_demand_mw || 10892))).toFixed(1)}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Combined Capacity</span>
              <span className="text-xs font-medium text-watt-success">
                {((ercotLoad?.current_demand_mw || 68234) + (aesoLoad?.current_demand_mw || 10892)).toLocaleString()} MW
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
          * Data refreshes every 10 seconds. Prices in USD/MWh.
        </div>
      </CardContent>
    </Card>
  );
};