import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Building, Calendar, Activity, TrendingUp, ExternalLink } from 'lucide-react';
import { EnhancedMapboxMap } from '../EnhancedMapboxMap';

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

interface SubstationDetailsModalProps {
  substation: Substation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubstationDetailsModal({ substation, isOpen, onClose }: SubstationDetailsModalProps) {
  if (!substation) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default' as const;
      case 'inactive':
        return 'secondary' as const;
      case 'maintenance':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  const getVoltageColor = (voltage: string) => {
    if (voltage.includes('735kV') || voltage.includes('500kV')) {
      return 'text-red-600 dark:text-red-400 font-bold';
    } else if (voltage.includes('345kV')) {
      return 'text-orange-600 dark:text-orange-400 font-semibold';
    } else if (voltage.includes('240kV') || voltage.includes('230kV')) {
      return 'text-blue-600 dark:text-blue-400';
    }
    return 'text-muted-foreground';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewOnMap = () => {
    if (substation.latitude && substation.longitude) {
      window.open(`https://maps.google.com/?q=${substation.latitude},${substation.longitude}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">{substation.name}</h2>
              <p className="text-sm text-muted-foreground">Complete Substation Analysis</p>
            </div>
            {substation.latitude && substation.longitude && (
              <Button
                onClick={handleViewOnMap}
                size="sm"
                variant="outline"
                className="self-start sm:self-auto"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Google Maps
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Classification */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={getStatusColor(substation.status)}>
              {substation.status}
            </Badge>
            <Badge variant="outline" className={getVoltageColor(substation.voltage_level)}>
              {substation.voltage_level}
            </Badge>
            <Badge variant="outline">
              {substation.interconnection_type}
            </Badge>
            {substation.coordinates_source && (
              <Badge variant="secondary" className="text-xs">
                Source: {substation.coordinates_source.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Embedded Map View */}
          {substation.latitude && substation.longitude && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Map
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <EnhancedMapboxMap
                  height="h-80"
                  initialCenter={[substation.longitude, substation.latitude]}
                  initialZoom={15}
                  showControls={true}
                  mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                  substations={[{
                    ...substation,
                    latitude: substation.latitude,
                    longitude: substation.longitude
                  }]}
                />
              </div>
            </div>
          )}

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Information */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Information
                </h3>
                <div className="space-y-3 pl-7 bg-muted/30 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-muted-foreground">City:</span>
                      <p className="font-medium">{substation.city}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">State:</span>
                      <p className="font-medium">{substation.state}</p>
                    </div>
                  </div>
                  {substation.latitude && substation.longitude && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Latitude:</span>
                        <p className="font-mono text-sm">{substation.latitude.toFixed(6)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Longitude:</span>
                        <p className="font-mono text-sm">{substation.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Full Address:</span>
                    <p className="font-medium">{substation.city}, {substation.state}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Ownership & Operations
                </h3>
                <div className="space-y-3 pl-7 bg-muted/30 rounded-lg p-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Utility Owner:</span>
                    <p className="font-medium text-lg">{substation.utility_owner}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <p className="capitalize font-medium">{substation.interconnection_type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <p className="capitalize font-medium">{substation.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Technical Specifications
                </h3>
                <div className="space-y-3 pl-7 bg-muted/30 rounded-lg p-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Capacity:</span>
                    <p className="font-bold text-2xl text-yellow-600 dark:text-yellow-400">
                      {substation.capacity_mva.toLocaleString()} MVA
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Voltage Level:</span>
                    <p className={`font-semibold text-lg ${getVoltageColor(substation.voltage_level)}`}>
                      {substation.voltage_level}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Load Factor:</span>
                      <p className="font-medium">{substation.load_factor}%</p>
                    </div>
                    {substation.upgrade_potential && (
                      <div>
                        <span className="text-sm text-muted-foreground">Upgrade Potential:</span>
                        <p className="text-green-600 dark:text-green-400 font-medium">{substation.upgrade_potential}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timeline Information
                </h3>
                <div className="space-y-3 pl-7 bg-muted/30 rounded-lg p-4">
                  {substation.commissioning_date && (
                    <div>
                      <span className="text-sm text-muted-foreground">Commissioned:</span>
                      <p className="font-medium">{formatDate(substation.commissioning_date)}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Added to System:</span>
                      <p className="font-medium">{formatDate(substation.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <p className="font-medium">{formatDate(substation.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Activity className="w-5 h-5 mr-2" />
              Performance & Capacity Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Load Factor</span>
                </div>
                <div className="text-3xl font-bold mt-2 text-green-700 dark:text-green-300">{substation.load_factor}%</div>
                <div className="text-xs text-green-600 dark:text-green-400">Current utilization</div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium">MVA Capacity</span>
                </div>
                <div className="text-3xl font-bold mt-2 text-yellow-700 dark:text-yellow-300">{substation.capacity_mva.toLocaleString()}</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Total capacity</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">Type</span>
                </div>
                <div className="text-lg font-bold mt-2 text-blue-700 dark:text-blue-300 capitalize">{substation.interconnection_type}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Infrastructure type</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">MW Estimate</span>
                </div>
                <div className="text-3xl font-bold mt-2 text-purple-700 dark:text-purple-300">
                  {Math.round(substation.capacity_mva * 0.8)}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Power output est.</div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Additional Technical Information</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Voltage Classification:</span>
                  <p className="font-medium">
                    {substation.voltage_level.includes('kV') ? 
                      (parseInt(substation.voltage_level) >= 230 ? 'Extra High Voltage' : 
                       parseInt(substation.voltage_level) >= 35 ? 'High Voltage' : 'Medium Voltage') : 
                      'Unknown Classification'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">System ID:</span>
                  <p className="font-mono text-xs">{substation.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Coordinates Source:</span>
                  <p className="font-medium capitalize">{substation.coordinates_source?.replace('_', ' ') || 'Manual entry'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
