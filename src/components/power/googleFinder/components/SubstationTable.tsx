
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Eye, Zap, Building2, Brain } from 'lucide-react';
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
    ownership_confidence?: number;
    ownership_source?: string;
  };
}

interface SubstationTableProps {
  substations: DiscoveredSubstation[];
  onViewOnMap: (substation: DiscoveredSubstation) => void;
  showCheckboxes?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (id: string, checked: boolean) => void;
  onAnalyzeSubstation?: (substation: DiscoveredSubstation) => void;
  analyzing?: boolean;
}

export function SubstationTable({ 
  substations, 
  onViewOnMap,
  showCheckboxes = false,
  selectedIds = [],
  onSelectionChange,
  onAnalyzeSubstation,
  analyzing = false
}: SubstationTableProps) {
  const [selectedSubstation, setSelectedSubstation] = React.useState<DiscoveredSubstation | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleViewDetails = (substation: DiscoveredSubstation) => {
    setSelectedSubstation(substation);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (substations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No substations found
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
                <TableHead className="w-12"></TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Capacity (MVA)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {substations.map((substation) => (
              <TableRow key={substation.id}>
                {showCheckboxes && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(substation.id)}
                      onCheckedChange={(checked) => 
                        onSelectionChange?.(substation.id, checked as boolean)
                      }
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="max-w-48 truncate">{substation.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="max-w-48 truncate">{substation.address}</div>
                    <div className="text-gray-500 text-xs">
                      {substation.latitude.toFixed(4)}, {substation.longitude.toFixed(4)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {substation.details?.utility_owner ? (
                      <div>
                        <div>{substation.details.utility_owner}</div>
                        {substation.details.ownership_confidence && (
                          <div className="text-xs text-gray-500">
                            {Math.round(substation.details.ownership_confidence * 100)}% confidence
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {substation.capacity_estimate ? (
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">
                        {substation.capacity_estimate.min}-{substation.capacity_estimate.max}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not analyzed</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(substation.analysis_status)}>
                    {substation.analysis_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onAnalyzeSubstation && substation.analysis_status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAnalyzeSubstation(substation)}
                        disabled={analyzing}
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        Analyze
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(substation)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewOnMap(substation)}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Map
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SubstationDetailsModal
        substation={selectedSubstation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
