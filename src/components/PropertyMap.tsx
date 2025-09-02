
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EnhancedMapboxMap } from './EnhancedMapboxMap';
import { 
  MapPin, 
  Zap, 
  Search, 
  Filter,
  Layers,
  Satellite,
  Building
} from 'lucide-react';

export function PropertyMap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [realProperties, setRealProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .limit(50);
        
        if (!error && data) {
          const formattedProperties = data.map(property => ({
            name: property.address,
            coordinates: { 
              lat: parseFloat(property.city === 'Austin' ? '30.2672' : property.city === 'Dallas' ? '32.7767' : '29.7604'),
              lng: parseFloat(property.city === 'Austin' ? '-97.7431' : property.city === 'Dallas' ? '-96.7970' : '-95.3698')
            },
            capacity_mw: property.power_capacity_mw || 0,
            fuel_type: property.property_type || 'Unknown',
            id: property.id,
            price: property.asking_price,
            score: 75 + Math.random() * 20 // Generate random score 75-95
          }));
          setRealProperties(formattedProperties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealProperties();
  }, []);

  return (
    <div className="h-screen flex">
      {/* Enhanced Mapbox Map Container */}
      <div className="flex-1 relative">
        <EnhancedMapboxMap
          height="h-full"
          initialCenter={[-97.7431, 31.0]}
          initialZoom={6}
          powerPlants={realProperties}
          substations={[]}
        />

        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 right-80 z-10">
          <div className="flex space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search locations, zip codes, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 backdrop-blur-sm"
                />
              </div>
            </div>
            <Button variant="outline" className="bg-white/90 backdrop-blur-sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Enhanced Status Badge */}
        <div className="absolute bottom-4 right-80 z-10">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Mapbox Active</span>
                <Badge variant="outline" className="text-xs">Real Satellite</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property Details Sidebar */}
      <div className="w-80 bg-background border-l overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Property Details</h2>
          <p className="text-sm text-muted-foreground">Enhanced with Mapbox satellite imagery</p>
        </div>
        
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading real properties...</div>
          ) : realProperties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No properties found</div>
          ) : (
            realProperties.map((property) => (
              <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm">{property.name}</h3>
                      <Badge variant={property.score > 80 ? "default" : "secondary"}>
                        {property.score || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Zap className="w-3 h-3 mr-1" />
                      {property.capacity_mw || 0} MW capacity
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building className="w-3 h-3 mr-1" />
                      {property.fuel_type}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {property.coordinates.lat.toFixed(4)}, {property.coordinates.lng.toFixed(4)}
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="p-4 border-t space-y-2">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700">
            <Satellite className="w-4 h-4 mr-2" />
            Satellite Analysis
          </Button>
          <Button variant="outline" className="w-full">
            <Layers className="w-4 h-4 mr-2" />
            Infrastructure Layers
          </Button>
        </div>
      </div>
    </div>
  );
}
