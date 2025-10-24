
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiscoveredSubstation } from './types';

interface SubstationCardProps {
  substation: DiscoveredSubstation;
  onClick: (substation: DiscoveredSubstation) => void;
}

export function SubstationCard({ substation, onClick }: SubstationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'analyzing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
      onClick={() => onClick(substation)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-foreground truncate pr-2">
              {substation.name}
            </h3>
            <Badge className={getStatusColor(substation.analysis_status)}>
              {substation.analysis_status}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span className="truncate">{substation.address}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>
                {substation.capacity_estimate?.max 
                  ? `${substation.capacity_estimate.max} MVA` 
                  : 'Capacity TBD'
                }
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>{substation.details?.utility_owner || 'Unknown Utility'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>{substation.details?.voltage_level || 'Voltage TBD'}</span>
            </div>
            
            {substation.details?.load_factor && (
              <div className="flex items-center space-x-2">
                <span>{(substation.details.load_factor * 100).toFixed(1)}% Load Factor</span>
              </div>
            )}

            {substation.confidence_score && (
              <div className="flex items-center space-x-2">
                <span>{substation.confidence_score}% Confidence</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick(substation);
              }}
            >
              View Details
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // This could trigger analysis in the future
                console.log('Analyze substation:', substation.name);
              }}
            >
              Analyze
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
