
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Map, Search, Loader2 } from 'lucide-react';

interface PredefinedSection {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    lat: number;
    lng: number;
  };
}

interface SearchMethodSelectorProps {
  activeMethod: 'google' | 'map';
  setActiveMethod: (method: 'google' | 'map') => void;
  location: string;
  setLocation: (location: string) => void;
  selectedSection: PredefinedSection | null;
  setSelectedSection: (section: PredefinedSection | null) => void;
  searching: boolean;
  analyzing: boolean;
  onGoogleSearch: () => void;
  onMapSearch: () => void;
  progress: number;
}

const PREDEFINED_SECTIONS: PredefinedSection[] = [
  {
    id: 'texas-central',
    name: 'Central Texas',
    bounds: { north: 30.5, south: 29.6, east: -97.0, west: -98.3 },
    center: { lat: 30.05, lng: -97.65 }
  },
  {
    id: 'alberta-calgary',
    name: 'Calgary, Alberta',
    bounds: { north: 51.5, south: 50.6, east: -113.5, west: -114.8 },
    center: { lat: 51.05, lng: -114.15 }
  },
  {
    id: 'alberta-edmonton',
    name: 'Edmonton, Alberta',
    bounds: { north: 54.0, south: 53.1, east: -113.0, west: -114.3 },
    center: { lat: 53.55, lng: -113.65 }
  },
  {
    id: 'california-central',
    name: 'Central California',
    bounds: { north: 37.8, south: 36.9, east: -121.0, west: -122.3 },
    center: { lat: 37.35, lng: -121.65 }
  },
  {
    id: 'florida-central',
    name: 'Central Florida',
    bounds: { north: 28.8, south: 27.9, east: -80.5, west: -81.8 },
    center: { lat: 28.35, lng: -81.15 }
  },
  {
    id: 'new-york-metro',
    name: 'New York Metro',
    bounds: { north: 41.0, south: 40.1, east: -73.7, west: -75.0 },
    center: { lat: 40.55, lng: -74.35 }
  }
];

export function SearchMethodSelector({
  activeMethod,
  setActiveMethod,
  location,
  setLocation,
  selectedSection,
  setSelectedSection,
  searching,
  analyzing,
  onGoogleSearch,
  onMapSearch,
  progress
}: SearchMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant={activeMethod === 'google' ? 'default' : 'outline'}
          onClick={() => setActiveMethod('google')}
          className="flex-1 text-sm"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Google Search
        </Button>
        <Button
          variant={activeMethod === 'map' ? 'default' : 'outline'}
          onClick={() => setActiveMethod('map')}
          className="flex-1 text-sm"
        >
          <Map className="w-4 h-4 mr-2" />
          Map Sections
        </Button>
      </div>

      {activeMethod === 'google' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="location" className="text-sm">State or Province</Label>
              <Input
                id="location"
                placeholder="e.g., Texas, California, Alberta"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onGoogleSearch()}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={onGoogleSearch}
                disabled={searching || analyzing || !location.trim()}
                className="w-full sm:w-auto text-sm"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Find Substations
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select a Region (100km x 100km sections)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PREDEFINED_SECTIONS.map((section) => (
                <Button
                  key={section.id}
                  variant={selectedSection?.id === section.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSection(section)}
                  className="text-sm p-3 h-auto"
                >
                  <div className="text-left">
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs opacity-75">
                      {section.center.lat.toFixed(2)}, {section.center.lng.toFixed(2)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            {selectedSection && (
              <Button 
                onClick={onMapSearch}
                disabled={searching || analyzing}
                className="w-full sm:w-auto text-sm"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search {selectedSection.name}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
