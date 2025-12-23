import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Target, Zap, Bitcoin, AlertCircle, Info } from 'lucide-react';
import ProgressiveDisclosure from '@/components/academy/ProgressiveDisclosure';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const BreakEvenAnalysisSection = () => {
  const [efficiency, setEfficiency] = useState(17.5); // J/TH
  const [btcPrice, setBtcPrice] = useState(100000);

  // Calculate break-even energy rate
  const networkHashrate = 750; // EH/s
  const blockReward = 3.125;
  const blocksPerDay = 144;
  
  const btcPerThPerDay = (1 / (networkHashrate * 1e6)) * blocksPerDay * blockReward;
  const revenuePerThPerDay = btcPerThPerDay * btcPrice;
  const kwhPerThPerDay = efficiency * 24 / 1000;
  const breakEvenRate = revenuePerThPerDay / kwhPerThPerDay;

  const breakEvenScenarios = [
    { btc: 50000, s21: (btcPerThPerDay * 50000) / kwhPerThPerDay, s19xp: (btcPerThPerDay * 50000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 50000) / (34 * 24 / 1000) },
    { btc: 75000, s21: (btcPerThPerDay * 75000) / kwhPerThPerDay, s19xp: (btcPerThPerDay * 75000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 75000) / (34 * 24 / 1000) },
    { btc: 100000, s21: (btcPerThPerDay * 100000) / kwhPerThPerDay, s19xp: (btcPerThPerDay * 100000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 100000) / (34 * 24 / 1000) },
    { btc: 150000, s21: (btcPerThPerDay * 150000) / kwhPerThPerDay, s19xp: (btcPerThPerDay * 150000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 150000) / (34 * 24 / 1000) },
    { btc: 200000, s21: (btcPerThPerDay * 200000) / kwhPerThPerDay, s19xp: (btcPerThPerDay * 200000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 200000) / (34 * 24 / 1000) },
  ];

  const getRateColor = (rate: number) => {
    if (rate >= 0.08) return 'text-watt-success bg-watt-success/10';
    if (rate >= 0.05) return 'text-watt-bitcoin bg-watt-bitcoin/10';
    if (rate >= 0.03) return 'text-yellow-600 bg-yellow-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  const basicContent = (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-xl p-6">
        <h4 className="font-bold text-foreground mb-3">What is Break-Even?</h4>
        <p className="text-muted-foreground mb-4">
          The break-even energy rate is the maximum you can pay for electricity and still make money. 
          If your energy costs more than this, you're losing money on every kilowatt-hour.
        </p>
        <div className="bg-background rounded-lg p-4 text-center">
          <div className="text-sm text-muted-foreground mb-2">Simple Example</div>
          <div className="text-xl text-foreground">
            If break-even is <span className="font-bold text-watt-success">$0.075/kWh</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div className="p-2 bg-watt-success/10 rounded-lg">
              <div className="text-watt-success font-bold">Pay $0.05/kWh</div>
              <div className="text-muted-foreground">✓ Profitable</div>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <div className="text-red-500 font-bold">Pay $0.10/kWh</div>
              <div className="text-muted-foreground">✗ Losing money</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const intermediateContent = (
    <div className="space-y-6">
      {/* Interactive Calculator */}
      <div className="bg-gradient-to-br from-watt-navy to-watt-navy/90 rounded-2xl p-8 text-white">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-watt-bitcoin" />
          Break-Even Calculator
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-white/70 mb-2 flex items-center gap-2">
                Hardware Efficiency (J/TH)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Joules per Terahash - how much energy your miner uses per unit of hashrate. Lower is better.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <input
                type="range"
                min="15"
                max="50"
                step="0.5"
                value={efficiency}
                onChange={(e) => setEfficiency(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-white/50 mt-1">
                <span>15 J/TH (Latest)</span>
                <span className="text-watt-bitcoin font-bold">{efficiency} J/TH</span>
                <span>50 J/TH (Old)</span>
              </div>
            </div>

            <div>
              <label className="block text-white/70 mb-2">Bitcoin Price (USD)</label>
              <input
                type="range"
                min="30000"
                max="200000"
                step="1000"
                value={btcPrice}
                onChange={(e) => setBtcPrice(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-white/50 mt-1">
                <span>$30K</span>
                <span className="text-watt-success font-bold">${(btcPrice/1000).toFixed(0)}K</span>
                <span>$200K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">Maximum Profitable Energy Rate</div>
              <div className={`text-5xl font-bold mb-2 ${breakEvenRate >= 0.05 ? 'text-watt-success' : 'text-watt-bitcoin'}`}>
                ${breakEvenRate.toFixed(3)}
              </div>
              <div className="text-white/60">per kWh (all-in)</div>
              
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <p className="text-sm text-white/70">
                  At {efficiency} J/TH and ${btcPrice.toLocaleString()} BTC, you can pay up to 
                  <span className="text-watt-bitcoin font-bold"> ${breakEvenRate.toFixed(3)}/kWh</span> and still break even.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-watt-success/10 border border-watt-success/20 rounded-xl p-6">
          <h4 className="font-bold text-watt-success mb-3 flex items-center gap-2">
            <Bitcoin className="w-5 h-5" />
            Hardware Efficiency Matters
          </h4>
          <p className="text-sm text-muted-foreground">
            A 17.5 J/TH machine (S21) can pay nearly <strong>2x the energy rate</strong> as 
            a 34 J/TH machine (S19) and still break even. This is why hardware upgrades 
            often pay for themselves quickly.
          </p>
        </div>

        <div className="bg-watt-bitcoin/10 border border-watt-bitcoin/20 rounded-xl p-6">
          <h4 className="font-bold text-watt-bitcoin mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Don't Forget All-In Costs
          </h4>
          <p className="text-sm text-muted-foreground">
            Break-even analysis should use your <strong>all-in energy cost</strong> including 
            transmission charges, demand fees, and ancillary services — not just the headline 
            energy rate.
          </p>
        </div>
      </div>
    </div>
  );

  const expertContent = (
    <div className="space-y-6">
      {intermediateContent}
      
      {/* Break-Even Matrix */}
      <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-watt-bitcoin" />
          Break-Even Rate Matrix ($/kWh)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Maximum energy rate for profitability by hardware generation and BTC price
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground font-semibold">BTC Price</th>
                <th className="text-center py-3 px-4 text-foreground font-semibold">S21 (17.5 J/TH)</th>
                <th className="text-center py-3 px-4 text-foreground font-semibold">S19 XP (21.5 J/TH)</th>
                <th className="text-center py-3 px-4 text-foreground font-semibold">S19 (34 J/TH)</th>
              </tr>
            </thead>
            <tbody>
              {breakEvenScenarios.map((scenario, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="py-3 px-4 font-bold text-foreground">${(scenario.btc/1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full font-bold ${getRateColor(scenario.s21)}`}>
                      ${scenario.s21.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full font-bold ${getRateColor(scenario.s19xp)}`}>
                      ${scenario.s19xp.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full font-bold ${getRateColor(scenario.s19)}`}>
                      ${scenario.s19.toFixed(3)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-watt-success/20 rounded" />
            <span className="text-muted-foreground">≥$0.08 - Excellent margin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-watt-bitcoin/20 rounded" />
            <span className="text-muted-foreground">$0.05-0.08 - Good margin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500/20 rounded" />
            <span className="text-muted-foreground">$0.03-0.05 - Tight margin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500/20 rounded" />
            <span className="text-muted-foreground">&lt;$0.03 - Challenging</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="breakeven" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Break-Even Analysis
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Break-Even Energy Rate Calculator
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Determine the maximum energy rate you can pay while remaining profitable. 
              This is critical for site selection and PPA negotiations.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <ProgressiveDisclosure
            basicContent={basicContent}
            intermediateContent={intermediateContent}
            expertContent={expertContent}
            defaultLevel="intermediate"
            labels={{
              basic: "What is it?",
              intermediate: "Calculator",
              expert: "Full Matrix"
            }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BreakEvenAnalysisSection;
