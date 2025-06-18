
import { useState } from 'react';
import mapboxgl from 'mapbox-gl';

export function useAreaSelection() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedArea, setSelectedArea] = useState<mapboxgl.LngLatBounds | null>(null);

  const enableAreaSelection = (map: mapboxgl.Map | null, onAreaSelected: (bounds: mapboxgl.LngLatBounds) => void) => {
    if (!map) return;

    setIsSelecting(true);
    map.getCanvas().style.cursor = 'crosshair';

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
      map.getCanvasContainer().appendChild(currentBox);

      const startPixel = map.project(startPoint);
      currentBox.style.left = startPixel.x + 'px';
      currentBox.style.top = startPixel.y + 'px';
    };

    const onMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (!startPoint || !currentBox) return;

      const currentPixel = map.project(e.lngLat);
      const startPixel = map.project(startPoint);

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
      onAreaSelected(bounds);

      // Update selected area visualization
      const source = map.getSource('selected-area') as mapboxgl.GeoJSONSource;
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
      map.off('mousedown', onMouseDown);
      map.off('mousemove', onMouseMove);
      map.off('mouseup', onMouseUp);
      map.getCanvas().style.cursor = '';
      setIsSelecting(false);
    };

    map.on('mousedown', onMouseDown);
    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);
  };

  const clearSelection = (map: mapboxgl.Map | null) => {
    setSelectedArea(null);
    
    if (map) {
      const gridSource = map.getSource('grid') as mapboxgl.GeoJSONSource;
      const areaSource = map.getSource('selected-area') as mapboxgl.GeoJSONSource;
      
      gridSource.setData({ type: 'FeatureCollection', features: [] });
      areaSource.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  return {
    isSelecting,
    selectedArea,
    enableAreaSelection,
    clearSelection
  };
}
