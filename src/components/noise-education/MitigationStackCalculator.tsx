import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Building, Shield, Fan, Volume2, Vibrate, Mountain, Gauge, Compass, Calculator, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MitigationTechnique {
  id: string;
  name: string;
  reductionMin: number;
  reductionMax: number;
  cost: string;
  complexity: string;
  icon: typeof Building;
  diminishingFactor: number;
}

const techniques: MitigationTechnique[] = [
  { id: 'barriers', name: 'Acoustic Barrier Walls', reductionMin: 10, reductionMax: 15, cost: '$$', complexity: 'Medium', icon: Building, diminishingFactor: 1 },
  { id: 'enclosures', name: 'Acoustic Enclosures', reductionMin: 15, reductionMax: 25, cost: '$$$', complexity: 'High', icon: Shield, diminishingFactor: 0.9 },
  { id: 'low-rpm', name: 'Low-RPM Fans', reductionMin: 8, reductionMax: 12, cost: '$$', complexity: 'Low', icon: Fan, diminishingFactor: 0.85 },
  { id: 'silencers', name: 'Duct Silencers', reductionMin: 10, reductionMax: 20, cost: '$$', complexity: 'Medium', icon: Volume2, diminishingFactor: 0.8 },
  { id: 'vibration', name: 'Vibration Isolation', reductionMin: 3, reductionMax: 5, cost: '$', complexity: 'Low', icon: Vibrate, diminishingFactor: 0.75 },
  { id: 'berms', name: 'Earth Berms & Vegetation', reductionMin: 5, reductionMax: 10, cost: '$', complexity: 'Low', icon: Mountain, diminishingFactor: 0.7 },
  { id: 'vfd', name: 'Variable Frequency Drives', reductionMin: 5, reductionMax: 8, cost: '$$', complexity: 'Medium', icon: Gauge, diminishingFactor: 0.65 },
  { id: 'orientation', name: 'Strategic Orientation', reductionMin: 3, reductionMax: 8, cost: '$', complexity: 'Low', icon: Compass, diminishingFactor: 0.6 },
];

const MitigationStackCalculator = () => {
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [sourceDb, setSourceDb] = useState(81.8);

  const toggleTechnique = (id: string) => {
    setSelectedTechniques(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  // Calculate combined reduction with diminishing returns
  const calculation = useMemo(() => {
    if (selectedTechniques.length === 0) {
      return { totalMin: 0, totalMax: 0, effectiveReduction: 0, costLevel: 0, resultDb: sourceDb };
    }

    const selected = techniques.filter(t => selectedTechniques.includes(t.id));
    
    // Sort by reduction (highest first) to apply diminishing returns properly
    const sorted = [...selected].sort((a, b) => b.reductionMax - a.reductionMax);
    
    let totalMin = 0;
    let totalMax = 0;
    let costLevel = 0;
    
    sorted.forEach((tech, index) => {
      // Apply diminishing returns based on position
      const factor = Math.pow(0.85, index);
      totalMin += tech.reductionMin * factor;
      totalMax += tech.reductionMax * factor;
      costLevel += tech.cost.length;
    });

    const effectiveReduction = (totalMin + totalMax) / 2;
    const resultDb = Math.max(0, sourceDb - effectiveReduction);

    return { totalMin, totalMax, effectiveReduction, costLevel, resultDb };
  }, [selectedTechniques, sourceDb]);

  const getCostLabel = () => {
    if (calculation.costLevel <= 2) return { label: 'Low', color: 'text-[hsl(var(--watt-success))]' };
    if (calculation.costLevel <= 5) return { label: 'Medium', color: 'text-blue-500' };
    if (calculation.costLevel <= 8) return { label: 'High', color: 'text-yellow-500' };
    return { label: 'Very High', color: 'text-destructive' };
  };

  return (
    <Card className="bg-gradient-to-br from-[hsl(var(--watt-success)/0.05)] to-blue-500/5 border-2 border-[hsl(var(--watt-success)/0.2)]">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[hsl(var(--watt-success)/0.1)] rounded-lg flex items-center justify-center">
            <Calculator className="h-5 w-5 text-[hsl(var(--watt-success))]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Mitigation Stack Calculator</h3>
            <p className="text-sm text-muted-foreground">Select techniques to see combined effect</p>
          </div>
        </div>

        {/* Technique Selection Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {techniques.map((tech) => {
            const Icon = tech.icon;
            const isSelected = selectedTechniques.includes(tech.id);
            
            return (
              <motion.button
                key={tech.id}
                onClick={() => toggleTechnique(tech.id)}
                className={`relative p-4 rounded-xl text-left transition-all border-2 ${
                  isSelected 
                    ? 'bg-[hsl(var(--watt-success)/0.1)] border-[hsl(var(--watt-success))] shadow-lg' 
                    : 'bg-card border-border hover:border-[hsl(var(--watt-success)/0.5)]'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={isSelected}
                    className="mt-0.5 data-[state=checked]:bg-[hsl(var(--watt-success))] data-[state=checked]:border-[hsl(var(--watt-success))]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-[hsl(var(--watt-success))]' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-mono ${isSelected ? 'text-[hsl(var(--watt-success))]' : 'text-muted-foreground'}`}>
                        {tech.cost}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{tech.name}</p>
                    <p className="text-xs font-mono text-blue-500">
                      -{tech.reductionMin} to -{tech.reductionMax} dB
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Results Panel */}
        <div className="bg-[hsl(var(--watt-navy))] rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-[hsl(var(--watt-success))]" />
            <h4 className="font-bold">Combined Effect</h4>
            <Badge className="ml-auto bg-white/10 text-white/70">
              {selectedTechniques.length} technique{selectedTechniques.length !== 1 ? 's' : ''} selected
            </Badge>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-white/60 mb-1">Source Level</p>
              <p className="text-2xl font-bold font-mono text-[hsl(var(--watt-bitcoin))]">{sourceDb} dB</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-white/60 mb-1">Total Reduction</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={calculation.effectiveReduction.toFixed(1)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-2xl font-bold font-mono text-[hsl(var(--watt-success))]"
                >
                  -{calculation.effectiveReduction.toFixed(1)} dB
                </motion.p>
              </AnimatePresence>
              <p className="text-[10px] text-white/40">
                Range: {calculation.totalMin.toFixed(0)}-{calculation.totalMax.toFixed(0)} dB
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-white/60 mb-1">Result</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={calculation.resultDb.toFixed(1)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-2xl font-bold font-mono text-blue-400"
                >
                  {calculation.resultDb.toFixed(1)} dB
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-white/60 mb-1">Est. Cost</p>
              <p className={`text-xl font-bold ${getCostLabel().color}`}>
                {getCostLabel().label}
              </p>
            </div>
          </div>

          {selectedTechniques.length > 1 && (
            <div className="mt-4 p-3 bg-[hsl(var(--watt-bitcoin)/0.2)] rounded-lg">
              <p className="text-xs text-white/80">
                <strong className="text-[hsl(var(--watt-bitcoin))]">Note:</strong> Combined reductions account for diminishing returns.
                Stacking more techniques provides less marginal benefit than their individual specs suggest.
              </p>
            </div>
          )}

          {selectedTechniques.length === 0 && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg text-center">
              <p className="text-sm text-white/60">
                Select mitigation techniques above to calculate combined effect
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MitigationStackCalculator;
