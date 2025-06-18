
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
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex items-center space-x-2">
            <Map className="w-5 h-5" />
            <span className="text-lg sm:text-xl">Map-Based Substation Discovery</span>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto">Grid Search</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="relative">
          <div ref={mapContainer} className="w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden" />
          
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
