
import { useState, useMemo } from 'react';

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
}

export function useSubstationFilters(substations: DiscoveredSubstation[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredSubstations = useMemo(() => {
    return substations.filter(substation => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          substation.name.toLowerCase().includes(searchLower) ||
          substation.address.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && substation.analysis_status !== statusFilter) {
        return false;
      }

      // Capacity filter
      if (capacityFilter !== 'all' && substation.capacity_estimate) {
        const maxCapacity = substation.capacity_estimate.max;
        switch (capacityFilter) {
          case '0-50':
            if (maxCapacity > 50) return false;
            break;
          case '50-100':
            if (maxCapacity <= 50 || maxCapacity > 100) return false;
            break;
          case '100-250':
            if (maxCapacity <= 100 || maxCapacity > 250) return false;
            break;
          case '250-500':
            if (maxCapacity <= 250 || maxCapacity > 500) return false;
            break;
          case '500+':
            if (maxCapacity <= 500) return false;
            break;
        }
      } else if (capacityFilter !== 'all' && !substation.capacity_estimate) {
        return false; // Filter out substations without capacity estimates when capacity filter is active
      }

      // Location filter
      if (locationFilter) {
        const locationLower = locationFilter.toLowerCase();
        if (!substation.address.toLowerCase().includes(locationLower)) {
          return false;
        }
      }

      return true;
    });
  }, [substations, searchTerm, statusFilter, capacityFilter, locationFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCapacityFilter('all');
    setLocationFilter('');
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    capacityFilter,
    setCapacityFilter,
    locationFilter,
    setLocationFilter,
    filteredSubstations,
    clearFilters
  };
}
