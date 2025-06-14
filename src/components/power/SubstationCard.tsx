
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Zap, ExternalLink } from 'lucide-react';

interface Substation {
  id: string;
  name: string;
  city: string;
  state: string;
  voltage_level: string;
  capacity_mva: number;
  utility_owner: string;
  interconnection_type: string;
  load_factor: number;
  status: string;
  commissioning_date?: string;
  upgrade_potential?: number;
  latitude?: number;
  longitude?: number;
  coordinates_source?: string;
  created_at: string;
  updated_at: string;
}

interface SubstationCardProps {
  substation: Substation;
  onSubstationClick: (substation: Substation) => void;
}

export function SubstationCard({ substation, onSubstationClick }: SubstationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default' as const;
      case 'inactive':
        return 'secondary' as const;
      case 'maintenance':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  const getVoltageColor = (voltage: string) => {
    if (voltage.includes('735kV') || voltage.includes('500kV')) {
      return 'text-red-600 font-bold';
    } else if (voltage.includes('345kV')) {
      return 'text-orange-600 font-semibold';
    } else if (voltage.includes('240kV') || voltage.includes('230kV')) {
      return 'text-blue-600';
    }
    return 'text-gray-600';
  };

  return (
    <div 
      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onSubstationClick(substation)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold">{substation.name}</h3>
            <Badge variant={getStatusColor(substation.status)}>
              {substation.status}
            </Badge>
            <Badge variant="outline" className={getVoltageColor(substation.voltage_level)}>
              {substation.voltage_level}
            </Badge>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{substation.city}, {substation.state}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span>{substation.utility_owner}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span>{substation.interconnection_type}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right space-y-1">
          <div className="text-2xl font-bold text-yellow-600">
            {substation.capacity_mva.toLocaleString()} MVA
          </div>
          <div className="text-sm text-muted-foreground">
            {substation.load_factor}% load factor
          </div>
        </div>
      </div>
    </div>
  );
}
