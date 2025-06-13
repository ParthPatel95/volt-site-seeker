
import { Card, CardContent } from '@/components/ui/card';
import { Building, AlertCircle, CheckCircle } from 'lucide-react';

interface PropertyStatsProps {
  totalCount: number;
  availableCount: number;
  movedCount: number;
}

export function PropertyStats({ totalCount, availableCount, movedCount }: PropertyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Building className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Total Scraped</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{availableCount}</p>
              <p className="text-sm text-muted-foreground">Available to Move</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{movedCount}</p>
              <p className="text-sm text-muted-foreground">Moved to Properties</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
