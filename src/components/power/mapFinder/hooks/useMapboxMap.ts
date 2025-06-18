
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox public token
mapboxgl.accessToken = 'pk.eyJ1Ijoidm9sdHNjb3V0IiwiYSI6ImNtYnpqeWtmeDF5YjkycXB2MzQ3YWk0YzIifQ.YkeTxxJcGkgHTpt9miLk6A';

export function useMapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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

  return {
    mapContainer,
    map: map.current,
    isMapLoaded
  };
}
