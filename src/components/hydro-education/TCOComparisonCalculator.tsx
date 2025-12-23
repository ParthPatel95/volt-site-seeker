import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp, Clock, Zap, Droplets, Wind } from 'lucide-react';

const TCOComparisonCalculator = () => {
  const [capacity, setCapacity] = useState(100); // MW
  const [electricityRate, setElectricityRate] = useState(0.05); // $/kWh
  const [years, setYears] = useState(5);

  const calculations = useMemo(() => {
    const hoursPerYear = 8760;
    
    // Air-cooled assumptions
    const airCooledPUE = 1.4;
    const airCooledCapex = capacity * 180000; // $180k/MW infrastructure
    const airCooledOpex = capacity * airCooledPUE * 1000 * hoursPerYear * electricityRate; // Annual
    
    // Hydro-cooled assumptions  
    const hydroCooledPUE = 1.05;
    const hydroCooledCapex = capacity * 250000; // $250k/MW infrastructure (higher initial)
    const hydroCooledOpex = capacity * hydroCooledPUE * 1000 * hoursPerYear * electricityRate;
    
    // Additional hydro costs
    const waterSystemCapex = capacity * 20000; // $20k/MW for water infrastructure
    const waterOpex = capacity * 5000; // $5k/MW/year water treatment & maintenance
    
    const totalHydroCapex = hydroCooledCapex + waterSystemCapex;
    const totalHydroOpex = hydroCooledOpex + waterOpex;
    
    // Multi-year TCO
    const airCooledTCO = Array.from({ length: years }, (_, i) => 
      airCooledCapex + (airCooledOpex * (i + 1))
    );
    
    const hydroCooledTCO = Array.from({ length: years }, (_, i) => 
      totalHydroCapex + (totalHydroOpex * (i + 1))
    );
    
    // Find breakeven year
    let breakevenYear = null;
    for (let i = 0; i < years; i++) {
      if (hydroCooledTCO[i] < airCooledTCO[i]) {
        breakevenYear = i + 1;
        break;
      }
    }
    
    const annualSavings = airCooledOpex - totalHydroOpex;
    const capexDifference = totalHydroCapex - airCooledCapex;
    const paybackYears = annualSavings > 0 ? capexDifference / annualSavings : Infinity;
    
    return {
      airCooledCapex,
      hydroCooledCapex: totalHydroCapex,
      airCooledOpex,
      hydroCooledOpex: totalHydroOpex,
      airCooledTCO,
      hydroCooledTCO,
      breakevenYear,
      annualSavings,
      capexDifference,
      paybackYears,
      finalSavings: airCooledTCO[years - 1] - hydroCooledTCO[years - 1]
    };
  }, [capacity, electricityRate, years]);

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const maxTCO = Math.max(
    calculations.airCooledTCO[years - 1],
    calculations.hydroCooledTCO[years - 1]
  );

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6" />
            <h3 className="text-xl font-bold">Total Cost of Ownership Calculator</h3>
          </div>
          <p className="text-white/80 text-sm">
            Compare long-term costs between hydro-cooled and air-cooled infrastructure
          </p>
        </div>

        <div className="p-6">
          {/* Inputs */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <Label className="text-sm text-muted-foreground">Capacity (MW)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Slider
                  value={[capacity]}
                  onValueChange={([value]) => setCapacity(value)}
                  min={10}
                  max={500}
                  step={10}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-20 text-center"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Electricity Rate ($/kWh)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Slider
                  value={[electricityRate * 100]}
                  onValueChange={([value]) => setElectricityRate(value / 100)}
                  min={1}
                  max={15}
                  step={0.5}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={electricityRate}
                  onChange={(e) => setElectricityRate(Number(e.target.value))}
                  step={0.01}
                  className="w-20 text-center"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Analysis Period (Years)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Slider
                  value={[years]}
                  onValueChange={([value]) => setYears(value)}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          {/* CAPEX vs OPEX Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Air Cooled */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold text-foreground">Air-Cooled</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CAPEX</span>
                  <span className="font-mono font-semibold">{formatCurrency(calculations.airCooledCapex)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual OPEX</span>
                  <span className="font-mono font-semibold">{formatCurrency(calculations.airCooledOpex)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-orange-200">
                  <span className="font-medium">{years}-Year TCO</span>
                  <span className="font-mono font-bold text-orange-600">
                    {formatCurrency(calculations.airCooledTCO[years - 1])}
                  </span>
                </div>
              </div>
            </div>

            {/* Hydro Cooled */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-foreground">Hydro-Cooled</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CAPEX</span>
                  <span className="font-mono font-semibold">{formatCurrency(calculations.hydroCooledCapex)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual OPEX</span>
                  <span className="font-mono font-semibold">{formatCurrency(calculations.hydroCooledOpex)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="font-medium">{years}-Year TCO</span>
                  <span className="font-mono font-bold text-blue-600">
                    {formatCurrency(calculations.hydroCooledTCO[years - 1])}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TCO Timeline Visualization */}
          <div className="mb-8">
            <h4 className="font-semibold text-foreground mb-4">TCO Over Time</h4>
            <div className="space-y-3">
              {Array.from({ length: years }, (_, i) => {
                const year = i + 1;
                const airTCO = calculations.airCooledTCO[i];
                const hydroTCO = calculations.hydroCooledTCO[i];
                const isBreakeven = calculations.breakevenYear === year;
                
                return (
                  <div key={year} className="relative">
                    <div className="flex items-center gap-4 mb-1">
                      <span className={`w-16 text-sm font-medium ${isBreakeven ? 'text-green-600' : 'text-foreground'}`}>
                        Year {year}
                        {isBreakeven && ' ✓'}
                      </span>
                      <div className="flex-1 flex gap-2">
                        {/* Air */}
                        <div className="flex-1">
                          <div 
                            className="h-6 bg-gradient-to-r from-orange-400 to-orange-500 rounded-r flex items-center justify-end pr-2"
                            style={{ width: `${(airTCO / maxTCO) * 100}%` }}
                          >
                            <span className="text-xs text-white font-mono">{formatCurrency(airTCO)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-16"></span>
                      <div className="flex-1">
                        {/* Hydro */}
                        <div 
                          className="h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-r flex items-center justify-end pr-2"
                          style={{ width: `${(hydroTCO / maxTCO) * 100}%` }}
                        >
                          <span className="text-xs text-white font-mono">{formatCurrency(hydroTCO)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-400 to-orange-500" />
                <span className="text-muted-foreground">Air-Cooled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-400 to-blue-500" />
                <span className="text-muted-foreground">Hydro-Cooled</span>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-xs text-green-600">Annual Savings</div>
              <div className="text-xl font-bold text-green-700">{formatCurrency(calculations.annualSavings)}</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xs text-blue-600">Payback Period</div>
              <div className="text-xl font-bold text-blue-700">
                {calculations.paybackYears < 10 ? `${calculations.paybackYears.toFixed(1)} yrs` : 'N/A'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-xs text-purple-600">CAPEX Difference</div>
              <div className="text-xl font-bold text-purple-700">{formatCurrency(calculations.capexDifference)}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              <div className="text-xs text-emerald-600">{years}-Year Savings</div>
              <div className="text-xl font-bold text-emerald-700">{formatCurrency(calculations.finalSavings)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TCOComparisonCalculator;
