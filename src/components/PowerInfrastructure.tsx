import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  MapPin, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CityPowerAnalysis } from './power/CityPowerAnalysis';

interface PowerData {
  totalProperties: number;
  totalPowerCapacity: number;
  averageCapacity: number;
  highCapacityCount: number;
}

interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  power_capacity_mw: number;
  substation_distance_miles: number;
  status: string;
}

export function PowerInfrastructure() {
  const [powerData, setPowerData] = useState<PowerData>({
    totalProperties: 0,
    totalPowerCapacity: 0,
    averageCapacity: 0,
    highCapacityCount: 0
  });
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPowerData();
  }, []);

  const loadPowerData = async () => {
    try {
      console.log('Loading power infrastructure data...');
      
      // Load properties with power capacity data
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, address, city, state, power_capacity_mw, substation_distance_miles, status')
        .not('power_capacity_mw', 'is', null)
        .order('power_capacity_mw', { ascending: false });

      if (propertiesError) {
        console.error('Error loading properties:', propertiesError);
        toast({
          title: "Error Loading Data",
          description: propertiesError.message,
          variant: "destructive"
        });
        return;
      }

      const properties = propertiesData || [];
      setProperties(properties);

      // Calculate power statistics
      const totalPowerCapacity = properties.reduce((sum, prop) => 
        sum + (Number(prop.power_capacity_mw) || 0), 0
      );
      
      const averageCapacity = properties.length > 0 
        ? totalPowerCapacity / properties.length 
        : 0;
      
      const highCapacityCount = properties.filter(prop => 
        Number(prop.power_capacity_mw) >= 20
      ).length;

      setPowerData({
        totalProperties: properties.length,
        totalPowerCapacity,
        averageCapacity,
        highCapacityCount
      });

      console.log('Power data loaded:', {
        totalProperties: properties.length,
        totalPowerCapacity,
        averageCapacity,
        highCapacityCount
      });

    } catch (error) {
      console.error('Error loading power data:', error);
      toast({
        title: "Error",
        description: "Failed to load power infrastructure data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'available':
        return 'default';
      case 'under_review':
      case 'analyzing':
        return 'secondary';
      case 'acquired':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading power infrastructure data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Power Infrastructure</h1>
            <p className="text-muted-foreground">Grid connectivity and transmission analysis</p>
          </div>
        </div>
      </div>

      <div className="p-6 h-full overflow-y-auto">
        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="city-analysis">City Analysis</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="interconnection">Interconnection Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total Properties</p>
                      <p className="text-2xl font-bold">{powerData.totalProperties}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Total Capacity</p>
                      <p className="text-2xl font-bold">{powerData.totalPowerCapacity.toFixed(1)} MW</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Avg Capacity</p>
                      <p className="text-2xl font-bold">{powerData.averageCapacity.toFixed(1)} MW</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">High Capacity (20+ MW)</p>
                      <p className="text-2xl font-bold">{powerData.highCapacityCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Power Capacity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {properties.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No Power Data Available</h3>
                      <p className="text-muted-foreground">No properties with power capacity data found in the system.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {properties.slice(0, 10).map((property) => (
                        <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{property.address}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {property.city}, {property.state}
                            </div>
                            {property.substation_distance_miles && (
                              <div className="text-sm text-muted-foreground">
                                {property.substation_distance_miles} mi to substation
                              </div>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-lg font-bold text-yellow-600">
                              {Number(property.power_capacity_mw).toFixed(1)} MW
                            </div>
                            <Badge variant={getStatusColor(property.status)}>
                              {property.status?.replace('_', ' ') || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {properties.length > 10 && (
                        <div className="text-center py-4 text-muted-foreground">
                          +{properties.length - 10} more properties
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="city-analysis" className="mt-6">
            <CityPowerAnalysis />
          </TabsContent>

          <TabsContent value="properties" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">All Properties with Power Data</h3>
              {properties.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-muted-foreground mb-2">No Properties Found</h3>
                    <p className="text-muted-foreground">No properties with power capacity data available.</p>
                  </CardContent>
                </Card>
              ) : (
                properties.map((property) => (
                  <Card key={property.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{property.address}</h4>
                            <Badge variant={getStatusColor(property.status)}>
                              {property.status?.replace('_', ' ') || 'Unknown'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>Location: {property.city}, {property.state}</div>
                            <div>Capacity: {Number(property.power_capacity_mw).toFixed(1)} MW</div>
                            {property.substation_distance_miles && (
                              <div>Distance: {property.substation_distance_miles} mi to substation</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-yellow-600">
                            {Number(property.power_capacity_mw).toFixed(1)} MW
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="interconnection" className="mt-6 space-y-6">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">Interconnection Queue Monitor</h3>
              <p className="text-muted-foreground mt-2">ERCOT, PJM, MISO queue integration coming in Phase 3</p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-muted-foreground">• Real-time queue position tracking</p>
                <p className="text-sm text-muted-foreground">• Delay prediction algorithms</p>
                <p className="text-sm text-muted-foreground">• Interconnection cost estimation</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
