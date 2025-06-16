
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, MapPin, Fuel, Building } from 'lucide-react';

interface EIAPowerPlantsTabProps {
  powerPlants: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function EIAPowerPlantsTab({ powerPlants, loading, onRefresh }: EIAPowerPlantsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Power Plants Data</h3>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <Zap className="w-4 h-4 mr-2" />
          Refresh Plants
        </Button>
      </div>
      
      {powerPlants.length > 0 ? (
        <div className="grid gap-4">
          {powerPlants.slice(0, 10).map((plant) => (
            <Card key={plant.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{plant.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {plant.state} • {plant.utility_name}
                    </div>
                    <div className="flex items-center text-sm">
                      <Fuel className="w-3 h-3 mr-1" />
                      {plant.fuel_type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{plant.capacity_mw.toFixed(0)} MW</div>
                    <Badge variant={plant.operational_status === 'OP' ? 'default' : 'secondary'}>
                      {plant.operational_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {powerPlants.length > 10 && (
            <p className="text-center text-muted-foreground">
              Showing 10 of {powerPlants.length} power plants
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Click "Refresh Plants" to load EIA power plant data.</p>
        </div>
      )}
    </div>
  );
}
