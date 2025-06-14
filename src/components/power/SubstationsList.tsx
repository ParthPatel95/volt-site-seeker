
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubstationCard } from './SubstationCard';

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

interface SubstationsListProps {
  substations: Substation[];
  totalCount: number;
  onSubstationClick: (substation: Substation) => void;
}

export function SubstationsList({ substations, totalCount, onSubstationClick }: SubstationsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Substations Directory ({substations.length} of {totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {substations.map((substation) => (
            <SubstationCard
              key={substation.id}
              substation={substation}
              onSubstationClick={onSubstationClick}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
