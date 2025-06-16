
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';

interface USGSLandUseCardProps {
  landUseData: any;
  searchResults: any;
}

export function USGSLandUseCard({ landUseData, searchResults }: USGSLandUseCardProps) {
  const data = landUseData || searchResults?.landUse;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Layers className="w-5 h-5 mr-2 text-blue-600" />
          Land Use Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Primary Land Use</p>
              <p className="text-lg font-semibold">
                {data.primary_land_use}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Land Cover Distribution</p>
              {(data.land_cover_classes || []).map((item: any, index: number) => (
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
                  {data.impervious_surface_percent || 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tree Canopy</p>
                <p className="font-semibold">
                  {data.tree_canopy_percent || 0}%
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
  );
}
