
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets } from 'lucide-react';

interface USGSGeologicalCardProps {
  geologicalData: any;
  searchResults: any;
}

export function USGSGeologicalCard({ geologicalData, searchResults }: USGSGeologicalCardProps) {
  const data = geologicalData || searchResults?.geological;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Droplets className="w-5 h-5 mr-2 text-cyan-600" />
          Geological & Water Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bedrock Type</p>
                <p className="font-semibold">
                  {data.bedrock_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Soil Type</p>
                <p className="font-semibold">
                  {data.soil_type}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Foundation Suitability</p>
                <Badge variant="outline">
                  {data.foundation_suitability}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seismic Zone</p>
                <Badge variant="outline">
                  {data.seismic_zone}
                </Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Groundwater Depth</p>
              <p className="font-semibold">
                {data.groundwater_depth_feet} feet
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
  );
}
