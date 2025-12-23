import { lazy, Suspense } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Activity, Clock, AlertTriangle, Info } from 'lucide-react';
import ProgressiveDisclosure from '@/components/academy/ProgressiveDisclosure';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const basicContent = (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-xl p-6">
        <h4 className="font-bold text-foreground mb-3">Why Does Difficulty Matter?</h4>
        <p className="text-muted-foreground mb-4">
          Bitcoin automatically adjusts how hard it is to mine every ~2 weeks. When more miners join, 
          difficulty goes up. When miners leave, it goes down. This keeps blocks coming every ~10 minutes.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="font-bold text-red-500">Difficulty Up</div>
            <div className="text-sm text-muted-foreground">= Less BTC for you</div>
          </div>
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📉</div>
            <div className="font-bold text-watt-success">Difficulty Down</div>
            <div className="text-sm text-muted-foreground">= More BTC for you</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-watt-bitcoin/10 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-watt-bitcoin">Key fact:</strong> Difficulty has increased ~600% over the past 5 years. 
            Plan for continued growth when modeling your mining operation.
          </p>
        </div>
      </div>
    </div>
  );

  const intermediateContent = (
    <div className="space-y-6">
      {/* How It Works */}
      <div className="bg-gradient-to-r from-watt-bitcoin/10 to-watt-success/10 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-watt-bitcoin" />
          How Difficulty Adjustment Works
        </h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Measure Time", desc: "Calculate actual time to mine 2,016 blocks" },
            { step: "2", title: "Compare Target", desc: "Target is 20,160 minutes (2 weeks)" },
            { step: "3", title: "Calculate Ratio", desc: "Actual time ÷ Target time" },
            { step: "4", title: "Adjust Difficulty", desc: "Up if blocks too fast, down if too slow" },
          ].map((item, idx) => (
            <div key={idx} className="bg-background/60 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-watt-bitcoin text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-background/60 rounded-xl">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-watt-bitcoin">Key Formula:</strong> New Difficulty = Old Difficulty × (Actual Time / Target Time) — 
            Limited to ±300% adjustment per epoch for stability
          </p>
        </div>
      </div>

      {/* Impact on Mining */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-watt-navy rounded-2xl p-6 text-white">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-watt-bitcoin" />
            Revenue Impact
          </h4>
          <p className="text-white/70 text-sm mb-4">
            When difficulty increases, your share of network hashrate decreases, 
            reducing daily BTC earnings proportionally.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-white/10 rounded-lg">
              <span>+10% difficulty</span>
              <span className="text-red-400 font-bold">-9.1% revenue</span>
            </div>
            <div className="flex justify-between p-3 bg-white/10 rounded-lg">
              <span>+20% difficulty</span>
              <span className="text-red-400 font-bold">-16.7% revenue</span>
            </div>
            <div className="flex justify-between p-3 bg-white/10 rounded-lg">
              <span>+50% difficulty</span>
              <span className="text-red-400 font-bold">-33.3% revenue</span>
            </div>
          </div>
        </div>

        <div className="bg-watt-bitcoin/10 border border-watt-bitcoin/20 rounded-2xl p-6">
          <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-watt-bitcoin" />
            Planning Considerations
          </h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-watt-bitcoin rounded-full mt-2" />
              <span>Network hashrate has grown 40-90% annually over the past 5 years</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-watt-bitcoin rounded-full mt-2" />
              <span>Financial models should assume 3-5% monthly difficulty growth</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-watt-bitcoin rounded-full mt-2" />
              <span>Hardware efficiency determines how long you remain profitable as difficulty rises</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-watt-bitcoin rounded-full mt-2" />
              <span>Negative adjustments are rare but occur during major events (China ban 2021: -28%)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const expertContent = (
    <div className="space-y-6">
      {intermediateContent}

      {/* Interactive Chart */}
      <Suspense fallback={
        <div className="bg-background rounded-2xl border border-border p-6 flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-watt-bitcoin border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <DifficultyTrendChart />
      </Suspense>

      {/* Historical Table */}
      <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          Historical Difficulty Data
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Year-over-year comparison of Bitcoin mining difficulty and network hashrate.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
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
                <tr key={idx} className="border-b border-border">
                  <td className="py-3 px-4 font-medium text-foreground">{row.date}</td>
                  <td className="py-3 px-4 text-right text-foreground">{row.difficulty.toFixed(2)} T</td>
                  <td className="py-3 px-4 text-right text-watt-purple">{row.hashrate} EH/s</td>
                  <td className={`py-3 px-4 text-right font-bold ${row.change.startsWith('+') ? 'text-watt-success' : 'text-red-500'}`}>
                    {row.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <section id="difficulty" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Difficulty Adjustment
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Understanding Difficulty Adjustments
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Bitcoin's difficulty adjusts every 2,016 blocks (~2 weeks) to maintain 
              10-minute block times. This mechanism directly impacts mining revenue.
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
              basic: "Overview",
              intermediate: "How it Works",
              expert: "Full Analysis"
            }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DifficultyAdjustmentSection;
