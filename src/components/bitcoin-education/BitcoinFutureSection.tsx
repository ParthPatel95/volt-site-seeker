import React from 'react';
import { 
  Zap, Building2, Scale, Cpu, Sparkles, Globe,
  TrendingUp, Battery, Users, ChevronRight, Rocket
} from 'lucide-react';
import { 
  BitcoinSectionWrapper, 
  BitcoinSectionHeader, 
  BitcoinContentCard,
  BitcoinKeyInsight,
  BitcoinDeepDive,
  BitcoinQuote
} from './shared';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const BitcoinFutureSection: React.FC = () => {
  const developments = [
    {
      icon: Zap,
      title: 'Lightning Network',
      status: 'Live & Growing',
      description: 'A layer 2 solution enabling instant, near-free Bitcoin payments. Lightning processes transactions in milliseconds rather than minutes, making Bitcoin viable for everyday purchases like coffee or micropayments.',
      details: [
        'Transactions settle in under 1 second',
        'Fees measured in fractions of a cent',
        'Growing ecosystem of wallets and payment processors',
        'Already processing millions of transactions monthly'
      ],
      impact: 'Enables Bitcoin to scale to billions of daily transactions while preserving decentralization and security of the base layer.'
    },
    {
      icon: Building2,
      title: 'Institutional Infrastructure',
      status: 'Accelerating',
      description: 'Major financial institutions are building Bitcoin custody, trading, and investment products at unprecedented scale. What was once considered too risky is now being offered by the world\'s largest asset managers.',
      details: [
        'BlackRock, Fidelity, VanEck launched spot ETFs',
        'Major banks offering custody services',
        'Prime brokerage emerging for institutional traders',
        'Insurance products and lending markets developing'
      ],
      impact: 'Dramatically reduces barriers for pension funds, endowments, and corporations to allocate to Bitcoin.'
    },
    {
      icon: Scale,
      title: 'Regulatory Clarity',
      status: 'Evolving',
      description: 'Countries worldwide are developing clearer frameworks for Bitcoin. The approval of spot ETFs in the United States signals growing regulatory acceptance in the world\'s largest financial markets.',
      details: [
        'US: Spot ETF approval marked regulatory milestone',
        'EU: MiCA framework provides legal certainty',
        'UAE, Singapore leading with clear crypto frameworks',
        'El Salvador, Central African Republic adopted as legal tender'
      ],
      impact: 'Clear rules enable more institutions and corporations to participate confidently in the Bitcoin ecosystem.'
    },
    {
      icon: Cpu,
      title: 'AI & HPC Integration',
      status: 'Emerging',
      description: 'Bitcoin mining infrastructure is increasingly co-located with AI training and high-performance computing. The overlap in power, cooling, and operational requirements creates powerful synergies.',
      details: [
        'Shared power purchase agreements and substations',
        'Mining facilities converting to AI training data centers',
        'Immersion cooling technology transfers between industries',
        'Flexible compute that switches between BTC and AI workloads'
      ],
      impact: 'Mining companies becoming diversified energy and compute infrastructure providers.'
    }
  ];

  const trends = [
    {
      title: 'Corporate Treasury Adoption',
      description: 'Following MicroStrategy\'s lead, more public companies are adding Bitcoin to their balance sheets as a treasury reserve asset. This trend accelerated after the 2024 halving.',
      stat: '50+',
      statLabel: 'Public companies holding BTC'
    },
    {
      title: 'Sovereign Adoption',
      description: 'Nation-states are exploring Bitcoin for strategic reserves, international settlements, and as an alternative to dollar-dominated systems. Some predict a "game theory" rush among central banks.',
      stat: '3',
      statLabel: 'Countries with legal tender status'
    },
    {
      title: 'Energy Innovation',
      description: 'Bitcoin mining is driving innovation in stranded energy monetization, renewable integration, and grid stabilization. Miners are becoming essential partners for energy producers.',
      stat: '60%+',
      statLabel: 'Mining powered by sustainable energy'
    },
    {
      title: 'Financial Rails Evolution',
      description: 'Bitcoin and Lightning are increasingly used for international settlements, cross-border payroll, and B2B payments, offering faster and cheaper alternatives to SWIFT.',
      stat: '$400B+',
      statLabel: 'Annual on-chain transaction volume'
    }
  ];

  const wattbyteAdvantages = [
    {
      title: 'Strategic Infrastructure',
      description: 'Located in cold climates with access to low-cost, reliable power sources—the optimal environment for energy-intensive computing.'
    },
    {
      title: 'AI/HPC Diversification',
      description: 'Positioned to integrate AI training and high-performance computing alongside Bitcoin mining for diversified revenue streams.'
    },
    {
      title: 'Operational Excellence',
      description: 'Deep expertise in maximizing mining profitability through optimal machine selection, power management, and operational efficiency.'
    },
    {
      title: 'Investment Access',
      description: 'Multiple vehicles for gaining exposure to Bitcoin infrastructure growth, from direct facility investment to managed mining operations.'
    }
  ];

  return (
    <BitcoinSectionWrapper theme="gradient" id="bitcoin-future">
      <BitcoinSectionHeader
        badge="Looking Ahead"
        badgeIcon={Sparkles}
        title="The Future of Bitcoin"
        description="From scaling solutions to sovereign adoption, Bitcoin's ecosystem continues to mature and expand. Understanding these developments is essential for anyone building in this space."
      />

      {/* Opening Quote */}
      <ScrollReveal direction="up">
        <div className="mb-16">
          <BitcoinQuote
            quote="We see Bitcoin as emerging technology that could be a long-term store of value. As the digital economy grows, Bitcoin could provide a way for people to preserve their purchasing power."
            author="Larry Fink"
            role="CEO, BlackRock"
          />
        </div>
      </ScrollReveal>

      {/* Key Developments */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <Rocket className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
            Key Developments Shaping Bitcoin's Future
          </h3>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {developments.map((item, index) => (
              <BitcoinContentCard
                key={index}
                icon={item.icon}
                title={item.title}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-[hsl(var(--watt-success)/0.1)] text-[hsl(var(--watt-success))] border border-[hsl(var(--watt-success)/0.2)]">
                    {item.status}
                  </span>
                </div>
                
                <p className="mb-4 leading-relaxed text-sm">{item.description}</p>
                
                <ul className="space-y-2 mb-4">
                  {item.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="w-4 h-4 text-[hsl(var(--watt-bitcoin))] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Impact</span>
                  <p className="text-sm text-foreground mt-1">{item.impact}</p>
                </div>
              </BitcoinContentCard>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Trends to Watch */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
            Trends to Watch
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {trends.map((trend, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border hover:border-[hsl(var(--watt-bitcoin)/0.3)] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-bold text-foreground text-lg">{trend.title}</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">{trend.stat}</div>
                    <div className="text-xs text-muted-foreground">{trend.statLabel}</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{trend.description}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Deep Dive: The Bitcoin Halving Cycle */}
      <ScrollReveal direction="up" delay={0.3}>
        <div className="mb-16">
          <BitcoinDeepDive title="Deep Dive: Understanding the Halving Cycle">
            <p>
              Every 210,000 blocks (approximately every 4 years), the Bitcoin mining reward is cut in half. This "halving" event is one of Bitcoin's most important monetary policy mechanisms.
            </p>
            
            <div className="my-6 p-4 bg-muted/50 rounded-lg">
              <h5 className="font-semibold text-foreground mb-4">Historical Halving Timeline</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground w-20">2009</span>
                  <div className="flex-1 bg-[hsl(var(--watt-bitcoin)/0.3)] h-2 rounded-full" />
                  <span className="text-sm font-medium text-foreground w-24 text-right">50 BTC/block</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground w-20">2012</span>
                  <div className="flex-1 bg-[hsl(var(--watt-bitcoin)/0.4)] h-2 rounded-full" style={{ width: '75%' }} />
                  <span className="text-sm font-medium text-foreground w-24 text-right">25 BTC/block</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground w-20">2016</span>
                  <div className="flex-1 bg-[hsl(var(--watt-bitcoin)/0.5)] h-2 rounded-full" style={{ width: '50%' }} />
                  <span className="text-sm font-medium text-foreground w-24 text-right">12.5 BTC/block</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground w-20">2020</span>
                  <div className="flex-1 bg-[hsl(var(--watt-bitcoin)/0.6)] h-2 rounded-full" style={{ width: '25%' }} />
                  <span className="text-sm font-medium text-foreground w-24 text-right">6.25 BTC/block</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground w-20">2024</span>
                  <div className="flex-1 bg-[hsl(var(--watt-bitcoin))] h-2 rounded-full" style={{ width: '12.5%' }} />
                  <span className="text-sm font-medium text-foreground w-24 text-right">3.125 BTC/block</span>
                </div>
              </div>
            </div>
            
            <p>
              Each halving reduces the rate of new Bitcoin entering circulation, making the asset increasingly scarce over time. Historically, halvings have preceded significant bull markets, though past performance doesn't guarantee future results.
            </p>
            
            <p className="mt-4">
              <strong>For miners:</strong> Halvings create pressure to improve efficiency. Less efficient operations become unprofitable, while well-positioned miners with low-cost power benefit from reduced competition.
            </p>
          </BitcoinDeepDive>
        </div>
      </ScrollReveal>

      {/* WattByte Connection */}
      <ScrollReveal direction="up" delay={0.4}>
        <div className="mb-16 bg-gradient-to-br from-[hsl(var(--watt-bitcoin))] to-[hsl(var(--watt-bitcoin)/0.8)] rounded-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/20">
              <Battery className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Where WattByte Fits In</h3>
          </div>
          
          <p className="text-white/90 mb-8 text-lg leading-relaxed max-w-3xl">
            As Bitcoin mining matures, the industry is shifting from hashrate maximization to sustainable, profitable operations. WattByte is strategically positioned at this intersection of energy, computing, and finance.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {wattbyteAdvantages.map((advantage, index) => (
              <div key={index} className="flex items-start gap-4 bg-white/10 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
                <ChevronRight className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-2">{advantage.title}</h4>
                  <p className="text-white/80 text-sm leading-relaxed">{advantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Key Insight */}
      <ScrollReveal direction="up" delay={0.5}>
        <BitcoinKeyInsight type="insight" title="The Infrastructure Opportunity">
          <div className="space-y-3">
            <p>
              Bitcoin's future isn't just about price speculation—it's about building the infrastructure for a new financial system. This includes:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                <span><strong>Mining operations</strong> that secure the network and profit from block rewards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                <span><strong>Lightning infrastructure</strong> that enables instant payments at scale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                <span><strong>Custody solutions</strong> that bridge traditional finance with Bitcoin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                <span><strong>Energy partnerships</strong> that monetize stranded and renewable power</span>
              </li>
            </ul>
            <p>
              Those who build this infrastructure today will be the foundation of tomorrow's financial system.
            </p>
          </div>
        </BitcoinKeyInsight>
      </ScrollReveal>
    </BitcoinSectionWrapper>
  );
};

export default BitcoinFutureSection;
