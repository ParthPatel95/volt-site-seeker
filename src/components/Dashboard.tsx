
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  Zap, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Settings,
  Bell,
  MapPin,
  Wind,
  Sun,
  Fuel
} from 'lucide-react';
import { useERCOTData } from '@/hooks/useERCOTData';
import { useAESOData } from '@/hooks/useAESOData';
import { ResponsiveContentGrid } from '@/components/ResponsiveGrid';
import { ResponsivePageContainer, ResponsiveSection } from '@/components/ResponsiveContainer';


interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export const Dashboard = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Live data hooks
  const { 
    pricing: ercotPricing, 
    loadData: ercotLoad, 
    generationMix: ercotGeneration,
    loading: ercotLoading 
  } = useERCOTData();

  const { 
    pricing: aesoPricing, 
    loadData: aesoLoad, 
    generationMix: aesoGeneration,
    loading: aesoLoading,
    error: aesoError 
  } = useAESOData();
  
  // Use real loading states from data hooks
  const isLoading = ercotLoading || aesoLoading;


  // Remove simulated loading - use real data loading states


  const alerts: AlertItem[] = [
    {
      id: '1',
      title: 'High Energy Consumption',
      message: 'Power usage exceeded threshold in Facility A',
      severity: 'high',
      timestamp: new Date(Date.now() - 30 * 60000)
    },
    {
      id: '2',
      title: 'Maintenance Required',
      message: 'Scheduled maintenance due for Generator 3',
      severity: 'medium',
      timestamp: new Date(Date.now() - 2 * 60 * 60000)
    },
    {
      id: '3',
      title: 'System Update',
      message: 'New features available in Corporate Intelligence',
      severity: 'low',
      timestamp: new Date(Date.now() - 24 * 60 * 60000)
    }
  ];

  const getSeverityColor = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const refreshData = () => {
    setLastUpdated(new Date());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ResponsivePageContainer className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <ResponsiveSection className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>


        {/* Live Energy Market Data */}
        <ResponsiveContentGrid>
          {/* ERCOT Live Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                ERCOT (Texas) - Live Data
                {ercotLoading && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ercotPricing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Current Price</div>
                    <div className="text-lg sm:text-xl font-bold text-blue-600 break-all">
                      ${ercotPricing.current_price.toFixed(2)}/MWh
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Market Status</div>
                    <div className="text-base sm:text-lg font-semibold text-green-600 capitalize break-words">
                      {ercotPricing.market_conditions}
                    </div>
                  </div>
                </div>
              )}
              
              {ercotLoad && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Demand</span>
                    <span className="font-bold text-sm sm:text-base">{(ercotLoad.current_demand_mw / 1000).toFixed(1)} GW</span>
                  </div>
                  <Progress value={(ercotLoad.current_demand_mw / ercotLoad.peak_forecast_mw) * 100} className="mt-2" />
                </div>
              )}

              {ercotGeneration && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Generation Mix</div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                    <div className="flex items-center gap-1 min-w-0">
                      <Fuel className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span className="truncate">Gas: {((ercotGeneration.natural_gas_mw / ercotGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Wind className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="truncate">Wind: {((ercotGeneration.wind_mw / ercotGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Sun className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      <span className="truncate">Solar: {((ercotGeneration.solar_mw / ercotGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    Renewable: {ercotGeneration.renewable_percentage.toFixed(1)}%
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AESO Live Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                AESO (Alberta) - Live Data
                {aesoLoading && <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aesoPricing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Current Price</div>
                    <div className="text-lg sm:text-xl font-bold text-red-600 break-all">
                      CA${aesoPricing.current_price.toFixed(2)}/MWh
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Market Status</div>
                    <div className="text-base sm:text-lg font-semibold text-green-600 capitalize break-words">
                      {aesoPricing.market_conditions}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-sm text-amber-700">Pricing data temporarily unavailable</div>
                  <div className="text-xs text-amber-600">Load and generation data shown below</div>
                </div>
              )}
              
              {aesoLoad && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Demand</span>
                    <span className="font-bold text-sm sm:text-base">{(aesoLoad.current_demand_mw / 1000).toFixed(1)} GW</span>
                  </div>
                  <Progress value={(aesoLoad.current_demand_mw / aesoLoad.peak_forecast_mw) * 100} className="mt-2" />
                </div>
              )}

              {aesoGeneration && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Generation Mix</div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                    <div className="flex items-center gap-1 min-w-0">
                      <Fuel className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span className="truncate">Gas: {((aesoGeneration.natural_gas_mw / aesoGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Wind className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="truncate">Wind: {((aesoGeneration.wind_mw / aesoGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Activity className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="truncate">Hydro: {((aesoGeneration.hydro_mw / aesoGeneration.total_generation_mw) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    Renewable: {aesoGeneration.renewable_percentage.toFixed(1)}%
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ResponsiveContentGrid>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts and Analytics */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <LineChart className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">CPU Usage</span>
                        <span className="text-sm font-medium">73%</span>
                      </div>
                      <Progress value={73} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Memory Usage</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Storage Usage</span>
                        <span className="text-sm font-medium">62%</span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Energy Consumption
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-3xl font-bold text-gray-900 mb-2">2,847 kWh</div>
                      <div className="text-sm text-gray-600">This month</div>
                      <div className="flex justify-center items-center gap-1 mt-2">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">-8.2% from last month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Advanced analytics charts will be displayed here</p>
                      <Button className="mt-4" variant="outline">
                        View Detailed Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Generate and view detailed reports</p>
                      <Button className="mt-4" variant="outline">
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Alerts and Quick Actions */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{alert.title}</div>
                        <div className="text-xs mt-1 opacity-90">{alert.message}</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Zap className="w-4 h-4 mr-2" />
                  Energy Settings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monitoring</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Warning
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResponsiveSection>
    </ResponsivePageContainer>
  );
};
