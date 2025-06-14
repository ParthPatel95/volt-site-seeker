
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  power_capacity_mw: number;
  substation_distance_miles: number;
  status: string;
}

interface PowerPropertyCardProps {
  property: PropertyData;
  getStatusColor: (status: string) => "default" | "secondary" | "destructive" | "outline";
}

export function PowerPropertyCard({ property, getStatusColor }: PowerPropertyCardProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="space-y-1">
        <div className="font-medium">{property.address}</div>
        <div className="text-sm text-muted-foreground flex items-center">
          <MapPin className="w-3 h-3 mr-1" />
          {property.city}, {property.state}
        </div>
        {property.substation_distance_miles && (
          <div className="text-sm text-muted-foreground">
            {property.substation_distance_miles} mi to substation
          </div>
        )}
      </div>
      <div className="text-right space-y-1">
        <div className="text-lg font-bold text-yellow-600">
          {Number(property.power_capacity_mw).toFixed(1)} MW
        </div>
        <Badge variant={getStatusColor(property.status)}>
          {property.status?.replace('_', ' ') || 'Unknown'}
        </Badge>
      </div>
    </div>
  );
}
