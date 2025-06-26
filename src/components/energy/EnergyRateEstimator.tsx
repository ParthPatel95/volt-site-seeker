
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { EnergyRateResults } from './EnergyRateResults';
import { EnergyRateInputForm } from './EnergyRateInputForm';
import { GridLineTracer } from './GridLineTracer';
import { useEnergyRateEstimator } from '@/hooks/useEnergyRateEstimator';
import { Calculator, Scan } from 'lucide-react';
import { EnergyRateInput } from './EnergyRateInputTypes';

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
            Energy Rate Intelligence Platform
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Calculate fully-burdened electricity costs and analyze grid infrastructure 
            with real market data, transmission analysis, and AI-powered grid tracing.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rate-calculator" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rate-calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Rate Calculator
              </TabsTrigger>
              <TabsTrigger value="grid-tracer" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Grid Line Tracer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rate-calculator" className="space-y-6">
              <EnergyRateInputForm
                input={input}
                onInputChange={setInput}
                onCalculate={handleCalculate}
                onMapClick={handleMapClick}
                loading={loading}
              />

              {results && (
                <EnergyRateResults 
                  results={results} 
                  input={input as EnergyRateInput}
                  onDownloadCSV={() => downloadCSV(results, input as EnergyRateInput)}
                  onDownloadPDF={() => downloadPDF(results, input as EnergyRateInput)}
                />
              )}
            </TabsContent>

            <TabsContent value="grid-tracer" className="space-y-6">
              <GridLineTracer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
