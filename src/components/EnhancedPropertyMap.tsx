
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Map, 
  Layers, 
  Search,
  Filter,
  Settings,
  Eye,
  EyeOff,
  Zap,
  Building,
  MapPin,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  property_type: string;
  asking_price?: number;
  square_footage?: number;
  power_capacity_mw?: number;
  substation_distance_miles?: number;
  coordinates?: [number, number];
}

interface MapLayer {
  id: string;
  name: string;
  type: 'substations' | 'transmission' | 'properties' | 'zoning' | 'power_plants';
  visible: boolean;
  color: string;
}

export function EnhancedPropertyMap() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [powerRange, setPowerRange] = useState([0, 100]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'properties', name: 'Properties', type: 'properties', visible: true, color: '#3B82F6' },
    { id: 'substations', name: 'Substations', type: 'substations', visible: true, color: '#EF4444' },
    { id: 'transmission', name: 'Transmission Lines', type: 'transmission', visible: true, color: '#10B981' },
    { id: 'power_plants', name: 'Power Plants', type: 'power_plants', visible: false, color: '#F59E0B' },
    { id: 'zoning', name: 'Zoning', type: 'zoning', visible: false, color: '#8B5CF6' }
  ]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(100);
      
      if (error) throw error;
      
      const formattedProperties: Property[] = (data || []).map(property => ({
        id: property.id,
        address: property.address,
        city: property.city,
        state: property.state,
        property_type: property.property_type,
        asking_price: property.asking_price,
        square_footage: property.square_footage,
        power_capacity_mw: property.power_capacity_mw,
        substation_distance_miles: property.substation_distance_miles,
        coordinates: [
          parseFloat(property.city === 'Austin' ? '-97.7431' : property.city === 'Dallas' ? '-96.7970' : '-95.3698'),
          parseFloat(property.city === 'Austin' ? '30.2672' : property.city === 'Dallas' ? '32.7767' : '29.7604')
        ]
      }));
      
      setProperties(formattedProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLayer = (layerId: string) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = !property.asking_price || 
                        (property.asking_price >= priceRange[0] && property.asking_price <= priceRange[1]);
    const matchesPower = !property.power_capacity_mw || 
                        (property.power_capacity_mw >= powerRange[0] && property.power_capacity_mw <= powerRange[1]);
    
    return matchesSearch && matchesPrice && matchesPower;
  });

  return (
    <div className="h-screen flex">
      {/* Map Container */}
      <div className="flex-1 relative bg-gray-100">
        {/* Map Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Map className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Interactive Map View</h3>
            <p className="text-sm">Property locations, substations, and power infrastructure</p>
            <p className="text-xs mt-2 text-gray-400">
              Map integration with Mapbox/Google Maps would be implemented here
            </p>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <Card className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </Card>

          {/* Layer Controls */}
          <Card className="p-3">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Layers className="w-4 h-4 mr-1" />
              Map Layers
            </h4>
            <div className="space-y-2">
              {mapLayers.map((layer) => (
                <div key={layer.id} className="flex items-center space-x-2">
                  <Switch
                    checked={layer.visible}
                    onCheckedChange={() => toggleLayer(layer.id)}
                  />
                  <div className="flex items-center space-x-1">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="text-xs">{layer.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Property Info Popup */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 w-80">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedProperty.address}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedProperty.city}, {selectedProperty.state}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProperty(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">
                      ${selectedProperty.asking_price ? (selectedProperty.asking_price / 1000000).toFixed(1) : 'N/A'}M
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{selectedProperty.square_footage?.toLocaleString() || 'N/A'} sq ft</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Power</p>
                    <p className="font-medium">{selectedProperty.power_capacity_mw || 'N/A'} MW</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Substation</p>
                    <p className="font-medium">{selectedProperty.substation_distance_miles || 'N/A'} mi</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Sidebar */}
      {showFilters && (
        <div className="w-80 border-l bg-background overflow-y-auto">
          <Card className="rounded-none border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Filters & Search</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-medium">Search Properties</label>
                <Input
                  placeholder="Address, city, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium">
                  Price Range: ${(priceRange[0] / 1000000).toFixed(1)}M - ${(priceRange[1] / 1000000).toFixed(1)}M
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={50000000}
                  min={0}
                  step={1000000}
                  className="mt-2"
                />
              </div>

              {/* Power Capacity Range */}
              <div>
                <label className="text-sm font-medium">
                  Power Capacity: {powerRange[0]}MW - {powerRange[1]}MW
                </label>
                <Slider
                  value={powerRange}
                  onValueChange={setPowerRange}
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
              </div>

              {/* Property Type Filter */}
              <div>
                <label className="text-sm font-medium">Property Type</label>
                <div className="mt-2 space-y-2">
                  {['Industrial', 'Data Center', 'Manufacturing', 'Warehouse'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input type="checkbox" id={type} className="rounded" />
                      <label htmlFor={type} className="text-sm">{type}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Map Statistics
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Properties</span>
                    <span className="font-medium">{filteredProperties.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Price</span>
                    <span className="font-medium">
                      ${(filteredProperties.reduce((sum, p) => sum + (p.asking_price || 0), 0) / filteredProperties.length / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Power</span>
                    <span className="font-medium">
                      {(filteredProperties.reduce((sum, p) => sum + (p.power_capacity_mw || 0), 0) / filteredProperties.length).toFixed(0)} MW
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property List */}
          <div className="p-4 space-y-2">
            <h4 className="text-sm font-medium">Properties ({filteredProperties.length})</h4>
            {filteredProperties.map((property) => (
              <Card 
                key={property.id} 
                className="p-3 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setSelectedProperty(property)}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">{property.address}</h5>
                    <Badge variant="outline" className="text-xs">
                      {property.property_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {property.city}, {property.state}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {property.power_capacity_mw || 'N/A'} MW
                    </div>
                    <div className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      ${property.asking_price ? (property.asking_price / 1000000).toFixed(1) : 'N/A'}M
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
