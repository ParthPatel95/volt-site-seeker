import { useState } from "react";
import { Building2, TrendingUp, Zap, DollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const MAValuationEstimator = () => {
  const [hashrate, setHashrate] = useState(5); // PH/s
  const [powerCapacity, setPowerCapacity] = useState(50); // MW
  const [efficiency, setEfficiency] = useState(25); // J/TH
  const [powerCost, setPowerCost] = useState(4); // cents/kWh
  const [equipmentAge, setEquipmentAge] = useState<string>("new");
  const [siteCondition, setSiteCondition] = useState<string>("good");

  const calculateValuation = () => {
    // Base valuations
    const baseEVPerPH = 15000000; // $15M per PH/s base
    const baseEVPerMW = 500000; // $500K per MW base
    
    // Efficiency adjustment (lower is better)
    const efficiencyMultiplier = efficiency <= 20 ? 1.3 : 
                                  efficiency <= 25 ? 1.0 :
                                  efficiency <= 30 ? 0.85 : 0.7;
    
    // Power cost adjustment
    const powerCostMultiplier = powerCost <= 3 ? 1.4 :
                                 powerCost <= 4 ? 1.15 :
                                 powerCost <= 5 ? 1.0 :
                                 powerCost <= 6 ? 0.85 : 0.7;
    
    // Equipment age adjustment
    const ageMultiplier = equipmentAge === "new" ? 1.2 :
                          equipmentAge === "1-2years" ? 1.0 :
                          equipmentAge === "2-3years" ? 0.75 : 0.5;
    
    // Site condition adjustment
    const siteMultiplier = siteCondition === "excellent" ? 1.2 :
                           siteCondition === "good" ? 1.0 :
                           siteCondition === "fair" ? 0.85 : 0.7;

    // Calculate EV/Hash valuation
    const evPerHash = baseEVPerPH * efficiencyMultiplier * powerCostMultiplier * ageMultiplier;
    const hashValuation = hashrate * evPerHash;

    // Calculate EV/MW valuation
    const evPerMW = baseEVPerMW * powerCostMultiplier * siteMultiplier;
    const mwValuation = powerCapacity * evPerMW;

    // Blended valuation (weighted average)
    const blendedValuation = (hashValuation * 0.6) + (mwValuation * 0.4);

    // Range (±15%)
    const lowRange = blendedValuation * 0.85;
    const highRange = blendedValuation * 1.15;

    return {
      evPerHash: evPerHash / 1000000, // Convert to $M per PH
      evPerMW: evPerMW / 1000, // Convert to $K per MW
      hashValuation,
      mwValuation,
      blendedValuation,
      lowRange,
      highRange,
      efficiencyMultiplier,
      powerCostMultiplier,
      ageMultiplier,
      siteMultiplier
    };
  };

  const valuation = calculateValuation();

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 1.1) return 'text-watt-success';
    if (multiplier >= 0.9) return 'text-foreground';
    return 'text-destructive';
  };

  const getMultiplierLabel = (multiplier: number) => {
    if (multiplier >= 1.2) return 'Premium';
    if (multiplier >= 1.0) return 'Market';
    if (multiplier >= 0.8) return 'Discount';
    return 'Deep Discount';
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-watt-success/10 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-watt-success" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">M&A Valuation Estimator</h3>
          <p className="text-sm text-muted-foreground">Estimate acquisition target value</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Target Hashrate: {hashrate} PH/s
            </label>
            <Slider
              value={[hashrate]}
              onValueChange={([value]) => setHashrate(value)}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Power Capacity: {powerCapacity} MW
            </label>
            <Slider
              value={[powerCapacity]}
              onValueChange={([value]) => setPowerCapacity(value)}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Fleet Efficiency: {efficiency} J/TH
            </label>
            <Slider
              value={[efficiency]}
              onValueChange={([value]) => setEfficiency(value)}
              min={15}
              max={40}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Power Cost: ${powerCost}¢/kWh
            </label>
            <Slider
              value={[powerCost]}
              onValueChange={([value]) => setPowerCost(value)}
              min={2}
              max={8}
              step={0.5}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Equipment Age
            </label>
            <RadioGroup value={equipmentAge} onValueChange={setEquipmentAge} className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="age-new" />
                <Label htmlFor="age-new" className="text-sm">New (&lt;1 yr)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1-2years" id="age-1-2" />
                <Label htmlFor="age-1-2" className="text-sm">1-2 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2-3years" id="age-2-3" />
                <Label htmlFor="age-2-3" className="text-sm">2-3 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3plus" id="age-3plus" />
                <Label htmlFor="age-3plus" className="text-sm">3+ years</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Site Condition
            </label>
            <RadioGroup value={siteCondition} onValueChange={setSiteCondition} className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="site-excellent" />
                <Label htmlFor="site-excellent" className="text-sm">Excellent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="site-good" />
                <Label htmlFor="site-good" className="text-sm">Good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="site-fair" />
                <Label htmlFor="site-fair" className="text-sm">Fair</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="site-poor" />
                <Label htmlFor="site-poor" className="text-sm">Needs Work</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Valuation Results */}
        <div className="space-y-6">
          {/* Main Valuation */}
          <div className="bg-watt-success/5 border border-watt-success/20 rounded-xl p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Estimated Enterprise Value</div>
            <div className="text-4xl font-bold text-watt-success mb-2">
              {formatCurrency(valuation.blendedValuation)}
            </div>
            <div className="text-sm text-muted-foreground">
              Range: {formatCurrency(valuation.lowRange)} - {formatCurrency(valuation.highRange)}
            </div>
          </div>

          {/* Valuation Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <TrendingUp className="w-5 h-5 text-watt-bitcoin mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">
                ${valuation.evPerHash.toFixed(1)}M
              </div>
              <div className="text-xs text-muted-foreground">EV / PH</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <Zap className="w-5 h-5 text-watt-coinbase mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">
                ${valuation.evPerMW.toFixed(0)}K
              </div>
              <div className="text-xs text-muted-foreground">EV / MW</div>
            </div>
          </div>

          {/* Value Drivers */}
          <div className="bg-muted/20 rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Value Drivers
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Efficiency ({efficiency} J/TH)</span>
                <span className={`font-medium ${getMultiplierColor(valuation.efficiencyMultiplier)}`}>
                  {getMultiplierLabel(valuation.efficiencyMultiplier)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Power Cost (${powerCost}¢)</span>
                <span className={`font-medium ${getMultiplierColor(valuation.powerCostMultiplier)}`}>
                  {getMultiplierLabel(valuation.powerCostMultiplier)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Equipment Age</span>
                <span className={`font-medium ${getMultiplierColor(valuation.ageMultiplier)}`}>
                  {getMultiplierLabel(valuation.ageMultiplier)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Site Condition</span>
                <span className={`font-medium ${getMultiplierColor(valuation.siteMultiplier)}`}>
                  {getMultiplierLabel(valuation.siteMultiplier)}
                </span>
              </div>
            </div>
          </div>

          {/* Suggested Offer */}
          <div className="bg-watt-bitcoin/10 border border-watt-bitcoin/20 rounded-lg p-4">
            <div className="text-sm font-medium text-foreground mb-2">Suggested Offer Range</div>
            <div className="text-xl font-bold text-watt-bitcoin">
              {formatCurrency(valuation.lowRange * 0.9)} - {formatCurrency(valuation.blendedValuation)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Start negotiations at 10-15% below estimated EV
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
