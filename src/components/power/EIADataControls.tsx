
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

interface EIADataControlsProps {
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedFuelType: string;
  setSelectedFuelType: (fuelType: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export function EIADataControls({ 
  selectedState, 
  setSelectedState, 
  selectedFuelType, 
  setSelectedFuelType, 
  loading, 
  onRefresh 
}: EIADataControlsProps) {
  const states = [
    'TX', 'CA', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
    'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI'
  ];

  const fuelTypes = [
    { value: 'all', label: 'All Fuel Types' },
    { value: 'NG', label: 'Natural Gas' },
    { value: 'COL', label: 'Coal' },
    { value: 'NUC', label: 'Nuclear' },
    { value: 'SUN', label: 'Solar' },
    { value: 'WND', label: 'Wind' },
    { value: 'WAT', label: 'Hydro' },
    { value: 'OIL', label: 'Oil' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Query Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">State</label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Fuel Type (Optional)</label>
            <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fuelTypes.map(fuel => (
                  <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={onRefresh} 
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
