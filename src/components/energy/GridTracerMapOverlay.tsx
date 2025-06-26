
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GridTracerResults, DetectedInfrastructure } from '@/hooks/useGridLineTracer';

interface GridTracerMapOverlayProps {
  results: GridTracerResults;
  scanCenter: [number, number];
  scanRadius: number;
}

export function GridTracerMapOverlay({ 
  results, 
  scanCenter, 
  scanRadius 
}: GridTracerMapOverlayProps) {
  const getMarkerColor = (item: DetectedInfrastructure) => {
    if (item.estimatedCapacity) {
      switch (item.estimatedCapacity.color) {
        case 'green': return '#10b981';
        case 'yellow': return '#f59e0b';
        case 'red': return '#ef4444';
        default: return '#6b7280';
      }
    }
    return '#6b7280';
  };

  const getMarkerSymbol = (type: string) => {
    switch (type) {
      case 'substation': return '⚡';
      case 'transmission_line': return '⚡';
      case 'tower': return '📡';
      default: return '📍';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Scan Radius Circle */}
      <div 
        className="absolute border-2 border-blue-400 border-dashed rounded-full opacity-30"
        style={{
          width: `${scanRadius * 20}px`, // Approximate scaling
          height: `${scanRadius * 20}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Infrastructure Markers */}
      <div className="absolute inset-0">
        {results.detectedInfrastructure.map((item, index) => (
          <div
            key={item.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${50 + (item.coordinates[0] - scanCenter[0]) * 1000}%`, // Approximate positioning
              top: `${50 - (item.coordinates[1] - scanCenter[1]) * 1000}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative group">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer"
                style={{ backgroundColor: getMarkerColor(item) }}
              >
                {getMarkerSymbol(item.type)}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <div className="font-semibold">
                  {item.properties?.name || `${item.type.replace('_', ' ')}`}
                </div>
                {item.properties?.voltage && (
                  <div>{item.properties.voltage}</div>
                )}
                {item.estimatedCapacity && (
                  <div>
                    <Badge 
                      className="text-xs"
                      style={{ backgroundColor: getMarkerColor(item) }}
                    >
                      {item.estimatedCapacity.tier}
                    </Badge>
                  </div>
                )}
                <div>{item.properties?.distance?.toFixed(1)} km</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg pointer-events-auto">
        <h4 className="text-sm font-semibold mb-2">Grid Infrastructure</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available Capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Congested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>At Capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-400 border-dashed rounded-full"></div>
            <span>Scan Area ({scanRadius} km)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
