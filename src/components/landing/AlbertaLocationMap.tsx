import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation } from 'lucide-react';
import { useMapboxConfig } from '@/hooks/useMapboxConfig';

export const AlbertaLocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { accessToken, loading, error } = useMapboxConfig();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Alberta facility coordinates (approximate central Alberta location)
  const facilityLocation: [number, number] = [-113.4937, 53.5461]; // Edmonton area

  useEffect(() => {
    if (!mapContainer.current || !accessToken || map.current) return;

    mapboxgl.accessToken = accessToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: facilityLocation,
      zoom: 5,
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
      
      if (!map.current) return;

      // Add custom marker for facility
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'hsl(var(--primary))';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 20px rgba(247, 175, 20, 0.6)';
      el.style.cursor = 'pointer';

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: hsl(var(--primary));">WattByte Alberta Facility</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px;">150 MW Data Center</p>
          <p style="margin: 0; font-size: 12px; color: #888;">Edmonton Region, Alberta, Canada</p>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat(facilityLocation)
        .setPopup(popup)
        .addTo(map.current);

      // Add glow effect around facility
      map.current.addLayer({
        id: 'facility-glow',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: facilityLocation
            },
            properties: {}
          }
        },
        paint: {
          'circle-radius': 50,
          'circle-color': 'hsl(var(--primary))',
          'circle-opacity': 0.3,
          'circle-blur': 1
        }
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [accessToken]);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-slate-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="animate-pulse text-muted-foreground">Loading map...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-slate-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center text-muted-foreground">
            Map temporarily unavailable
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-slate-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Strategic North American Location
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Positioned in Alberta's energy corridor with access to renewable power and major connectivity routes
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Map Container */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl mb-8">
            <div ref={mapContainer} className="w-full h-[400px] sm:h-[500px] md:h-[600px]" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                <div className="animate-pulse text-muted-foreground">Initializing map...</div>
              </div>
            )}
          </div>

          {/* Location Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Major Cities Proximity</h4>
                  <p className="text-sm text-muted-foreground">
                    Within 200km of Calgary and Edmonton metropolitan areas
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Fiber Connectivity</h4>
                  <p className="text-sm text-muted-foreground">
                    Direct access to trans-continental fiber optic infrastructure
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Renewable Energy Hub</h4>
                  <p className="text-sm text-muted-foreground">
                    Surrounded by wind farms and hydro facilities in Alberta's energy corridor
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
