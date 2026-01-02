import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Zap, Droplets, Wind, TrendingDown } from 'lucide-react';

const InteractivePUEComparison = () => {
  const [powerCapacity, setPowerCapacity] = useState(100); // MW

  const airCooledPUE = 1.4;
  const hydroCooledPUE = 1.05;

  const calculations = useMemo(() => {
    const itLoad = powerCapacity; // MW IT load
    
    // Total facility power = IT Load × PUE
    const airCooledTotal = itLoad * airCooledPUE;
    const hydroCooledTotal = itLoad * hydroCooledPUE;
    
    // Cooling overhead
    const airCooledOverhead = airCooledTotal - itLoad;
    const hydroCooledOverhead = hydroCooledTotal - itLoad;
    
    // Annual energy (assuming 8760 hours/year)
    const hoursPerYear = 8760;
    const airCooledAnnualMWh = airCooledTotal * hoursPerYear;
    const hydroCooledAnnualMWh = hydroCooledTotal * hoursPerYear;
    
    // Cost savings (assuming $50/MWh average)
    const energyCost = 50;
    const annualSavings = (airCooledAnnualMWh - hydroCooledAnnualMWh) * energyCost;
    
    // CO2 savings (assuming 0.4 tons CO2/MWh)
    const co2Factor = 0.4;
    const co2Savings = (airCooledAnnualMWh - hydroCooledAnnualMWh) * co2Factor;
    
    return {
      airCooledTotal,
      hydroCooledTotal,
      airCooledOverhead,
      hydroCooledOverhead,
      airCooledAnnualMWh,
      hydroCooledAnnualMWh,
      annualSavings,
      co2Savings,
      efficiencyGain: ((airCooledPUE - hydroCooledPUE) / airCooledPUE * 100).toFixed(1)
    };
  }, [powerCapacity]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toFixed(1);
  };

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">PUE Comparison Calculator</h3>
            <p className="text-sm text-muted-foreground">See the efficiency impact of hydro vs air cooling</p>
          </div>
        </div>

        {/* Capacity Slider */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            IT Load Capacity: {powerCapacity} MW
          </label>
          <Slider
            value={[powerCapacity]}
            onValueChange={([value]) => setPowerCapacity(value)}
            min={10}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>10 MW</span>
            <span>500 MW</span>
          </div>
        </div>

        {/* Visual Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Air Cooled */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Air-Cooled</h4>
                <span className="text-2xl font-bold text-orange-600">PUE {airCooledPUE}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Facility Power</span>
                  <span className="font-mono text-foreground">{calculations.airCooledTotal.toFixed(1)} MW</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${(powerCapacity / calculations.airCooledTotal) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-sm py-2 border-t border-orange-200">
                <span className="text-muted-foreground">Cooling Overhead</span>
                <span className="font-mono text-red-600">+{calculations.airCooledOverhead.toFixed(1)} MW</span>
              </div>
              
              <div className="p-3 rounded-lg bg-white/50">
                <div className="text-xs text-muted-foreground">Annual Energy</div>
                <div className="text-lg font-bold text-foreground">{formatNumber(calculations.airCooledAnnualMWh)} MWh</div>
              </div>
            </div>
          </div>

          {/* Hydro Cooled */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Hydro-Cooled</h4>
                <span className="text-2xl font-bold text-blue-600">PUE {hydroCooledPUE}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Facility Power</span>
                  <span className="font-mono text-foreground">{calculations.hydroCooledTotal.toFixed(1)} MW</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${(powerCapacity / calculations.hydroCooledTotal) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-sm py-2 border-t border-blue-200">
                <span className="text-muted-foreground">Cooling Overhead</span>
                <span className="font-mono text-green-600">+{calculations.hydroCooledOverhead.toFixed(1)} MW</span>
              </div>
              
              <div className="p-3 rounded-lg bg-white/50">
                <div className="text-xs text-muted-foreground">Annual Energy</div>
                <div className="text-lg font-bold text-foreground">{formatNumber(calculations.hydroCooledAnnualMWh)} MWh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white text-center">
            <Zap className="w-6 h-6 mx-auto mb-2" />
            <div className="text-xs opacity-80">Efficiency Gain</div>
            <div className="text-2xl font-bold">{calculations.efficiencyGain}%</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-center">
            <TrendingDown className="w-6 h-6 mx-auto mb-2" />
            <div className="text-xs opacity-80">Annual Savings</div>
            <div className="text-2xl font-bold">${formatNumber(calculations.annualSavings)}</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-center">
            <svg className="w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div className="text-xs opacity-80">CO₂ Reduced</div>
            <div className="text-2xl font-bold">{formatNumber(calculations.co2Savings)} t</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractivePUEComparison;
