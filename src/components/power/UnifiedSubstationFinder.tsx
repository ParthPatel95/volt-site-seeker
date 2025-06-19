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
  Map,
  Loader2
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

interface PredefinedSection {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    lat: number;
    lng: number;
  };
}

// Predefined 100km x 100km sections across major US and Canadian regions
const PREDEFINED_SECTIONS: PredefinedSection[] = [
  {
    id: 'texas-central',
    name: 'Central Texas',
    bounds: { north: 30.5, south: 29.6, east: -97.0, west: -98.3 },
    center: { lat: 30.05, lng: -97.65 }
  },
  {
    id: 'alberta-calgary',
    name: 'Calgary, Alberta',
    bounds: { north: 51.5, south: 50.6, east: -113.5, west: -114.8 },
    center: { lat: 51.05, lng: -114.15 }
  },
  {
    id: 'alberta-edmonton',
    name: 'Edmonton, Alberta',
    bounds: { north: 54.0, south: 53.1, east: -113.0, west: -114.3 },
    center: { lat: 53.55, lng: -113.65 }
  },
  {
    id: 'california-central',
    name: 'Central California',
    bounds: { north: 37.8, south: 36.9, east: -121.0, west: -122.3 },
    center: { lat: 37.35, lng: -121.65 }
  },
  {
    id: 'florida-central',
    name: 'Central Florida',
    bounds: { north: 28.8, south: 27.9, east: -80.5, west: -81.8 },
    center: { lat: 28.35, lng: -81.15 }
  },
  {
    id: 'new-york-metro',
    name: 'New York Metro',
    bounds: { north: 41.0, south: 40.1, east: -73.7, west: -75.0 },
    center: { lat: 40.55, lng: -74.35 }
  }
];

