import React from 'react';
import { 
  Bitcoin, Shield, Globe, Coins, Scale, Lock, 
  Users, Building, Server, ChevronRight, Landmark,
  Banknote, TrendingUp
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

const WhatIsBitcoinSection: React.FC = () => {
  const corePillars = [
    {
      icon: Globe,
      title: 'Decentralized',
      description: 'No single entity controls Bitcoin. The network is maintained by thousands of independent nodes spread across every continent, making it resistant to censorship, seizure, and shutdown.',
      details: [
        'Over 15,000 publicly reachable nodes worldwide',
        'No CEO, no headquarters, no central point of failure',
        'Changes require broad consensus from miners, developers, and users',
        'Operates 24/7/365 with 99.98% uptime since 2009'
      ]
    },
    {
      icon: Coins,
      title: 'Digital Scarcity',
      description: 'Only 21 million Bitcoin will ever exist. This fixed supply is enforced by mathematics, not by any government or institution, making Bitcoin the first truly scarce digital asset.',
      details: [
        'Current supply: ~19.5 million BTC (93% already mined)',
        'Final Bitcoin will be mined around year 2140',
        'Supply schedule is completely predictable and verifiable',
        'Cannot be inflated, debased, or altered by any authority'
      ]
    },
    {
      icon: Users,
      title: 'Peer-to-Peer',
      description: 'Send value directly to anyone, anywhere in the world, without needing a bank, payment processor, or any other intermediary. Transactions settle in minutes, not days.',
      details: [
        'Works across borders without currency conversion',
        'Settlement is final and irreversible',
        'No account freezes, chargebacks, or holds',
        'Available to the 1.4 billion unbanked adults worldwide'
      ]
    }
  ];

  const decentralizationLevels = [
    {
      icon: Server,
      title: 'Network Decentralization',
      description: 'The Bitcoin network consists of thousands of independently operated nodes. Each node stores a complete copy of the blockchain and independently validates every transaction and block.',
      stat: '15,000+',
      statLabel: 'Active Nodes'
    },
    {
      icon: Building,
      title: 'Development Decentralization',
      description: 'Bitcoin\'s open-source code is maintained by hundreds of contributors worldwide. No single company or individual controls development. Major changes require years of discussion and voluntary adoption.',
      stat: '800+',
      statLabel: 'Contributors'
    },
    {
      icon: Shield,
      title: 'Mining Decentralization',
      description: 'Bitcoin mining is performed by countless operations across dozens of countries. While pools aggregate hashpower, individual miners can switch pools instantly, preventing any single entity from controlling transaction ordering.',
      stat: '40+',
      statLabel: 'Mining Countries'
    }
  ];

  const comparisonData = [
    { attribute: 'Maximum Supply', bitcoin: '21 Million (Fixed Forever)', usd: 'Unlimited (Fed decides)', gold: '~244,000 tons (estimated remaining)' },
    { attribute: 'Issuance Control', bitcoin: 'Mathematical Algorithm', usd: 'Federal Reserve', gold: 'Mining Companies' },
    { attribute: 'Verification', bitcoin: 'Anyone with a computer', usd: 'Trust the bank', gold: 'Requires assay testing' },
    { attribute: 'Portability', bitcoin: '12 words in your head', usd: 'Physical cash / bank wires', gold: 'Heavy, expensive to transport' },
    { attribute: 'Divisibility', bitcoin: '100 million satoshis per BTC', usd: 'Cents (2 decimal places)', gold: 'Difficult to divide precisely' },
    { attribute: 'Seizure Resistance', bitcoin: 'Very high (self-custody)', usd: 'Low (banks can freeze)', gold: 'Medium (confiscation history)' },
    { attribute: 'Transaction Speed', bitcoin: '10-60 minutes (final)', usd: '1-5 business days (reversible)', gold: 'Days to weeks (physical)' },
    { attribute: 'Operating Hours', bitcoin: '24/7/365', usd: 'Banking hours only', gold: 'Market hours only' }
  ];

  return (
    <BitcoinSectionWrapper theme="light" id="what-is-bitcoin">
      <BitcoinSectionHeader
        badge="Foundation"
        badgeIcon={Bitcoin}
        title="What Is Bitcoin?"
        description="Bitcoin is a revolutionary form of money: digital, decentralized, and designed to give individuals true ownership of their wealth without relying on banks, governments, or any other intermediary."
      />

      {/* Opening Context */}
      <ScrollReveal direction="up">
        <div className="mb-16">
          <BitcoinQuote
            quote="Bitcoin is a technological tour de force. It's the first time in history that money can be transmitted around the world without the need for a trusted third party."
            author="Bill Gates"
            role="Co-founder of Microsoft"
          />
        </div>
      </ScrollReveal>

      {/* Core Pillars */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {corePillars.map((pillar, index) => (
            <BitcoinContentCard
              key={index}
              icon={pillar.icon}
              title={pillar.title}
            >
              <p className="mb-4 leading-relaxed">{pillar.description}</p>
              <ul className="space-y-2">
                {pillar.details.map((detail, i) => (
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

      {/* Understanding Trustless Systems */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
            Understanding "Trustless" Systems
          </h3>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                When Bitcoin is described as "trustless," it doesn't mean there's no trust involved—it means you don't need to trust any <strong className="text-foreground">specific person, company, or institution</strong>. Instead, you trust mathematics, cryptography, and transparent code that anyone can verify.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                In the traditional financial system, you trust that your bank won't lose your money, that the government won't inflate it away, and that payment processors won't freeze your account. Bitcoin eliminates these trust requirements by replacing them with verifiable mathematical proofs.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every Bitcoin transaction is validated by thousands of independent computers running the same open-source software. No single entity can fake a transaction, create Bitcoin out of thin air, or censor payments—the rules are enforced by cryptography, not by permission.
              </p>
            </div>
            
            <BitcoinKeyInsight type="insight" title="Why This Matters">
              <p className="mb-3">
                Traditional money requires you to trust that:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                  <span>Banks won't lose, freeze, or gamble with your deposits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                  <span>Central banks won't devalue your savings through inflation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                  <span>Payment processors won't block your transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                  <span>Governments won't seize or confiscate your assets</span>
                </li>
              </ul>
              <p>
                Bitcoin replaces all of this trust with <strong>verifiable mathematics</strong>. You don't hope the rules will be followed—you can <em>prove</em> they are.
              </p>
            </BitcoinKeyInsight>
          </div>
        </div>
      </ScrollReveal>

      {/* Decentralization Deep Dive */}
      <ScrollReveal direction="up" delay={0.3}>
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Globe className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
            The Three Layers of Decentralization
          </h3>
          
          <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            Bitcoin's resilience comes from being decentralized at multiple levels simultaneously. Each layer reinforces the others, creating a system that has proven impossible to shut down despite attempts by some of the world's most powerful governments.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {decentralizationLevels.map((level, index) => (
              <BitcoinContentCard key={index} icon={level.icon} title={level.title}>
                <p className="mb-4 text-sm leading-relaxed">{level.description}</p>
                <div className="pt-4 border-t border-border">
                  <div className="text-3xl font-bold text-[hsl(var(--watt-bitcoin))]">{level.stat}</div>
                  <div className="text-xs text-muted-foreground">{level.statLabel}</div>
                </div>
              </BitcoinContentCard>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Evolution of Money Deep Dive */}
      <ScrollReveal direction="up" delay={0.4}>
        <div className="mb-16">
          <BitcoinDeepDive title="Deep Dive: The Evolution of Money">
            <p>
              To understand why Bitcoin matters, we need to understand what money actually is. Throughout history, money has evolved through several distinct phases, each solving problems created by the previous form.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 my-6">
              <div className="space-y-3">
                <h5 className="font-semibold text-foreground flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                  Barter Economy (Ancient)
                </h5>
                <p>Direct exchange of goods required a "double coincidence of wants"—both parties needed what the other had. This severely limited trade.</p>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-semibold text-foreground flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                  Commodity Money (Thousands of years)
                </h5>
                <p>Shells, salt, cattle, and eventually precious metals became money. Gold emerged as ideal: scarce, divisible, durable, and universally recognized.</p>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-semibold text-foreground flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                  Representative Money (1800s-1971)
                </h5>
                <p>Paper notes represented claims on gold in bank vaults. Convenient for trade, but required trusting banks and governments to maintain reserves.</p>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-semibold text-foreground flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                  Fiat Money (1971-Present)
                </h5>
                <p>Nixon ended dollar-to-gold convertibility in 1971. Modern money is backed only by government decree and can be created without limit.</p>
              </div>
            </div>
            
            <div className="p-4 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg border border-[hsl(var(--watt-bitcoin)/0.2)]">
              <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Bitcoin className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                Bitcoin: The Next Evolution
              </h5>
              <p>
                Bitcoin combines the scarcity of gold with the convenience of digital payments—and adds something neither has: <strong>verifiable scarcity without trusted third parties</strong>. You can run the numbers yourself and prove exactly how many Bitcoin exist and will ever exist.
              </p>
            </div>
          </BitcoinDeepDive>
        </div>
      </ScrollReveal>

      {/* Comparison Table */}
      <ScrollReveal direction="up" delay={0.5}>
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Scale className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
            Bitcoin vs Traditional Assets
          </h3>
          
          <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            The following comparison illustrates how Bitcoin differs fundamentally from both fiat currency (like USD) and traditional stores of value (like gold). These aren't minor differences—they represent a paradigm shift in how money works.
          </p>
          
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full border-collapse bg-card">
              <thead>
                <tr className="border-b-2 border-border bg-muted/50">
                  <th className="text-left p-4 font-semibold text-foreground">Attribute</th>
                  <th className="text-left p-4 font-semibold text-[hsl(var(--watt-bitcoin))]">
                    <div className="flex items-center gap-2">
                      <Bitcoin className="w-5 h-5" />
                      Bitcoin
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5" />
                      US Dollar
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Gold
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{row.attribute}</td>
                    <td className="p-4 text-sm text-[hsl(var(--watt-bitcoin))] font-medium">{row.bitcoin}</td>
                    <td className="p-4 text-sm text-muted-foreground">{row.usd}</td>
                    <td className="p-4 text-sm text-muted-foreground">{row.gold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Summary Key Insight */}
      <ScrollReveal direction="up" delay={0.6}>
        <BitcoinKeyInsight type="success" title="What You've Learned">
          <div className="space-y-3">
            <p>
              <strong>Bitcoin is fundamentally different</strong> from every form of money that came before it. It's not just "digital gold" or "internet money"—it's the first asset in human history that combines:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-success))]">✓</span>
                <span><strong>Absolute scarcity</strong> — mathematically guaranteed 21 million cap</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-success))]">✓</span>
                <span><strong>True decentralization</strong> — no single point of control or failure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-success))]">✓</span>
                <span><strong>Permissionless access</strong> — anyone with internet can participate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-success))]">✓</span>
                <span><strong>Self-custody capability</strong> — hold your own keys, be your own bank</span>
              </li>
            </ul>
          </div>
        </BitcoinKeyInsight>
      </ScrollReveal>
    </BitcoinSectionWrapper>
  );
};

export default WhatIsBitcoinSection;
