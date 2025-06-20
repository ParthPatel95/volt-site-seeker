
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Satellite, Factory } from 'lucide-react';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
];

const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
];

interface IdleIndustryScanControlsProps {
  selectedJurisdiction: string;
  setSelectedJurisdiction: (jurisdiction: string) => void;
  scanning: boolean;
  progress: number;
  currentPhase: string;
  onExecuteScan: () => Promise<void>;
}

export function IdleIndustryScanControls({
  selectedJurisdiction,
  setSelectedJurisdiction,
  scanning,
  progress,
  currentPhase,
  onExecuteScan
}: IdleIndustryScanControlsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          <CardTitle>Scan Configuration</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Jurisdiction</label>
            <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
              <SelectTrigger>
                <SelectValue placeholder="Select state or province" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">United States</div>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {state}
                    </div>
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">Canada</div>
                {CANADIAN_PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {province}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Scan Features</label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <Factory className="w-3 h-3 mr-1" />
                Industrial Sites
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Satellite className="w-3 h-3 mr-1" />
                Satellite Analysis
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Substation Proximity
              </Badge>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">Scan Pipeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Industrial Site Discovery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Satellite Image Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>AI Idle Score Calculation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Opportunity Assessment</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onExecuteScan}
          disabled={scanning || !selectedJurisdiction}
          className="w-full"
          size="lg"
        >
          {scanning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Execute Idle Industry Scan
            </>
          )}
        </Button>

        {scanning && (
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
