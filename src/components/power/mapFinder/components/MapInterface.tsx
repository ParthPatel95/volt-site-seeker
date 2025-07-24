
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map } from 'lucide-react';
import { MapControls } from './MapControls';
import { ProgressOverlay } from './ProgressOverlay';

interface MapInterfaceProps {
  mapContainer: React.RefObject<HTMLDivElement>;
  isSelecting: boolean;
  selectedArea: mapboxgl.LngLatBounds | null;
  searching: boolean;
  analyzing: boolean;
  progress: number;
  searchStats: {
    totalCells: number;
    searchedCells: number;
    totalSubstations: number;
  };
  onEnableAreaSelection: () => void;
  onSearchSelectedArea: () => void;
  onClearSelection: () => void;
}

export function MapInterface({
  mapContainer,
  isSelecting,
  selectedArea,
  searching,
  analyzing,
  progress,
  searchStats,
  onEnableAreaSelection,
  onSearchSelectedArea,
  onClearSelection
}: MapInterfaceProps) {
  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Map className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-base sm:text-lg lg:text-xl font-semibold truncate">Map-Based Substation Discovery</span>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto text-xs whitespace-nowrap">Grid Search</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 lg:p-6">
        <div className="relative">
          <div ref={mapContainer} className="w-full h-[250px] xs:h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] rounded-md sm:rounded-lg overflow-hidden border border-border" />
          
          <MapControls
            isSelecting={isSelecting}
            selectedArea={selectedArea}
            searching={searching}
            analyzing={analyzing}
            onEnableAreaSelection={onEnableAreaSelection}
            onSearchSelectedArea={onSearchSelectedArea}
            onClearSelection={onClearSelection}
          />

          <ProgressOverlay
            searching={searching}
            analyzing={analyzing}
            progress={progress}
            searchStats={searchStats}
          />
        </div>
      </CardContent>
    </Card>
  );
}
