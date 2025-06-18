
import React, { useState } from 'react';
import { MapInterface } from './mapFinder/components/MapInterface';
import { SearchStats } from './mapFinder/components/SearchStats';
import { SubstationResults } from './mapFinder/components/SubstationResults';
import { useMapboxMap } from './mapFinder/hooks/useMapboxMap';
import { useAreaSelection } from './mapFinder/hooks/useAreaSelection';
import { useMapGrid } from './mapFinder/hooks/useMapGrid';
import { useSubstationOperations } from './mapFinder/hooks/useSubstationOperations';
import { DiscoveredSubstation, SearchStats as SearchStatsType } from './mapFinder/types';

export function MapBasedSubstationFinder() {
  const { mapContainer, map, isMapLoaded } = useMapboxMap();
  const { isSelecting, selectedArea, enableAreaSelection, clearSelection } = useAreaSelection();
  const { gridCells, setGridCells, generateGrid, visualizeGrid } = useMapGrid();
  const { searchGridCell, analyzeSubstationCapacity } = useSubstationOperations();

  const [searching, setSearching] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [discoveredSubstations, setDiscoveredSubstations] = useState<DiscoveredSubstation[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStatsType>({
    totalCells: 0,
    searchedCells: 0,
    totalSubstations: 0
  });

  const handleEnableAreaSelection = () => {
    if (!map) return;
    enableAreaSelection(map, handleAreaSelected);
  };

  const handleAreaSelected = (bounds: mapboxgl.LngLatBounds) => {
    if (!map) return;
    
    const cells = generateGrid(bounds);
    setGridCells(cells);
    visualizeGrid(cells, map);
    
    setSearchStats(prev => ({
      ...prev,
      totalCells: cells.length
    }));
  };

  const handleSearchSelectedArea = async () => {
    if (!selectedArea || gridCells.length === 0) return;

    setSearching(true);
    setProgress(0);
    setDiscoveredSubstations([]);
    
    const allSubstations: DiscoveredSubstation[] = [];
    const substationMap = new Map<string, DiscoveredSubstation>();
    
    try {
      for (let i = 0; i < gridCells.length; i++) {
        const cell = gridCells[i];
        console.log(`Searching cell ${i + 1}/${gridCells.length}: ${cell.id}`);
        
        const cellSubstations = await searchGridCell(cell);
        
        // Deduplicate substations based on coordinates (within 500m)
        cellSubstations.forEach(sub => {
          const key = `${Math.round(sub.latitude * 1000)}:${Math.round(sub.longitude * 1000)}`;
          if (!substationMap.has(key)) {
            substationMap.set(key, sub);
            allSubstations.push(sub);
          }
        });

        // Update cell as searched
        cell.searched = true;
        cell.substationCount = cellSubstations.length;

        // Update progress and stats
        const progressPercent = ((i + 1) / gridCells.length) * 100;
        setProgress(progressPercent);
        setSearchStats({
          totalCells: gridCells.length,
          searchedCells: i + 1,
          totalSubstations: allSubstations.length
        });
        
        setDiscoveredSubstations([...allSubstations]);
        
        // Update grid visualization
        if (map) {
          visualizeGrid(gridCells, map);
        }
      }
      
      console.log(`Grid search completed! Found ${allSubstations.length} unique substations`);
      
      // Start capacity analysis
      if (allSubstations.length > 0) {
        setSearching(false);
        setAnalyzing(true);
        setProgress(0);
        
        for (let i = 0; i < allSubstations.length; i++) {
          const substation = allSubstations[i];
          
          try {
            substation.analysis_status = 'analyzing';
            setDiscoveredSubstations([...allSubstations]);
            
            const capacityEstimate = await analyzeSubstationCapacity(substation);
            
            substation.capacity_estimate = capacityEstimate;
            substation.analysis_status = 'completed';
          } catch (error) {
            console.error(`Failed to analyze ${substation.name}:`, error);
            substation.analysis_status = 'failed';
          }
          
          const analysisProgress = ((i + 1) / allSubstations.length) * 100;
          setProgress(analysisProgress);
          setDiscoveredSubstations([...allSubstations]);
        }
        
        setAnalyzing(false);
        console.log('Capacity analysis completed!');
      }
      
    } catch (error) {
      console.error('Grid search failed:', error);
    } finally {
      setSearching(false);
      setAnalyzing(false);
    }
  };

  const handleClearSelection = () => {
    clearSelection(map);
    setGridCells([]);
    setDiscoveredSubstations([]);
    setSearchStats({
      totalCells: 0,
      searchedCells: 0,
      totalSubstations: 0
    });
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <MapInterface
        mapContainer={mapContainer}
        isSelecting={isSelecting}
        selectedArea={selectedArea}
        searching={searching}
        analyzing={analyzing}
        progress={progress}
        searchStats={searchStats}
        onEnableAreaSelection={handleEnableAreaSelection}
        onSearchSelectedArea={handleSearchSelectedArea}
        onClearSelection={handleClearSelection}
      />
      
      <SearchStats 
        searchStats={searchStats} 
        totalCells={gridCells.length} 
      />
      
      <SubstationResults substations={discoveredSubstations} />
    </div>
  );
}
