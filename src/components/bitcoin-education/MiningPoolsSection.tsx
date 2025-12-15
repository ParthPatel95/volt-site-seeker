import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { 
  Users, Server, PieChart, Shield, Globe, TrendingUp, 
  CheckCircle2, AlertCircle, ArrowRight, Zap, DollarSign
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const MiningPoolsSection: React.FC = () => {
  const topPools = [
    { name: 'Foundry USA', hashrate: 29.5, color: 'watt-trust' },
    { name: 'AntPool', hashrate: 16.2, color: 'watt-bitcoin' },
    { name: 'F2Pool', hashrate: 11.8, color: 'watt-success' },
    { name: 'ViaBTC', hashrate: 11.4, color: 'watt-warning' },
    { name: 'Binance Pool', hashrate: 8.3, color: 'watt-navy' },
    { name: 'Others', hashrate: 22.8, color: 'watt-navy' }
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

  const soloMiningMath = {
    networkHashrate: 700, // EH/s
    yourHashrate: 1, // PH/s
    probability: (1 / 700000).toFixed(8),
    avgDaysToBlock: Math.round(700000 / 1 / 144),
    blockReward: 3.125
  };

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/20 mb-4">
              <Users className="w-4 h-4 text-watt-trust" />
              <span className="text-sm font-medium text-watt-trust">Collaborative Mining</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-watt-navy mb-4">
              Mining Pools & Solo Mining
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Mining pools combine the hashrate of many miners to find blocks more consistently, 
              then distribute rewards proportionally.
            </p>
          </div>
        </ScrollReveal>

        {/* Why Pool Mining */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-watt-light rounded-2xl p-6 md:p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-watt-navy mb-4">Why Mine in a Pool?</h3>
                <p className="text-watt-navy/70 mb-4">
                  With network hashrate at <strong>700+ EH/s</strong>, solo mining is like playing the lottery. 
                  Even a large 1 PH/s operation would wait <strong>years</strong> on average to find a single block.
                </p>
                <p className="text-watt-navy/70">
                  Pools solve this by combining resources. When any pool member finds a block, 
                  the reward is split among all participants based on their contributed work (shares).
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-institutional">
                <h4 className="font-bold text-watt-navy mb-4">Solo Mining Math (1 PH/s)</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-watt-navy/60">Your Hashrate</span>
                    <span className="font-mono font-bold text-watt-navy">1 PH/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-watt-navy/60">Network Hashrate</span>
                    <span className="font-mono font-bold text-watt-navy">700,000 PH/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-watt-navy/60">% of Network</span>
                    <span className="font-mono font-bold text-watt-navy">0.000143%</span>
                  </div>
                  <div className="border-t border-watt-navy/10 my-2" />
                  <div className="flex justify-between">
                    <span className="text-watt-navy/60">Blocks per Day (network)</span>
                    <span className="font-mono font-bold text-watt-navy">144</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-watt-navy/60">Expected Days to Block</span>
                    <span className="font-mono font-bold text-watt-bitcoin">~4,861 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-watt-navy/60">That's about...</span>
                    <span className="font-mono font-bold text-destructive">~13.3 years</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-watt-warning/10 rounded-lg border border-watt-warning/20">
                  <p className="text-xs text-watt-navy/70">
                    <AlertCircle className="w-4 h-4 inline mr-1 text-watt-warning" />
                    This is average time. You could get lucky in week 1 or wait 30+ years.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Top Mining Pools */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-institutional mb-8">
            <h3 className="text-2xl font-bold text-watt-navy mb-6">Top Mining Pools by Hashrate</h3>
            <div className="space-y-4">
              {topPools.map((pool, index) => (
                <div key={pool.name} className="flex items-center gap-4">
                  <div className="w-8 text-center font-bold text-watt-navy/40">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-watt-navy">{pool.name}</span>
                      <span className="font-bold text-watt-navy">{pool.hashrate}%</span>
                    </div>
                    <div className="w-full bg-watt-navy/10 rounded-full h-3">
                      <div 
                        className={`bg-${pool.color} rounded-full h-3 transition-all duration-1000`}
                        style={{ width: `${pool.hashrate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-watt-navy/60 mt-4 text-center">
              Source: BTC.com Pool Distribution (approximate, changes frequently)
            </p>
          </div>
        </ScrollReveal>

        {/* Payout Schemes */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-watt-navy mb-6 text-center">Pool Payout Schemes Explained</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {payoutSchemes.map((scheme, index) => (
                <div key={scheme.name} className="bg-watt-light rounded-2xl p-6">
                  <h4 className="font-bold text-watt-navy mb-2">{scheme.name}</h4>
                  <p className="text-sm text-watt-navy/70 mb-4">{scheme.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-watt-navy/60">Risk Level</span>
                      <span className={`font-medium ${
                        scheme.riskLevel === 'Very Low' ? 'text-watt-success' :
                        scheme.riskLevel === 'Low' ? 'text-watt-trust' : 'text-watt-warning'
                      }`}>{scheme.riskLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-watt-navy/60">Pool Fee</span>
                      <span className="font-medium text-watt-navy">{scheme.poolFee}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {scheme.pros.map((pro, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-watt-success">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                        {pro}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-watt-navy/70">
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
          <div className="bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy/90 rounded-2xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Choosing the Right Pool</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {poolSelectionFactors.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    item.importance === 'High' ? 'bg-watt-bitcoin/20 text-watt-bitcoin' :
                    item.importance === 'Medium' ? 'bg-watt-trust/20 text-watt-trust' :
                    'bg-white/20 text-white/60'
                  }`}>
                    {item.importance}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{item.factor}</h4>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MiningPoolsSection;
