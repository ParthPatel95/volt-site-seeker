
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
import { MapInterface } from './mapFinder/components/MapInterface';
import { SearchStats } from './mapFinder/components/SearchStats';
import { useMapboxMap } from './mapFinder/hooks/useMapboxMap';
import { 
  Search, 
  MapPin, 
  Database,
  BarChart3,
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

// Predefined 100km x 100km sections across major US regions
const PREDEFINED_SECTIONS: PredefinedSection[] = [
  {
    id: 'texas-central',
    name: 'Central Texas',
    bounds: { north: 30.5, south: 29.6, east: -97.0, west: -98.3 },
    center: { lat: 30.05, lng: -97.65 }
  },
  {
    id: 'texas-east',
    name: 'East Texas',
    bounds: { north: 32.8, south: 31.9, east: -94.0, west: -95.3 },
    center: { lat: 32.35, lng: -94.65 }
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
  },
  {
    id: 'illinois-chicago',
    name: 'Chicago Region',
    bounds: { north: 42.4, south: 41.5, east: -87.5, west: -88.8 },
    center: { lat: 41.95, lng: -88.15 }
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
  const [searchStats, setSearchStats] = useState({
    totalCells: 0,
    searchedCells: 0,
    totalSubstations: 0
  });

  const { mapContainer, map, isMapLoaded } = useMapboxMap();
  const { toast } = useToast();
  const { estimateCapacity } = useCapacityEstimator();

  const discoveredFilters = useSubstationFilters(discoveredSubstations);
  const storedFilters = useSubstationFilters(storedSubstations);

  useEffect(() => {
    loadStoredSubstations();
  }, []);

  useEffect(() => {
    if (map && isMapLoaded) {
      addPredefinedSections();
    }
  }, [map, isMapLoaded]);

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

  const addPredefinedSections = () => {
    if (!map) return;

    // Add predefined sections as clickable areas
    PREDEFINED_SECTIONS.forEach(section => {
      const coordinates = [
        [section.bounds.west, section.bounds.south],
        [section.bounds.east, section.bounds.south],
        [section.bounds.east, section.bounds.north],
        [section.bounds.west, section.bounds.north],
        [section.bounds.west, section.bounds.south]
      ];

      // Add source for this section
      map.addSource(`section-${section.id}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          },
          properties: {
            id: section.id,
            name: section.name
          }
        }
      });

      // Add fill layer
      map.addLayer({
        id: `section-fill-${section.id}`,
        type: 'fill',
        source: `section-${section.id}`,
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.1
        }
      });

      // Add border layer
      map.addLayer({
        id: `section-border-${section.id}`,
        type: 'line',
        source: `section-${section.id}`,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // Add click handler
      map.on('click', `section-fill-${section.id}`, () => {
        setSelectedSection(section);
        toast({
          title: "Section Selected",
          description: `Selected ${section.name} for substation search`,
        });
      });

      // Add hover effect
      map.on('mouseenter', `section-fill-${section.id}`, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', `section-fill-${section.id}`, () => {
        map.getCanvas().style.cursor = '';
      });
    });
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
        description: "Please select a section on the map to search for substations",
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
          // Filter substations within the selected section bounds
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

      setSearchStats({
        totalCells: 1,
        searchedCells: 1,
        totalSubstations: substations.length
      });

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

      setProgress(25 + ((i + 1) / total) * 75);
    }

    setAnalyzing(false);
    await loadStoredSubstations();
    
    toast({
      title: "Analysis Complete",
      description: `Completed capacity analysis for ${substations.length} substations`,
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
          voltage_level: capacityResult.voltageLevel || 'Estimated',
          utility_owner: capacityResult.utilityOwner || 'Unknown',
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
      {/* Method Selection */}
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
                    placeholder="e.g., Texas, California, Ontario"
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
              <div className="relative">
                <div ref={mapContainer} className="w-full h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden border" />
                <div className="absolute top-2 left-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 max-w-48">
                  <p className="text-xs text-muted-foreground mb-2">
                    Click on a blue section to select it
                  </p>
                  {selectedSection && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{selectedSection.name}</p>
                      <Button 
                        onClick={findSubstationsMap}
                        disabled={searching || analyzing}
                        size="sm"
                        className="w-full text-xs"
                      >
                        {searching ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Search className="w-3 h-3 mr-1" />
                        )}
                        Search Area
                      </Button>
                    </div>
                  )}
                </div>
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

      {activeMethod === 'map' && (
        <SearchStats 
          searchStats={searchStats} 
          totalCells={1}
        />
      )}

      {/* Results Tabs */}
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
