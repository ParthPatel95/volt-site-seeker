import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw } from "lucide-react";
import { PricePrediction } from "@/hooks/useAESOPricePrediction";

interface ScenarioAnalysisProps {
  basePrediction: PricePrediction | null;
}

export const ScenarioAnalysis = ({ basePrediction }: ScenarioAnalysisProps) => {
  const [tempAdjust, setTempAdjust] = useState(0);
  const [windAdjust, setWindAdjust] = useState(0);
  const [outageCapacity, setOutageCapacity] = useState(0);

  if (!basePrediction) return null;

  const basePrice = basePrediction.price;
  
  // Simple impact model
  const tempImpact = tempAdjust * 1.5; // $1.5/MWh per degree
  const windImpact = windAdjust * -0.8; // -$0.8/MWh per km/h wind increase
  const outageImpact = outageCapacity * 0.05; // $0.05/MWh per MW outage
  
  const adjustedPrice = basePrice + tempImpact + windImpact + outageImpact;
  const priceChange = adjustedPrice - basePrice;
  const percentChange = (priceChange / basePrice) * 100;

  const reset = () => {
    setTempAdjust(0);
    setWindAdjust(0);
    setOutageCapacity(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          What-If Scenario Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Temperature Change (°C)</Label>
              <span className="text-sm text-muted-foreground">{tempAdjust > 0 ? '+' : ''}{tempAdjust}°C</span>
            </div>
            <Slider
              value={[tempAdjust]}
              onValueChange={(v) => setTempAdjust(v[0])}
              min={-15}
              max={15}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Wind Speed Change (km/h)</Label>
              <span className="text-sm text-muted-foreground">{windAdjust > 0 ? '+' : ''}{windAdjust} km/h</span>
            </div>
            <Slider
              value={[windAdjust]}
              onValueChange={(v) => setWindAdjust(v[0])}
              min={-30}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Additional Outage Capacity (MW)</Label>
              <span className="text-sm text-muted-foreground">{outageCapacity} MW</span>
            </div>
            <Slider
              value={[outageCapacity]}
              onValueChange={(v) => setOutageCapacity(v[0])}
              min={0}
              max={2000}
              step={100}
              className="w-full"
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price:</span>
            <span className="font-medium">{basePrice.toFixed(2)} $/MWh</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Temperature Impact:</span>
            <span className={tempImpact >= 0 ? "text-destructive" : "text-green-600"}>
              {tempImpact >= 0 ? '+' : ''}{tempImpact.toFixed(2)} $/MWh
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Wind Impact:</span>
            <span className={windImpact >= 0 ? "text-destructive" : "text-green-600"}>
              {windImpact >= 0 ? '+' : ''}{windImpact.toFixed(2)} $/MWh
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Outage Impact:</span>
            <span className="text-destructive">+{outageImpact.toFixed(2)} $/MWh</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Adjusted Price:</span>
            <span className={priceChange >= 0 ? "text-destructive" : "text-green-600"}>
              {adjustedPrice.toFixed(2)} $/MWh ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)
            </span>
          </div>
        </div>

        <Button onClick={reset} variant="outline" className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Scenario
        </Button>
      </CardContent>
    </Card>
  );
};
