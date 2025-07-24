import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CloudIcon, 
  Zap, 
  Globe, 
  Activity,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Link,
  Database,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface APIIntegration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync: string;
  dataPoints: number;
  isEnabled: boolean;
  config: any;
  requiresAuth: boolean;
  icon: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  timestamp: string;
}

interface RegulatoryUpdate {
  id: string;
  title: string;
  agency: string;
  effectiveDate: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export function ExternalAPIIntegrations() {
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<APIIntegration | null>(null);
  const [configForm, setConfigForm] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
    loadWeatherData();
    loadRegulatoryUpdates();
  }, []);

  const loadIntegrations = () => {
    const mockIntegrations: APIIntegration[] = [
      {
        id: 'weather',
        name: 'Weather API',
        description: 'Real-time weather data affecting energy consumption',
        category: 'Environmental',
        status: 'connected',
        lastSync: new Date().toISOString(),
        dataPoints: 24567,
        isEnabled: true,
        config: { apiKey: '****-****-****', refreshInterval: 15 },
        requiresAuth: true,
        icon: 'cloud'
      },
      {
        id: 'regulatory',
        name: 'Regulatory Filings API',
        description: 'FERC and state regulatory updates',
        category: 'Regulatory',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        dataPoints: 892,
        isEnabled: true,
        config: { sources: ['FERC', 'PUCT', 'CPUC'], alertThreshold: 'medium' },
        requiresAuth: false,
        icon: 'database'
      },
      {
        id: 'news',
        name: 'Energy News Feed',
        description: 'Aggregated energy industry news and alerts',
        category: 'News',
        status: 'connected',
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        dataPoints: 1456,
        isEnabled: true,
        config: { keywords: ['energy', 'power', 'electricity'], sentiment: true },
        requiresAuth: true,
        icon: 'activity'
      },
      {
        id: 'commodity',
        name: 'Commodity Prices API',
        description: 'Real-time commodity and futures pricing',
        category: 'Financial',
        status: 'error',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dataPoints: 5678,
        isEnabled: false,
        config: { symbols: ['CL', 'NG', 'HO'], exchange: 'NYMEX' },
        requiresAuth: true,
        icon: 'trending-up'
      },
      {
        id: 'grid',
        name: 'Grid Operators API',
        description: 'Direct feeds from ERCOT, PJM, CAISO',
        category: 'Grid Data',
        status: 'configuring',
        lastSync: '',
        dataPoints: 0,
        isEnabled: false,
        config: { operators: ['ERCOT', 'PJM'], realtime: true },
        requiresAuth: true,
        icon: 'zap'
      },
      {
        id: 'satellite',
        name: 'Satellite Imagery API',
        description: 'Infrastructure monitoring via satellite data',
        category: 'Geospatial',
        status: 'disconnected',
        lastSync: '',
        dataPoints: 0,
        isEnabled: false,
        config: { resolution: 'high', frequency: 'daily' },
        requiresAuth: true,
        icon: 'globe'
      }
    ];
    setIntegrations(mockIntegrations);
  };

  const loadWeatherData = () => {
    const locations = ['Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX'];
    const mockWeather: WeatherData[] = locations.map(location => ({
      location,
      temperature: Math.floor(Math.random() * 40) + 60,
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain'][Math.floor(Math.random() * 4)],
      timestamp: new Date().toISOString()
    }));
    setWeatherData(mockWeather);
  };

  const loadRegulatoryUpdates = () => {
    const mockUpdates: RegulatoryUpdate[] = [
      {
        id: '1',
        title: 'New Interconnection Standards for Battery Storage',
        agency: 'FERC',
        effectiveDate: '2024-03-01',
        impact: 'high',
        description: 'Updated technical requirements for grid-scale battery storage interconnection procedures'
      },
      {
        id: '2',
        title: 'Renewable Energy Certificate Trading Rules',
        agency: 'PUCT',
        effectiveDate: '2024-02-15',
        impact: 'medium',
        description: 'Modified requirements for REC trading in competitive electricity markets'
      },
      {
        id: '3',
        title: 'Transmission Planning Process Updates',
        agency: 'ERCOT',
        effectiveDate: '2024-04-01',
        impact: 'medium',
        description: 'Enhanced stakeholder participation in transmission planning and cost allocation'
      }
    ];
    setRegulatoryUpdates(mockUpdates);
  };

  const toggleIntegration = async (integrationId: string, enabled: boolean) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, isEnabled: enabled, status: enabled ? 'connected' : 'disconnected' }
        : integration
    ));
    
    toast({
      title: enabled ? "Integration enabled" : "Integration disabled",
      description: `Integration has been ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  };

  const syncIntegration = async (integrationId: string) => {
    setLoading(true);
    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              lastSync: new Date().toISOString(),
              status: 'connected',
              dataPoints: integration.dataPoints + Math.floor(Math.random() * 100)
            }
          : integration
      ));
      
      toast({
        title: "Sync completed",
        description: "Integration data has been synchronized"
      });
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const configureIntegration = async (integrationId: string, config: any) => {
    setLoading(true);
    try {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, config, status: 'connected' }
          : integration
      ));
      
      toast({
        title: "Configuration saved",
        description: "Integration settings have been updated"
      });
      
      setSelectedIntegration(null);
    } catch (error: any) {
      toast({
        title: "Configuration failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: APIIntegration['status']) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'secondary';
      case 'error': return 'destructive';
      case 'configuring': return 'warning';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: APIIntegration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'disconnected': return <XCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'configuring': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getIntegrationIcon = (iconName: string) => {
    switch (iconName) {
      case 'cloud': return <CloudIcon className="w-5 h-5" />;
      case 'zap': return <Zap className="w-5 h-5" />;
      case 'globe': return <Globe className="w-5 h-5" />;
      case 'activity': return <Activity className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'trending-up': return <TrendingUp className="w-5 h-5" />;
      default: return <Link className="w-5 h-5" />;
    }
  };

  const getImpactColor = (impact: RegulatoryUpdate['impact']) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">External API Integrations</h1>
          <p className="text-muted-foreground">Connect with external data sources and services</p>
        </div>
        <Button className="gap-2">
          <Link className="w-4 h-4" />
          Add Integration
        </Button>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="weather">Weather Data</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getIntegrationIcon(integration.icon)}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getStatusColor(integration.status)} className="gap-1">
                        {getStatusIcon(integration.status)}
                        {integration.status}
                      </Badge>
                      <Switch
                        checked={integration.isEnabled}
                        onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{integration.category}</Badge>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data Points:</span>
                    <span className="font-medium">{integration.dataPoints.toLocaleString()}</span>
                  </div>
                  
                  {integration.lastSync && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span>{new Date(integration.lastSync).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncIntegration(integration.id)}
                      disabled={!integration.isEnabled || loading}
                      className="flex-1 gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setConfigForm(integration.config);
                      }}
                      className="flex-1 gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedIntegration && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configure {selectedIntegration.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedIntegration.requiresAuth && (
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter API key..."
                      value={configForm.apiKey || ''}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>
                )}
                
                {selectedIntegration.id === 'weather' && (
                  <div>
                    <Label htmlFor="refresh-interval">Refresh Interval (minutes)</Label>
                    <Input
                      id="refresh-interval"
                      type="number"
                      value={configForm.refreshInterval || 15}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                    />
                  </div>
                )}
                
                {selectedIntegration.id === 'regulatory' && (
                  <div>
                    <Label>Alert Threshold</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={configForm.alertThreshold || 'medium'}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, alertThreshold: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => configureIntegration(selectedIntegration.id, configForm)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : 'Save Configuration'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedIntegration(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <h2 className="text-xl font-semibold">Real-Time Weather Data</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {weatherData.map((weather, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CloudIcon className="w-5 h-5" />
                    {weather.location}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold">{weather.temperature}°F</div>
                  <div className="text-sm text-muted-foreground">{weather.conditions}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Humidity:</span>
                      <div>{weather.humidity}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Wind:</span>
                      <div>{weather.windSpeed} mph</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(weather.timestamp).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-4">
          <h2 className="text-xl font-semibold">Regulatory Updates</h2>
          
          <div className="space-y-4">
            {regulatoryUpdates.map((update) => (
              <Card key={update.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{update.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {update.agency} • Effective: {new Date(update.effectiveDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getImpactColor(update.impact)}>
                      {update.impact} impact
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{update.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Integration Analytics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Total Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{integrations.length}</div>
                <div className="text-sm text-muted-foreground">
                  {integrations.filter(i => i.isEnabled).length} active
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Total Data Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {integrations.reduce((sum, i) => sum + i.dataPoints, 0).toLocaleString()}
                </div>
                <div className="text-sm text-green-600">
                  +12% this week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <div className="text-sm text-muted-foreground">
                  Last 30 days
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Sync Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15m</div>
                <div className="text-sm text-muted-foreground">
                  Average interval
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integration Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getIntegrationIcon(integration.icon)}
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {integration.dataPoints.toLocaleString()} data points
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(integration.status)} className="gap-1">
                        {getStatusIcon(integration.status)}
                        {integration.status}
                      </Badge>
                      {integration.isEnabled && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}