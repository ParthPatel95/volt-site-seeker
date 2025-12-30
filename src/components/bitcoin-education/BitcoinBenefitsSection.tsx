import React from 'react';
import { 
  Shield, Globe, TrendingUp, Users, Eye, Wallet, 
  AlertTriangle, CheckCircle2, ChevronRight, Lock,
  Landmark, Clock, Ban, Percent
} from 'lucide-react';
import { 
  BitcoinSectionWrapper, 
  BitcoinSectionHeader, 
  BitcoinContentCard,
  BitcoinKeyInsight,
  BitcoinDeepDive
} from './shared';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const BitcoinBenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Store of Value',
      description: 'Often called "Digital Gold," Bitcoin\'s mathematically guaranteed scarcity makes it an attractive hedge against currency debasement and inflation.',
      details: [
        'Only 21 million will ever exist—ever',
        'No CEO, board, or government can print more',
        'Outperformed every other asset class over 10 years',
        'Increasingly held by institutions and nation-states'
      ]
    },
    {
      icon: Shield,
      title: 'Inflation Protection',
      description: 'While central banks can create unlimited fiat currency, Bitcoin\'s supply schedule is fixed in code and enforced by thousands of independent nodes worldwide.',
      details: [
        'The US dollar has lost 96% of its value since 1913',
        'Bitcoin\'s inflation rate is currently ~1.7% per year',
        'After the 2024 halving, it dropped to ~0.9%',
        'By 2140, no new Bitcoin will be created'
      ]
    },
    {
      icon: Globe,
      title: 'Borderless Transactions',
      description: 'Send value to anyone, anywhere in the world, 24/7/365. No bank approvals, no wire transfer fees, no currency conversion needed.',
      details: [
        'Settlement in 10-60 minutes, not 3-5 business days',
        'Works on weekends and holidays',
        'No intermediary can block or reverse transactions',
        'Same fee whether sending $10 or $10 million'
      ]
    },
    {
      icon: Users,
      title: 'Financial Inclusion',
      description: 'Anyone with a smartphone and internet connection can access Bitcoin. No credit check, no minimum balance, no application process.',
      details: [
        '1.4 billion adults worldwide lack bank accounts',
        'Bitcoin requires only internet access to use',
        'No discrimination based on location or status',
        'Empowers individuals in unstable economies'
      ]
    },
    {
      icon: Eye,
      title: 'Transparent & Auditable',
      description: 'Every Bitcoin transaction is recorded on a public ledger that anyone can verify. The supply, issuance, and rules are completely transparent.',
      details: [
        'Full transaction history since 2009 is public',
        'Anyone can run a node to verify everything',
        'Impossible to fake transactions or inflate supply',
        'Real-time proof of reserves is trivial'
      ]
    },
    {
      icon: Wallet,
      title: 'True Self-Custody',
      description: 'You can hold your own Bitcoin directly, without any bank, broker, or custodian. Your keys, your coins—no counterparty risk.',
      details: [
        'Store your entire wealth in 12-24 words',
        'Cross borders with nothing but a memorized phrase',
        'No one can freeze or seize self-custodied Bitcoin',
        'Full control over your own financial destiny'
      ]
    }
  ];

  const considerations = [
    {
      icon: TrendingUp,
      title: 'Price Volatility',
      description: 'Bitcoin can experience significant price swings—30%+ moves in either direction are not uncommon. This volatility decreases over time but remains substantial compared to traditional assets.',
      mitigation: 'Use dollar-cost averaging (DCA) to reduce timing risk. Only invest what you can hold through multi-year periods. View Bitcoin as a long-term savings technology, not a short-term trading vehicle.'
    },
    {
      icon: Lock,
      title: 'Security Responsibility',
      description: 'Self-custody means you\'re responsible for security. Lost seed phrases mean permanently lost Bitcoin—there\'s no customer support, no password reset, no recovery.',
      mitigation: 'Start with small amounts while learning. Use reputable hardware wallets. Store seed phrases in multiple secure locations. Consider multi-signature setups for large amounts.'
    },
    {
      icon: Landmark,
      title: 'Regulatory Uncertainty',
      description: 'Cryptocurrency regulations vary significantly by country and continue to evolve. Tax treatment, reporting requirements, and legal status differ across jurisdictions.',
      mitigation: 'Stay informed about rules in your jurisdiction. Keep detailed records for tax purposes. Work with crypto-knowledgeable accountants and attorneys if needed.'
    },
    {
      icon: Clock,
      title: 'Learning Curve',
      description: 'Understanding wallets, keys, addresses, and security best practices takes time and effort. Mistakes early on can be costly.',
      mitigation: 'Start slowly and educate yourself thoroughly. Practice with small amounts first. Don\'t rush into self-custody until you\'re confident. Use reputable educational resources.'
    }
  ];

  const realWorldUseCases = [
    {
      title: 'Inflation Protection in Emerging Markets',
      description: 'Citizens in Argentina, Turkey, Lebanon, and Venezuela use Bitcoin to protect savings from currencies losing 50-100%+ of their value annually.',
      stat: '5x-10x',
      statLabel: 'Argentine peso devaluation over 5 years'
    },
    {
      title: 'Cross-Border Remittances',
      description: 'Migrant workers send money home via Bitcoin, avoiding traditional remittance fees that can exceed 10% of the transfer amount.',
      stat: '$700B+',
      statLabel: 'Annual global remittance market'
    },
    {
      title: 'Financial Access for the Unbanked',
      description: 'In developing nations, Bitcoin provides banking services to populations without access to traditional financial infrastructure.',
      stat: '1.4B',
      statLabel: 'Adults without bank accounts globally'
    }
  ];

  return (
    <BitcoinSectionWrapper theme="light" id="bitcoin-benefits">
      <BitcoinSectionHeader
        badge="Benefits & Considerations"
        badgeIcon={CheckCircle2}
        title="Why Bitcoin Matters"
        description="Bitcoin offers unique properties that no other asset or payment system can match. Understanding both its strengths and challenges is essential for making informed decisions."
      />

      {/* Benefits Grid */}
      <ScrollReveal direction="up">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <BitcoinContentCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
            >
              <p className="mb-4 leading-relaxed text-sm">{benefit.description}</p>
              <ul className="space-y-2">
                {benefit.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-[hsl(var(--watt-bitcoin))] shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </BitcoinContentCard>
          ))}
        </div>
      </ScrollReveal>

      {/* Real World Use Cases */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Globe className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
            Real-World Impact
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {realWorldUseCases.map((useCase, index) => (
              <div key={index} className="bg-gradient-to-br from-[hsl(var(--watt-bitcoin)/0.05)] to-transparent rounded-2xl p-6 border border-[hsl(var(--watt-bitcoin)/0.2)]">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-[hsl(var(--watt-bitcoin))]">{useCase.stat}</div>
                  <div className="text-xs text-muted-foreground">{useCase.statLabel}</div>
                </div>
                <h4 className="font-bold text-foreground mb-2">{useCase.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Deep Dive: Store of Value */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="mb-16">
          <BitcoinDeepDive title="Deep Dive: Bitcoin as a Store of Value">
            <p>
              To understand why Bitcoin works as a store of value, we need to understand what makes something valuable for storing wealth over time. Historically, the best stores of value share several key properties:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Ban className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                  Scarcity
                </h5>
                <p className="text-sm">Cannot be easily produced or replicated. Bitcoin has the most verifiable scarcity of any asset ever created—you can mathematically prove the supply cap.</p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                  Durability
                </h5>
                <p className="text-sm">Doesn't degrade over time. Bitcoin is pure information—as long as the network exists, your Bitcoin exists in the exact same form forever.</p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                  Portability
                </h5>
                <p className="text-sm">Easy to transport. You can carry billions in Bitcoin with a memorized 12-word phrase. Try doing that with gold or real estate.</p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                  Divisibility
                </h5>
                <p className="text-sm">Can be divided into small units. Each Bitcoin divides into 100 million satoshis, allowing micro-transactions impossible with gold.</p>
              </div>
            </div>
            
            <p>
              Bitcoin scores highly on all these properties while adding something gold cannot offer: <strong>censorship resistance</strong>. No government can confiscate properly self-custodied Bitcoin, and no border can prevent you from taking it with you.
            </p>
          </BitcoinDeepDive>
        </div>
      </ScrollReveal>

      {/* Important Considerations */}
      <ScrollReveal direction="up" delay={0.3}>
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Important Considerations</h3>
          </div>
          
          <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            A balanced view is essential. While Bitcoin offers unique benefits, there are real challenges and risks that every participant should understand before getting involved.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {considerations.map((item, index) => (
              <BitcoinContentCard key={index} icon={item.icon} title={item.title}>
                <p className="text-sm leading-relaxed mb-4">{item.description}</p>
                <div className="p-3 bg-[hsl(var(--watt-success)/0.1)] rounded-lg border border-[hsl(var(--watt-success)/0.2)]">
                  <h5 className="font-semibold text-[hsl(var(--watt-success))] text-xs uppercase tracking-wider mb-1">Mitigation Strategy</h5>
                  <p className="text-sm text-muted-foreground">{item.mitigation}</p>
                </div>
              </BitcoinContentCard>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Key Insight */}
      <ScrollReveal direction="up" delay={0.4}>
        <BitcoinKeyInsight type="success" title="The Bottom Line">
          <div className="space-y-3">
            <p>
              Bitcoin is not a get-rich-quick scheme—it's a fundamental technological innovation that enables something previously impossible: <strong>true digital property rights</strong>.
            </p>
            <p>
              For the first time in history, individuals can hold wealth that cannot be confiscated, inflated, or controlled by any third party. Whether that's valuable to you depends on your circumstances, goals, and beliefs about the future of money.
            </p>
            <p className="font-medium text-foreground">
              Start small. Learn continuously. Never invest more than you can afford to lose. And always, always secure your keys.
            </p>
          </div>
        </BitcoinKeyInsight>
      </ScrollReveal>
    </BitcoinSectionWrapper>
  );
};

export default BitcoinBenefitsSection;
