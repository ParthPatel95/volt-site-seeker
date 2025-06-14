
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { PowerPropertyCard } from './PowerPropertyCard';

interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  power_capacity_mw: number;
  substation_distance_miles: number;
  status: string;
}

interface PowerCapacityDistributionProps {
  properties: PropertyData[];
  getStatusColor: (status: string) => "default" | "secondary" | "destructive" | "outline";
}

export function PowerCapacityDistribution({ properties, getStatusColor }: PowerCapacityDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Power Capacity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Power Data Available</h3>
              <p className="text-muted-foreground">No properties with power capacity data found in the system.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {properties.slice(0, 10).map((property) => (
                <PowerPropertyCard 
                  key={property.id} 
                  property={property} 
                  getStatusColor={getStatusColor} 
                />
              ))}
              {properties.length > 10 && (
                <div className="text-center py-4 text-muted-foreground">
                  +{properties.length - 10} more properties
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
