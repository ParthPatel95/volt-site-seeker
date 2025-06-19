
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Eye, MapPin, Zap, Database } from 'lucide-react';
import { SubstationDetailsModal } from './SubstationDetailsModal';

interface DiscoveredSubstation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  place_id: string;
  address: string;
  capacity_estimate?: {
    min: number;
    max: number;
    confidence: number;
  };
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
  stored_at?: string;
  details?: {
    utility_owner?: string;
    voltage_level?: string;
    interconnection_type?: string;
    commissioning_date?: string;
    load_factor?: number;
    status?: string;
  };
}

interface SubstationTableProps {
  substations: DiscoveredSubstation[];
  onViewOnMap: (substation: DiscoveredSubstation) => void;
}

export function SubstationTable({ substations, onViewOnMap }: SubstationTableProps) {
  const [selectedSubstation, setSelectedSubstation] = useState<DiscoveredSubstation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'analyzing':
        return 'secondary' as const;
      case 'pending':
        return 'outline' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleViewDetails = (substation: DiscoveredSubstation) => {
    setSelectedSubstation(substation);
    setIsModalOpen(true);
  };

  if (substations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 sm:py-12 text-center">
          <Database className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-sm sm:text-base">No substations found. Try adjusting your search or filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-base sm:text-lg">Discovered Substations</span>
            <Badge variant="outline" className="self-start sm:self-auto text-xs">
              {substations.length} Results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card Layout */}
          <div className="block sm:hidden space-y-4">
            {substations.map((substation) => (
              <div key={substation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm truncate">{substation.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{substation.address}</p>
                  </div>
                  <Badge variant={getStatusColor(substation.analysis_status)} className="ml-2 text-xs">
                    {substation.analysis_status}
                  </Badge>
                </div>
                
                {substation.capacity_estimate && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium">
                      {substation.capacity_estimate.min}-{substation.capacity_estimate.max} MW
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewDetails(substation)}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                  <Button
                    onClick={() => onViewOnMap(substation)}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Map
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name & Location</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Capacity (MW)</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Owner</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {substations.map((substation) => (
                  <tr key={substation.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div className="max-w-xs">
                        <div className="font-medium text-sm truncate">{substation.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{substation.address}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {substation.latitude.toFixed(4)}, {substation.longitude.toFixed(4)}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {substation.capacity_estimate ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {substation.capacity_estimate.min}-{substation.capacity_estimate.max} MW
                          </div>
                          <div className={`text-xs ${getConfidenceColor(substation.capacity_estimate.confidence)}`}>
                            {(substation.capacity_estimate.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Analyzing...</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {substation.details?.utility_owner || 'Unknown'}
                      </div>
                      {substation.details?.voltage_level && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {substation.details.voltage_level}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusColor(substation.analysis_status)} className="text-xs">
                        {substation.analysis_status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewDetails(substation)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                        <Button
                          onClick={() => onViewOnMap(substation)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SubstationDetailsModal
        substation={selectedSubstation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onViewOnMap={onViewOnMap}
      />
    </>
  );
}
