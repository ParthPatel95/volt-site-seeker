
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Building, Calendar, Activity, TrendingUp, ExternalLink } from 'lucide-react';

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

interface SubstationDetailsModalProps {
  substation: DiscoveredSubstation | null;
  isOpen: boolean;
  onClose: () => void;
  onViewOnMap: (substation: DiscoveredSubstation) => void;
}

export function SubstationDetailsModal({ 
  substation, 
  isOpen, 
  onClose, 
  onViewOnMap 
}: SubstationDetailsModalProps) {
  if (!substation) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">{substation.name}</h2>
              <p className="text-sm text-muted-foreground">Substation Details & Analysis</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusColor(substation.analysis_status)}>
                {substation.analysis_status}
              </Badge>
              {substation.details?.voltage_level && (
                <Badge variant="outline">
                  {substation.details.voltage_level}
                </Badge>
              )}
              {substation.details?.interconnection_type && (
                <Badge variant="outline">
                  {substation.details.interconnection_type}
                </Badge>
              )}
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <Button
                onClick={() => onViewOnMap(substation)}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View on Map
              </Button>
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold flex items-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Location Information
                </h3>
                <div className="space-y-2 pl-6 sm:pl-7">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-xs sm:text-sm text-muted-foreground">Address:</span>
                      <p className="text-sm sm:text-base font-medium break-words">{substation.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Latitude:</span>
                        <p className="text-sm font-mono">{substation.latitude.toFixed(6)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Longitude:</span>
                        <p className="text-sm font-mono">{substation.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {substation.details && (
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center">
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Ownership & Operations
                  </h3>
                  <div className="space-y-2 pl-6 sm:pl-7">
                    {substation.details.utility_owner && (
                      <div>
                        <span className="text-xs text-muted-foreground">Utility Owner:</span>
                        <p className="text-sm font-medium">{substation.details.utility_owner}</p>
                      </div>
                    )}
                    {substation.details.status && (
                      <div>
                        <span className="text-xs text-muted-foreground">Operational Status:</span>
                        <p className="text-sm capitalize">{substation.details.status}</p>
                      </div>
                    )}
                    {substation.details.commissioning_date && (
                      <div>
                        <span className="text-xs text-muted-foreground">Commissioned:</span>
                        <p className="text-sm">{new Date(substation.details.commissioning_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Technical Specifications */}
              {substation.capacity_estimate && (
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Technical Specifications
                  </h3>
                  <div className="space-y-2 pl-6 sm:pl-7">
                    <div>
                      <span className="text-xs text-muted-foreground">Estimated Capacity Range:</span>
                      <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                        {substation.capacity_estimate.min} - {substation.capacity_estimate.max} MW
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Analysis Confidence:</span>
                      <p className={`text-sm font-semibold ${getConfidenceColor(substation.capacity_estimate.confidence)}`}>
                        {(substation.capacity_estimate.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    {substation.details?.voltage_level && (
                      <div>
                        <span className="text-xs text-muted-foreground">Voltage Level:</span>
                        <p className="text-sm font-medium">{substation.details.voltage_level}</p>
                      </div>
                    )}
                    {substation.details?.load_factor && (
                      <div>
                        <span className="text-xs text-muted-foreground">Load Factor:</span>
                        <p className="text-sm">{substation.details.load_factor}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Information */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Discovery Information
                </h3>
                <div className="space-y-2 pl-6 sm:pl-7">
                  {substation.stored_at && (
                    <div>
                      <span className="text-xs text-muted-foreground">Discovered:</span>
                      <p className="text-sm">{new Date(substation.stored_at).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-muted-foreground">Place ID:</span>
                    <p className="text-xs font-mono break-all">{substation.place_id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {substation.capacity_estimate && (
            <div className="border-t pt-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center mb-4">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs sm:text-sm font-medium">Min Capacity</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mt-2">{substation.capacity_estimate.min}</div>
                  <div className="text-xs text-muted-foreground">MW minimum</div>
                </div>
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs sm:text-sm font-medium">Max Capacity</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mt-2">{substation.capacity_estimate.max}</div>
                  <div className="text-xs text-muted-foreground">MW maximum</div>
                </div>
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    <span className="text-xs sm:text-sm font-medium">Confidence</span>
                  </div>
                  <div className={`text-xl sm:text-2xl font-bold mt-2 ${getConfidenceColor(substation.capacity_estimate.confidence)}`}>
                    {(substation.capacity_estimate.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Analysis confidence</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
