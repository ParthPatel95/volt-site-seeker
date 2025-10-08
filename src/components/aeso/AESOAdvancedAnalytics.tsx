import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cable, 
  TrendingUp, 
  Factory, 
  AlertTriangle,
  Battery,
  MapPin,
  Shield,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TransmissionConstraintChart } from './TransmissionConstraintChart';
import { ForecastAccuracyChart } from './ForecastAccuracyChart';
import { StoragePerformanceChart } from './StoragePerformanceChart';
import { MarketSharePieChart } from './MarketSharePieChart';

interface TransmissionConstraint {
  constraint_name: string;
  limit_mw: number;
  flow_mw: number;
  utilization_percent: number;
  status: 'normal' | 'warning' | 'critical';
  region: string;
}

interface ForecastData {
  date: string;
  demand_forecast_mw: number;
  wind_forecast_mw: number;
  solar_forecast_mw: number;
  price_forecast: number;
  confidence_level: number;
}

interface MarketParticipant {
  participant_name: string;
  total_capacity_mw: number;
  available_capacity_mw: number;
  generation_type: string;
  market_share_percent: number;
}

interface OutageEvent {
  asset_name: string;
  outage_type: 'planned' | 'forced';
  capacity_mw: number;
  start_time: string;
  end_time: string;
  status: string;
  impact_level: 'low' | 'medium' | 'high';
}

interface StorageMetrics {
  facility_name: string;
  capacity_mw: number;
  state_of_charge_percent: number;
  charging_mw: number;
  discharging_mw: number;
  cycles_today: number;
}

interface GridStabilityMetrics {
  timestamp: string;
  frequency_hz: number;
  spinning_reserve_mw: number;
  supplemental_reserve_mw: number;
  system_inertia: number;
  stability_score: number;
}


