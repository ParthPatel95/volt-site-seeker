
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, Trash2, RefreshCw } from 'lucide-react';
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
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSubstation, setSelectedSubstation] = useState<Substation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const loadSubstations = async () => {
    try {
      console.log('Loading substations data...');
      setLoading(true);
      
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

  const deleteAllSubstations = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('substations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;

      toast({
        title: "All Substations Deleted",
        description: "Successfully deleted all stored substations",
      });

      // Reload the data
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Substations Database</h2>
          <p className="text-muted-foreground">Manage and analyze power infrastructure substations</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={loadSubstations}
            disabled={loading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {substations.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={deleting}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Substations</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete ALL {substations.length} substations from the database? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAllSubstations}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

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
