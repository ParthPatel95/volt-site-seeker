import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Calculator, Info, Lightbulb, ArrowDown } from 'lucide-react';
import { ELECTRICAL_FUNDAMENTALS, calculateTransmissionLoss } from '@/constants/educational-constants';
import { DCEDeepDive } from '../shared';

interface ElectricalPrimerProps {
  className?: string;
  defaultOpen?: boolean;
}

/**
 * Educational primer on electrical engineering for datacenter context
 * Explains why voltage step-down is necessary and power loss principles
 */
export const ElectricalPrimer: React.FC<ElectricalPrimerProps> = ({
  className,
  defaultOpen = false,
}) => {
  const [voltage, setVoltage] = useState(138);
  const [power, setPower] = useState(100);
  const distance = 10; // km
  const resistance = 0.05; // ohms/km

  // Calculate current at different voltages
  const currentHighVoltage = (power * 1000000) / (Math.sqrt(3) * voltage * 1000);
  const current480V = (power * 1000000) / (Math.sqrt(3) * 0.48 * 1000);
  
  // Calculate losses
  const lossHighVoltage = calculateTransmissionLoss(power, voltage, resistance, distance);
  const loss480V = calculateTransmissionLoss(power, 0.48, resistance, distance);

  return (
    <DCEDeepDive 
      title="Physics Primer: Why High Voltage Transmission?" 
      icon={Zap}
      defaultOpen={defaultOpen}
      className={className}
    >
      <div className="space-y-6">
        {/* Core Principle */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-5 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h4 className="font-bold text-foreground">The I²R Loss Problem</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Power lost in transmission lines is <strong className="text-foreground">proportional to current squared</strong> (P = I²R). 
            Since Power = Voltage × Current, transmitting the same power at higher voltage means lower current—and 
            dramatically lower losses.
          </p>
          
          <div className="bg-background/50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">The Key Relationship</div>
              <div className="text-xl font-mono font-bold text-foreground">
                P<sub>loss</sub> = I² × R
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                If current doubles, losses quadruple. If current is 10× lower, losses are 100× lower.
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Comparison */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            <h4 className="font-semibold text-foreground">Voltage Comparison Calculator</h4>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Transmission Voltage (kV)
                </label>
                <input
                  type="range"
                  min="69"
                  max="500"
                  step="69"
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--watt-bitcoin))]"
                />
                <div className="text-lg font-bold text-foreground">{voltage} kV</div>
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Power to Transmit (MW)
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={power}
                  onChange={(e) => setPower(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--watt-bitcoin))]"
                />
                <div className="text-lg font-bold text-foreground">{power} MW</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Current at {voltage}kV</div>
                <div className="text-xl font-bold text-foreground">
                  {currentHighVoltage.toLocaleString(undefined, { maximumFractionDigits: 0 })} A
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">Line Loss at {voltage}kV (10km)</div>
                <div className="text-xl font-bold text-emerald-500">
                  {lossHighVoltage.toFixed(3)}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground">Voltage</th>
                  <th className="text-right py-2 px-3 text-muted-foreground">Current</th>
                  <th className="text-right py-2 px-3 text-muted-foreground">Loss (%)</th>
                  <th className="text-right py-2 px-3 text-muted-foreground">Loss (MW)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 font-medium text-foreground">{voltage} kV</td>
                  <td className="py-2 px-3 text-right text-foreground">{currentHighVoltage.toFixed(0)} A</td>
                  <td className="py-2 px-3 text-right text-emerald-500 font-medium">{lossHighVoltage.toFixed(4)}%</td>
                  <td className="py-2 px-3 text-right text-foreground">{(power * lossHighVoltage / 100).toFixed(4)} MW</td>
                </tr>
                <tr className="bg-red-500/10">
                  <td className="py-2 px-3 font-medium text-foreground">480 V</td>
                  <td className="py-2 px-3 text-right text-foreground">{current480V.toLocaleString(undefined, { maximumFractionDigits: 0 })} A</td>
                  <td className="py-2 px-3 text-right text-red-500 font-medium">{loss480V > 100 ? '>100%' : loss480V.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right text-red-500">Impossible</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Transmitting {power}MW at 480V would require {current480V.toLocaleString(undefined, { maximumFractionDigits: 0 })} Amps—
                this would melt any practical conductor and lose more power than transmitted. 
                This is why grid transmission uses 69kV to 765kV.
              </p>
            </div>
          </div>
        </div>

        {/* Voltage Step-Down Chain */}
        <div>
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowDown className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
            Why Multiple Voltage Steps?
          </h4>
          <div className="space-y-3">
            {[
              { voltage: '138-500 kV', purpose: 'Bulk transmission (10-100+ km)', reason: 'Minimizes I²R losses over long distances' },
              { voltage: '25-69 kV', purpose: 'Sub-transmission to facility', reason: 'Practical transformer size, manageable equipment' },
              { voltage: '600V (CAN) / 480V (US)', purpose: 'Building distribution', reason: 'Standard industrial equipment, safer working voltage' },
              { voltage: '240V AC', purpose: 'Equipment feed', reason: 'Matches ASIC PSU input requirements' },
              { voltage: '12V DC', purpose: 'Hash board power', reason: 'ASIC chip operating voltage' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border"
              >
                <div className="w-16 flex-shrink-0">
                  <div className="text-xs font-bold text-[hsl(var(--watt-bitcoin))]">{step.voltage}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{step.purpose}</div>
                  <div className="text-xs text-muted-foreground">{step.reason}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Power Factor Explanation */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-semibold text-foreground mb-3">Understanding Power Factor</h4>
          <p className="text-sm text-muted-foreground mb-4">
            {ELECTRICAL_FUNDAMENTALS.POWER_FACTOR.definition}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Typical Mining PF</div>
              <div className="text-lg font-bold text-foreground">
                {ELECTRICAL_FUNDAMENTALS.POWER_FACTOR.typical_mining.min} - {ELECTRICAL_FUNDAMENTALS.POWER_FACTOR.typical_mining.max}
              </div>
              <div className="text-xs text-muted-foreground">
                (PSUs have built-in PFC circuits)
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Impact</div>
              <p className="text-sm text-foreground">
                {ELECTRICAL_FUNDAMENTALS.POWER_FACTOR.impact}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DCEDeepDive>
  );
};

export default ElectricalPrimer;
