import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Target, Zap, Bitcoin, AlertCircle, Info, Calculator, TrendingUp } from 'lucide-react';
import ProgressiveDisclosure from '@/components/academy/ProgressiveDisclosure';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MECSectionWrapper, MECSectionHeader, MECContentCard, MECKeyInsight, MECDeepDive, MECCallout } from './shared';
import { motion } from 'framer-motion';

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
    { btc: 50000, s21: (btcPerThPerDay * 50000) / (17.5 * 24 / 1000), s19xp: (btcPerThPerDay * 50000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 50000) / (34 * 24 / 1000) },
    { btc: 75000, s21: (btcPerThPerDay * 75000) / (17.5 * 24 / 1000), s19xp: (btcPerThPerDay * 75000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 75000) / (34 * 24 / 1000) },
    { btc: 100000, s21: (btcPerThPerDay * 100000) / (17.5 * 24 / 1000), s19xp: (btcPerThPerDay * 100000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 100000) / (34 * 24 / 1000) },
    { btc: 150000, s21: (btcPerThPerDay * 150000) / (17.5 * 24 / 1000), s19xp: (btcPerThPerDay * 150000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 150000) / (34 * 24 / 1000) },
    { btc: 200000, s21: (btcPerThPerDay * 200000) / (17.5 * 24 / 1000), s19xp: (btcPerThPerDay * 200000) / (21.5 * 24 / 1000), s19: (btcPerThPerDay * 200000) / (34 * 24 / 1000) },
  ];

  const getRateColor = (rate: number) => {
    if (rate >= 0.08) return { text: 'hsl(var(--watt-success))', bg: 'hsl(var(--watt-success) / 0.1)' };
    if (rate >= 0.05) return { text: 'hsl(var(--watt-bitcoin))', bg: 'hsl(var(--watt-bitcoin) / 0.1)' };
    if (rate >= 0.03) return { text: '#eab308', bg: 'rgba(234, 179, 8, 0.2)' };
    return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' };
  };

  const basicContent = (
    <div className="space-y-6">
      <MECContentCard variant="default">
        <h4 className="font-bold text-foreground mb-3 text-lg">What is Break-Even?</h4>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          The break-even energy rate is the <strong>maximum you can pay for electricity</strong> and 
          still make money. If your energy costs more than this, you're losing money on every 
          kilowatt-hour. This is the most critical number for any mining operation.
        </p>
        <div className="bg-background rounded-lg p-6 text-center">
          <div className="text-sm text-muted-foreground mb-2">Simple Example</div>
          <div className="text-xl text-foreground mb-4">
            If break-even is <span className="font-bold" style={{ color: 'hsl(var(--watt-success))' }}>$0.075/kWh</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--watt-success) / 0.1)' }}>
              <div className="font-bold" style={{ color: 'hsl(var(--watt-success))' }}>Pay $0.05/kWh</div>
              <div className="text-muted-foreground">✓ Profitable ($0.025 margin)</div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <div className="font-bold" style={{ color: '#ef4444' }}>Pay $0.10/kWh</div>
              <div className="text-muted-foreground">✗ Losing $0.025/kWh</div>
            </div>
          </div>
        </div>
      </MECContentCard>

      <MECKeyInsight variant="info" title="Why This Matters">
        Break-even analysis is essential for site selection and PPA negotiations. 
        Knowing your break-even rate tells you exactly what energy price to target.
      </MECKeyInsight>
    </div>
  );

  const intermediateContent = (
    <div className="space-y-6">
      {/* Interactive Calculator */}
      <MECContentCard variant="dark" className="text-white">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
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
                <span className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{efficiency} J/TH</span>
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
                <span className="font-bold" style={{ color: 'hsl(var(--watt-success))' }}>${(btcPrice/1000).toFixed(0)}K</span>
                <span>$200K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <motion.div 
              className="text-center"
              key={`${efficiency}-${btcPrice}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm text-white/60 mb-2">Maximum Profitable Energy Rate</div>
              <div 
                className="text-5xl font-bold mb-2"
                style={{ color: breakEvenRate >= 0.05 ? 'hsl(var(--watt-success))' : 'hsl(var(--watt-bitcoin))' }}
              >
                ${breakEvenRate.toFixed(3)}
              </div>
              <div className="text-white/60">per kWh (all-in)</div>
              
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <p className="text-sm text-white/70">
                  At {efficiency} J/TH and ${btcPrice.toLocaleString()} BTC, you can pay up to 
                  <span className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}> ${breakEvenRate.toFixed(3)}/kWh</span> and still break even.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </MECContentCard>

      {/* Deep Dive: All-in Cost */}
      <MECDeepDive title="Understanding 'All-In' Energy Costs" icon={Zap}>
        <div className="space-y-4">
          <p>
            Break-even analysis should use your <strong>all-in energy cost</strong>, not just the 
            headline rate. All-in includes:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-background rounded-lg p-3 border border-border">
              <h5 className="font-semibold text-foreground">Energy charge</h5>
              <p className="text-xs text-muted-foreground">Base $/kWh rate</p>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <h5 className="font-semibold text-foreground">Transmission</h5>
              <p className="text-xs text-muted-foreground">Grid delivery fees</p>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <h5 className="font-semibold text-foreground">Demand charges</h5>
              <p className="text-xs text-muted-foreground">Peak usage penalties</p>
            </div>
            <div className="bg-background rounded-lg p-3 border border-border">
              <h5 className="font-semibold text-foreground">Ancillary services</h5>
              <p className="text-xs text-muted-foreground">Grid reliability fees</p>
            </div>
          </div>
          <MECCallout variant="example" title="Real Example">
            A PPA showing $0.035/kWh energy-only might be $0.055/kWh all-in after 
            transmission ($0.012) and ancillaries ($0.008). Always calculate with all-in rates.
          </MECCallout>
        </div>
      </MECDeepDive>

      {/* Key Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <MECKeyInsight variant="success" title="Hardware Efficiency Matters">
          A 17.5 J/TH machine (S21) can pay nearly <strong>2x the energy rate</strong> as 
          a 34 J/TH machine (S19) and still break even. This is why hardware upgrades 
          often pay for themselves quickly.
        </MECKeyInsight>

        <MECKeyInsight variant="warning" title="Don't Forget All-In Costs">
          Break-even analysis should use your <strong>all-in energy cost</strong> including 
          transmission charges, demand fees, and ancillary services — not just the headline 
          energy rate.
        </MECKeyInsight>
      </div>
    </div>
  );

  const expertContent = (
    <div className="space-y-6">
      {intermediateContent}
      
      {/* Break-Even Matrix */}
      <MECContentCard variant="elevated" headerIcon={Calculator} headerTitle="Break-Even Rate Matrix ($/kWh)" headerIconColor="bitcoin">
        <p className="text-sm text-muted-foreground mb-4">
          Maximum energy rate for profitability by hardware generation and BTC price. 
          Use this to evaluate sites and negotiate PPAs.
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
                <motion.tr 
                  key={idx} 
                  className="border-b border-border"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <td className="py-3 px-4 font-bold text-foreground">${(scenario.btc/1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-center">
                    <span 
                      className="px-3 py-1 rounded-full font-bold"
                      style={{ 
                        color: getRateColor(scenario.s21).text,
                        backgroundColor: getRateColor(scenario.s21).bg
                      }}
                    >
                      ${scenario.s21.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span 
                      className="px-3 py-1 rounded-full font-bold"
                      style={{ 
                        color: getRateColor(scenario.s19xp).text,
                        backgroundColor: getRateColor(scenario.s19xp).bg
                      }}
                    >
                      ${scenario.s19xp.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span 
                      className="px-3 py-1 rounded-full font-bold"
                      style={{ 
                        color: getRateColor(scenario.s19).text,
                        backgroundColor: getRateColor(scenario.s19).bg
                      }}
                    >
                      ${scenario.s19.toFixed(3)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--watt-success) / 0.2)' }} />
            <span className="text-muted-foreground">≥$0.08 - Excellent margin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--watt-bitcoin) / 0.2)' }} />
            <span className="text-muted-foreground">$0.05-0.08 - Good margin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)' }} />
            <span className="text-muted-foreground">$0.03-0.05 - Tight margin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }} />
            <span className="text-muted-foreground">&lt;$0.03 - Challenging</span>
          </div>
        </div>
      </MECContentCard>

      {/* Key Takeaway */}
      <MECKeyInsight variant="success" title="Section Summary">
        <ul className="space-y-2 mt-2">
          <li>• <strong>Break-even rate</strong> = maximum energy cost for profitability</li>
          <li>• <strong>Hardware efficiency</strong> is the biggest factor in break-even</li>
          <li>• Always use <strong>all-in costs</strong>, not headline rates</li>
          <li>• Use the matrix above for <strong>site selection</strong> and <strong>PPA negotiations</strong></li>
        </ul>
      </MECKeyInsight>
    </div>
  );

  return (
    <MECSectionWrapper id="break-even" theme="light">
      <ScrollReveal>
        <MECSectionHeader
          badge="Break-Even Analysis"
          badgeIcon={Target}
          title="Break-Even Energy Rate Calculator"
          description="Determine the maximum energy rate you can pay while remaining profitable. This is critical for site selection and PPA negotiations."
          accentColor="bitcoin"
        />
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
    </MECSectionWrapper>
  );
};

export default BreakEvenAnalysisSection;
