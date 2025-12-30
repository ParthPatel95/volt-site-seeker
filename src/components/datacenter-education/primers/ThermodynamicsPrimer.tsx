import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Thermometer, Wind, ArrowRight, Calculator, Info, Lightbulb } from 'lucide-react';
import { THERMODYNAMICS, HEAT_TRANSFER_MODES, calculateRequiredCFM, calculateCoolingTons } from '@/constants/educational-constants';
import { DCEDeepDive } from '../shared';

interface ThermodynamicsPrimerProps {
  className?: string;
  defaultOpen?: boolean;
}

/**
 * Educational primer on thermodynamics for datacenter context
 * Explains first law of thermodynamics and heat transfer mechanisms
 */
export const ThermodynamicsPrimer: React.FC<ThermodynamicsPrimerProps> = ({
  className,
  defaultOpen = false,
}) => {
  const [watts, setWatts] = useState(3500);
  const [deltaT, setDeltaT] = useState(30);
  
  const btuPerHour = watts * THERMODYNAMICS.WATTS_TO_BTU_HR;
  const cfmRequired = calculateRequiredCFM(watts, deltaT);
  const coolingTons = calculateCoolingTons(watts / 1000);

  return (
    <DCEDeepDive 
      title="Physics Primer: Why Every Watt Becomes Heat" 
      icon={Flame}
      defaultOpen={defaultOpen}
      className={className}
    >
      <div className="space-y-6">
        {/* First Law of Thermodynamics */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-5 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-orange-500" />
            <h4 className="font-bold text-foreground">First Law of Thermodynamics</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Energy cannot be created or destroyed, only transformed. In a mining facility, 
            <strong className="text-foreground"> 100% of electrical energy becomes heat</strong>. 
            The SHA-256 computations are not stored—they produce heat as their byproduct.
          </p>
          
          <div className="bg-background/50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">The Universal Conversion</div>
              <div className="text-2xl font-mono font-bold text-foreground">
                1 Watt = {THERMODYNAMICS.WATTS_TO_BTU_HR} BTU/hr
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                (British Thermal Units per hour)
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            <strong>What this means:</strong> A 3,500W miner produces ~11,942 BTU/hr of heat. 
            This is equivalent to a small space heater running continuously. A 100MW facility 
            produces heat equivalent to 285,000 space heaters—enough to heat a small city.
          </p>
        </div>

        {/* Heat Transfer Modes */}
        <div>
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
            Three Modes of Heat Transfer
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(HEAT_TRANSFER_MODES).map(([key, mode]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl border border-border p-4 hover:border-[hsl(var(--watt-bitcoin)/0.3)] transition-colors"
              >
                <div className="font-semibold text-foreground mb-2">{mode.name}</div>
                <div className="text-[10px] font-mono text-[hsl(var(--watt-bitcoin))] bg-muted/50 px-2 py-1 rounded mb-2">
                  {mode.equation}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {mode.explanation}
                </p>
                <div className="text-[10px] text-muted-foreground">
                  <strong className="text-foreground">In Mining:</strong> {mode.relevance}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interactive Calculator */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            <h4 className="font-semibold text-foreground">Heat Load Calculator</h4>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Miner Power (Watts)
                </label>
                <input
                  type="range"
                  min="1000"
                  max="6000"
                  step="100"
                  value={watts}
                  onChange={(e) => setWatts(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--watt-bitcoin))]"
                />
                <div className="text-lg font-bold text-foreground">{watts.toLocaleString()} W</div>
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Temperature Rise ΔT (°F)
                </label>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="5"
                  value={deltaT}
                  onChange={(e) => setDeltaT(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--watt-bitcoin))]"
                />
                <div className="text-lg font-bold text-foreground">{deltaT}°F</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Heat Generated</div>
                <div className="text-xl font-bold text-foreground">
                  {btuPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTU/hr
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Airflow Required</div>
                <div className="text-xl font-bold text-[hsl(var(--watt-bitcoin))]">
                  {cfmRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })} CFM
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Cooling Capacity</div>
                <div className="text-xl font-bold text-cyan-500">
                  {coolingTons.toFixed(2)} tons
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                <strong>CFM Formula:</strong> CFM = (Watts × 3.412) ÷ (1.08 × ΔT). 
                Lower ΔT means more airflow but less temperature stress on equipment. 
                Higher ΔT reduces airflow needs but increases hot aisle temperatures.
              </p>
            </div>
          </div>
        </div>

        {/* Practical Implications */}
        <div className="bg-gradient-to-br from-[hsl(var(--watt-bitcoin)/0.1)] to-transparent rounded-xl p-5 border border-[hsl(var(--watt-bitcoin)/0.2)]">
          <h4 className="font-semibold text-foreground mb-3">Practical Implications for Facility Design</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Wind className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Cooling capacity = IT load</strong>
                <p className="text-xs text-muted-foreground">
                  You must reject every watt of heat. A 100MW facility needs ~100MW of cooling capacity.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">PUE overhead is cooling</strong>
                <p className="text-xs text-muted-foreground">
                  A PUE of 1.15 means 15% extra power for cooling. That's 15MW for a 100MW IT load.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DCEDeepDive>
  );
};

export default ThermodynamicsPrimer;
