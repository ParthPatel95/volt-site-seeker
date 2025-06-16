
import { useState } from 'react';
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

const mockMapData = [
  { id: 1, lat: 32.7767, lng: -96.7970, title: "Dallas Industrial Complex", power: "25 MW", score: 85 },
  { id: 2, lat: 30.2672, lng: -97.7431, title: "Austin Manufacturing", power: "18 MW", score: 72 },
  { id: 3, lat: 29.7604, lng: -95.3698, title: "Houston Energy Hub", power: "32 MW", score: 91 },
];

export function PropertyMap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Convert mock data to format expected by map
  const mockPowerPlants = mockMapData.map(item => ({
    name: item.title,
    coordinates: { lat: item.lat, lng: item.lng },
    capacity_mw: parseFloat(item.power.replace(' MW', '')),
    fuel_type: 'Industrial Load',
    id: item.id
  }));

  return (
    <div className="h-screen flex">
      {/* Enhanced Mapbox Map Container */}
      <div className="flex-1 relative">
        <EnhancedMapboxMap
          height="h-full"
          initialCenter={[-97.7431, 31.0]}
          initialZoom={6}
          powerPlants={mockPowerPlants}
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
          {mockMapData.map((property) => (
            <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm">{property.title}</h3>
                    <Badge variant={property.score > 80 ? "default" : "secondary"}>
                      {property.score}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Zap className="w-3 h-3 mr-1" />
                    {property.power} capacity
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building className="w-3 h-3 mr-1" />
                    Industrial/Manufacturing
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.lat.toFixed(4)}, {property.lng.toFixed(4)}
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
