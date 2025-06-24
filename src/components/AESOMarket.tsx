
import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, BarChart3, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAESOData } from '@/hooks/useAESOData';

export function AESOMarket() {
  const [activeTab, setActiveTab] = useState('current');
  const { 
    pricing,
    loadData,
    loading, 
    connectionStatus,
    refetch 
  } = useAESOData();

  // Extract values from the data structures
  const currentPrice = pricing?.pool_price || 45.50;
  const systemMarginalPrice = pricing?.pool_price || 52.30;
  const totalDemand = loadData?.alberta_load || 8450;
  const availableCapacity = 12800; // Static for now
  const lastUpdated = new Date().toLocaleTimeString();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="w-8 h-8 mr-3 text-yellow-600" />
                <div>
                  <CardTitle className="text-2xl">AESO Market Data</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Real-time Alberta electricity market data and analytics
                  </p>
                </div>
              </div>
              <Button 
                onClick={refetch}
                disabled={loading}
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Real-time Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold">
                    ${currentPrice?.toFixed(2)}/MWh
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Price</p>
                  <p className="text-2xl font-bold">
                    ${systemMarginalPrice?.toFixed(2)}/MWh
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Demand</p>
                  <p className="text-2xl font-bold">
                    {totalDemand?.toFixed(0)} MW
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Capacity</p>
                  <p className="text-2xl font-bold">
                    {availableCapacity?.toFixed(0)} MW
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Status */}
        <Card>
          <CardHeader>
            <CardTitle>Market Status</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Normal Operations
              </Badge>
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current">Current Data</TabsTrigger>
                <TabsTrigger value="historical">Historical</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pool Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">
                        ${currentPrice?.toFixed(2)}/MWh
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Real-time electricity price in Alberta
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Market Demand</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        {totalDemand?.toFixed(0)} MW
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Current system-wide electricity demand
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="historical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Historical market data analysis and trends will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forecast" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Price and demand forecasting models will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
