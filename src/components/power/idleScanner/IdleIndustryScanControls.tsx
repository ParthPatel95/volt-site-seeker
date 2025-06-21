
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, AlertTriangle } from 'lucide-react';
import { TEXAS_CITIES, ALBERTA_CITIES } from '../ultimateFinder/UltimateFinderTypes';

interface IdleIndustryScanControlsProps {
  selectedJurisdiction: string;
  setSelectedJurisdiction: (jurisdiction: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  scanning: boolean;
  progress: number;
  currentPhase: string;
  executeScan: () => void;
  exportToCsv: () => void;
  exportToPdf: () => Promise<void>;
}

const JURISDICTIONS = [
  'Texas', 'California', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan',
  'Alberta', 'British Columbia', 'Ontario', 'Quebec'
];

export function IdleIndustryScanControls({
  selectedJurisdiction,
  setSelectedJurisdiction,
  selectedCity,
  setSelectedCity,
  scanning,
  progress,
  currentPhase,
  executeScan,
  exportToCsv,
  exportToPdf
}: IdleIndustryScanControlsProps) {
  const getCitiesForJurisdiction = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'Texas':
        return TEXAS_CITIES;
      case 'Alberta':
        return ALBERTA_CITIES;
      default:
        return [];
    }
  };

  const availableCities = getCitiesForJurisdiction(selectedJurisdiction);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Scan Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Jurisdiction *</label>
            <Select value={selectedJurisdiction} onValueChange={(value) => {
              setSelectedJurisdiction(value);
              setSelectedCity('all'); // Reset city when jurisdiction changes
            }} disabled={scanning}>
              <SelectTrigger>
                <SelectValue placeholder="Select state or province" />
              </SelectTrigger>
              <SelectContent>
                {JURISDICTIONS.map(jurisdiction => (
                  <SelectItem key={jurisdiction} value={jurisdiction}>
                    {jurisdiction}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">City (Optional)</label>
            <Select 
              value={selectedCity} 
              onValueChange={setSelectedCity} 
              disabled={scanning || !selectedJurisdiction || availableCities.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedJurisdiction 
                    ? "Select jurisdiction first" 
                    : availableCities.length === 0 
                      ? "All cities (no specific cities available)"
                      : "All cities or select specific city"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {availableCities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCity && selectedCity !== 'all' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
              <AlertTriangle className="w-4 h-4" />
              <span>City-specific scan will have smaller search radius and faster processing</span>
            </div>
          </div>
        )}

        {scanning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentPhase}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={executeScan}
          disabled={scanning || !selectedJurisdiction}
          className="w-full"
          size="lg"
        >
          {scanning ? (
            <>
              <Search className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Start Idle Industry Scan
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Scans industrial facilities for underutilization patterns</p>
          <p>• Uses AI-powered satellite imagery analysis</p>
          <p>• Estimates available power capacity for data center conversion</p>
          {selectedCity && selectedCity !== 'all' && <p>• City-specific search reduces processing time</p>}
        </div>
      </CardContent>
    </Card>
  );
}
