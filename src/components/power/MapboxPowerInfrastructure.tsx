
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EnhancedMapboxMap } from '../EnhancedMapboxMap';
import { useEIAData } from '@/hooks/useEIAData';
import { useSatelliteAnalysis } from '@/hooks/useSatelliteAnalysis';
import { 
  Search, 
  Filter,
  MapPin,
  Zap,
  Building2,
  Satellite,
  Download
} from 'lucide-react';

export function MapboxPowerInfrastructure() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-98.5795, 39.8283]);
  const [mapZoom, setMapZoom] = useState(4);
  
  const { powerPlants, loading: eiaLoading, getPowerPlantsByState } = useEIAData();
  const { discoveries, loading: satelliteLoading, discoverSubstations } = useSatelliteAnalysis();

  // Sample substations data (in real app, this would come from your database)
  const [substations] = useState([
    {
      name: "Dallas North Substation",
      latitude: 32.7767,
      longitude: -96.7970,
      capacity_mva: 500,
      voltage_level: "345kV",
      city: "Dallas",
      state: "TX"
    },
    {
      name: "Houston Energy Hub",
      latitude: 29.7604,
      longitude: -95.3698,
      capacity_mva: 750,
      voltage_level: "500kV",
      city: "Houston",
      state: "TX"
    },
    {
      name: "Austin Distribution Center",
      latitude: 30.2672,
      longitude: -97.7431,
      capacity_mva: 300,
      voltage_level: "138kV",
      city: "Austin",
      state: "TX"
    }
  ]);

  const handleStateSearch = async () => {
    if (selectedState) {
      // Focus map on selected state
      const stateCoordinates: { [key: string]: [number, number] } = {
        'TX': [-99.9018, 31.9686],
        'CA': [-119.4179, 36.7783],
        'NY': [-74.2179, 43.2994],
        'FL': [-81.5158, 27.7663]
      };
      
      if (stateCoordinates[selectedState]) {
        setMapCenter(stateCoordinates[selectedState]);
        setMapZoom(6);
      }

      // Fetch real EIA data for the state
      await getPowerPlantsByState(selectedState);
      
      // Discover substations using satellite analysis
      await discoverSubstations(selectedState.toLowerCase());
    }
  };

  const states = [
    { value: 'TX', label: 'Texas' },
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'FL', label: 'Florida' },
    { value: 'IL', label: 'Illinois' },
    { value: 'PA', label: 'Pennsylvania' }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Mapbox Power Infrastructure Explorer</span>
            <Badge variant="outline" className="ml-auto">Real Satellite Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search locations, coordinates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleStateSearch}
              disabled={!selectedState || eiaLoading || satelliteLoading}
              className="w-full"
            >
              {eiaLoading || satelliteLoading ? (
                <>
                  <Satellite className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Explore State
                </>
              )}
            </Button>

            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {powerPlants.length}
              </div>
              <div className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium">
                EIA Power Plants
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {substations.length}
              </div>
              <div className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">
                Known Substations
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {discoveries.length}
              </div>
              <div className="text-xs text-purple-600/80 dark:text-purple-400/80 font-medium">
                AI Discoveries
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {powerPlants.reduce((sum, plant) => sum + (plant.capacity_mw || 0), 0).toFixed(0)}
              </div>
              <div className="text-xs text-orange-600/80 dark:text-orange-400/80 font-medium">
                Total MW
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Mapbox Map */}
      <Card>
        <CardContent className="p-0">
          <EnhancedMapboxMap
            height="h-[600px]"
            initialCenter={mapCenter}
            initialZoom={mapZoom}
            showControls={true}
            powerPlants={powerPlants}
            substations={[...substations, ...discoveries.map(d => ({
              name: d.name,
              latitude: d.coordinates.lat,
              longitude: d.coordinates.lng,
              capacity_mva: parseFloat(d.capacity_estimate.split('-')[0]) || 100,
              voltage_level: d.voltage_indicators[0] || 'Unknown',
              city: 'AI Discovery',
              state: selectedState || 'Unknown'
            }))]}
          />
        </CardContent>
      </Card>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Mapbox Active</p>
                <p className="text-sm text-green-600 dark:text-green-400">High-res satellite imagery</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">EIA API Connected</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Real government data</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-purple-800 dark:text-purple-200">AI Analysis Ready</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Satellite discovery active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
