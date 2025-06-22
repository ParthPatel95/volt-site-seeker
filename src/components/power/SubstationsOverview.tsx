
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SubstationDetailsModal } from './SubstationDetailsModal';
import { SubstationFilters } from './googleFinder/components/SubstationFilters';
import { useSubstationFilters } from './googleFinder/hooks/useSubstationFilters';
import { SubstationCard } from './substationsOverview/SubstationCard';
import { SubstationActions } from './substationsOverview/SubstationActions';
import { SubstationHeader } from './substationsOverview/SubstationHeader';
import { SubstationLoadingCard } from './substationsOverview/SubstationLoadingCard';
import { SubstationEmptyState } from './substationsOverview/SubstationEmptyState';
import { DiscoveredSubstation, Substation } from './substationsOverview/types';

export function SubstationsOverview() {
  const [substations, setSubstations] = useState<DiscoveredSubstation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedSubstation, setSelectedSubstation] = useState<Substation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const loadSubstations = useCallback(async () => {
    try {
      console.log('Loading substations data...');
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('substations')
        .select('*')
        .order('capacity_mva', { ascending: false });

      if (fetchError) {
        console.error('Error loading substations:', fetchError);
        setError(fetchError.message);
        toast({
          title: "Error Loading Data",
          description: fetchError.message,
          variant: "destructive"
        });
        return;
      }

      // Convert database format to DiscoveredSubstation format
      const substationsData = (data || []).map((sub): DiscoveredSubstation => ({
        id: sub.id,
        name: sub.name,
        latitude: sub.latitude || 0,
        longitude: sub.longitude || 0,
        place_id: `db_${sub.id}`,
        address: `${sub.city}, ${sub.state}`,
        capacity_estimate: {
          min: sub.capacity_mva || 0,
          max: sub.capacity_mva || 0,
          confidence: 0.9
        },
        analysis_status: 'completed' as const,
        stored_at: sub.created_at,
        detection_method: 'database',
        confidence_score: 90,
        details: {
          utility_owner: sub.utility_owner,
          voltage_level: sub.voltage_level,
          interconnection_type: sub.interconnection_type,
          commissioning_date: sub.commissioning_date,
          load_factor: sub.load_factor,
          status: sub.status
        }
      }));

      setSubstations(substationsData);
      console.log('Substations loaded:', substationsData.length, 'substations');
    } catch (error) {
      console.error('Error loading substations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load substations data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteAllSubstations = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('substations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      toast({
        title: "All Substations Deleted",
        description: "Successfully deleted all stored substations",
      });

      await loadSubstations();
    } catch (error: any) {
      console.error('Error deleting all substations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete all substations",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    loadSubstations();
  }, [loadSubstations]);

  const handleSubstationClick = useCallback((substation: DiscoveredSubstation) => {
    // Convert DiscoveredSubstation to Substation format for the modal
    const convertedSubstation: Substation = {
      id: substation.id,
      name: substation.name,
      city: substation.address.split(',')[0]?.trim() || 'Unknown',
      state: substation.address.split(',')[1]?.trim() || 'Unknown',
      voltage_level: substation.details?.voltage_level || 'Unknown',
      capacity_mva: substation.capacity_estimate?.max || 0,
      utility_owner: substation.details?.utility_owner || 'Unknown',
      interconnection_type: substation.details?.interconnection_type || 'Unknown',
      load_factor: substation.details?.load_factor || 0,
      status: substation.details?.status || 'active',
      commissioning_date: substation.details?.commissioning_date,
      upgrade_potential: 0,
      latitude: substation.latitude,
      longitude: substation.longitude,
      coordinates_source: 'database',
      created_at: substation.stored_at || new Date().toISOString(),
      updated_at: substation.stored_at || new Date().toISOString()
    };
    
    setSelectedSubstation(convertedSubstation);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSubstation(null);
  }, []);

  if (loading) {
    return <SubstationLoadingCard />;
  }

  if (error && substations.length === 0) {
    return (
      <div className="space-y-6">
        <SubstationHeader
          title="Substations Database"
          description="Manage and analyze power infrastructure substations"
        />
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Error loading substations: {error}</p>
          <button 
            onClick={loadSubstations}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <SubstationHeader
          title="Substations Database"
          description="Manage and analyze power infrastructure substations"
        />
        
        <SubstationActions
          substationsCount={substations.length}
          loading={loading}
          deleting={deleting}
          onRefresh={loadSubstations}
          onDeleteAll={deleteAllSubstations}
        />
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubstations.map((substation) => (
          <SubstationCard 
            key={substation.id}
            substation={substation}
            onClick={handleSubstationClick}
          />
        ))}
      </div>

      <SubstationEmptyState 
        hasFilters={filteredSubstations.length !== substations.length}
        totalCount={substations.length}
      />

      <SubstationDetailsModal
        substation={selectedSubstation}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
