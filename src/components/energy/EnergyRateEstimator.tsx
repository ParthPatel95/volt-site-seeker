
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EnergyRateResults } from './EnergyRateResults';
import { EnergyRateInputForm } from './EnergyRateInputForm';
import { useEnergyRateEstimator } from '@/hooks/useEnergyRateEstimator';
import { Calculator } from 'lucide-react';
import { EnergyRateInput } from './EnergyRateInputTypes';

type UIEnergyRateInput = Partial<EnergyRateInput> & {
  inputMode?: 'coords' | 'grid';
  gridRegion?: 'ERCOT' | 'AESO';
};

export function EnergyRateEstimator() {
  const [input, setInput] = useState<UIEnergyRateInput>({
    currency: 'CAD',
    customerClass: 'Industrial',
    retailAdder: 0.3,
    inputMode: 'coords'
  });
  const [results, setResults] = useState(null);
  const { calculateRates, loading, downloadCSV, downloadPDF } = useEnergyRateEstimator();
  const { toast } = useToast();

const handleCalculate = async () => {
  const usingGrid = (input as any).inputMode === 'grid';

  // Validate contracted load
  if (!input.contractedLoadMW || input.contractedLoadMW <= 0 || input.contractedLoadMW > 1000) {
    toast({
      title: "Invalid Load",
      description: "Contracted load must be between 0 and 1000 MW",
      variant: "destructive"
    });
    return;
  }

  let payload: EnergyRateInput;

  if (usingGrid) {
    const region = ((input as any).gridRegion as 'ERCOT' | 'AESO' | undefined) ?? 'AESO';

    // Representative coordinates for grid-level estimate
    const regionCoords = region === 'ERCOT'
      ? { latitude: 31.0, longitude: -97.0 } // Central Texas (ERCOT)
      : { latitude: 53.5, longitude: -113.5 }; // Central Alberta (AESO)

    // Reflect chosen coords in UI for transparency
    setInput((prev) => ({ ...(prev as any), latitude: regionCoords.latitude, longitude: regionCoords.longitude }));

    payload = {
      ...(input as EnergyRateInput),
      latitude: regionCoords.latitude,
      longitude: regionCoords.longitude,
    };
  } else {
    // Coordinate mode validation
    if (!input.latitude || !input.longitude) {
      toast({
        title: "Missing Required Fields",
        description: "Please enter latitude and longitude",
        variant: "destructive"
      });
      return;
    }

    if (Math.abs(input.latitude) > 90 || Math.abs(input.longitude) > 180) {
      toast({
        title: "Invalid Coordinates",
        description: "Latitude (-90 to 90) and longitude (-180 to 180)",
        variant: "destructive"
      });
      return;
    }

    payload = input as EnergyRateInput;
  }

  try {
    console.log('Calculating energy rates for:', payload);
    const rateResults = await calculateRates(payload);
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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calculator className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Energy Rate Estimator</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Calculate fully-burdened electricity costs for the past 12 months including market price, 
            transmission & distribution, riders, surcharges, and taxes.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <EnergyRateInputForm
            input={input}
            onInputChange={setInput}
            onCalculate={handleCalculate}
            onMapClick={handleMapClick}
            loading={loading}
          />
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
