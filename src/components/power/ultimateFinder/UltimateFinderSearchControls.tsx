
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Target, Shield, Zap } from 'lucide-react';
import { TEXAS_CITIES, ALBERTA_CITIES } from './UltimateFinderTypes';

interface UltimateFinderSearchControlsProps {
  searchRegion: 'alberta' | 'texas';
  setSearchRegion: (region: 'alberta' | 'texas') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  centerCoordinates: string;
  setCenterCoordinates: (coords: string) => void;
  searching: boolean;
  progress: number;
  currentPhase: string;
  onExecuteSearch: () => void;
}

export function UltimateFinderSearchControls({
  searchRegion,
  setSearchRegion,
  selectedCity,
  setSelectedCity,
  centerCoordinates,
  setCenterCoordinates,
  searching,
  progress,
  currentPhase,
  onExecuteSearch
}: UltimateFinderSearchControlsProps) {
  const getCitiesForRegion = () => {
    return searchRegion === 'texas' ? TEXAS_CITIES : ALBERTA_CITIES;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Search Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Target Region</label>
            <select 
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
              value={searchRegion}
              onChange={(e) => setSearchRegion(e.target.value as 'alberta' | 'texas')}
            >
              <option value="texas">Texas (ERCOT) - Full State Coverage</option>
              <option value="alberta">Alberta (AESO) - Full Province Coverage</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">City Filter (Optional)</label>
            <select 
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {getCitiesForRegion().map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Focus Coordinates (optional)</label>
            <Input
              value={centerCoordinates}
              onChange={(e) => setCenterCoordinates(e.target.value)}
              placeholder="lat, lng (for prioritization)"
              className="p-3"
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Industrial Rate Analysis Configuration
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Rate estimations calculated for <strong>50 MW large industrial client</strong> with 24/7 operations
            {selectedCity !== 'All Cities' && (
              <span className="block mt-1">
                <strong>City Focus:</strong> {selectedCity}, {searchRegion === 'texas' ? 'Texas' : 'Alberta'}
              </span>
            )}
          </p>
        </div>

        <Button 
          onClick={onExecuteSearch}
          disabled={searching}
          className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Shield className="w-5 h-5 mr-2" />
          Execute {selectedCity !== 'All Cities' ? `${selectedCity} ` : 'Region-Wide '}Ultimate Search with Rate Analysis
        </Button>

        {searching && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{currentPhase}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
