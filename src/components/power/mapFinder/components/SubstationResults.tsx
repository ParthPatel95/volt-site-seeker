
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, MapPin, ExternalLink, TrendingUp } from 'lucide-react';
import { DiscoveredSubstation } from '../types';

interface SubstationResultsProps {
  substations: DiscoveredSubstation[];
}

export function SubstationResults({ substations }: SubstationResultsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'analyzing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (substations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Discovered Substations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">No substations discovered yet. Select an area and start searching to find substations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Discovered Substations</span>
          </div>
          <Badge variant="secondary" className="self-start sm:self-auto">
            {substations.length} Found
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
          {substations.map((substation) => (
            <div
              key={substation.id}
              className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base break-words">{substation.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="break-words">{substation.address}</span>
                    </p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(substation.analysis_status)} flex-shrink-0`}>
                    {substation.analysis_status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground">Coordinates:</span>
                    <div className="font-mono text-xs break-all">
                      {substation.latitude.toFixed(4)}, {substation.longitude.toFixed(4)}
                    </div>
                  </div>
                  
                  {substation.capacity_estimate && (
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {substation.capacity_estimate.min}-{substation.capacity_estimate.max} MW
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(substation.capacity_estimate.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                    onClick={() => window.open(`https://maps.google.com/?q=${substation.latitude},${substation.longitude}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    View on Maps
                  </Button>
                  
                  {substation.capacity_estimate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Capacity Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
