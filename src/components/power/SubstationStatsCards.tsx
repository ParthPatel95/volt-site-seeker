
import { Card, CardContent } from '@/components/ui/card';
import { Building, Zap, MapPin } from 'lucide-react';

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

interface SubstationStatsCardsProps {
  substations: Substation[];
  uniqueStates: string[];
}

export function SubstationStatsCards({ substations, uniqueStates }: SubstationStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Total Substations</p>
              <p className="text-2xl font-bold">{substations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Total Capacity</p>
              <p className="text-2xl font-bold">
                {Math.round(substations.reduce((sum, sub) => sum + sub.capacity_mva, 0)).toLocaleString()} MVA
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">States/Provinces</p>
              <p className="text-2xl font-bold">{uniqueStates.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Avg Load Factor</p>
              <p className="text-2xl font-bold">
                {Math.round(substations.reduce((sum, sub) => sum + sub.load_factor, 0) / substations.length)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
