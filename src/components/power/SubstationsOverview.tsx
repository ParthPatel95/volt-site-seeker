
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap } from 'lucide-react';
import { SubstationDetailsModal } from './SubstationDetailsModal';
import { SubstationStatsCards } from './SubstationStatsCards';
import { SubstationFilters } from './SubstationFilters';
import { SubstationsList } from './SubstationsList';

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

export function SubstationsOverview() {
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [filteredSubstations, setFilteredSubstations] = useState<Substation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSubstation, setSelectedSubstation] = useState<Substation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const loadSubstations = async () => {
    try {
      console.log('Loading substations data...');
      
      const { data, error } = await supabase
        .from('substations')
        .select('*')
        .order('capacity_mva', { ascending: false });

      if (error) {
        console.error('Error loading substations:', error);
        toast({
          title: "Error Loading Data",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const substationsData = data || [];
      setSubstations(substationsData);
      setFilteredSubstations(substationsData);
      
      console.log('Substations loaded:', substationsData.length, 'substations');
    } catch (error) {
      console.error('Error loading substations:', error);
      toast({
        title: "Error",
        description: "Failed to load substations data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubstations();
  }, []);

  useEffect(() => {
    let filtered = substations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.utility_owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply state filter
    if (stateFilter !== 'all') {
      filtered = filtered.filter(sub => sub.state === stateFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(sub => sub.interconnection_type === typeFilter);
    }

    setFilteredSubstations(filtered);
  }, [substations, searchTerm, stateFilter, typeFilter]);

  const handleSubstationClick = (substation: Substation) => {
    setSelectedSubstation(substation);
    setIsModalOpen(true);
  };

  const uniqueStates = [...new Set(substations.map(sub => sub.state))].sort();
  const uniqueTypes = [...new Set(substations.map(sub => sub.interconnection_type))].sort();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Zap className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading substations data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SubstationStatsCards 
        substations={filteredSubstations} 
        uniqueStates={uniqueStates} 
      />

      <SubstationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        uniqueStates={uniqueStates}
        uniqueTypes={uniqueTypes}
      />

      <SubstationsList
        substations={filteredSubstations}
        totalCount={substations.length}
        onSubstationClick={handleSubstationClick}
      />

      <SubstationDetailsModal
        substation={selectedSubstation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
