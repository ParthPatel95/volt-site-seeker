
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap, Building, Calendar, Activity, TrendingUp } from 'lucide-react';

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
      return 'text-red-600 font-bold';
    } else if (voltage.includes('345kV')) {
      return 'text-orange-600 font-semibold';
    } else if (voltage.includes('240kV') || voltage.includes('230kV')) {
      return 'text-blue-600';
    }
    return 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{substation.name}</h2>
              <p className="text-sm text-muted-foreground">Substation Details</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Classification */}
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusColor(substation.status)}>
              {substation.status}
            </Badge>
            <Badge variant="outline" className={getVoltageColor(substation.voltage_level)}>
              {substation.voltage_level}
            </Badge>
            <Badge variant="outline">
              {substation.interconnection_type}
            </Badge>
          </div>

          {/* Primary Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Information
                </h3>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Address:</span>
                    <span className="font-medium">{substation.city}, {substation.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span>{substation.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State/Province:</span>
                    <span>{substation.state}</span>
                  </div>
                  {substation.latitude && substation.longitude && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coordinates:</span>
                      <span className="text-sm">
                        {substation.latitude.toFixed(4)}, {substation.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                  {substation.coordinates_source && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coord. Source:</span>
                      <span className="text-sm capitalize">{substation.coordinates_source}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Ownership & Operations
                </h3>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Utility Owner:</span>
                    <span className="font-medium">{substation.utility_owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{substation.interconnection_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="capitalize">{substation.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Technical Specifications
                </h3>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-bold text-yellow-600">
                      {substation.capacity_mva.toLocaleString()} MVA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Voltage Level:</span>
                    <span className={getVoltageColor(substation.voltage_level)}>
                      {substation.voltage_level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load Factor:</span>
                    <span>{substation.load_factor}%</span>
                  </div>
                  {substation.upgrade_potential && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Upgrade Potential:</span>
                      <span className="text-green-600">{substation.upgrade_potential}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timeline Information
                </h3>
                <div className="space-y-2 pl-7">
                  {substation.commissioning_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commissioned:</span>
                      <span>{formatDate(substation.commissioning_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Added to System:</span>
                    <span className="text-sm">{formatDate(substation.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="text-sm">{formatDate(substation.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Activity className="w-5 h-5 mr-2" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Load Factor</span>
                </div>
                <div className="text-2xl font-bold mt-2">{substation.load_factor}%</div>
                <div className="text-xs text-muted-foreground">Current utilization</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Capacity Rating</span>
                </div>
                <div className="text-2xl font-bold mt-2">{substation.capacity_mva.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">MVA capacity</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Classification</span>
                </div>
                <div className="text-lg font-bold mt-2 capitalize">{substation.interconnection_type}</div>
                <div className="text-xs text-muted-foreground">Substation type</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
