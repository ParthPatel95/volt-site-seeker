
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, Trash2, RefreshCw } from 'lucide-react';
import { SubstationDetailsModal } from './SubstationDetailsModal';
import { SubstationStatsCards } from './SubstationStatsCards';
import { SubstationFilters } from './googleFinder/components/SubstationFilters';
import { useSubstationFilters } from './googleFinder/hooks/useSubstationFilters';
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

export function SubstationsOverview() {
  const [substations, setSubstations] = useState<DiscoveredSubstation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedSubstation, setSelectedSubstation] = useState<DiscoveredSubstation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Use the same filter hook as the other components
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

  const handleSubstationClick = (substation: DiscoveredSubstation) => {
    setSelectedSubstation(substation);
    setIsModalOpen(true);
  };

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
          <Card 
            key={substation.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSubstationClick(substation)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{substation.name}</h3>
                  <span className="text-sm text-blue-600 font-medium">
                    {substation.details?.voltage_level || 'N/A'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>📍</span>
                    <span>{substation.address}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span>⚡</span>
                    <span>{substation.capacity_estimate?.max || 0} MVA</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span>🏢</span>
                    <span>{substation.details?.utility_owner || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span>🔌</span>
                    <span>{substation.details?.interconnection_type || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span>📊</span>
                    <span>{((substation.details?.load_factor || 0) * 100).toFixed(1)}% Load Factor</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Analyze
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubstations.length === 0 && substations.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No substations match your current filters. Try adjusting your search criteria.
        </div>
      )}

      {substations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No substations found in the database.
        </div>
      )}

      <SubstationDetailsModal
        substation={selectedSubstation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
