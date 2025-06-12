
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  MapPin, 
  Zap, 
  Search, 
  Filter,
  Layers,
  Satellite,
  Building,
  AlertTriangle,
  TrendingDown,
  Target,
  Settings
} from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';

interface MapLayer {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  icon: any;
}

interface PropertyCluster {
  id: string;
  lat: number;
  lng: number;
  properties: any[];
  avgVoltScore: number;
  totalPowerCapacity: number;
  distressCount: number;
}

export function EnhancedPropertyMap() {
  const { properties, loading } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'properties', name: 'Properties', enabled: true, color: '#3b82f6', icon: Building },
    { id: 'substations', name: 'Substations', enabled: true, color: '#eab308', icon: Zap },
    { id: 'distress', name: 'Distressed Companies', enabled: true, color: '#ef4444', icon: AlertTriangle },
    { id: 'opportunities', name: 'Opportunities', enabled: false, color: '#10b981', icon: Target },
  ]);
  const [voltScoreRange, setVoltScoreRange] = useState([0, 100]);
  const [powerCapacityRange, setPowerCapacityRange] = useState([0, 100]);
  const [showClusters, setShowClusters] = useState(true);
  const [mapStyle, setMapStyle] = useState('satellite');

  // Simulate property clustering
  const propertyClusters: PropertyCluster[] = [
    {
      id: '1',
      lat: 32.7767,
      lng: -96.7970,
      properties: properties.slice(0, 3),
      avgVoltScore: 85,
      totalPowerCapacity: 75,
      distressCount: 1
    },
    {
      id: '2', 
      lat: 30.2672,
      lng: -97.7431,
      properties: properties.slice(3, 6),
      avgVoltScore: 72,
      totalPowerCapacity: 50,
      distressCount: 0
    }
  ];

  const toggleLayer = (layerId: string) => {
    setMapLayers(layers => 
      layers.map(layer => 
        layer.id === layerId 
          ? { ...layer, enabled: !layer.enabled }
          : layer
      )
    );
  };

  const filteredProperties = properties.filter(property => {
    const voltScore = property.volt_scores?.[0]?.overall_score || 0;
    const powerCapacity = property.power_capacity_mw || 0;
    
    const matchesSearch = property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVoltScore = voltScore >= voltScoreRange[0] && voltScore <= voltScoreRange[1];
    const matchesPowerCapacity = powerCapacity >= powerCapacityRange[0] && powerCapacity <= powerCapacityRange[1];
    
    return matchesSearch && matchesVoltScore && matchesPowerCapacity;
  });

  return (
    <div className="h-screen flex">
      {/* Enhanced Map Container */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-100 to-blue-100">
        {/* Map Placeholder with Advanced Features */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-blue-200 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Satellite className="w-8 h-8 text-blue-600" />
              <MapPin className="w-12 h-12 text-blue-600" />
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-700">Enhanced Intelligence Map</h3>
              <p className="text-slate-600">Multi-layer property discovery & corporate intelligence</p>
              <div className="text-sm text-slate-500 mt-2 space-y-1">
                <p>• Real-time property overlays with VoltScore visualization</p>
                <p>• Substation & transmission line mapping</p>
                <p>• Distressed company asset tracking</p>
                <p>• Power infrastructure heat maps</p>
                <p>• Corporate intelligence integration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Search & Filters */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search properties, companies, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <Select value={mapStyle} onValueChange={setMapStyle}>
              <SelectTrigger className="w-32 bg-white/90 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="streets">Streets</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="bg-white/90 backdrop-blur-sm">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="absolute top-20 left-4 z-10">
          <Card className="bg-white/90 backdrop-blur-sm w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Map Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mapLayers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: layer.color }}
                    />
                    <layer.icon className="w-3 h-3" />
                    <span className="text-xs">{layer.name}</span>
                  </div>
                  <Switch
                    checked={layer.enabled}
                    onCheckedChange={() => toggleLayer(layer.id)}
                    size="sm"
                  />
                </div>
              ))}
              
              <div className="border-t pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium">VoltScore Range</label>
                  <Slider
                    value={voltScoreRange}
                    onValueChange={setVoltScoreRange}
                    max={100}
                    step={1}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{voltScoreRange[0]}</span>
                    <span>{voltScoreRange[1]}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium">Power Capacity (MW)</label>
                  <Slider
                    value={powerCapacityRange}
                    onValueChange={setPowerCapacityRange}
                    max={100}
                    step={1}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{powerCapacityRange[0]}</span>
                    <span>{powerCapacityRange[1]}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs">Show Clusters</span>
                  <Switch
                    checked={showClusters}
                    onCheckedChange={setShowClusters}
                    size="sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intelligence Insights Panel */}
        <div className="absolute bottom-4 left-4 z-10">
          <Card className="bg-white/90 backdrop-blur-sm w-80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Market Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-100 p-2 rounded">
                  <div className="font-medium text-green-800">High Opportunity</div>
                  <div className="text-green-600">{filteredProperties.filter(p => p.volt_scores?.[0]?.overall_score > 80).length} properties</div>
                </div>
                <div className="bg-red-100 p-2 rounded">
                  <div className="font-medium text-red-800">Distressed Assets</div>
                  <div className="text-red-600">3 companies</div>
                </div>
                <div className="bg-blue-100 p-2 rounded">
                  <div className="font-medium text-blue-800">New Listings</div>
                  <div className="text-blue-600">12 this week</div>
                </div>
                <div className="bg-yellow-100 p-2 rounded">
                  <div className="font-medium text-yellow-800">Power Available</div>
                  <div className="text-yellow-600">450+ MW</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Sidebar */}
      <div className="w-96 bg-background border-l overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Property Intelligence</h2>
          <p className="text-sm text-muted-foreground">
            {filteredProperties.length} of {properties.length} properties shown
          </p>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">
                {filteredProperties.filter(p => p.volt_scores?.[0]?.overall_score > 80).length}
              </div>
              <div className="text-xs text-green-600">High VoltScore</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">
                {filteredProperties.reduce((sum, p) => sum + (p.power_capacity_mw || 0), 0)}MW
              </div>
              <div className="text-xs text-blue-600">Total Power</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {showClusters && propertyClusters.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Property Clusters</h3>
              {propertyClusters.map((cluster) => (
                <Card key={cluster.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Cluster {cluster.id}</span>
                        <Badge variant={cluster.avgVoltScore > 80 ? "default" : "secondary"}>
                          Avg: {cluster.avgVoltScore}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center">
                          <Building className="w-3 h-3 mr-1" />
                          {cluster.properties.length} props
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {cluster.totalPowerCapacity}MW
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {cluster.distressCount} alerts
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredProperties.map((property) => (
            <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm">{property.address}</h3>
                    <div className="flex space-x-1">
                      {property.volt_scores?.[0] && (
                        <Badge variant={property.volt_scores[0].overall_score > 80 ? "default" : "secondary"}>
                          {property.volt_scores[0].overall_score}
                        </Badge>
                      )}
                      {property.power_capacity_mw && property.power_capacity_mw > 20 && (
                        <Badge variant="outline" className="text-xs">
                          High Power
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {property.city}, {property.state}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {property.power_capacity_mw || 'N/A'} MW
                    </div>
                    <div className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {property.property_type.replace('_', ' ')}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-4 border-t">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700">
            <Target className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}
