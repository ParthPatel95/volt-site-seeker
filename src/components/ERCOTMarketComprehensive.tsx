import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Activity,
  Gauge,
  RefreshCw,
  MapPin,
  Shield,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';
import { ERCOTHistoricalPricing } from './ercot/ERCOTHistoricalPricing';

export function ERCOTMarketComprehensive() {
  const { 
    pricing, 
    loadData, 
    generationMix,
    loading, 
    error,
    refetch
  } = useERCOTData();

  const currentPrice = pricing?.current_price ?? 0;
  const averagePrice = pricing?.average_price ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-600" />
              ERCOT Market Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Electric Reliability Council of Texas - Real-Time Market Data
            </p>
          </div>
          <Button 
            onClick={refetch}
            disabled={loading}
            size="lg"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="market" className="space-y-6">
          <TabsList>
            <TabsTrigger value="market">
              <Zap className="w-4 h-4 mr-2" />
              Market Data
            </TabsTrigger>
            <TabsTrigger value="generation">
              <Activity className="w-4 h-4 mr-2" />
              Generation
            </TabsTrigger>
            <TabsTrigger value="historical">
              <Calendar className="w-4 h-4 mr-2" />
              Historical
            </TabsTrigger>
          </TabsList>

          {/* Market Data Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Real-Time LMP
                    {pricing?.timestamp && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {new Date(pricing.timestamp).toLocaleTimeString()}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-3xl font-bold">
                      {loading ? 'Loading...' : `$${currentPrice.toFixed(2)}/MWh`}
                    </p>
                    <Badge variant={currentPrice > 100 ? 'destructive' : 'default'} className="mt-2">
                      {currentPrice > 100 ? 'HIGH DEMAND' : 'NORMAL'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">30-Day Average</p>
                    <p className="text-xl font-semibold">${averagePrice.toFixed(2)}/MWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Conditions</p>
                    <p className="text-lg font-medium">{pricing?.market_conditions || 'Normal'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Load Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-blue-600" />
                    System Load & Demand
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Demand</p>
                      <p className="text-2xl font-bold">
                        {loadData?.current_demand_mw 
                          ? `${(loadData.current_demand_mw / 1000).toFixed(1)} GW`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Peak Forecast</p>
                      <p className="text-xl font-semibold">
                        {loadData?.peak_forecast_mw 
                          ? `${(loadData.peak_forecast_mw / 1000).toFixed(1)} GW`
                          : '—'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Reserve Margin</p>
                      <p className="text-xl font-semibold">
                        {loadData?.reserve_margin?.toFixed(1) || '—'}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Generation Tab */}
          <TabsContent value="generation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generation Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Natural Gas</p>
                    <p className="text-xl font-semibold">
                      {generationMix?.natural_gas_mw 
                        ? `${(generationMix.natural_gas_mw / 1000).toFixed(1)} GW`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coal</p>
                    <p className="text-xl font-semibold">
                      {generationMix?.coal_mw 
                        ? `${(generationMix.coal_mw / 1000).toFixed(1)} GW`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nuclear</p>
                    <p className="text-xl font-semibold">
                      {generationMix?.nuclear_mw 
                        ? `${(generationMix.nuclear_mw / 1000).toFixed(1)} GW`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wind</p>
                    <p className="text-xl font-semibold">
                      {generationMix?.wind_mw 
                        ? `${(generationMix.wind_mw / 1000).toFixed(1)} GW`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Solar</p>
                    <p className="text-xl font-semibold">
                      {generationMix?.solar_mw 
                        ? `${(generationMix.solar_mw / 1000).toFixed(1)} GW`
                        : '—'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Total Generation</p>
                    <p className="text-2xl font-bold">
                      {generationMix?.total_generation_mw 
                        ? `${(generationMix.total_generation_mw / 1000).toFixed(1)} GW`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Renewable %</p>
                    <p className="text-xl font-semibold text-green-600">
                      {generationMix?.renewable_percentage?.toFixed(1) || '—'}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historical Tab */}
          <TabsContent value="historical">
            <ERCOTHistoricalPricing />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
