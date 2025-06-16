
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Mountain, 
  Layers,
  Droplets,
  RefreshCw,
  Search
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

  const [searchResults, setSearchResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!coordinates.latitude || !coordinates.longitude) return;
    
    try {
      const [elevation, landUse, geological, water] = await Promise.all([
        getElevationData(coordinates),
        getLandUseData(coordinates),
        getGeologicalData(coordinates),
        getWaterData(coordinates)
      ]);

      setSearchResults({ elevation, landUse, geological, water });
    } catch (error) {
      console.error('Error fetching USGS data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">USGS Data Dashboard</h2>
          <p className="text-muted-foreground">U.S. Geological Survey elevation, land use, and geological data</p>
        </div>
      </div>

      {/* Coordinate Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Location Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                value={coordinates.latitude}
                onChange={(e) => setCoordinates(prev => ({
                  ...prev,
                  latitude: parseFloat(e.target.value) || 0
                }))}
                placeholder="32.7767"
                step="0.0001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                value={coordinates.longitude}
                onChange={(e) => setCoordinates(prev => ({
                  ...prev,
                  longitude: parseFloat(e.target.value) || 0
                }))}
                placeholder="-96.7970"
                step="0.0001"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="w-full"
            >
              <Search className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Analyze Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Elevation Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mountain className="w-5 h-5 mr-2 text-green-600" />
            Elevation Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {elevationData || searchResults?.elevation ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Elevation (Feet)</p>
                <p className="text-2xl font-bold">
                  {(elevationData?.elevation_feet || searchResults?.elevation?.elevation_feet || 0).toFixed(0)}'
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Elevation (Meters)</p>
                <p className="text-2xl font-bold">
                  {(elevationData?.elevation_meters || searchResults?.elevation?.elevation_meters || 0).toFixed(0)}m
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Data Source</p>
                <Badge variant="outline">
                  {elevationData?.data_source || searchResults?.elevation?.data_source || 'USGS NED'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Mountain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Enter coordinates to get elevation data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Land Use Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="w-5 h-5 mr-2 text-blue-600" />
              Land Use Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {landUseData || searchResults?.landUse ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Primary Land Use</p>
                  <p className="text-lg font-semibold">
                    {landUseData?.primary_land_use || searchResults?.landUse?.primary_land_use}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Land Cover Distribution</p>
                  {(landUseData?.land_cover_classes || searchResults?.landUse?.land_cover_classes || []).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.class}</span>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Impervious Surface</p>
                    <p className="font-semibold">
                      {landUseData?.impervious_surface_percent || searchResults?.landUse?.impervious_surface_percent || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tree Canopy</p>
                    <p className="font-semibold">
                      {landUseData?.tree_canopy_percent || searchResults?.landUse?.tree_canopy_percent || 0}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">Enter coordinates to get land use data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-cyan-600" />
              Geological & Water Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {geologicalData || searchResults?.geological ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrock Type</p>
                    <p className="font-semibold">
                      {geologicalData?.bedrock_type || searchResults?.geological?.bedrock_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Soil Type</p>
                    <p className="font-semibold">
                      {geologicalData?.soil_type || searchResults?.geological?.soil_type}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Foundation Suitability</p>
                    <Badge variant="outline">
                      {geologicalData?.foundation_suitability || searchResults?.geological?.foundation_suitability}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seismic Zone</p>
                    <Badge variant="outline">
                      {geologicalData?.seismic_zone || searchResults?.geological?.seismic_zone}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Groundwater Depth</p>
                  <p className="font-semibold">
                    {geologicalData?.groundwater_depth_feet || searchResults?.geological?.groundwater_depth_feet} feet
                  </p>
                </div>
                
                {searchResults?.water && (
                  <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <p className="text-sm font-medium mb-2">Water Resources</p>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Nearest Water Body:</span>
                        <span>{searchResults.water.nearest_water_body}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span>{searchResults.water.distance_to_water_miles} miles</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Watershed:</span>
                        <span>{searchResults.water.watershed}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Droplets className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">Enter coordinates to get geological data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
