
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Zap, 
  Building2, 
  Calendar,
  ExternalLink,
  Info,
  AlertTriangle
} from 'lucide-react';

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
    ownership_confidence?: number;
    ownership_source?: string;
  };
}

interface SubstationDetailsModalProps {
  substation: DiscoveredSubstation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubstationDetailsModal({
  substation,
  isOpen,
  onClose
}: SubstationDetailsModalProps) {
  if (!substation) return null;

  const handleViewOnExternalMap = () => {
    window.open(`https://maps.google.com/?q=${substation.latitude},${substation.longitude}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5" />
            {substation.name}
            <Badge className={getStatusColor(substation.analysis_status)}>
              {substation.analysis_status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="w-5 h-5" />
              Location Information
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{substation.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Latitude</p>
                  <p className="font-medium">{substation.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Longitude</p>
                  <p className="font-medium">{substation.longitude.toFixed(6)}</p>
                </div>
              </div>

              <Button 
                onClick={handleViewOnExternalMap}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Google Maps
              </Button>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Map requires Google Maps API key
              </p>
              <p className="text-xs text-gray-500">
                Click "View on Google Maps" above to see location
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Zap className="w-5 h-5" />
              Technical Details
            </div>

            {substation.capacity_estimate && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-blue-900">Capacity Estimate</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-blue-600">Min</p>
                    <p className="font-medium">{substation.capacity_estimate.min} MVA</p>
                  </div>
                  <div>
                    <p className="text-blue-600">Max</p>
                    <p className="font-medium">{substation.capacity_estimate.max} MVA</p>
                  </div>
                  <div>
                    <p className="text-blue-600">Confidence</p>
                    <p className="font-medium">{Math.round(substation.capacity_estimate.confidence * 100)}%</p>
                  </div>
                </div>
              </div>
            )}

            {substation.details && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Operational Details</h4>
                
                {substation.details.utility_owner && (
                  <div>
                    <p className="text-sm text-gray-600">Utility Owner</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{substation.details.utility_owner}</p>
                      {substation.details.ownership_confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(substation.details.ownership_confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    {substation.details.ownership_source && (
                      <p className="text-xs text-gray-500">Source: {substation.details.ownership_source}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {substation.details.voltage_level && (
                    <div>
                      <p className="text-gray-600">Voltage Level</p>
                      <p className="font-medium">{substation.details.voltage_level}</p>
                    </div>
                  )}
                  
                  {substation.details.interconnection_type && (
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium capitalize">{substation.details.interconnection_type}</p>
                    </div>
                  )}
                  
                  {substation.details.load_factor && (
                    <div>
                      <p className="text-gray-600">Load Factor</p>
                      <p className="font-medium">{Math.round(substation.details.load_factor * 100)}%</p>
                    </div>
                  )}
                  
                  {substation.details.status && (
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium capitalize">{substation.details.status}</p>
                    </div>
                  )}
                </div>

                {substation.details.commissioning_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Commissioned:</span>
                    <span className="font-medium">
                      {new Date(substation.details.commissioning_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {substation.stored_at && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">
                    Stored: {new Date(substation.stored_at).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleViewOnExternalMap}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Google Maps
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
