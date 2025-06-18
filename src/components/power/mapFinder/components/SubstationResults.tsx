
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { DiscoveredSubstation } from '../types';

interface SubstationResultsProps {
  substations: DiscoveredSubstation[];
}

export function SubstationResults({ substations }: SubstationResultsProps) {
  if (substations.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'analyzing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Discovered Substations ({substations.length})</span>
          </div>
          <Badge variant="secondary">
            {substations.filter(s => s.analysis_status === 'completed').length} Analyzed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {substations.map((substation) => (
            <div 
              key={substation.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{substation.name}</h4>
                  {getStatusIcon(substation.analysis_status)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {substation.address}
                </p>
                <p className="text-xs text-gray-500">
                  {substation.latitude.toFixed(6)}, {substation.longitude.toFixed(6)}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {substation.capacity_estimate && (
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {substation.capacity_estimate.min}-{substation.capacity_estimate.max} MW
                    </div>
                    <div className="text-xs text-gray-500">
                      {substation.capacity_estimate.confidence}% confidence
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
