
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Zap, 
  Activity, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Battery,
  Wind,
  Sun,
  Flame,
  Atom,
  Droplets
} from 'lucide-react';
import { LiveMarketData } from '@/hooks/useEnhancedGridLineTracer';

interface LiveMarketDataPanelProps {
  marketData: LiveMarketData;
  customerClass: string;
  powerRequirement: number;
}

export function LiveMarketDataPanel({ 
  marketData, 
  customerClass, 
  powerRequirement 
}: LiveMarketDataPanelProps) {
  const getStatusColor = (conditions: string) => {
    switch (conditions) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'alert': return 'text-yellow-600 bg-yellow-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (conditions: string) => {
    switch (conditions) {
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number | undefined, currency: string = 'CAD') => {
    if (price === undefined || price === null) return 'N/A';
    return `${price.toFixed(2)}¢/kWh ${currency}`;
  };

  const formatDemand = (demand: number | undefined) => {
    if (demand === undefined || demand === null) return 'N/A MW';
    return `${demand.toLocaleString()} MW`;
  };

  const calculateMonthlyCost = () => {
    if (!marketData.currentPrice || !powerRequirement) return 'N/A';
    
    const hoursPerMonth = 730;
    const loadFactor = 0.80;
    const monthlyMWh = powerRequirement * hoursPerMonth * loadFactor;
    const monthlyCost = (monthlyMWh * 1000 * marketData.currentPrice) / 100;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: marketData.currency || 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monthlyCost);
  };

  const getGenerationIcon = (type: string) => {
    switch (type) {
      case 'renewable': return <Wind className="h-4 w-4 text-green-600" />;
      case 'natural_gas': return <Flame className="h-4 w-4 text-blue-600" />;
      case 'coal': return <Battery className="h-4 w-4 text-gray-600" />;
      case 'nuclear': return <Atom className="h-4 w-4 text-purple-600" />;
      case 'other': return <Droplets className="h-4 w-4 text-cyan-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <TrendingUp className="h-5 w-5" />
          Live Market Data - {marketData.market}
          <Badge variant="secondary" className="ml-2">
            <Clock className="h-3 w-3 mr-1" />
            Real-time
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Current electricity market conditions and pricing for {customerClass} customers
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Market Status */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-white">
            <div className="flex items-center gap-2">
              {getStatusIcon(marketData.gridConditions)}
              <span className="font-medium">Grid Status:</span>
            </div>
            <Badge className={getStatusColor(marketData.gridConditions)}>
              {marketData.gridConditions?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>

          {/* Current Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(marketData.currentPrice, marketData.currency)}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Peak Rate</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPrice(marketData.peakPrice, marketData.currency)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Off-Peak Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(marketData.offPeakPrice, marketData.currency)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demand Forecast */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Demand</p>
                  <p className="text-xl font-bold">
                    {formatDemand(marketData.demandForecast)}
                  </p>
                </div>
                <Battery className="h-8 w-8 text-orange-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Load Factor</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Generation Mix */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generation Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketData.generationMix && Object.entries(marketData.generationMix).map(([type, percentage]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getGenerationIcon(type)}
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost Estimation */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Estimated Monthly Cost ({powerRequirement}MW)
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {calculateMonthlyCost()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Based on 80% load factor and current rates
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {customerClass}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Timestamp */}
          <div className="text-center text-xs text-gray-500">
            Last updated: {new Date(marketData.timestamp).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
