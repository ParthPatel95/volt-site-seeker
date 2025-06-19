
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubstationFilters } from '../googleFinder/components/SubstationFilters';
import { SubstationTable } from '../googleFinder/components/SubstationTable';
import { useSubstationFilters } from '../googleFinder/hooks/useSubstationFilters';

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

interface SubstationResultsProps {
  discoveredSubstations: DiscoveredSubstation[];
  storedSubstations: DiscoveredSubstation[];
  onViewOnMap: (substation: DiscoveredSubstation) => void;
}

export function SubstationResults({
  discoveredSubstations,
  storedSubstations,
  onViewOnMap
}: SubstationResultsProps) {
  const discoveredFilters = useSubstationFilters(discoveredSubstations);
  const storedFilters = useSubstationFilters(storedSubstations);

  return (
    <Tabs defaultValue="current" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="current" className="text-xs sm:text-sm">
          Current Search ({discoveredSubstations.length})
        </TabsTrigger>
        <TabsTrigger value="stored" className="text-xs sm:text-sm">
          All Stored ({storedSubstations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="current" className="space-y-4">
        {discoveredSubstations.length > 0 && (
          <>
            <SubstationFilters
              searchTerm={discoveredFilters.searchTerm}
              setSearchTerm={discoveredFilters.setSearchTerm}
              statusFilter={discoveredFilters.statusFilter}
              setStatusFilter={discoveredFilters.setStatusFilter}
              capacityFilter={discoveredFilters.capacityFilter}
              setCapacityFilter={discoveredFilters.setCapacityFilter}
              locationFilter={discoveredFilters.locationFilter}
              setLocationFilter={discoveredFilters.setLocationFilter}
              onClearFilters={discoveredFilters.clearFilters}
              totalResults={discoveredSubstations.length}
              filteredResults={discoveredFilters.filteredSubstations.length}
            />

            <SubstationTable
              substations={discoveredFilters.filteredSubstations}
              onViewOnMap={onViewOnMap}
            />
          </>
        )}
      </TabsContent>

      <TabsContent value="stored" className="space-y-4">
        <SubstationFilters
          searchTerm={storedFilters.searchTerm}
          setSearchTerm={storedFilters.setSearchTerm}
          statusFilter={storedFilters.statusFilter}
          setStatusFilter={storedFilters.setStatusFilter}
          capacityFilter={storedFilters.capacityFilter}
          setCapacityFilter={storedFilters.setCapacityFilter}
          locationFilter={storedFilters.locationFilter}
          setLocationFilter={storedFilters.setLocationFilter}
          onClearFilters={storedFilters.clearFilters}
          totalResults={storedSubstations.length}
          filteredResults={storedFilters.filteredSubstations.length}
        />

        <SubstationTable
          substations={storedFilters.filteredSubstations}
          onViewOnMap={onViewOnMap}
        />
      </TabsContent>
    </Tabs>
  );
}
