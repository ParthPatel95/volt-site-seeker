
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

  return (
    <div className="h-screen flex">
      {/* Map Container */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-100 to-blue-100">
        {/* Map Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-blue-200 flex items-center justify-center">
          <div className="text-center space-y-4">
            <MapPin className="w-16 h-16 text-blue-600 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-slate-700">Interactive Map View</h3>
              <p className="text-slate-600">Heavy power site discovery map will be integrated here</p>
              <p className="text-sm text-slate-500 mt-2">Future: OSM + Substation overlays + Property markers</p>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 right-4 z-10">
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
            <Button variant="outline" className="bg-white/90 backdrop-blur-sm">
              <Layers className="w-4 h-4 mr-2" />
              Layers
            </Button>
          </div>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-10">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs">High VoltScore (80+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs">Medium VoltScore (60-79)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-xs">Low VoltScore (&lt;60)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-blue-600" />
                <span className="text-xs">Substations</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property Details Sidebar */}
      <div className="w-80 bg-background border-l overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Property Details</h2>
          <p className="text-sm text-muted-foreground">Click on map markers for details</p>
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
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-4 border-t">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700">
            <Satellite className="w-4 h-4 mr-2" />
            Satellite Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}
