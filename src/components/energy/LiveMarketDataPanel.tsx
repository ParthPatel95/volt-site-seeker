
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Zap, Activity, AlertTriangle, Clock } from 'lucide-react';
import { LiveMarketData } from '@/hooks/useEnhancedGridLineTracer';

interface LiveMarketDataPanelProps {
  marketData: LiveMarketData;
  customerClass: string;
  powerRequirement: number;
}

export function LiveMarketDataPanel({ marketData, customerClass, powerRequirement }: LiveMarketDataPanelProps) {
  const getGridConditionColor = (condition: string) => {
    switch (condition) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'alert': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGridConditionIcon = (condition: string) => {
    switch (condition) {
      case 'normal': return <Activity className="h-4 w-4 text-green-600" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: marketData.currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const estimatedMonthlyCost = () => {
    const hoursPerMonth = 730;
    const loadFactor = 0.80;
    const monthlyMWh = powerRequirement * hoursPerMonth * loadFactor;
    const energyCost = (monthlyMWh * 1000 * marketData.currentPrice) / 100;
    return energyCost;
  };

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <TrendingUp className="h-5 w-5" />
          Live Market Data - {marketData.market}
          <Badge variant="secondary" className="ml-2">
            <Clock className="h-3 w-3 mr-1" />
            Real-Time
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Live electricity market data for {customerClass} customers with {powerRequirement}MW demand
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Market Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {marketData.currentPrice.toFixed(2)}¢
              </div>
              <div className="text-sm text-gray-600">Current Rate/kWh</div>
              <div className="text-xs text-gray-500">{marketData.currency}</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                {marketData.peakPrice.toFixed(2)}¢
              </div>
              <div className="text-sm text-gray-600">Peak Rate/kWh</div>
              <div className="text-xs text-gray-500">Highest Today</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {marketData.offPeakPrice.toFixed(2)}¢
              </div>
              <div className="text-sm text-gray-600">Off-Peak Rate/kWh</div>
              <div className="text-xs text-gray-500">Lowest Today</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-xl font-bold text-purple-600">
                {formatCurrency(estimatedMonthlyCost())}
              </div>
              <div className="text-sm text-gray-600">Est. Monthly Cost</div>
              <div className="text-xs text-gray-500">{powerRequirement}MW @ 80% LF</div>
            </div>
          </div>

          {/* Grid Conditions */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              {getGridConditionIcon(marketData.gridConditions)}
              <div>
                <div className="font-medium">Grid Conditions</div>
                <div className="text-sm text-gray-600">System demand: {marketData.demandForecast.toLocaleString()} MW</div>
              </div>
            </div>
            <Badge className={getGridConditionColor(marketData.gridConditions)}>
              {marketData.gridConditions.toUpperCase()}
            </Badge>
          </div>

          {/* Generation Mix */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Current Generation Mix
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Renewable Energy</span>
                <span className="text-sm font-medium">{marketData.generationMix.renewable}%</span>
              </div>
              <Progress value={marketData.generationMix.renewable} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Natural Gas</span>
                <span className="text-sm font-medium">{marketData.generationMix.natural_gas}%</span>
              </div>
              <Progress value={marketData.generationMix.natural_gas} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Coal</span>
                <span className="text-sm font-medium">{marketData.generationMix.coal}%</span>
              </div>
              <Progress value={marketData.generationMix.coal} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Nuclear</span>
                <span className="text-sm font-medium">{marketData.generationMix.nuclear}%</span>
              </div>
              <Progress value={marketData.generationMix.nuclear} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Other</span>
                <span className="text-sm font-medium">{marketData.generationMix.other}%</span>
              </div>
              <Progress value={marketData.generationMix.other} className="h-2" />
            </div>
          </div>

          {/* Market Insights */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">Market Insights</h5>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Current price is {marketData.currentPrice > marketData.peakPrice * 0.8 ? 'HIGH' : marketData.currentPrice < marketData.peakPrice * 0.5 ? 'LOW' : 'MODERATE'} compared to daily peak</div>
              <div>• Renewable generation at {marketData.generationMix.renewable}% - {marketData.generationMix.renewable > 40 ? 'favorable for green energy credits' : 'consider timing for cleaner energy'}</div>
              <div>• Grid conditions are {marketData.gridConditions} - {marketData.gridConditions === 'normal' ? 'optimal for energy-intensive operations' : 'consider load management strategies'}</div>
              <div>• Updated: {new Date(marketData.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
