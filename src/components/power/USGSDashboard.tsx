
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Mountain, 
  Leaf, 
  Layers,
  Droplets,
  Search,
  MapPin,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useUSGSData } from '@/hooks/useUSGSData';

export function USGSDashboard() {
  const { 
    elevationData, 
    landUseData, 
    geologicalData, 
    loading,
    getElevationData,
    getLandUseData,
    getGeologicalData,
    getWaterData
  } = useUSGSData();

  const [coordinates, setCoordinates] = useState({
    latitude: 32.7767,
    longitude: -96.7970
  });

  const handleSearch = async () => {
    await Promise.all([
      getElevationData(coordinates),
      getLandUseData(coordinates),
      getGeologicalData(coordinates)
    ]);
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability.toLowerCase()) {
      case 'excellent': case 'high': return 'default';
      case 'good': case 'moderate': return 'secondary';
      case 'poor': case 'low': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">USGS Environmental Data</h2>
          <p className="text-muted-foreground">US Geological Survey elevation, land use, and geological analysis</p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Location Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={coordinates.latitude}
                onChange={(e) => setCoordinates(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                placeholder="32.7767"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={coordinates.longitude}
                onChange={(e) => setCoordinates(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                placeholder="-96.7970"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Analyze Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Elevation Data */}
      {elevationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mountain className="w-5 h-5 mr-2 text-gray-600" />
              Elevation Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Elevation (Feet)</p>
                <p className="text-2xl font-bold">{elevationData.elevation_feet.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Elevation (Meters)</p>
                <p className="text-2xl font-bold">{elevationData.elevation_meters}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Source</p>
                <p className="font-medium">{elevationData.data_source}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coordinates</p>
                <p className="font-medium">{elevationData.latitude.toFixed(4)}, {elevationData.longitude.toFixed(4)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Land Use Data */}
      {landUseData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-green-600" />
              Land Use Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Primary Land Use</p>
                  <p className="text-xl font-bold">{landUseData.primary_land_use}</p>
                  <Badge variant="secondary">Code: {landUseData.land_use_code}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Development Suitability</p>
                  <Badge variant={getSuitabilityColor(landUseData.suitability_for_development)}>
                    {landUseData.suitability_for_development}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impervious Surface</p>
                  <p className="text-xl font-bold">{landUseData.impervious_surface_percent}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Land Cover Classes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {landUseData.land_cover_classes.map((landClass, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{landClass.class}</span>
                      <Badge variant="outline">{landClass.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {landUseData.environmental_constraints.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                    Environmental Constraints
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {landUseData.environmental_constraints.map((constraint, index) => (
                      <Badge key={index} variant="destructive">{constraint}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geological Data */}
      {geologicalData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="w-5 h-5 mr-2 text-orange-600" />
              Geological Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bedrock Type</p>
                  <p className="font-semibold">{geologicalData.bedrock_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Formation</p>
                  <p className="font-semibold">{geologicalData.geological_formation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Soil Type</p>
                  <p className="font-semibold">{geologicalData.soil_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Foundation Suitability</p>
                  <Badge variant={getSuitabilityColor(geologicalData.foundation_suitability)}>
                    {geologicalData.foundation_suitability}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Seismic Zone</p>
                  <p className="font-semibold">{geologicalData.seismic_zone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Flood Zone</p>
                  <p className="font-semibold">{geologicalData.flood_zone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Groundwater Depth</p>
                  <p className="font-semibold">{geologicalData.groundwater_depth_feet} ft</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Mineral Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {geologicalData.mineral_resources.map((mineral, index) => (
                    <Badge key={index} variant="secondary">{mineral}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Construction Considerations
                </h4>
                <ul className="space-y-1">
                  {geologicalData.construction_considerations.map((consideration, index) => (
                    <li key={index} className="text-sm flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                      {consideration}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
