
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, RefreshCw, Trash2, MapPin, Zap, Building2, Calendar, Activity, Eye, BarChart3 } from 'lucide-react';
import { StoredSubstation } from './UltimateFinderTypes';

interface UltimateFinderSubstationsListProps {
  storedSubstations: StoredSubstation[];
  loadingStored: boolean;
  analyzingSubstation: string | null;
  deletingSubstation: string | null;
  capacityLoading: boolean;
  onLoadStoredSubstations: () => Promise<void>;
  onSubstationClick: (substation: StoredSubstation) => void;
  onAnalyzeSubstation: (substation: StoredSubstation) => Promise<void>;
  onDeleteSubstation: (substation: StoredSubstation) => Promise<void>;
}

export function UltimateFinderSubstationsList({
  storedSubstations,
  loadingStored,
  analyzingSubstation,
  deletingSubstation,
  capacityLoading,
  onLoadStoredSubstations,
  onSubstationClick,
  onAnalyzeSubstation,
  onDeleteSubstation
}: UltimateFinderSubstationsListProps) {
  const [deletingAll, setDeletingAll] = useState(false);
  const { toast } = useToast();

  const deleteAllSubstations = async () => {
    setDeletingAll(true);
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
      await onLoadStoredSubstations();
    } catch (error: any) {
      console.error('Error deleting all substations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete all substations",
        variant: "destructive"
      });
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle>Substation Database ({storedSubstations.length})</CardTitle>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onLoadStoredSubstations}
              disabled={loadingStored}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingStored ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {storedSubstations.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    disabled={deletingAll}
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
                      Are you sure you want to delete ALL {storedSubstations.length} substations from the database? This action cannot be undone.
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
      </CardHeader>
      
      <CardContent>
        {loadingStored ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading stored substations...</p>
          </div>
        ) : storedSubstations.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No substations found in database</p>
            <p className="text-sm text-muted-foreground">
              Execute the Ultimate Search to discover and store substations
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storedSubstations.map((substation) => (
              <Card key={substation.id} className="relative hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm leading-tight">{substation.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {substation.voltage_level || 'Unknown kV'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{substation.city}, {substation.state}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{substation.capacity_mva} MVA</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{substation.utility_owner}</span>
                      </div>
                      
                      {substation.commissioning_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(substation.commissioning_date).getFullYear()}</span>
                        </div>
                      )}
                      
                      {substation.load_factor && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>{substation.load_factor}% Load Factor</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSubstationClick(substation)}
                        className="flex-1 text-xs h-7"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAnalyzeSubstation(substation)}
                        disabled={analyzingSubstation === substation.id || capacityLoading}
                        className="flex-1 text-xs h-7"
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        {analyzingSubstation === substation.id ? 'Analyzing...' : 'Analyze'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteSubstation(substation)}
                        disabled={deletingSubstation === substation.id}
                        className="px-2 text-xs h-7"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
