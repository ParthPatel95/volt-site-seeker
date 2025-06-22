
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { SubstationDetailsModal } from './SubstationDetailsModal';
import { SubstationTableHeader } from './SubstationTableHeader';
import { SubstationTableRow } from './SubstationTableRow';
import { SubstationFilters } from './SubstationFilters';
import { useSubstationFilters } from '../hooks/useSubstationFilters';

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
  detection_method?: string;
  confidence_score?: number;
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

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    capacityFilter,
    setCapacityFilter,
    locationFilter,
    setLocationFilter,
    detectionMethodFilter,
    setDetectionMethodFilter,
    confidenceFilter,
    setConfidenceFilter,
    filteredSubstations,
    clearFilters
  } = useSubstationFilters(substations);

  const handleViewDetails = (substation: DiscoveredSubstation) => {
    setSelectedSubstation(substation);
    setIsModalOpen(true);
  };

  if (substations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No substations found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SubstationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        capacityFilter={capacityFilter}
        setCapacityFilter={setCapacityFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        detectionMethodFilter={detectionMethodFilter}
        setDetectionMethodFilter={setDetectionMethodFilter}
        confidenceFilter={confidenceFilter}
        setConfidenceFilter={setConfidenceFilter}
        onClearFilters={clearFilters}
        totalResults={substations.length}
        filteredResults={filteredSubstations.length}
      />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <SubstationTableHeader showCheckboxes={showCheckboxes} />
          <TableBody>
            {filteredSubstations.map((substation) => (
              <SubstationTableRow
                key={substation.id}
                substation={substation}
                showCheckboxes={showCheckboxes}
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
                onViewDetails={handleViewDetails}
                onViewOnMap={onViewOnMap}
                onAnalyzeSubstation={onAnalyzeSubstation}
                analyzing={analyzing}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <SubstationDetailsModal
        substation={selectedSubstation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
