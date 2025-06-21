
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Map, 
  Satellite, 
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation,
  Filter,
  Download,
  Eye,
  Zap,
  Factory
} from 'lucide-react';
import { EnhancedVerifiedSite, MapCluster } from './enhanced_types';

// Use the existing Mapbox token
mapboxgl.accessToken = 'pk.eyJ1Ijoidm9sdHNjb3V0IiwiYSI6ImNtYnpqeWtmeDF5YjkycXB2MzQ3YWk0YzIifQ.YkeTxxJcGkgHTpt9miLk6A';

interface EnhancedInteractiveMapProps {
  sites: EnhancedVerifiedSite[];
  selectedSites: string[];
  onSiteSelect: (siteId: string) => void;
  onSitesSelect: (siteIds: string[]) => void;
  filters: any;
  onFilterChange: (filters: any) => void;
}

export function EnhancedInteractiveMap({ 
  sites, 
  selectedSites, 
  onSiteSelect, 
  onSitesSelect,
  filters,
  onFilterChange
}: EnhancedInteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('mapbox://styles/mapbox/satellite-streets-v12');
  const [showClusters, setShowClusters] = useState(true);
  const [mapFilter, setMapFilter] = useState('all');
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: currentStyle,
      center: [-98.5795, 39.8283], // Center of USA
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

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      setIsLoaded(true);
      addSiteMarkers();
    });

    // Cleanup
    return () => {
      clearMarkers();
      map.current?.remove();
    };
  }, []);

  // Update map style when changed
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.setStyle(currentStyle);
      map.current.once('styledata', () => {
        addSiteMarkers();
      });
    }
  }, [currentStyle]);

  // Update markers when sites change
  useEffect(() => {
    if (map.current && isLoaded) {
      addSiteMarkers();
    }
  }, [sites, selectedSites, mapFilter, showClusters]);

  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  const addSiteMarkers = () => {
    if (!map.current || !isLoaded) return;

    clearMarkers();

    // Filter sites based on map filter
    let filteredSites = sites;
    
    if (mapFilter !== 'all') {
      switch (mapFilter) {
        case 'high-confidence':
          filteredSites = sites.filter(s => s.confidence_level === 'High');
          break;
        case 'high-power':
          filteredSites = sites.filter(s => s.power_potential === 'High');
          break;
        case 'idle':
          filteredSites = sites.filter(s => s.visual_status === 'Idle' || s.visual_status === 'Likely Abandoned');
          break;
        case 'verified':
          filteredSites = sites.filter(s => s.validation_status === 'verified');
          break;
      }
    }

    if (showClusters && filteredSites.length > 50) {
      addClusteredMarkers(filteredSites);
    } else {
      addIndividualMarkers(filteredSites);
    }
  };

  const addIndividualMarkers = (sitesToShow: EnhancedVerifiedSite[]) => {
    sitesToShow.forEach((site) => {
      if (!site.coordinates) return;

      const isSelected = selectedSites.includes(site.id);
      const markerColor = getMarkerColor(site);
      
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = `relative cursor-pointer transition-all duration-200 ${isSelected ? 'scale-125' : 'hover:scale-110'}`;
      markerElement.innerHTML = `
        <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center" style="background-color: ${markerColor}">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
        ${isSelected ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"></div>' : ''}
      `;

      // Create popup content
      const popupContent = `
        <div class="p-3 max-w-sm">
          <h3 class="font-semibold text-lg mb-2">${site.name}</h3>
          <div class="space-y-2">
            <p class="text-sm text-gray-600">${site.address}</p>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded" style="background-color: ${markerColor}20; color: ${markerColor}">
                ${site.confidence_level} Confidence (${site.confidence_score})
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="font-medium">Power Potential:</span>
                <div class="text-gray-600">${site.power_potential}</div>
              </div>
              <div>
                <span class="font-medium">Estimated Free MW:</span>
                <div class="text-gray-600">${site.estimated_free_mw || 'N/A'}</div>
              </div>
              <div>
                <span class="font-medium">Visual Status:</span>
                <div class="text-gray-600">${site.visual_status}</div>
              </div>
              <div>
                <span class="font-medium">Industry:</span>
                <div class="text-gray-600">${site.industry_type}</div>
              </div>
            </div>
            <div class="text-xs text-gray-500 mt-2">
              Sources: ${site.data_sources.join(', ')}
            </div>
          </div>
          <button 
            class="mt-3 w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            onclick="window.selectSite('${site.id}')"
          >
            ${isSelected ? 'Deselect' : 'Select'} Site
          </button>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        maxWidth: '300px'
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat([site.coordinates.lng, site.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        onSiteSelect(site.id);
      });

      markers.current.push(marker);
    });

    // Global function for popup button clicks
    (window as any).selectSite = (siteId: string) => {
      onSiteSelect(siteId);
    };
  };

  const addClusteredMarkers = (sitesToShow: EnhancedVerifiedSite[]) => {
    // Simple clustering logic - group sites within 0.1 degree radius
    const clusters: MapCluster[] = [];
    const processed = new Set<string>();

    sitesToShow.forEach(site => {
      if (processed.has(site.id) || !site.coordinates) return;

      const cluster: MapCluster = {
        id: `cluster-${clusters.length}`,
        coordinates: site.coordinates,
        count: 1,
        totalFreeMW: site.estimated_free_mw || 0,
        averageConfidence: site.confidence_score,
        sites: [site]
      };

      // Find nearby sites
      sitesToShow.forEach(otherSite => {
        if (otherSite.id === site.id || processed.has(otherSite.id) || !otherSite.coordinates) return;

        const distance = Math.sqrt(
          Math.pow(site.coordinates!.lat - otherSite.coordinates.lat, 2) +
          Math.pow(site.coordinates!.lng - otherSite.coordinates.lng, 2)
        );

        if (distance < 0.1) { // Within ~11km
          cluster.sites.push(otherSite);
          cluster.count++;
          cluster.totalFreeMW += otherSite.estimated_free_mw || 0;
          processed.add(otherSite.id);
        }
      });

      cluster.averageConfidence = Math.round(
        cluster.sites.reduce((sum, s) => sum + s.confidence_score, 0) / cluster.sites.length
      );

      processed.add(site.id);
      clusters.push(cluster);
    });

    // Add cluster markers
    clusters.forEach(cluster => {
      const markerColor = cluster.count === 1 
        ? getMarkerColor(cluster.sites[0])
        : cluster.averageConfidence >= 80 ? '#22c55e' : 
          cluster.averageConfidence >= 50 ? '#f59e0b' : '#ef4444';

      const markerElement = document.createElement('div');
      markerElement.className = 'cursor-pointer transition-all duration-200 hover:scale-110';
      
      if (cluster.count === 1) {
        // Single site marker
        const site = cluster.sites[0];
        const isSelected = selectedSites.includes(site.id);
        
        markerElement.innerHTML = `
          <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${isSelected ? 'scale-125' : ''}" style="background-color: ${markerColor}">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        `;
      } else {
        // Cluster marker
        markerElement.innerHTML = `
          <div class="w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm" style="background-color: ${markerColor}">
            ${cluster.count}
          </div>
        `;
      }

      const popupContent = cluster.count === 1 
        ? createSingleSitePopup(cluster.sites[0])
        : createClusterPopup(cluster);

      const popup = new mapboxgl.Popup({
        offset: 25,
        maxWidth: '400px'
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat([cluster.coordinates.lng, cluster.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  const createSingleSitePopup = (site: EnhancedVerifiedSite) => {
    const isSelected = selectedSites.includes(site.id);
    return `
      <div class="p-3 max-w-sm">
        <h3 class="font-semibold text-lg mb-2">${site.name}</h3>
        <div class="space-y-2">
          <p class="text-sm text-gray-600">${site.address}</p>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-1 rounded bg-gray-100">
              ${site.confidence_level} Confidence (${site.confidence_score})
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="font-medium">Power:</span> ${site.power_potential}</div>
            <div><span class="font-medium">Free MW:</span> ${site.estimated_free_mw || 'N/A'}</div>
            <div><span class="font-medium">Status:</span> ${site.visual_status}</div>
            <div><span class="font-medium">Industry:</span> ${site.industry_type}</div>
          </div>
        </div>
        <button 
          class="mt-3 w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          onclick="window.selectSite('${site.id}')"
        >
          ${isSelected ? 'Deselect' : 'Select'} Site
        </button>
      </div>
    `;
  };

  const createClusterPopup = (cluster: MapCluster) => {
    return `
      <div class="p-3 max-w-md">
        <h3 class="font-semibold text-lg mb-2">${cluster.count} Industrial Sites</h3>
        <div class="space-y-2 mb-3">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="font-medium">Avg Confidence:</span> ${cluster.averageConfidence}</div>
            <div><span class="font-medium">Total Free MW:</span> ${Math.round(cluster.totalFreeMW)}</div>
          </div>
        </div>
        <div class="max-h-32 overflow-y-auto space-y-1">
          ${cluster.sites.map(site => `
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
              <div>
                <div class="font-medium">${site.name}</div>
                <div class="text-gray-600">${site.industry_type}</div>
              </div>
              <button 
                class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onclick="window.selectSite('${site.id}')"
              >
                Select
              </button>
            </div>
          `).join('')}
        </div>
        <button 
          class="mt-3 w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          onclick="window.selectAllInCluster('${cluster.sites.map(s => s.id).join(',')}')"
        >
          Select All ${cluster.count} Sites
        </button>
      </div>
    `;
  };

  const getMarkerColor = (site: EnhancedVerifiedSite) => {
    if (site.confidence_level === 'High') return '#22c55e';
    if (site.confidence_level === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  const mapStyles = [
    { name: 'Satellite', value: 'mapbox://styles/mapbox/satellite-streets-v12', icon: Satellite },
    { name: 'Streets', value: 'mapbox://styles/mapbox/streets-v12', icon: Map },
    { name: 'Outdoors', value: 'mapbox://styles/mapbox/outdoors-v12', icon: Navigation },
    { name: 'Light', value: 'mapbox://styles/mapbox/light-v11', icon: Layers }
  ];

  const zoomToSites = () => {
    if (!map.current || sites.length === 0) return;

    const coordinates = sites
      .filter(site => site.coordinates)
      .map(site => [site.coordinates!.lng, site.coordinates!.lat] as [number, number]);

    if (coordinates.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach(coord => bounds.extend(coord));

    map.current.fitBounds(bounds, { padding: 50 });
  };

  // Global functions for popup interactions
  useEffect(() => {
    (window as any).selectSite = (siteId: string) => {
      onSiteSelect(siteId);
    };

    (window as any).selectAllInCluster = (siteIds: string) => {
      onSitesSelect(siteIds.split(','));
    };
  }, [onSiteSelect, onSitesSelect]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Enhanced Interactive Map
            <Badge variant="outline">{sites.length} sites</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={zoomToSites}>
              <Navigation className="w-4 h-4 mr-1" />
              Fit All
            </Button>
            <Button 
              size="sm" 
              variant={showClusters ? "default" : "outline"}
              onClick={() => setShowClusters(!showClusters)}
            >
              <Layers className="w-4 h-4 mr-1" />
              Cluster
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative p-0">
        {/* Map Container */}
        <div ref={mapContainer} className="w-full h-96 rounded-lg overflow-hidden" />
        
        {/* Map Controls */}
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

        {/* Filter Controls */}
        <div className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="w-4 h-4" />
              Map Filter
            </div>
            <Select value={mapFilter} onValueChange={setMapFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="high-confidence">High Confidence</SelectItem>
                <SelectItem value="high-power">High Power Potential</SelectItem>
                <SelectItem value="idle">Idle/Abandoned</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
          <h4 className="text-sm font-semibold mb-2">Site Confidence</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-xs">High (80-100)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-xs">Medium (50-79)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-xs">Low (0-49)</span>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Map className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-600">Loading Enhanced Map...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
