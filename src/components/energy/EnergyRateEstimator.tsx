
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { EnergyRateResults } from './EnergyRateResults';
import { useEnergyRateEstimator } from '@/hooks/useEnergyRateEstimator';
import { MapPin, Calculator, Download } from 'lucide-react';

export interface EnergyRateInput {
  latitude: number;
  longitude: number;
  contractedLoadMW: number;
  currency: 'CAD' | 'USD';
  customerClass: 'Industrial' | 'Commercial';
  retailAdder?: number; // ¢/kWh
}

export function EnergyRateEstimator() {
  const [input, setInput] = useState<Partial<EnergyRateInput>>({
    currency: 'CAD',
    customerClass: 'Industrial',
    retailAdder: 0.3
  });
  const [results, setResults] = useState(null);
  const { calculateRates, loading, downloadCSV, downloadPDF } = useEnergyRateEstimator();
  const { toast } = useToast();

  const handleCalculate = async () => {
    // Validate inputs
    if (!input.latitude || !input.longitude || !input.contractedLoadMW) {
      toast({
        title: "Missing Required Fields",
        description: "Please enter latitude, longitude, and contracted load",
        variant: "destructive"
      });
      return;
    }

    if (Math.abs(input.latitude) > 90 || Math.abs(input.longitude) > 180) {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter valid latitude (-90 to 90) and longitude (-180 to 180)",
        variant: "destructive"
      });
      return;
    }

    if (input.contractedLoadMW <= 0 || input.contractedLoadMW > 1000) {
      toast({
        title: "Invalid Load",
        description: "Contracted load must be between 0 and 1000 MW",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Calculating energy rates for:', input);
      const rateResults = await calculateRates(input as EnergyRateInput);
      setResults(rateResults);
      
      toast({
        title: "Calculation Complete",
        description: "Energy rate estimate generated successfully"
      });
    } catch (error: any) {
      console.error('Rate calculation error:', error);
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate energy rates",
        variant: "destructive"
      });
    }
  };

  const handleMapClick = () => {
    // Future enhancement: open map picker
    toast({
      title: "Map Integration",
      description: "Map coordinate picker coming soon",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Energy Rate Estimator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Calculate fully-burdened electricity costs for the past 12 months including market price, 
            transmission & distribution, riders, surcharges, and taxes.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="51.0447"
                value={input.latitude || ''}
                onChange={(e) => setInput({ ...input, latitude: parseFloat(e.target.value) })}
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
                  onChange={(e) => setInput({ ...input, longitude: parseFloat(e.target.value) })}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMapClick}
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
                onChange={(e) => setInput({ ...input, contractedLoadMW: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Customer Class</Label>
              <Select
                value={input.customerClass}
                onValueChange={(value: 'Industrial' | 'Commercial') => 
                  setInput({ ...input, customerClass: value })
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
                  setInput({ ...input, currency: value })
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
                onChange={(e) => setInput({ ...input, retailAdder: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Additional retail markup or hedge premium
              </p>
            </div>
          </div>

          <Button 
            onClick={handleCalculate} 
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? 'Calculating...' : 'Calculate Energy Rates'}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <EnergyRateResults 
          results={results} 
          input={input as EnergyRateInput}
          onDownloadCSV={() => downloadCSV(results, input as EnergyRateInput)}
          onDownloadPDF={() => downloadPDF(results, input as EnergyRateInput)}
        />
      )}
    </div>
  );
}
