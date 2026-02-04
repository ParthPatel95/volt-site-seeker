import { useState } from 'react';
import { Calculator, DollarSign, TrendingDown, Zap, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { AESO_TARIFF_2026 } from '@/constants/tariff-rates';
import { AESOTransmissionBadge } from '@/components/ui/rate-source-badge';

interface CalculatorResults {
  baseTransmissionCost: number;
  reductionPercent: number;
  annualSavings: number;
  costAfterSavings: number;
  hoursDown: number;
}

export default function TwelveCPCalculator() {
  const [facilityMW, setFacilityMW] = useState(50);
  const [avoidedPeaks, setAvoidedPeaks] = useState(12);
  const [hoursPerYear, setHoursPerYear] = useState(8500);

  // AESO 2026 transmission adder (CAD/MWh)
  const TRANSMISSION_ADDER = AESO_TARIFF_2026.TRANSMISSION_ADDER_CAD_MWH;

  const calculateSavings = (): CalculatorResults => {
    const baseTransmissionCost = facilityMW * TRANSMISSION_ADDER * hoursPerYear;
    const reductionPercent = (avoidedPeaks / 12) * 100;
    const annualSavings = baseTransmissionCost * (reductionPercent / 100);
    const costAfterSavings = baseTransmissionCost - annualSavings;
    const hoursDown = avoidedPeaks; // 1 hour per peak avoided

    return {
      baseTransmissionCost,
      reductionPercent,
      annualSavings,
      costAfterSavings,
      hoursDown,
    };
  };

  const results = calculateSavings();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">12CP Savings Calculator</h3>
              <p className="text-white/80 text-sm">Estimate your transmission cost savings</p>
            </div>
          </div>
          <AESOTransmissionBadge variant="compact" className="bg-white/20 border-white/30 text-white" />
        </div>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            {/* Facility Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Facility Size</label>
                <span className="text-lg font-bold text-primary">{facilityMW} MW</span>
              </div>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={facilityMW}
                onChange={(e) => setFacilityMW(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5 MW</span>
                <span>500 MW</span>
              </div>
            </div>

            {/* Peaks Avoided */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Peaks Avoided</label>
                <span className="text-lg font-bold text-primary">{avoidedPeaks} / 12</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={avoidedPeaks}
                onChange={(e) => setAvoidedPeaks(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 peaks</span>
                <span>12 peaks (max)</span>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Operating Hours/Year</label>
                <span className="text-lg font-bold text-primary">{hoursPerYear.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={4000}
                max={8760}
                step={100}
                value={hoursPerYear}
                onChange={(e) => setHoursPerYear(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>4,000 hrs</span>
                <span>8,760 hrs (24/7)</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <strong className="text-foreground">How it works:</strong> Each avoided peak reduces your 
                  transmission allocation by ~8.33%. Avoid all 12 = 100% transmission savings.
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <motion.div
              className="p-5 rounded-xl bg-muted/50 border border-border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={`base-${facilityMW}-${hoursPerYear}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Base Transmission Cost</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(results.baseTransmissionCost)}
                <span className="text-sm text-muted-foreground ml-1">/year</span>
              </p>
            </motion.div>

            <motion.div
              className="p-5 rounded-xl bg-muted/50 border border-border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={`reduction-${avoidedPeaks}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Transmission Reduction</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {results.reductionPercent.toFixed(0)}%
              </p>
            </motion.div>

            <motion.div
              className="p-5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={`savings-${facilityMW}-${avoidedPeaks}-${hoursPerYear}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" />
                <p className="text-sm text-white/80">Annual Savings</p>
              </div>
              <p className="text-4xl font-bold">
                {formatCurrency(results.annualSavings)}
              </p>
              <p className="text-sm text-white/80 mt-2">
                By curtailing for just {results.hoursDown} hour{results.hoursDown !== 1 ? 's' : ''}/year
              </p>
            </motion.div>

            {/* ROI Context */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Bitcoin Mining Context:</strong> Perfect 12CP avoidance 
                means losing only ~{results.hoursDown} hours of mining annually while saving{' '}
                <span className="text-primary font-semibold">{formatCurrency(results.annualSavings)}</span> 
                {' '}in transmission costs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
