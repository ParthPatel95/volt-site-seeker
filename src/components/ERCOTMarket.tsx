
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  TrendingUp, 
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Battery,
  Wind,
  Sun,
  Fuel,
  Atom
} from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';

export function ERCOTMarket() {
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
      case 'alert': return 'secondary';
      default: return 'outline';
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}/MWh`;
  };

  const formatLoad = (load: number) => {
    return `${(load / 1000).toFixed(1)} GW`;
  };

  const formatGeneration = (gen: number) => {
    return `${(gen / 1000).toFixed(1)} GW`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ERCOT Market</h1>
          <p className="text-muted-foreground">Texas electricity market real-time data and analytics</p>
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="load">System Load</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Market Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Price</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {pricing ? formatPrice(pricing.current_price) : 'Loading...'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Load</p>
                    <p className="text-2xl font-bold text-green-600">
                      {loadData ? formatLoad(loadData.current_demand_mw) : 'Loading...'}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Renewables</p>
                    <p className="text-2xl font-bold text-green-600">
                      {generationMix ? `${generationMix.renewable_percentage.toFixed(1)}%` : 'Loading...'}
                    </p>
                  </div>
                  <Wind className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Status</p>
                    <Badge variant={pricing ? getMarketConditionColor(pricing.market_conditions) : "outline"}>
                      {pricing ? pricing.market_conditions.replace('_', ' ').toUpperCase() : 'Loading...'}
                    </Badge>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Market Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Current Market Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Pricing Summary</h3>
                  {pricing ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Price:</span>
                        <span className="font-medium">{formatPrice(pricing.current_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Price:</span>
                        <span className="font-medium">{formatPrice(pricing.average_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak Price:</span>
                        <span className="font-medium text-red-600">{formatPrice(pricing.peak_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Off-Peak Price:</span>
                        <span className="font-medium text-green-600">{formatPrice(pricing.off_peak_price)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">Loading pricing data...</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">System Load</h3>
                  {loadData ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Demand:</span>
                        <span className="font-medium">{formatLoad(loadData.current_demand_mw)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak Forecast:</span>
                        <span className="font-medium">{formatLoad(loadData.peak_forecast_mw)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reserve Margin:</span>
                        <span className="font-medium">{loadData.reserve_margin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity Margin:</span>
                        <span className="font-medium">{loadData.capacity_margin.toFixed(1)}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">Loading system data...</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                ERCOT Real-Time Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pricing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-blue-50">
                    <CardContent className="p-4 text-center">
                      <h3 className="text-sm font-medium text-blue-600 mb-2">Current Price</h3>
                      <p className="text-2xl font-bold text-blue-800">{formatPrice(pricing.current_price)}</p>
                      <Badge variant={getMarketConditionColor(pricing.market_conditions)} className="mt-2">
                        {pricing.market_conditions.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50">
                    <CardContent className="p-4 text-center">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Average Price</h3>
                      <p className="text-2xl font-bold text-gray-800">{formatPrice(pricing.average_price)}</p>
                      <p className="text-xs text-gray-500 mt-2">24-hour average</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50">
                    <CardContent className="p-4 text-center">
                      <h3 className="text-sm font-medium text-red-600 mb-2">Peak Price</h3>
                      <p className="text-2xl font-bold text-red-800">{formatPrice(pricing.peak_price)}</p>
                      <p className="text-xs text-red-500 mt-2">Today's highest</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50">
                    <CardContent className="p-4 text-center">
                      <h3 className="text-sm font-medium text-green-600 mb-2">Off-Peak Price</h3>
                      <p className="text-2xl font-bold text-green-800">{formatPrice(pricing.off_peak_price)}</p>
                      <p className="text-xs text-green-500 mt-2">Today's lowest</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Loading pricing data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="load" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Battery className="w-5 h-5 mr-2 text-orange-600" />
                System Load & Demand
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50">
                      <CardContent className="p-4 text-center">
                        <h3 className="text-sm font-medium text-blue-600 mb-2">Current Demand</h3>
                        <p className="text-3xl font-bold text-blue-800">{formatLoad(loadData.current_demand_mw)}</p>
                        <p className="text-xs text-blue-500 mt-2">Real-time load</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50">
                      <CardContent className="p-4 text-center">
                        <h3 className="text-sm font-medium text-orange-600 mb-2">Peak Forecast</h3>
                        <p className="text-3xl font-bold text-orange-800">{formatLoad(loadData.peak_forecast_mw)}</p>
                        <p className="text-xs text-orange-500 mt-2">Expected peak today</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50">
                      <CardContent className="p-4 text-center">
                        <h3 className="text-sm font-medium text-green-600 mb-2">Reserve Margin</h3>
                        <p className="text-3xl font-bold text-green-800">{loadData.reserve_margin.toFixed(1)}%</p>
                        <p className="text-xs text-green-500 mt-2">Available reserves</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">System Reliability</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Capacity Margin</p>
                        <p className="text-lg font-bold">{loadData.capacity_margin.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Load Factor</p>
                        <p className="text-lg font-bold">{((loadData.current_demand_mw / loadData.peak_forecast_mw) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Battery className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Loading system load data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-600" />
                Generation Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generationMix ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Fuel className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-600">Natural Gas</p>
                        <p className="text-lg font-bold">{formatGeneration(generationMix.natural_gas_mw)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Wind className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-sm text-green-600">Wind</p>
                        <p className="text-lg font-bold">{formatGeneration(generationMix.wind_mw)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Sun className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-yellow-600">Solar</p>
                        <p className="text-lg font-bold">{formatGeneration(generationMix.solar_mw)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Atom className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-purple-600">Nuclear</p>
                        <p className="text-lg font-bold">{formatGeneration(generationMix.nuclear_mw)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-green-800">Renewable Generation</h3>
                        <p className="text-sm text-green-600">Wind + Solar + Hydro</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-800">{generationMix.renewable_percentage.toFixed(1)}%</p>
                        <p className="text-sm text-green-600">of total generation</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Total Generation</h4>
                      <p className="text-xl font-bold">{formatGeneration(generationMix.total_generation_mw)}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Last Updated</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(generationMix.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Loading generation data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
