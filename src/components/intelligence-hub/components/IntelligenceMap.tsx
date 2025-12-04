
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IntelOpportunity } from '../types/intelligence-hub.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, X } from 'lucide-react';

interface IntelligenceMapProps {
  opportunities: IntelOpportunity[];
  onSelectOpportunity?: (opportunity: IntelOpportunity) => void;
  selectedOpportunity?: IntelOpportunity | null;
}

const MAPBOX_TOKEN = 'pk.eyJ1Ijoid2F0dGJ5dGUiLCJhIjoiY200bGhiYmMyMHI1eTJrcjIyenJ3NXE5NSJ9.bXlLv2LCNO-B5t6j0sWpag';

export function IntelligenceMap({ opportunities, onSelectOpportunity, selectedOpportunity }: IntelligenceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const getMarkerColor = (opportunity: IntelOpportunity): string => {
    if (opportunity.metrics.confidenceLevel >= 0.8) return '#22c55e'; // green for high potential
    switch (opportunity.type) {
      case 'idle_facility': return '#eab308'; // yellow
      case 'distressed_company': return '#ef4444'; // red
      case 'power_asset': return '#3b82f6'; // blue
      default: return '#8b5cf6'; // purple
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-98.5795, 39.8283], // Center of US
        zoom: 3.5,
        pitch: 0,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setIsLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map');
        setIsLoading(false);
      });

    } catch (err) {
      console.error('Map initialization error:', err);
      setMapError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when opportunities change
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    const oppWithCoords = opportunities.filter(o => o.location.coordinates);
    
    oppWithCoords.forEach(opportunity => {
      const coords = opportunity.location.coordinates!;
      const color = getMarkerColor(opportunity);

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'intel-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        transition: transform 0.2s, box-shadow 0.2s;
      `;
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
      });

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="padding: 8px; min-width: 180px;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #111;">${opportunity.name}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${opportunity.location.city || ''}, ${opportunity.location.state || ''}</div>
            <div style="display: flex; gap: 8px; font-size: 11px;">
              ${opportunity.metrics.powerCapacityMW ? `<span style="color: #3b82f6; font-weight: 500;">${opportunity.metrics.powerCapacityMW.toFixed(0)} MW</span>` : ''}
              <span style="color: ${color}; font-weight: 500;">${Math.round(opportunity.metrics.confidenceLevel * 100)}% conf</span>
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onSelectOpportunity?.(opportunity);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if there are markers
    if (oppWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      oppWithCoords.forEach(o => {
        if (o.location.coordinates) {
          bounds.extend([o.location.coordinates.lng, o.location.coordinates.lat]);
        }
      });
      
      if (oppWithCoords.length === 1) {
        map.current.flyTo({
          center: [oppWithCoords[0].location.coordinates!.lng, oppWithCoords[0].location.coordinates!.lat],
          zoom: 10
        });
      } else {
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
      }
    }
  }, [opportunities, isLoading, onSelectOpportunity]);

  // Fly to selected opportunity
  useEffect(() => {
    if (selectedOpportunity?.location.coordinates && map.current) {
      map.current.flyTo({
        center: [selectedOpportunity.location.coordinates.lng, selectedOpportunity.location.coordinates.lat],
        zoom: 12,
        duration: 1500
      });
    }
  }, [selectedOpportunity]);

  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur rounded-lg p-3 shadow-lg">
        <p className="text-xs font-medium text-foreground mb-2">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Idle Facility</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Distressed</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Power Asset</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">High Potential</span>
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-3 text-xs">
          <Badge variant="secondary">
            {opportunities.filter(o => o.location.coordinates).length} mapped
          </Badge>
          <Badge variant="outline">
            {opportunities.length} total
          </Badge>
        </div>
      </div>
    </div>
  );
}
