
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DiscoveredSubstation } from './types';

interface SubstationCardProps {
  substation: DiscoveredSubstation;
  onClick: (substation: DiscoveredSubstation) => void;
}

export function SubstationCard({ substation, onClick }: SubstationCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick(substation)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{substation.name}</h3>
            <span className="text-sm text-blue-600 font-medium">
              {substation.details?.voltage_level || 'N/A'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>📍</span>
              <span>{substation.address}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>⚡</span>
              <span>{substation.capacity_estimate?.max || 0} MVA</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>🏢</span>
              <span>{substation.details?.utility_owner || 'Unknown'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>🔌</span>
              <span>{substation.details?.interconnection_type || 'N/A'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span>{((substation.details?.load_factor || 0) * 100).toFixed(1)}% Load Factor</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t">
            <Button variant="outline" size="sm">
              Details
            </Button>
            <Button variant="outline" size="sm">
              Analyze
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
