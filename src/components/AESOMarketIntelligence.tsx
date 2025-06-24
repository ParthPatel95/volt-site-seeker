
import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, BarChart3, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAESOData } from '@/hooks/useAESOData';

export function AESOMarketIntelligence() {
  const [activeTab, setActiveTab] = useState('analytics');
  const { loading, refetch } = useAESOData();

  const intelligenceMetrics = [
    { label: 'Price Volatility', value: '12.4%', trend: 'down', color: 'text-green-600' },
    { label: 'Demand Forecast', value: '8,650 MW', trend: 'up', color: 'text-blue-600' },
    { label: 'Market Efficiency', value: '94.7%', trend: 'stable', color: 'text-purple-600' },
    { label: 'Risk Score', value: 'Low', trend: 'down', color: 'text-green-600' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="w-8 h-8 mr-3 text-purple-600" />
                <div>
                  <CardTitle className="text-2xl">AESO Market Intelligence</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Advanced market intelligence and predictive analytics for Alberta's electricity market
                  </p>
                </div>
              </div>
              <Button 
                onClick={refetch}
                disabled={loading}
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Intelligence
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Intelligence Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {intelligenceMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className={`w-6 h-6 ${metric.color}`} />
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}
                    >
                      {metric.trend}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Intelligence Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Price Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Price (24h)</span>
                      <span className="font-semibold">$47.32/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peak Price</span>
                      <span className="font-semibold text-red-600">$89.45/MWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Off-Peak Price</span>
                      <span className="font-semibold text-green-600">$28.67/MWh</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Market Status</span>
                      <Badge className="bg-green-100 text-green-800">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Congestion Risk</span>
                      <Badge variant="outline">Low</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reserve Margin</span>
                      <span className="font-semibold">18.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Next 4 Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Prices expected to increase by 15-20% due to higher demand during evening peak.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Tomorrow</h4>
                    <p className="text-sm text-muted-foreground">
                      Moderate prices expected with average around $45/MWh. Low wind generation forecasted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">Renewable Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Wind generation has increased by 23% this month, contributing to lower average prices.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">Demand Patterns</h4>
                    <p className="text-sm text-muted-foreground">
                      Peak demand shifting later in the day due to increased electric vehicle charging.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">High price volatility detected in next 2 hours</span>
                    </div>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Optimal trading window identified for tomorrow 2-4 AM</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
