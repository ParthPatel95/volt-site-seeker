
import React from 'react';
import { Button } from '@/components/ui/button';
import { Square, Search, Loader2 } from 'lucide-react';

interface MapControlsProps {
  isSelecting: boolean;
  selectedArea: mapboxgl.LngLatBounds | null;
  searching: boolean;
  analyzing: boolean;
  onEnableAreaSelection: () => void;
  onSearchSelectedArea: () => void;
  onClearSelection: () => void;
}

export function MapControls({
  isSelecting,
  selectedArea,
  searching,
  analyzing,
  onEnableAreaSelection,
  onSearchSelectedArea,
  onClearSelection
}: MapControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
      <div className="space-y-3">
        <Button 
          onClick={onEnableAreaSelection}
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
              onClick={onSearchSelectedArea}
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
              onClick={onClearSelection}
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
  );
}