export function AESOAdvancedAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // State for all analytics data
  const [transmissionConstraints, setTransmissionConstraints] = useState<TransmissionConstraint[]>([]);
  const [sevenDayForecast, setSevenDayForecast] = useState<ForecastData[]>([]);
  const [marketParticipants, setMarketParticipants] = useState<MarketParticipant[]>([]);
  const [outageEvents, setOutageEvents] = useState<OutageEvent[]>([]);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics[]>([]);
  const [gridStability, setGridStability] = useState<GridStabilityMetrics | null>(null);

  useEffect(() => {
    fetchAdvancedAnalytics();
    
    // Auto-refresh every 5 minutes if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAdvancedAnalytics();
      }, 5 * 60 * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching AESO advanced analytics...');
      const { data, error } = await supabase.functions.invoke('aeso-advanced-analytics', {
        body: { action: 'fetch_all' }
      });

      console.log('📦 Raw response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Advanced analytics data received:', {
          transmissionConstraints: data.transmission_constraints?.length || 0,
          forecast: data.seven_day_forecast?.length || 0,
          participants: data.market_participants?.length || 0,
          outages: data.outage_events?.length || 0,
          storage: data.storage_metrics?.length || 0,
          gridStability: data.grid_stability ? 'Yes' : 'No'
        });
        
        setTransmissionConstraints(data.transmission_constraints || []);
        setSevenDayForecast(data.seven_day_forecast || []);
        setMarketParticipants(data.market_participants || []);
        setOutageEvents(data.outage_events || []);
        setStorageMetrics(data.storage_metrics || []);
        setGridStability(data.grid_stability || null);
        setLastUpdated(new Date());
        
        toast({
          title: 'Data Loaded',
          description: 'Advanced analytics updated successfully'
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching advanced analytics:', error);
      toast({
        title: 'Error Loading Data',
        description: error.message || 'Failed to fetch advanced analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    toast({
      title: 'Refreshing Data',
      description: 'Fetching latest analytics...'
    });
    fetchAdvancedAnalytics();
  };

  const exportToJSON = () => {
    console.log('📥 Exporting data to JSON...');
    const exportData = {
      timestamp: new Date().toISOString(),
      transmission_constraints: transmissionConstraints,
      seven_day_forecast: sevenDayForecast,
      market_participants: marketParticipants,
      outage_events: outageEvents,
      storage_metrics: storageMetrics,
      grid_stability: gridStability
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aeso-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ JSON export completed');
    toast({
      title: 'Export Successful',
      description: 'Data exported to JSON file'
    });
  };

  const exportToCSV = () => {
    console.log('📥 Exporting forecast data to CSV...');
    // Export forecast data as CSV (most useful for analysis)
    const headers = ['Date', 'Demand (MW)', 'Wind (MW)', 'Solar (MW)', 'Price ($/MWh)', 'Confidence (%)'];
    const rows = sevenDayForecast.map(f => [
      new Date(f.date).toLocaleDateString(),
      f.demand_forecast_mw.toFixed(0),
      f.wind_forecast_mw.toFixed(0),
      f.solar_forecast_mw.toFixed(0),
      f.price_forecast.toFixed(2),
      f.confidence_level.toFixed(1)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aeso-forecast-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV export completed');
    toast({
      title: 'Export Successful',
      description: 'Forecast data exported to CSV file'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      default: return 'secondary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Advanced Analytics</h2>
                {lastUpdated && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToJSON}
              >
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transmission" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="transmission" className="text-xs sm:text-sm">
            <Cable className="w-4 h-4 mr-1" />
            Transmission
          </TabsTrigger>
          <TabsTrigger value="forecast" className="text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            7-Day Forecast
          </TabsTrigger>
          <TabsTrigger value="participants" className="text-xs sm:text-sm">
            <Factory className="w-4 h-4 mr-1" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="outages" className="text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Outages
          </TabsTrigger>
          <TabsTrigger value="storage" className="text-xs sm:text-sm">
            <Battery className="w-4 h-4 mr-1" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="stability" className="text-xs sm:text-sm">
            <Shield className="w-4 h-4 mr-1" />
            Grid Stability
          </TabsTrigger>
        </TabsList>

        {/* Transmission Constraints Tab */}
        <TabsContent value="transmission" className="space-y-4">
          <TransmissionConstraintChart constraints={transmissionConstraints} />
          
          {/* Severity Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {transmissionConstraints.filter(c => c.status === 'critical').length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Critical Constraints</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {transmissionConstraints.filter(c => c.status === 'warning').length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Warning Level</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {transmissionConstraints.filter(c => c.status === 'normal').length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Normal Operations</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cable className="w-5 h-5 mr-2 text-orange-600" />
                Transmission Constraints & Grid Congestion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transmissionConstraints.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active transmission constraints</p>
              ) : (
                <div className="space-y-4">
                  {transmissionConstraints.map((constraint, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{constraint.constraint_name}</h3>
                          <p className="text-sm text-muted-foreground">{constraint.region}</p>
                        </div>
                        <Badge variant={getStatusColor(constraint.status)}>
                          {constraint.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Flow</p>
                          <p className="font-semibold">{constraint.flow_mw.toFixed(0)} MW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Limit</p>
                          <p className="font-semibold">{constraint.limit_mw.toFixed(0)} MW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <p className="font-semibold">{constraint.utilization_percent.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            constraint.utilization_percent > 90 ? 'bg-destructive' :
                            constraint.utilization_percent > 75 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(constraint.utilization_percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7-Day Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <ForecastAccuracyChart forecast={sevenDayForecast} />
          
          {/* Forecast Insights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  <div className="text-2xl font-bold text-blue-600">
                    {sevenDayForecast.length > 0 
                      ? (sevenDayForecast.reduce((acc, f) => acc + f.confidence_level, 0) / sevenDayForecast.length).toFixed(1)
                      : '0'}%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Peak Demand</p>
                  <div className="text-2xl font-bold text-orange-600">
                    {sevenDayForecast.length > 0
                      ? Math.max(...sevenDayForecast.map(f => f.demand_forecast_mw / 1000)).toFixed(1)
                      : '0'} GW
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Avg Wind</p>
                  <div className="text-2xl font-bold text-green-600">
                    {sevenDayForecast.length > 0
                      ? (sevenDayForecast.reduce((acc, f) => acc + f.wind_forecast_mw, 0) / sevenDayForecast.length / 1000).toFixed(1)
                      : '0'} GW
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Price Range</p>
                  <div className="text-2xl font-bold text-purple-600">
                    {sevenDayForecast.length > 0
                      ? `$${Math.min(...sevenDayForecast.map(f => f.price_forecast)).toFixed(0)}-${Math.max(...sevenDayForecast.map(f => f.price_forecast)).toFixed(0)}`
                      : '$0'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                7-Day Market Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sevenDayForecast.map((forecast, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                        <p className="text-xs text-muted-foreground">Confidence: {forecast.confidence_level}%</p>
                      </div>
                      <Badge variant="outline">CA${forecast.price_forecast.toFixed(2)}/MWh</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Demand</p>
                        <p className="font-semibold">{(forecast.demand_forecast_mw / 1000).toFixed(1)} GW</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Wind</p>
                        <p className="font-semibold">{(forecast.wind_forecast_mw / 1000).toFixed(1)} GW</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Solar</p>
                        <p className="font-semibold">{forecast.solar_forecast_mw.toFixed(0)} MW</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <MarketSharePieChart participants={marketParticipants} />
          
          {/* Market Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                  <div className="text-2xl font-bold text-blue-600">
                    {marketParticipants.reduce((acc, p) => acc + p.total_capacity_mw, 0).toFixed(0)} MW
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Available Now</p>
                  <div className="text-2xl font-bold text-green-600">
                    {marketParticipants.reduce((acc, p) => acc + p.available_capacity_mw, 0).toFixed(0)} MW
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Utilization</p>
                  <div className="text-2xl font-bold text-orange-600">
                    {marketParticipants.reduce((acc, p) => acc + p.total_capacity_mw, 0) > 0
                      ? ((marketParticipants.reduce((acc, p) => acc + p.available_capacity_mw, 0) / 
                         marketParticipants.reduce((acc, p) => acc + p.total_capacity_mw, 0)) * 100).toFixed(1)
                      : '0'}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Factory className="w-5 h-5 mr-2 text-purple-600" />
                Market Participants & Generation Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketParticipants.map((participant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{participant.participant_name}</h3>
                        <p className="text-sm text-muted-foreground">{participant.generation_type}</p>
                      </div>
                      <Badge variant="secondary">{participant.market_share_percent.toFixed(1)}% Market Share</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-muted-foreground">Total Capacity</p>
                        <p className="font-semibold">{participant.total_capacity_mw.toFixed(0)} MW</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Available Now</p>
                        <p className="font-semibold">{participant.available_capacity_mw.toFixed(0)} MW</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outages Tab */}
        <TabsContent value="outages" className="space-y-4">
          {/* Outage Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <p className="text-sm text-muted-foreground">Total Outages</p>
                  <div className="text-2xl font-bold">{outageEvents.length}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Forced Outages</p>
                  <div className="text-2xl font-bold text-red-600">
                    {outageEvents.filter(o => o.outage_type === 'forced').length}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Impact</p>
                  <div className="text-2xl font-bold text-orange-600">
                    {outageEvents.reduce((acc, o) => acc + o.capacity_mw, 0).toFixed(0)} MW
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">High Impact</p>
                  <div className="text-2xl font-bold text-yellow-600">
                    {outageEvents.filter(o => o.impact_level === 'high').length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Generation & Transmission Outages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outageEvents.map((outage, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{outage.asset_name}</h3>
                        <p className="text-sm text-muted-foreground">{outage.capacity_mw.toFixed(0)} MW</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getImpactColor(outage.impact_level)}>
                          {outage.impact_level.toUpperCase()} IMPACT
                        </Badge>
                        <Badge variant={outage.outage_type === 'forced' ? 'destructive' : 'secondary'}>
                          {outage.outage_type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start</p>
                        <p className="font-semibold">{new Date(outage.start_time).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End</p>
                        <p className="font-semibold">{new Date(outage.end_time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-4">
          <StoragePerformanceChart storage={storageMetrics} />
          
          {/* Storage Efficiency Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                  <div className="text-2xl font-bold text-blue-600">
                    {storageMetrics.reduce((acc, s) => acc + s.capacity_mw, 0).toFixed(0)} MW
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Avg State of Charge</p>
                  <div className="text-2xl font-bold text-green-600">
                    {storageMetrics.length > 0
                      ? (storageMetrics.reduce((acc, s) => acc + s.state_of_charge_percent, 0) / storageMetrics.length).toFixed(1)
                      : '0'}%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Net Flow</p>
                  <div className="text-2xl font-bold text-purple-600">
                    {(storageMetrics.reduce((acc, s) => acc + s.charging_mw - s.discharging_mw, 0)).toFixed(1)} MW
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Cycles Today</p>
                  <div className="text-2xl font-bold text-orange-600">
                    {storageMetrics.reduce((acc, s) => acc + s.cycles_today, 0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Battery className="w-5 h-5 mr-2 text-green-600" />
                Energy Storage & Grid Flexibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storageMetrics.map((storage, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{storage.facility_name}</h3>
                      <Badge variant="outline">{storage.capacity_mw.toFixed(0)} MW</Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">State of Charge</span>
                          <span className="font-semibold">{storage.state_of_charge_percent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${storage.state_of_charge_percent}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Charging</p>
                          <p className="font-semibold text-green-600">+{storage.charging_mw.toFixed(0)} MW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Discharging</p>
                          <p className="font-semibold text-orange-600">-{storage.discharging_mw.toFixed(0)} MW</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cycles Today</p>
                          <p className="font-semibold">{storage.cycles_today}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grid Stability Tab */}
        <TabsContent value="stability" className="space-y-4">
          {/* Grid Reliability Score */}
          {gridStability && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2">Grid Reliability Score</h3>
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {gridStability.stability_score.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gridStability.stability_score >= 85 ? 'Excellent' : 
                     gridStability.stability_score >= 70 ? 'Good' : 
                     gridStability.stability_score >= 60 ? 'Fair' : 'Poor'} Grid Health
                  </p>
                  <div className="mt-4 w-full bg-secondary rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                      style={{ width: `${gridStability.stability_score}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Real-time Grid Stability Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gridStability ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                          <p className="text-sm text-muted-foreground">Frequency</p>
                          <p className="text-2xl font-bold">{gridStability.frequency_hz.toFixed(3)} Hz</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-muted-foreground">Spinning Reserve</p>
                          <p className="text-2xl font-bold">{gridStability.spinning_reserve_mw.toFixed(0)} MW</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                          <p className="text-sm text-muted-foreground">System Inertia</p>
                          <p className="text-2xl font-bold">{gridStability.system_inertia.toFixed(1)} GW·s</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Grid Stability Score</span>
                          <span className="text-lg font-bold">{gridStability.stability_score.toFixed(1)}/100</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              gridStability.stability_score > 80 ? 'bg-green-500' :
                              gridStability.stability_score > 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${gridStability.stability_score}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="text-sm text-muted-foreground">
                    <p>Supplemental Reserve: {gridStability.supplemental_reserve_mw.toFixed(0)} MW</p>
                    <p>Last Updated: {new Date(gridStability.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No grid stability data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
