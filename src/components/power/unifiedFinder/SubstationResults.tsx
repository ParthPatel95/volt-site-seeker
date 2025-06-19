import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SubstationFilters } from '../googleFinder/components/SubstationFilters';
import { SubstationTable } from '../googleFinder/components/SubstationTable';
import { useSubstationFilters } from '../googleFinder/hooks/useSubstationFilters';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';

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
  onStoredSubstationsChange?: () => void;
}

export function SubstationResults({
  discoveredSubstations,
  storedSubstations,
  onViewOnMap,
  onStoredSubstationsChange
}: SubstationResultsProps) {
  const [selectedStoredIds, setSelectedStoredIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const discoveredFilters = useSubstationFilters(discoveredSubstations);
  const storedFilters = useSubstationFilters(storedSubstations);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStoredIds(storedFilters.filteredSubstations.map(s => s.id));
    } else {
      setSelectedStoredIds([]);
    }
  };

  const handleSelectSubstation = (substationId: string, checked: boolean) => {
    if (checked) {
      setSelectedStoredIds(prev => [...prev, substationId]);
    } else {
      setSelectedStoredIds(prev => prev.filter(id => id !== substationId));
    }
  };

  const deleteSelectedSubstations = async () => {
    if (selectedStoredIds.length === 0) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('substations')
        .delete()
        .in('id', selectedStoredIds);

      if (error) throw error;

      toast({
        title: "Substations Deleted",
        description: `Successfully deleted ${selectedStoredIds.length} substation(s)`,
      });

      setSelectedStoredIds([]);
      onStoredSubstationsChange?.();
    } catch (error: any) {
      console.error('Error deleting substations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete substations",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllStoredSubstations = async () => {
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

      setSelectedStoredIds([]);
      onStoredSubstationsChange?.();
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
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
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
          
          {storedSubstations.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedStoredIds.length === storedFilters.filteredSubstations.length && storedFilters.filteredSubstations.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({storedFilters.filteredSubstations.length})
                </label>
              </div>
              
              {selectedStoredIds.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={deleting}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedStoredIds.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Substations</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedStoredIds.length} selected substation(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteSelectedSubstations}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Stored Substations</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete ALL {storedSubstations.length} stored substations? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAllStoredSubstations}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <SubstationTable
          substations={storedFilters.filteredSubstations}
          onViewOnMap={onViewOnMap}
          showCheckboxes={true}
          selectedIds={selectedStoredIds}
          onSelectionChange={handleSelectSubstation}
        />
      </TabsContent>
    </Tabs>
  );
}
