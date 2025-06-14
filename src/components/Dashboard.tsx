
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Building, 
  TrendingUp, 
  MapPin, 
  AlertTriangle,
  DollarSign,
  Clock,
  Target,
  Activity,
  Bell,
  CheckCircle
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEnergyRates } from '@/hooks/useEnergyRates';
import { AlertsSystem } from './AlertsSystem';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  property_type: string;
  asking_price: number;
  square_footage: number;
  power_capacity_mw: number;
  status: string;
  created_at: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  is_read: boolean;
  created_at: string;
}

export function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [substations, setSubstations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const { toast } = useToast();
  const { getCurrentRates } = useEnergyRates();

  const loadDashboardData = async () => {
    try {
      // Load properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Load alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

      // Load substations
      const { data: substationsData, error: substationsError } = await supabase
        .from('substations')
        .select('*')
        .order('capacity_mva', { ascending: false })
        .limit(5);

      if (substationsError) throw substationsError;
      setSubstations(substationsData || []);

      // Load current energy rates
      const ratesData = await getCurrentRates('ERCOT');
      if (ratesData?.current_rates?.length > 0) {
        setCurrentPrice(ratesData.current_rates[0].price_per_mwh);
        setAveragePrice(ratesData.average_24h || 0);
      }

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalInvestmentValue = properties.reduce((sum, prop) => sum + (prop.asking_price || 0), 0);
  const totalPowerCapacity = properties.reduce((sum, prop) => sum + (prop.power_capacity_mw || 0), 0);
  const unreadAlerts = alerts.filter(alert => !alert.is_read).length;

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="flex items-center justify-center h-64">
          <Zap className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">VoltScout Dashboard</h1>
          <p className="text-muted-foreground">Heavy power site discovery and analysis</p>
        </div>
        <Button 
          onClick={loadDashboardData}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
        >
          <Target className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-blue-200">Active portfolio</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Power Capacity</CardTitle>
            <Zap className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalPowerCapacity)} MW</div>
            <p className="text-xs text-green-200">Total identified</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Investment Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalInvestmentValue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-purple-200">Portfolio value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadAlerts}</div>
            <p className="text-xs text-orange-200">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Energy Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-yellow-600" />
            Energy Market Overview
          </CardTitle>
          <CardDescription>Current ERCOT market conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold">${currentPrice.toFixed(2)}/MWh</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">24h Average</p>
              <p className="text-2xl font-bold">${averagePrice.toFixed(2)}/MWh</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Market Status</p>
              <Badge variant="default">Normal Operations</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Recent Properties
            </CardTitle>
            <CardDescription>
              Latest properties added to the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {properties.length > 0 ? (
              properties.slice(0, 5).map((property) => (
                <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium">{property.address}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {property.city}, {property.state}
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {property.power_capacity_mw ? `${property.power_capacity_mw} MW` : 'Power TBD'}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={property.status === 'active' ? "default" : "secondary"}>
                      {property.status}
                    </Badge>
                    {property.asking_price && (
                      <div className="text-sm font-medium">
                        ${(property.asking_price / 1000000).toFixed(1)}M
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No properties found. Start by using the Property Scraper.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-red-600" />
              Recent Alerts
            </CardTitle>
            <CardDescription>
              System notifications and monitoring alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length > 0 ? (
              alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.is_read ? 'bg-gray-400' : 'bg-red-500'
                  }`}></div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!alert.is_read && (
                    <Badge variant="destructive" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No alerts at this time. All systems operational.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Substations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-purple-600" />
            Major Substations
          </CardTitle>
          <CardDescription>
            Highest capacity transmission infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {substations.map((substation) => (
              <div key={substation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{substation.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {substation.city}, {substation.state}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{substation.capacity_mva.toLocaleString()} MVA</div>
                  <div className="text-sm text-muted-foreground">{substation.voltage_level}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
