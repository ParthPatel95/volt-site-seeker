
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Satellite, 
  Map, 
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation
} from 'lucide-react';

// Mapbox public token
mapboxgl.accessToken = 'pk.eyJ1Ijoidm9sdHNjb3V0IiwiYSI6ImNtYnpqeWtmeDF5YjkycXB2MzQ3YWk0YzIifQ.YkeTxxJcGkgHTpt9miLk6A';

interface MapboxMapProps {
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  showControls?: boolean;
  mapStyle?: string;
  powerPlants?: any[];
  substations?: any[];
}

export function EnhancedMapboxMap({ 
  height = 'h-96',
  initialCenter = [-98.5795, 39.8283], // Center of USA
  initialZoom = 4,
  showControls = true,
  mapStyle = 'mapbox://styles/mapbox/satellite-streets-v12',
  powerPlants = [],
  substations = []
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(mapStyle);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: currentStyle,
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    if (showControls) {
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
    }

    map.current.on('load', () => {
      setIsLoaded(true);
      addInfrastructureData();
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map style when changed
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.setStyle(currentStyle);
      map.current.once('styledata', () => {
        addInfrastructureData();
      });
    }
  }, [currentStyle]);

  const addInfrastructureData = () => {
    if (!map.current || !isLoaded) return;

    // Add power plants
    if (powerPlants.length > 0) {
      powerPlants.forEach((plant, index) => {
        if (plant.coordinates?.lat && plant.coordinates?.lng) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${plant.name}</h3>
              <p class="text-sm text-gray-600">${plant.capacity_mw} MW</p>
              <p class="text-sm text-gray-600">${plant.fuel_type}</p>
            </div>
          `);

          const marker = new mapboxgl.Marker({
            color: '#f59e0b', // Yellow for power plants
            scale: 0.8
          })
            .setLngLat([plant.coordinates.lng, plant.coordinates.lat])
            .setPopup(popup)
            .addTo(map.current!);
        }
      });
    }

    // Add substations
    if (substations.length > 0) {
      substations.forEach((substation, index) => {
        if (substation.latitude && substation.longitude) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${substation.name}</h3>
              <p class="text-sm text-gray-600">${substation.capacity_mva} MVA</p>
              <p class="text-sm text-gray-600">${substation.voltage_level}</p>
              <p class="text-sm text-gray-600">${substation.city}, ${substation.state}</p>
            </div>
          `);

          const marker = new mapboxgl.Marker({
            color: '#3b82f6', // Blue for substations
            scale: 0.6
          })
            .setLngLat([substation.longitude, substation.latitude])
            .setPopup(popup)
            .addTo(map.current!);
        }
      });
    }
  };

  const mapStyles = [
    { name: 'Satellite', value: 'mapbox://styles/mapbox/satellite-streets-v12', icon: Satellite },
    { name: 'Streets', value: 'mapbox://styles/mapbox/streets-v12', icon: Map },
    { name: 'Outdoors', value: 'mapbox://styles/mapbox/outdoors-v12', icon: Navigation },
    { name: 'Light', value: 'mapbox://styles/mapbox/light-v11', icon: Layers }
  ];

  const zoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  return (
    <div className="relative">
      {/* Map Container */}
      <div ref={mapContainer} className={`w-full ${height} rounded-lg overflow-hidden`} />
      
      {/* Map Style Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2">
        <div className="flex flex-col space-y-2">
          {mapStyles.map((style) => {
            const IconComponent = style.icon;
            return (
              <Button
                key={style.value}
                size="sm"
                variant={currentStyle === style.value ? "default" : "outline"}
                onClick={() => setCurrentStyle(style.value)}
                className="w-full justify-start"
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {style.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Custom Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1">
        <div className="flex flex-col space-y-1">
          <Button size="sm" variant="outline" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-semibold mb-2">Infrastructure</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs">Power Plants</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs">Substations</span>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Map className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-gray-600">Loading Mapbox...</p>
          </div>
        </div>
      )}
    </div>
  );
}
