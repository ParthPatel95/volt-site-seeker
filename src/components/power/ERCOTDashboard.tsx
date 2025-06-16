
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  TrendingUp, 
  Activity,
  Gauge,
  Wind,
  Sun,
  Fuel,
  RefreshCw
} from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';

export function ERCOTDashboard() {
  const { 
    pricing, 
    loadData, 
    generationMix, 
    loading, 
    refetch 
  } = useERCOTData();

  const getMarketConditionColor = (condition: string) => {
    switch (condition) {
      case 'high_demand': return 'destructive';
      case 'normal': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ERCOT Live Data</h2>
          <p className="text-muted-foreground">Real-time Texas grid operations and pricing</p>
        </div>
        <Button 
          onClick={refetch}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Real-time Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Real-Time Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pricing ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">${pricing.current_price.toFixed(2)}/MWh</p>
                <Badge variant={getMarketConditionColor(pricing.market_conditions)}>
                  {pricing.market_conditions.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Average Price</p>
                <p className="text-xl font-semibold">${pricing.average_price.toFixed(2)}/MWh</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Peak Price</p>
                <p className="text-xl font-semibold">${pricing.peak_price.toFixed(2)}/MWh</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Off-Peak Price</p>
                <p className="text-xl font-semibold">${pricing.off_peak_price.toFixed(2)}/MWh</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading pricing data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Load */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-blue-600" />
            System Load & Demand
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Demand</p>
                <p className="text-2xl font-bold">{(loadData.current_demand_mw / 1000).toFixed(1)} GW</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Peak Forecast</p>
                <p className="text-xl font-semibold">{(loadData.peak_forecast_mw / 1000).toFixed(1)} GW</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Reserve Margin</p>
                <p className="text-xl font-semibold">{loadData.reserve_margin.toFixed(1)}%</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading demand data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Mix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Generation Mix
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generationMix ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Fuel className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Natural Gas</p>
                    <p className="font-semibold">{(generationMix.natural_gas_mw / 1000).toFixed(1)} GW</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Wind</p>
                    <p className="font-semibold">{(generationMix.wind_mw / 1000).toFixed(1)} GW</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Solar</p>
                    <p className="font-semibold">{(generationMix.solar_mw / 1000).toFixed(1)} GW</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nuclear</p>
                    <p className="font-semibold">{(generationMix.nuclear_mw / 1000).toFixed(1)} GW</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Renewable Generation</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {generationMix.renewable_percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading generation data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
