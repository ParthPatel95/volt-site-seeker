
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { EnergyRateInput } from './EnergyRateInputTypes';

interface EnergyRateInputFormProps {
  input: Partial<EnergyRateInput>;
  onInputChange: (input: Partial<EnergyRateInput>) => void;
  onCalculate: () => void;
  onMapClick: () => void;
  loading: boolean;
}

export function EnergyRateInputForm({ 
  input, 
  onInputChange, 
  onCalculate, 
  onMapClick, 
  loading 
}: EnergyRateInputFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            placeholder="51.0447"
            value={input.latitude || ''}
            onChange={(e) => onInputChange({ ...input, latitude: parseFloat(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <div className="flex gap-2">
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              placeholder="-114.0719"
              value={input.longitude || ''}
              onChange={(e) => onInputChange({ ...input, longitude: parseFloat(e.target.value) })}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={onMapClick}
              type="button"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="load">Contracted Load (MW)</Label>
          <Input
            id="load"
            type="number"
            step="0.1"
            placeholder="25.0"
            value={input.contractedLoadMW || ''}
            onChange={(e) => onInputChange({ ...input, contractedLoadMW: parseFloat(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Customer Class</Label>
          <Select
            value={input.customerClass}
            onValueChange={(value: 'Industrial' | 'Commercial') => 
              onInputChange({ ...input, customerClass: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Industrial">Industrial</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={input.currency}
            onValueChange={(value: 'CAD' | 'USD') => 
              onInputChange({ ...input, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAD">CAD (Canadian Dollar)</SelectItem>
              <SelectItem value="USD">USD (US Dollar)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="retailAdder">
            Retail Adder (¢/kWh)
            <span className="text-xs text-muted-foreground ml-1">Optional</span>
          </Label>
          <Input
            id="retailAdder"
            type="number"
            step="0.01"
            placeholder="0.3"
            value={input.retailAdder || ''}
            onChange={(e) => onInputChange({ ...input, retailAdder: parseFloat(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">
            Additional retail markup or hedge premium
          </p>
        </div>
      </div>

      <Button 
        onClick={onCalculate} 
        disabled={loading}
        className="w-full md:w-auto"
      >
        {loading ? 'Calculating...' : 'Calculate Energy Rates'}
      </Button>
    </div>
  );
}
