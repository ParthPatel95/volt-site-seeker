import { lazy, Suspense } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Activity, Clock, AlertTriangle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import ProgressiveDisclosure from '@/components/academy/ProgressiveDisclosure';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MECSectionWrapper, MECSectionHeader, MECContentCard, MECKeyInsight, MECDeepDive, MECStepByStep, MECCallout } from './shared';
import { motion } from 'framer-motion';

const DifficultyTrendChart = lazy(() => import('./DifficultyTrendChart'));

const DifficultyAdjustmentSection = () => {
  const difficultyHistory = [
    { date: "Jan 2020", difficulty: 14.78, hashrate: 106, change: "+6.6%" },
    { date: "Jan 2021", difficulty: 20.82, hashrate: 149, change: "+40.9%" },
    { date: "Jan 2022", difficulty: 24.27, hashrate: 174, change: "+16.6%" },
    { date: "Jan 2023", difficulty: 37.59, hashrate: 269, change: "+54.9%" },
    { date: "Jan 2024", difficulty: 72.01, hashrate: 515, change: "+91.6%" },
    { date: "Dec 2024", difficulty: 103.92, hashrate: 743, change: "+44.3%" },
  ];

  const adjustmentSteps = [
    { number: "1", title: "Measure Time", description: "Calculate actual time to mine 2,016 blocks" },
    { number: "2", title: "Compare Target", description: "Target is 20,160 minutes (2 weeks)" },
    { number: "3", title: "Calculate Ratio", description: "Actual time ÷ Target time" },
    { number: "4", title: "Adjust Difficulty", description: "Up if blocks too fast, down if too slow" },
  ];

  const basicContent = (
    <div className="space-y-6">
      <MECContentCard variant="default">
        <h4 className="font-bold text-foreground mb-3 text-lg">Why Does Difficulty Matter?</h4>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Bitcoin automatically adjusts how hard it is to mine every ~2 weeks. When more miners join, 
          difficulty goes up. When miners leave, it goes down. This keeps blocks coming every ~10 minutes 
          and directly affects how much BTC you earn.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-4 text-center border border-border">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: '#ef4444' }} />
            <div className="font-bold" style={{ color: '#ef4444' }}>Difficulty Up</div>
            <div className="text-sm text-muted-foreground">= Less BTC for you</div>
          </div>
          <div className="bg-background rounded-lg p-4 text-center border border-border">
            <TrendingDown className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-success))' }} />
            <div className="font-bold" style={{ color: 'hsl(var(--watt-success))' }}>Difficulty Down</div>
            <div className="text-sm text-muted-foreground">= More BTC for you</div>
          </div>
        </div>
      </MECContentCard>

      <MECKeyInsight variant="warning" title="Key Fact">
        Difficulty has increased ~600% over the past 5 years. Plan for continued growth 
        when modeling your mining operation — assume 3-5% monthly growth in your projections.
      </MECKeyInsight>
    </div>
  );

  const intermediateContent = (
    <div className="space-y-6">
      {/* How It Works */}
      <div 
        className="rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, hsl(var(--watt-bitcoin) / 0.1), hsl(var(--watt-success) / 0.1))' }}
      >
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
          How Difficulty Adjustment Works
        </h3>
        
        <MECStepByStep steps={adjustmentSteps} />

        <MECCallout variant="formula" title="Key Formula" className="mt-6">
          New Difficulty = Old Difficulty × (Actual Time / Target Time) — Limited to ±300% per epoch
        </MECCallout>
      </div>

      {/* Impact on Mining */}
      <div className="grid md:grid-cols-2 gap-6">
        <MECContentCard variant="dark">
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
            Revenue Impact
          </h4>
          <p className="text-white/70 text-sm mb-4">
            When difficulty increases, your share of network hashrate decreases, 
            reducing daily BTC earnings proportionally.
          </p>
          <div className="space-y-3">
            {[
              { diff: "+10%", impact: "-9.1%" },
              { diff: "+20%", impact: "-16.7%" },
              { diff: "+50%", impact: "-33.3%" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between p-3 bg-white/10 rounded-lg">
                <span className="text-white/80">{item.diff} difficulty</span>
                <span className="font-bold" style={{ color: '#ef4444' }}>{item.impact} revenue</span>
              </div>
            ))}
          </div>
        </MECContentCard>

        <MECKeyInsight variant="warning" title="Planning Considerations">
          <ul className="space-y-2 mt-2">
            <li>• Network hashrate has grown 40-90% annually over the past 5 years</li>
            <li>• Financial models should assume 3-5% monthly difficulty growth</li>
            <li>• Hardware efficiency determines how long you remain profitable</li>
            <li>• Negative adjustments are rare (China ban 2021: -28%)</li>
          </ul>
        </MECKeyInsight>
      </div>
    </div>
  );

  const expertContent = (
    <div className="space-y-6">
      {intermediateContent}

      {/* Interactive Chart */}
      <Suspense fallback={
        <div className="bg-background rounded-2xl border border-border p-6 flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'hsl(var(--watt-bitcoin))', borderTopColor: 'transparent' }} />
        </div>
      }>
        <DifficultyTrendChart />
      </Suspense>

      {/* Historical Table */}
      <MECContentCard variant="elevated" headerIcon={Activity} headerTitle="Historical Difficulty Data" headerIconColor="bitcoin">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground font-semibold">Date</th>
                <th className="text-right py-3 px-4 text-foreground font-semibold">Difficulty (T)</th>
                <th className="text-right py-3 px-4 text-foreground font-semibold">Network Hashrate</th>
                <th className="text-right py-3 px-4 text-foreground font-semibold">YoY Change</th>
              </tr>
            </thead>
            <tbody>
              {difficultyHistory.map((row, idx) => (
                <motion.tr 
                  key={idx} 
                  className="border-b border-border"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <td className="py-3 px-4 font-medium text-foreground">{row.date}</td>
                  <td className="py-3 px-4 text-right text-foreground">{row.difficulty.toFixed(2)} T</td>
                  <td className="py-3 px-4 text-right" style={{ color: 'hsl(var(--watt-purple))' }}>{row.hashrate} EH/s</td>
                  <td 
                    className="py-3 px-4 text-right font-bold"
                    style={{ color: row.change.startsWith('+') ? 'hsl(var(--watt-success))' : '#ef4444' }}
                  >
                    {row.change}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </MECContentCard>
    </div>
  );

  return (
    <MECSectionWrapper id="difficulty" theme="light">
      <ScrollReveal>
        <MECSectionHeader
          badge="Difficulty Adjustment"
          badgeIcon={Activity}
          title="Understanding Difficulty Adjustments"
          description="Bitcoin's difficulty adjusts every 2,016 blocks (~2 weeks) to maintain 10-minute block times. This mechanism directly impacts mining revenue."
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
            basic: "Overview",
            intermediate: "How it Works",
            expert: "Full Analysis"
          }}
        />
      </ScrollReveal>
    </MECSectionWrapper>
  );
};

export default DifficultyAdjustmentSection;
