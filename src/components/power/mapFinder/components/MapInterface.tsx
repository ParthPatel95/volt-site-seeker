
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