export function UnifiedSubstationFinder() {
  const [activeMethod, setActiveMethod] = useState<'google' | 'map'>('google');
  const [location, setLocation] = useState('');
  const [selectedSection, setSelectedSection] = useState<PredefinedSection | null>(null);
  const [searching, setSearching] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [discoveredSubstations, setDiscoveredSubstations] = useState<DiscoveredSubstation[]>([]);
  const [storedSubstations, setStoredSubstations] = useState<DiscoveredSubstation[]>([]);
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();
  const { estimateCapacity } = useCapacityEstimator();

  const discoveredFilters = useSubstationFilters(discoveredSubstations);
  const storedFilters = useSubstationFilters(storedSubstations);

  useEffect(() => {
    loadStoredSubstations();
  }, []);

  const loadStoredSubstations = async () => {
    try {
      const { data, error } = await supabase
        .from('substations')
        .select('*')
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
          min: Math.round(sub.capacity_mva * 0.8),
          max: Math.round(sub.capacity_mva),
          confidence: 0.8
        },
        analysis_status: 'completed' as const,
        stored_at: sub.created_at,
        details: {
          utility_owner: sub.utility_owner,
          voltage_level: sub.voltage_level,
          interconnection_type: sub.interconnection_type,
          commissioning_date: sub.commissioning_date,
          load_factor: sub.load_factor,
          status: sub.status
        }
      }));

      setStoredSubstations(formattedSubstations);
    } catch (error) {
      console.error('Error loading stored substations:', error);
    }
  };

  const findSubstationsGoogle = async () => {
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

  const findSubstationsMap = async () => {
    if (!selectedSection) {
      toast({
        title: "Section Required",
        description: "Please select a section below to search for substations",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    setProgress(0);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: { 
          location: `${selectedSection.center.lat},${selectedSection.center.lng}`,
          searchRadius: 70000,
          maxResults: 200
        }
      });

      if (error) throw error;

      const substations: DiscoveredSubstation[] = data.substations
        .filter((sub: any) => {
          return sub.latitude >= selectedSection.bounds.south &&
                 sub.latitude <= selectedSection.bounds.north &&
                 sub.longitude >= selectedSection.bounds.west &&
                 sub.longitude <= selectedSection.bounds.east;
        })
        .map((sub: any) => ({
          ...sub,
          analysis_status: 'pending'
        }));

      setDiscoveredSubstations(substations);
      setProgress(25);

      toast({
        title: "Substations Found",
        description: `Found ${substations.length} substations in ${selectedSection.name}`,
      });

      await analyzeAllSubstations(substations);

    } catch (error: any) {
      console.error('Map search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search selected area",
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
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { ...s, analysis_status: 'analyzing' } 
            : s
          )
        );

        // Import the ownership detection utility
        const { detectSubstationOwnership } = await import('@/utils/substationOwnership');
        
        // Detect ownership
        const ownershipResult = await detectSubstationOwnership(
          substation.name,
          substation.latitude,
          substation.longitude,
          substation.address
        );

        const capacityResult = await estimateCapacity({
          latitude: substation.latitude,
          longitude: substation.longitude,
          manualOverride: {
            utilityContext: {
              name: substation.name,
              notes: `Auto-discovered via ${activeMethod === 'google' ? 'Google API' : 'Map Search'}`
            }
          }
        });

        const capacityEstimate = {
          min: capacityResult.estimatedCapacity.min,
          max: capacityResult.estimatedCapacity.max,
          confidence: capacityResult.detectionResults.confidence
        };

        // Update substation with ownership and enhanced details
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { 
                ...s, 
                analysis_status: 'completed',
                capacity_estimate: capacityEstimate,
                details: {
                  ...s.details,
                  utility_owner: ownershipResult.owner,
                  voltage_level: capacityResult.voltageLevel || 'Estimated',
                  interconnection_type: capacityResult.substationType || 'distribution',
                  ownership_confidence: ownershipResult.confidence,
                  ownership_source: ownershipResult.source,
                  commissioning_date: new Date().toISOString(),
                  load_factor: 0.75,
                  status: 'active'
                }
              } 
            : s
          )
        );

        await storeSubstationData(substation, capacityResult, ownershipResult);

      } catch (error) {
        console.error(`Failed to analyze ${substation.name}:`, error);
        
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { ...s, analysis_status: 'failed' } 
            : s
          )
        );
      }

      setProgress(25 + ((i + 1) / total) * 75);
    }

    setAnalyzing(false);
    await loadStoredSubstations();
    
    toast({
      title: "Analysis Complete",
      description: `Completed capacity and ownership analysis for ${substations.length} substations`,
    });
  };

  const storeSubstationData = async (substation: DiscoveredSubstation, capacityResult: any, ownershipResult?: any) => {
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
          voltage_level: capacityResult.voltageLevel || 'Estimated',
          utility_owner: ownershipResult?.owner || 'Unknown',
          interconnection_type: capacityResult.substationType || 'distribution',
          load_factor: 0.75,
          status: 'active',
          coordinates_source: activeMethod === 'google' ? 'google_maps_api' : 'map_search'
        }, {
          onConflict: 'name,latitude,longitude',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error storing substation:', error);
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

  return (
    <div className="w-full space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Search className="w-5 h-5 flex-shrink-0" />
            <span className="text-base sm:text-lg">Unified Substation Finder</span>
            <Badge variant="outline" className="self-start sm:self-auto">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={activeMethod === 'google' ? 'default' : 'outline'}
              onClick={() => setActiveMethod('google')}
              className="flex-1 text-sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Google Search
            </Button>
            <Button
              variant={activeMethod === 'map' ? 'default' : 'outline'}
              onClick={() => setActiveMethod('map')}
              className="flex-1 text-sm"
            >
              <Map className="w-4 h-4 mr-2" />
              Map Sections
            </Button>
          </div>

          {activeMethod === 'google' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="location" className="text-sm">State or Province</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Texas, California, Alberta"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && findSubstationsGoogle()}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={findSubstationsGoogle}
                    disabled={searching || analyzing || !location.trim()}
                    className="w-full sm:w-auto text-sm"
                  >
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Find Substations
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select a Region (100km x 100km sections)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PREDEFINED_SECTIONS.map((section) => (
                    <Button
                      key={section.id}
                      variant={selectedSection?.id === section.id ? 'default' : 'outline'}
                      onClick={() => setSelectedSection(section)}
                      className="text-sm p-3 h-auto"
                    >
                      <div className="text-left">
                        <div className="font-medium">{section.name}</div>
                        <div className="text-xs opacity-75">
                          {section.center.lat.toFixed(2)}, {section.center.lng.toFixed(2)}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                {selectedSection && (
                  <Button 
                    onClick={findSubstationsMap}
                    disabled={searching || analyzing}
                    className="w-full sm:w-auto text-sm"
                  >
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Search {selectedSection.name}
                  </Button>
                )}
              </div>
            </div>
          )}

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
