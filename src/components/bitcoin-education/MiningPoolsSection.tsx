import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { 
  Users, Server, PieChart, Shield, Globe, TrendingUp, 
  CheckCircle2, AlertCircle, ArrowRight, Zap, DollarSign
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { BitcoinSectionWrapper, BitcoinSectionHeader, BitcoinKeyInsight } from './shared';

const MiningPoolsSection: React.FC = () => {
  const topPools = [
    { name: 'Foundry USA', hashrate: 29.5, color: 'hsl(var(--watt-trust))' },
    { name: 'AntPool', hashrate: 16.2, color: 'hsl(var(--watt-bitcoin))' },
    { name: 'F2Pool', hashrate: 11.8, color: 'hsl(var(--watt-success))' },
    { name: 'ViaBTC', hashrate: 11.4, color: 'hsl(var(--watt-warning))' },
    { name: 'Binance Pool', hashrate: 8.3, color: 'hsl(var(--watt-navy))' },
    { name: 'Others', hashrate: 22.8, color: 'hsl(var(--muted-foreground))' }
  ];

  const payoutSchemes = [
    {
      name: 'FPPS (Full Pay Per Share)',
      description: 'Pool pays miners for each valid share plus estimated transaction fees',
      riskLevel: 'Very Low',
      variance: 'None',
      poolFee: '2-4%',
      pros: ['Predictable income', 'No variance', 'Includes tx fees'],
      cons: ['Higher pool fees', 'Pool assumes all risk'],
      bestFor: 'Miners who want stable, predictable income'
    },
    {
      name: 'PPS+ (Pay Per Share Plus)',
      description: 'Base PPS for block rewards + proportional transaction fee distribution',
      riskLevel: 'Low',
      variance: 'Low (tx fees only)',
      poolFee: '2-3%',
      pros: ['Stable block rewards', 'Fair tx fee distribution', 'Lower fees than FPPS'],
      cons: ['Slight variance in tx fees'],
      bestFor: 'Balance of stability and fee optimization'
    },
    {
      name: 'PPLNS (Pay Per Last N Shares)',
      description: 'Payment based on shares during the last N shares before a block is found',
      riskLevel: 'Medium',
      variance: 'Medium',
      poolFee: '0.5-2%',
      pros: ['Lowest pool fees', 'Rewards loyal miners', 'Fair during luck swings'],
      cons: ['Income varies with pool luck', 'Penalizes pool hopping'],
      bestFor: 'Long-term, dedicated miners seeking lowest fees'
    }
  ];

  const poolSelectionFactors = [
    { factor: 'Pool Hashrate', importance: 'High', description: 'Larger pools find blocks more regularly, reducing variance' },
    { factor: 'Fee Structure', importance: 'High', description: 'Fees typically range from 0.5% to 4% of earnings' },
    { factor: 'Payout Scheme', importance: 'High', description: 'Choose based on your risk tolerance and mining consistency' },
    { factor: 'Minimum Payout', importance: 'Medium', description: 'Lower thresholds mean more frequent payouts' },
    { factor: 'Server Locations', importance: 'Medium', description: 'Closer servers = lower latency = fewer stale shares' },
    { factor: 'Reputation & Track Record', importance: 'High', description: 'Established pools with transparent operations' },
    { factor: 'User Interface & Tools', importance: 'Low', description: 'Monitoring apps, notifications, detailed statistics' }
  ];

  return (
    <BitcoinSectionWrapper theme="light" id="mining-pools">
      <ScrollReveal direction="up">
        <BitcoinSectionHeader
          badge="Collaborative Mining"
          badgeIcon={Users}
          title="Mining Pools & Solo Mining"
          description="Mining pools combine the hashrate of many miners to find blocks more consistently, then distribute rewards proportionally."
          theme="light"
        />
      </ScrollReveal>

      {/* Why Pool Mining */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="bg-muted rounded-2xl p-6 md:p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Why Mine in a Pool?</h3>
              <p className="text-base text-foreground leading-relaxed mb-4">
                With network hashrate at <strong>700+ EH/s</strong>, solo mining is like playing the lottery. 
                Even a large 1 PH/s operation would wait <strong>years</strong> on average to find a single block.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Pools solve this by combining resources. When any pool member finds a block, 
                the reward is split among all participants based on their contributed work (shares).
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <h4 className="font-bold text-foreground mb-4">Solo Mining Math (1 PH/s)</h4>
              <div className="space-y-3 text-base">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Hashrate</span>
                  <span className="font-mono font-bold text-foreground">1 PH/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Hashrate</span>
                  <span className="font-mono font-bold text-foreground">700,000 PH/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">% of Network</span>
                  <span className="font-mono font-bold text-foreground">0.000143%</span>
                </div>
                <div className="border-t border-border my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blocks per Day (network)</span>
                  <span className="font-mono font-bold text-foreground">144</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Days to Block</span>
                  <span className="font-mono font-bold text-[hsl(var(--watt-bitcoin))]">~4,861 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">That's about...</span>
                  <span className="font-mono font-bold text-destructive">~13.3 years</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-[hsl(var(--watt-warning)/0.1)] rounded-lg border border-[hsl(var(--watt-warning)/0.2)]">
                <p className="text-sm text-foreground">
                  <AlertCircle className="w-4 h-4 inline mr-1 text-[hsl(var(--watt-warning))]" />
                  This is average time. You could get lucky in week 1 or wait 30+ years.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Top Mining Pools */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-border mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Top Mining Pools by Hashrate</h3>
          <div className="space-y-4">
            {topPools.map((pool, index) => (
              <div key={pool.name} className="flex items-center gap-4">
                <div className="w-8 text-center font-bold text-muted-foreground">#{index + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-foreground">{pool.name}</span>
                    <span className="font-bold text-foreground">{pool.hashrate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="rounded-full h-3 transition-all duration-1000"
                      style={{ width: `${pool.hashrate}%`, backgroundColor: pool.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Source: BTC.com Pool Distribution (approximate, changes frequently)
          </p>
        </div>
      </ScrollReveal>

      {/* Payout Schemes */}
      <ScrollReveal direction="up" delay={0.3}>
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Pool Payout Schemes Explained</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {payoutSchemes.map((scheme, index) => (
              <div key={scheme.name} className="bg-card rounded-2xl p-6 border border-border">
                <h4 className="font-bold text-foreground mb-2">{scheme.name}</h4>
                <p className="text-base text-muted-foreground mb-4">{scheme.description}</p>
                
                <div className="space-y-2 mb-4 text-base">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span className={`font-medium ${
                      scheme.riskLevel === 'Very Low' ? 'text-[hsl(var(--watt-success))]' :
                      scheme.riskLevel === 'Low' ? 'text-[hsl(var(--watt-trust))]' : 'text-[hsl(var(--watt-warning))]'
                    }`}>{scheme.riskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pool Fee</span>
                    <span className="font-medium text-foreground">{scheme.poolFee}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {scheme.pros.map((pro, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[hsl(var(--watt-success))]">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                      <span className="text-foreground">{pro}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Best for:</strong> {scheme.bestFor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Pool Selection Factors */}
      <ScrollReveal direction="up" delay={0.4}>
        <div className="bg-gradient-to-br from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.95)] to-[hsl(var(--watt-navy)/0.9)] rounded-2xl p-6 md:p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Choosing the Right Pool</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {poolSelectionFactors.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  item.importance === 'High' ? 'bg-[hsl(var(--watt-bitcoin)/0.2)] text-[hsl(var(--watt-bitcoin))]' :
                  item.importance === 'Medium' ? 'bg-[hsl(var(--watt-trust)/0.2)] text-[hsl(var(--watt-trust))]' :
                  'bg-white/20 text-white/80'
                }`}>
                  {item.importance}
                </div>
                <div>
                  <h4 className="font-medium text-white">{item.factor}</h4>
                  <p className="text-base text-white/80">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </BitcoinSectionWrapper>
  );
};

export default MiningPoolsSection;
