
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  power_capacity_mw: number;
  substation_distance_miles: number;
  status: string;
}

interface PowerPropertiesListProps {
  properties: PropertyData[];
  getStatusColor: (status: string) => "default" | "secondary" | "destructive" | "outline";
}

export function PowerPropertiesList({ properties, getStatusColor }: PowerPropertiesListProps) {
  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">No Properties Found</h3>
          <p className="text-muted-foreground">No properties with power capacity data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">All Properties with Power Data</h3>
      {properties.map((property) => (
        <Card key={property.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{property.address}</h4>
                  <Badge variant={getStatusColor(property.status)}>
                    {property.status?.replace('_', ' ') || 'Unknown'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>Location: {property.city}, {property.state}</div>
                  <div>Capacity: {Number(property.power_capacity_mw).toFixed(1)} MW</div>
                  {property.substation_distance_miles && (
                    <div>Distance: {property.substation_distance_miles} mi to substation</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-yellow-600">
                  {Number(property.power_capacity_mw).toFixed(1)} MW
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
