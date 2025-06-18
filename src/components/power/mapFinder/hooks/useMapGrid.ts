
import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { GridCell } from '../types';

export function useMapGrid() {
  const [gridCells, setGridCells] = useState<GridCell[]>([]);

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

  const visualizeGrid = (cells: GridCell[], map: mapboxgl.Map | null) => {
    if (!map) return;

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

    const source = map.getSource('grid') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features
    });
  };

  return {
    gridCells,
    setGridCells,
    generateGrid,
    visualizeGrid
  };
}
