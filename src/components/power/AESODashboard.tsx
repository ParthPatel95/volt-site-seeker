
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Activity, Wind, Gauge } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';

export const AESODashboard = () => {
  const { pricing, loadData, generationMix, loading, connectionStatus } = useAESOData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AESO Market Data</h2>
        <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
          {connectionStatus === 'connected' ? 'Live Data' : 'Disconnected'}
        </Badge>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Price</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pricing?.current_price_cents_kwh ? `${pricing.current_price_cents_kwh.toFixed(2)} ¢/kWh` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Alberta pool price</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadData?.load?.current_mw ? `${(loadData.load.current_mw / 1000).toFixed(1)} GW` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Current demand</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wind Generation</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generationMix?.generation_mw?.wind_mw ? `${(generationMix.generation_mw.wind_mw / 1000).toFixed(1)} GW` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Wind power output</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewables</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generationMix?.fuel_mix?.renewable_percent || 'N/A'}%
            </div>
            <p className="text-xs text-muted-foreground">Renewable generation</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Load Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Load:</span>
                <span className="font-medium">{loadData?.load?.current_mw ? `${loadData.load.current_mw.toFixed(0)} MW` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Peak Load:</span>
                <span className="font-medium">{loadData?.load?.peak_mw ? `${loadData.load.peak_mw.toFixed(0)} MW` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Load:</span>
                <span className="font-medium">{loadData?.load?.avg_mw ? `${loadData.load.avg_mw.toFixed(0)} MW` : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generation Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Natural Gas:</span>
                <span className="font-medium">{generationMix?.fuel_mix?.gas_percent || 'N/A'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Wind:</span>
                <span className="font-medium">{generationMix?.fuel_mix?.wind_percent || 'N/A'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hydro:</span>
                <span className="font-medium">{generationMix?.fuel_mix?.hydro_percent || 'N/A'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Solar:</span>
                <span className="font-medium">{generationMix?.fuel_mix?.solar_percent || 'N/A'}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
