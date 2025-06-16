
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mountain } from 'lucide-react';

interface USGSElevationCardProps {
  elevationData: any;
  searchResults: any;
}

export function USGSElevationCard({ elevationData, searchResults }: USGSElevationCardProps) {
  const data = elevationData || searchResults?.elevation;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mountain className="w-5 h-5 mr-2 text-green-600" />
          Elevation Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Elevation (Feet)</p>
              <p className="text-2xl font-bold">
                {(data.elevation_feet || 0).toFixed(0)}'
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Elevation (Meters)</p>
              <p className="text-2xl font-bold">
                {(data.elevation_meters || 0).toFixed(0)}m
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Data Source</p>
              <Badge variant="outline">
                {data.data_source || 'USGS NED'}
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
  );
}
