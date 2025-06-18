
import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCapacityEstimator } from '@/hooks/useCapacityEstimator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Map, 
  Square,
  Search,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  Grid3X3
} from 'lucide-react';

// Mapbox public token
mapboxgl.accessToken = 'pk.eyJ1Ijoidm9sdHNjb3V0IiwiYSI6ImNtYnpqeWtmeDF5YjkycXB2MzQ3YWk0YzIifQ.YkeTxxJcGkgHTpt9miLk6A';

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
}

interface GridCell {
  id: string;
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
  searched: boolean;
  substationCount: number;
}

export function MapBasedSubstationFinder() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedArea, setSelectedArea] = useState<mapboxgl.LngLatBounds | null>(null);
  const [searching, setSearching] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [discoveredSubstations, setDiscoveredSubstations] = useState<DiscoveredSubstation[]>([]);
  const [progress, setProgress] = useState(0);
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [searchStats, setSearchStats] = useState({
    totalCells: 0,
    searchedCells: 0,
    totalSubstations: 0
  });
  
  const { toast } = useToast();
  const { estimateCapacity } = useCapacityEstimator();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-98.5795, 39.8283], // Center of North America
      zoom: 4,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setIsMapLoaded(true);
      
      // Add source for grid visualization
      map.current!.addSource('grid', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for grid
      map.current!.addLayer({
        id: 'grid-layer',
        type: 'line',
        source: 'grid',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 2,
          'line-opacity': 0.7
        }
      });

      // Add source for selected area
      map.current!.addSource('selected-area', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for selected area
      map.current!.addLayer({
        id: 'selected-area-layer',
        type: 'fill',
        source: 'selected-area',
        paint: {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.2
        }
      });

      // Add layer for selected area outline
      map.current!.addLayer({
        id: 'selected-area-outline',
        type: 'line',
        source: 'selected-area',
        paint: {
          'line-color': '#f59e0b',
          'line-width': 3
        }
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  const generateGrid = (bounds: mapboxgl.LngLatBounds): GridCell[] => {
    const cells: GridCell[] = [];
    const cellSizeKm = 100; // 100km x 100km cells
    
    // Convert km to approximate degrees (rough approximation)
    const latDegreePerKm = 1 / 111; // 1 degree latitude ≈ 111 km
    const cellSizeLat = cellSizeKm * latDegreePerKm;
    
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();
    
    // Calculate longitude degree per km at average latitude
    const avgLat = (north + south) / 2;
    const lngDegreePerKm = 1 / (111 * Math.cos(avgLat * Math.PI / 180));
    const cellSizeLng = cellSizeKm * lngDegreePerKm;
    
    let cellId = 0;
    for (let lat = south; lat < north; lat += cellSizeLat) {
      for (let lng = west; lng < east; lng += cellSizeLng) {
        const cellNorth = Math.min(lat + cellSizeLat, north);
        const cellEast = Math.min(lng + cellSizeLng, east);
        
        cells.push({
          id: `cell-${cellId++}`,
          bounds: {
            north: cellNorth,
            south: lat,
            east: cellEast,
            west: lng
          },
          center: {
            lat: (lat + cellNorth) / 2,
            lng: (lng + cellEast) / 2
          },
          searched: false,
          substationCount: 0
        });
      }
    }
    
    return cells;
  };

  const visualizeGrid = (cells: GridCell[]) => {
    const features = cells.map(cell => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [cell.bounds.west, cell.bounds.south],
          [cell.bounds.east, cell.bounds.south],
          [cell.bounds.east, cell.bounds.north],
          [cell.bounds.west, cell.bounds.north],
          [cell.bounds.west, cell.bounds.south]
        ]]
      },
      properties: {
        id: cell.id,
        searched: cell.searched,
        substationCount: cell.substationCount
      }
    }));

    if (map.current) {
      const source = map.current.getSource('grid') as mapboxgl.GeoJSONSource;
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  };

  const enableAreaSelection = () => {
    if (!map.current || !isMapLoaded) return;

    setIsSelecting(true);
    map.current.getCanvas().style.cursor = 'crosshair';

    let startPoint: mapboxgl.LngLat | null = null;
    let currentBox: HTMLDivElement | null = null;

    const onMouseDown = (e: mapboxgl.MapMouseEvent) => {
      startPoint = e.lngLat;
      
      // Create selection box
      currentBox = document.createElement('div');
      currentBox.style.position = 'absolute';
      currentBox.style.border = '2px solid #f59e0b';
      currentBox.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
      currentBox.style.pointerEvents = 'none';
      map.current!.getCanvasContainer().appendChild(currentBox);

      const startPixel = map.current!.project(startPoint);
      currentBox.style.left = startPixel.x + 'px';
      currentBox.style.top = startPixel.y + 'px';
    };

    const onMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (!startPoint || !currentBox) return;

      const currentPixel = map.current!.project(e.lngLat);
      const startPixel = map.current!.project(startPoint);

      const minX = Math.min(startPixel.x, currentPixel.x);
      const maxX = Math.max(startPixel.x, currentPixel.x);
      const minY = Math.min(startPixel.y, currentPixel.y);
      const maxY = Math.max(startPixel.y, currentPixel.y);

      currentBox.style.left = minX + 'px';
      currentBox.style.top = minY + 'px';
      currentBox.style.width = (maxX - minX) + 'px';
      currentBox.style.height = (maxY - minY) + 'px';
    };

    const onMouseUp = (e: mapboxgl.MapMouseEvent) => {
      if (!startPoint) return;

      const bounds = new mapboxgl.LngLatBounds()
        .extend(startPoint)
        .extend(e.lngLat);

      setSelectedArea(bounds);
      
      // Generate and visualize grid
      const cells = generateGrid(bounds);
      setGridCells(cells);
      setSearchStats({
        totalCells: cells.length,
        searchedCells: 0,
        totalSubstations: 0
      });
      visualizeGrid(cells);

      // Update selected area visualization
      const source = map.current!.getSource('selected-area') as mapboxgl.GeoJSONSource;
      source.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [bounds.getWest(), bounds.getSouth()],
              [bounds.getEast(), bounds.getSouth()],
              [bounds.getEast(), bounds.getNorth()],
              [bounds.getWest(), bounds.getNorth()],
              [bounds.getWest(), bounds.getSouth()]
            ]]
          },
          properties: {}
        }]
      });

      // Cleanup
      if (currentBox) {
        currentBox.remove();
      }
      map.current!.off('mousedown', onMouseDown);
      map.current!.off('mousemove', onMouseMove);
      map.current!.off('mouseup', onMouseUp);
      map.current!.getCanvas().style.cursor = '';
      setIsSelecting(false);
    };

    map.current.on('mousedown', onMouseDown);
    map.current.on('mousemove', onMouseMove);
    map.current.on('mouseup', onMouseUp);
  };

  const searchGridCell = async (cell: GridCell): Promise<DiscoveredSubstation[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: { 
          location: `${cell.center.lat},${cell.center.lng}`,
          searchRadius: 70000, // 70km radius to cover 100km cell with overlap
          maxResults: 500 // No artificial limit
        }
      });

      if (error) throw error;
      
      return data.substations.map((sub: any) => ({
        ...sub,
        analysis_status: 'pending'
      }));
    } catch (error) {
      console.error(`Failed to search cell ${cell.id}:`, error);
      return [];
    }
  };

  const searchSelectedArea = async () => {
    if (!selectedArea || gridCells.length === 0) {
      toast({
        title: "No Area Selected",
        description: "Please select an area on the map first",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    setProgress(0);
    setDiscoveredSubstations([]);

    const allSubstations: DiscoveredSubstation[] = [];
    const updatedCells = [...gridCells];

    for (let i = 0; i < updatedCells.length; i++) {
      const cell = updatedCells[i];
      
      try {
        console.log(`Searching cell ${i + 1}/${updatedCells.length}:`, cell.id);
        
        const cellSubstations = await searchGridCell(cell);
        
        // Filter out duplicates based on place_id
        const newSubstations = cellSubstations.filter(sub => 
          !allSubstations.find(existing => existing.place_id === sub.place_id)
        );
        
        allSubstations.push(...newSubstations);
        
        // Update cell
        updatedCells[i] = {
          ...cell,
          searched: true,
          substationCount: cellSubstations.length
        };

        // Update progress and stats
        setProgress(((i + 1) / updatedCells.length) * 50); // 50% for search phase
        setSearchStats({
          totalCells: updatedCells.length,
          searchedCells: i + 1,
          totalSubstations: allSubstations.length
        });

        // Update grid visualization
        visualizeGrid(updatedCells);

        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error searching cell ${cell.id}:`, error);
      }
    }

    setGridCells(updatedCells);
    setDiscoveredSubstations(allSubstations);
    setSearching(false);

    toast({
      title: "Search Complete",
      description: `Found ${allSubstations.length} substations across ${updatedCells.length} grid cells`,
    });

    // Auto-start capacity analysis
    if (allSubstations.length > 0) {
      await analyzeAllSubstations(allSubstations);
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
              notes: `Auto-discovered via grid search`
            }
          }
        });

        // Update with capacity results
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { 
                ...s, 
                analysis_status: 'completed',
                capacity_estimate: {
                  min: capacityResult.estimatedCapacity.min,
                  max: capacityResult.estimatedCapacity.max,
                  confidence: capacityResult.detectionResults.confidence
                }
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

      // Update progress (50% + analysis progress)
      setProgress(50 + ((i + 1) / total) * 50);
    }

    setAnalyzing(false);
    
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
          voltage_level: 'Estimated',
          utility_owner: 'Unknown',
          interconnection_type: capacityResult.substationType || 'unknown',
          load_factor: 0.75,
          status: 'active',
          coordinates_source: 'google_maps_grid_search'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'analyzing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const clearSelection = () => {
    setSelectedArea(null);
    setGridCells([]);
    setDiscoveredSubstations([]);
    setSearchStats({ totalCells: 0, searchedCells: 0, totalSubstations: 0 });
    
    if (map.current) {
      const gridSource = map.current.getSource('grid') as mapboxgl.GeoJSONSource;
      const areaSource = map.current.getSource('selected-area') as mapboxgl.GeoJSONSource;
      
      gridSource.setData({ type: 'FeatureCollection', features: [] });
      areaSource.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Map className="w-5 h-5" />
            <span>Map-Based Substation Discovery</span>
            <Badge variant="outline">Grid Search</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div ref={mapContainer} className="w-full h-[500px] rounded-lg overflow-hidden" />
            
            {/* Map Controls */}
            <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
              <div className="space-y-3">
                <Button 
                  onClick={enableAreaSelection}
                  disabled={isSelecting || searching || analyzing}
                  size="sm"
                  className="w-full"
                >
                  <Square className="w-4 h-4 mr-2" />
                  {isSelecting ? 'Draw Selection...' : 'Select Area'}
                </Button>
                
                {selectedArea && (
                  <>
                    <Button 
                      onClick={searchSelectedArea}
                      disabled={searching || analyzing}
                      size="sm"
                      variant="default"
                      className="w-full"
                    >
                      {searching ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Search Area
                    </Button>
                    
                    <Button 
                      onClick={clearSelection}
                      disabled={searching || analyzing}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      Clear Selection
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Progress Overlay */}
            {(searching || analyzing) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <Card className="p-6 min-w-[300px]">
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Grid3X3 className="w-5 h-5 animate-pulse" />
                      <span className="font-medium">
                        {searching ? 'Searching Grid Cells...' : 'Analyzing Capacity...'}
                      </span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <div className="text-sm text-gray-600">
                      {searching && (
                        <div>
                          Grid: {searchStats.searchedCells}/{searchStats.totalCells} cells
                          <br />
                          Found: {searchStats.totalSubstations} substations
                        </div>
                      )}
                      {analyzing && (
                        <div>
                          Analyzing capacity for discovered substations...
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Stats */}
      {gridCells.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5" />
              <span>Grid Search Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {searchStats.totalCells}
                </div>
                <div className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium">
                  Total Grid Cells
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {searchStats.searchedCells}
                </div>
                <div className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">
                  Searched Cells
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {searchStats.totalSubstations}
                </div>
                <div className="text-xs text-purple-600/80 dark:text-purple-400/80 font-medium">
                  Total Substations
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(searchStats.totalSubstations / Math.max(searchStats.searchedCells, 1) * 100) / 100}
                </div>
                <div className="text-xs text-orange-600/80 dark:text-orange-400/80 font-medium">
                  Avg per Cell
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {discoveredSubstations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Discovered Substations ({discoveredSubstations.length})</span>
              </div>
              <Badge variant="secondary">
                {discoveredSubstations.filter(s => s.analysis_status === 'completed').length} Analyzed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {discoveredSubstations.map((substation) => (
                <div 
                  key={substation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{substation.name}</h4>
                      {getStatusIcon(substation.analysis_status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {substation.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      {substation.latitude.toFixed(6)}, {substation.longitude.toFixed(6)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {substation.capacity_estimate && (
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {substation.capacity_estimate.min}-{substation.capacity_estimate.max} MW
                        </div>
                        <div className="text-xs text-gray-500">
                          {substation.capacity_estimate.confidence}% confidence
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
