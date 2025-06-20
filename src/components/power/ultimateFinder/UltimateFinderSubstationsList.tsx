
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  Eye, 
  Activity, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { StoredSubstation } from './UltimateFinderTypes';

interface UltimateFinderSubstationsListProps {
  storedSubstations: StoredSubstation[];
  loadingStored: boolean;
  analyzingSubstation: string | null;
  deletingSubstation: string | null;
  capacityLoading: boolean;
  onLoadStoredSubstations: () => void;
  onSubstationClick: (substation: StoredSubstation) => void;
  onAnalyzeSubstation: (substation: StoredSubstation) => void;
  onDeleteSubstation: (substation: StoredSubstation) => void;
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Substation Database ({storedSubstations.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadStoredSubstations}
            disabled={loadingStored}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingStored ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loadingStored ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-muted-foreground">Loading substations...</p>
          </div>
        ) : storedSubstations.length > 0 ? (
          <div className="space-y-4">
            {storedSubstations.map((substation) => (
              <div key={substation.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{substation.name}</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Stored
                    </Badge>
                    <Badge variant="outline">{substation.voltage_level}</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSubstationClick(substation)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAnalyzeSubstation(substation)}
                      disabled={analyzingSubstation === substation.id || capacityLoading}
                    >
                      {analyzingSubstation === substation.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Activity className="w-4 h-4 mr-1" />
                      )}
                      Analyze
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteSubstation(substation)}
                      disabled={deletingSubstation === substation.id}
                    >
                      {deletingSubstation === substation.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Location:</strong> {substation.latitude?.toFixed(4)}, {substation.longitude?.toFixed(4)}
                  </div>
                  <div>
                    <strong>Capacity:</strong> {substation.capacity_mva} MVA
                  </div>
                  <div>
                    <strong>Owner:</strong> {substation.utility_owner}
                  </div>
                  <div>
                    <strong>Status:</strong> {substation.status}
                  </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  <strong>City:</strong> {substation.city}, {substation.state} | 
                  <strong> Added:</strong> {new Date(substation.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">No Substations Found</h3>
            <p className="text-muted-foreground">
              Execute an Ultimate Search to discover and analyze substations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
