import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCapacityEstimator } from '@/hooks/useCapacityEstimator';
import { supabase } from '@/integrations/supabase/client';
import { SubstationFilters } from './googleFinder/components/SubstationFilters';
import { SubstationTable } from './googleFinder/components/SubstationTable';
import { useSubstationFilters } from './googleFinder/hooks/useSubstationFilters';
import { 
  Search, 
  MapPin, 
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3
} from 'lucide-react';

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
}

export function GoogleMapsSubstationFinder() {
  const [location, setLocation] = useState('');
  const [searching, setSearching] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [discoveredSubstations, setDiscoveredSubstations] = useState<DiscoveredSubstation[]>([]);
  const [storedSubstations, setStoredSubstations] = useState<DiscoveredSubstation[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { estimateCapacity } = useCapacityEstimator();

  // Filter hooks for discovered substations
  const discoveredFilters = useSubstationFilters(discoveredSubstations);
  // Filter hooks for stored substations
  const storedFilters = useSubstationFilters(storedSubstations);

  // Load stored substations from database on component mount
  useEffect(() => {
    loadStoredSubstations();
  }, []);

  const loadStoredSubstations = async () => {
    try {
      const { data, error } = await supabase
        .from('substations')
        .select('*')
        .eq('coordinates_source', 'google_maps_api')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSubstations: DiscoveredSubstation[] = data.map(sub => ({
        id: sub.id,
        name: sub.name,
        latitude: sub.latitude || 0,
        longitude: sub.longitude || 0,
        place_id: `stored_${sub.id}`,
        address: `${sub.city}, ${sub.state}`,
        capacity_estimate: {
          min: Math.round(sub.capacity_mva * 0.8), // Convert MVA to MW estimate
          max: Math.round(sub.capacity_mva),
          confidence: 0.8
        },
        analysis_status: 'completed' as const,
        stored_at: sub.created_at
      }));

      setStoredSubstations(formattedSubstations);
    } catch (error) {
      console.error('Error loading stored substations:', error);
    }
  };

  const findSubstations = async () => {
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a state or province to search for substations",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    setProgress(0);
    
    try {
      console.log('Searching for substations in:', location);
      
      const { data, error } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: { 
          location: location.trim(),
          searchRadius: 100000,
          maxResults: 100
        }
      });

      if (error) throw error;

      const substations: DiscoveredSubstation[] = data.substations.map((sub: any) => ({
        ...sub,
        analysis_status: 'pending'
      }));

      setDiscoveredSubstations(substations);
      setProgress(25);

      toast({
        title: "Substations Found",
        description: `Found ${substations.length} substations in ${location}`,
      });

      // Auto-start capacity analysis
      await analyzeAllSubstations(substations);

    } catch (error: any) {
      console.error('Substation search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search for substations",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const analyzeAllSubstations = async (substations: DiscoveredSubstation[]) => {
    setAnalyzing(true);
    const total = substations.length;
    
    for (let i = 0; i < substations.length; i++) {
      const substation = substations[i];
      
      try {
        // Update status to analyzing
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { ...s, analysis_status: 'analyzing' } 
            : s
          )
        );

        console.log(`Analyzing substation ${i + 1}/${total}:`, substation.name);

        const capacityResult = await estimateCapacity({
          latitude: substation.latitude,
          longitude: substation.longitude,
          manualOverride: {
            utilityContext: {
              name: substation.name,
              notes: `Auto-discovered via Google Maps API from ${location}`
            }
          }
        });

        const capacityEstimate = {
          min: capacityResult.estimatedCapacity.min,
          max: capacityResult.estimatedCapacity.max,
          confidence: capacityResult.detectionResults.confidence
        };

        // Update with capacity results
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { 
                ...s, 
                analysis_status: 'completed',
                capacity_estimate: capacityEstimate
              } 
            : s
          )
        );

        // Store in database
        await storeSubstationData(substation, capacityResult);

      } catch (error) {
        console.error(`Failed to analyze ${substation.name}:`, error);
        
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { ...s, analysis_status: 'failed' } 
            : s
          )
        );
      }

      // Update progress
      setProgress(25 + ((i + 1) / total) * 75);
    }

    setAnalyzing(false);
    
    // Reload stored substations to include newly added ones
    await loadStoredSubstations();
    
    toast({
      title: "Analysis Complete",
      description: `Completed capacity analysis for ${substations.length} substations and stored them in the database`,
    });
  };

  const storeSubstationData = async (substation: DiscoveredSubstation, capacityResult: any) => {
    try {
      const { error } = await supabase
        .from('substations')
        .upsert({
          name: substation.name,
          latitude: substation.latitude,
          longitude: substation.longitude,
          city: extractCityFromAddress(substation.address),
          state: extractStateFromAddress(substation.address),
          capacity_mva: capacityResult.estimatedCapacity.max * 1.25,
          voltage_level: 'Estimated',
          utility_owner: 'Unknown',
          interconnection_type: capacityResult.substationType || 'unknown',
          load_factor: 0.75,
          status: 'active',
          coordinates_source: 'google_maps_api'
        }, {
          onConflict: 'name,latitude,longitude',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error storing substation:', error);
      } else {
        console.log('Successfully stored substation:', substation.name);
      }
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  const extractCityFromAddress = (address: string): string => {
    const parts = address.split(',');
    return parts[0]?.trim() || 'Unknown';
  };

  const extractStateFromAddress = (address: string): string => {
    const parts = address.split(',');
    const statePart = parts[parts.length - 2]?.trim();
    return statePart?.split(' ')[0] || 'Unknown';
  };

  const handleViewOnMap = (substation: DiscoveredSubstation) => {
    window.open(`https://maps.google.com/?q=${substation.latitude},${substation.longitude}`, '_blank');
  };

  const getAnalysisStats = (substations: DiscoveredSubstation[]) => {
    const completed = substations.filter(s => s.analysis_status === 'completed').length;
    const analyzing = substations.filter(s => s.analysis_status === 'analyzing').length;
    const pending = substations.filter(s => s.analysis_status === 'pending').length;
    const failed = substations.filter(s => s.analysis_status === 'failed').length;
    
    return { completed, analyzing, pending, failed };
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Google Maps Substation Discovery</span>
            <Badge variant="outline">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="location">State or Province</Label>
              <Input
                id="location"
                placeholder="e.g., Texas, California, Ontario"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && findSubstations()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={findSubstations}
                disabled={searching || analyzing || !location.trim()}
                className="flex items-center space-x-2"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                <span>{searching ? 'Searching...' : 'Find Substations'}</span>
              </Button>
            </div>
          </div>

          {(searching || analyzing) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {searching ? 'Searching for substations...' : 'Analyzing capacity...'}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">
            Current Search ({discoveredSubstations.length})
          </TabsTrigger>
          <TabsTrigger value="stored">
            All Stored Substations ({storedSubstations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {discoveredSubstations.length > 0 && (
            <>
              {/* Analysis Statistics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Analysis Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const stats = getAnalysisStats(discoveredSubstations);
                      return (
                        <>
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {stats.completed}
                            </div>
                            <div className="text-sm text-muted-foreground">Completed</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {stats.analyzing}
                            </div>
                            <div className="text-sm text-muted-foreground">Analyzing</div>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                              {stats.pending}
                            </div>
                            <div className="text-sm text-muted-foreground">Pending</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {stats.failed}
                            </div>
                            <div className="text-sm text-muted-foreground">Failed</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              <SubstationFilters
                searchTerm={discoveredFilters.searchTerm}
                setSearchTerm={discoveredFilters.setSearchTerm}
                statusFilter={discoveredFilters.statusFilter}
                setStatusFilter={discoveredFilters.setStatusFilter}
                capacityFilter={discoveredFilters.capacityFilter}
                setCapacityFilter={discoveredFilters.setCapacityFilter}
                locationFilter={discoveredFilters.locationFilter}
                setLocationFilter={discoveredFilters.setLocationFilter}
                detectionMethodFilter={discoveredFilters.detectionMethodFilter}
                setDetectionMethodFilter={discoveredFilters.setDetectionMethodFilter}
                confidenceFilter={discoveredFilters.confidenceFilter}
                setConfidenceFilter={discoveredFilters.setConfidenceFilter}
                onClearFilters={discoveredFilters.clearFilters}
                totalResults={discoveredSubstations.length}
                filteredResults={discoveredFilters.filteredSubstations.length}
              />

              <SubstationTable
                substations={discoveredFilters.filteredSubstations}
                onViewOnMap={handleViewOnMap}
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
            detectionMethodFilter={storedFilters.detectionMethodFilter}
            setDetectionMethodFilter={storedFilters.setDetectionMethodFilter}
            confidenceFilter={storedFilters.confidenceFilter}
            setConfidenceFilter={storedFilters.setConfidenceFilter}
            onClearFilters={storedFilters.clearFilters}
            totalResults={storedSubstations.length}
            filteredResults={storedFilters.filteredSubstations.length}
          />

          <SubstationTable
            substations={storedFilters.filteredSubstations}
            onViewOnMap={handleViewOnMap}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
