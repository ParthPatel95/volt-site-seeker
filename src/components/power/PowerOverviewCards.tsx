
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2,
  Zap,
  Activity,
  TrendingUp
} from 'lucide-react';

interface PowerData {
  totalProperties: number;
  totalPowerCapacity: number;
  averageCapacity: number;
  highCapacityCount: number;
}

interface PowerOverviewCardsProps {
  powerData: PowerData;
}

export function PowerOverviewCards({ powerData }: PowerOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Total Properties</p>
              <p className="text-2xl font-bold">{powerData.totalProperties}</p>
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
              <p className="text-2xl font-bold">{powerData.totalPowerCapacity.toFixed(1)} MW</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Avg Capacity</p>
              <p className="text-2xl font-bold">{powerData.averageCapacity.toFixed(1)} MW</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">High Capacity (20+ MW)</p>
              <p className="text-2xl font-bold">{powerData.highCapacityCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
