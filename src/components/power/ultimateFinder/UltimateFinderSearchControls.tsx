
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Zap, MapPin, Satellite, Brain } from 'lucide-react';
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
  useMLAnalysis: boolean;
  setUseMLAnalysis: (use: boolean) => void;
  onExecuteSearch: () => Promise<void>;
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
  useMLAnalysis,
  setUseMLAnalysis,
  onExecuteSearch
}: UltimateFinderSearchControlsProps) {
  const cities = searchRegion === 'texas' ? TEXAS_CITIES : ALBERTA_CITIES;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          <CardTitle>Ultimate Search Configuration</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select value={searchRegion} onValueChange={(value: 'alberta' | 'texas') => setSearchRegion(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="texas">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Texas (ERCOT)
                  </div>
                </SelectItem>
                <SelectItem value="alberta">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Alberta (AESO)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City Focus</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select city or all" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Cities">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coordinates">Center Coordinates (Optional)</Label>
          <Input
            id="coordinates"
            placeholder="e.g., 32.7767, -96.7970 (Dallas, TX)"
            value={centerCoordinates}
            onChange={(e) => setCenterCoordinates(e.target.value)}
            disabled={searching}
          />
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <Label htmlFor="ml-analysis" className="font-medium">
                  AI Satellite Analysis
                </Label>
                <Badge variant="secondary" className="text-xs">
                  <Satellite className="w-3 h-3 mr-1" />
                  Enhanced
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Use advanced AI vision to detect substations from satellite imagery. 
                Provides higher accuracy but takes longer.
              </p>
            </div>
            <Switch
              id="ml-analysis"
              checked={useMLAnalysis}
              onCheckedChange={setUseMLAnalysis}
              disabled={searching}
            />
          </div>
          
          {useMLAnalysis && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border-l-4 border-blue-200">
              <strong>AI Analysis Features:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>Multi-zoom satellite image analysis</li>
                <li>Advanced transformer and transmission line detection</li>
                <li>Voltage level estimation from equipment size</li>
                <li>Enhanced confidence scoring</li>
              </ul>
            </div>
          )}
        </div>

        <Button
          onClick={onExecuteSearch}
          disabled={searching}
          className="w-full"
          size="lg"
        >
          {searching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Execute Ultimate Search
              {useMLAnalysis && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  +AI
                </Badge>
              )}
            </>
          )}
        </Button>

        {searching && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{currentPhase}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
