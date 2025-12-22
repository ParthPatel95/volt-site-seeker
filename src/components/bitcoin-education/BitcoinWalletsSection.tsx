import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { 
  Wallet, 
  Key, 
  Shield, 
  Smartphone, 
  HardDrive, 
  FileText, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';


const BitcoinWalletsSection: React.FC = () => {
  const walletTypes = [
    {
      title: 'Hot Wallets',
      subtitle: 'Software Wallets',
      icon: Smartphone,
      description: 'Apps on your phone or computer that are connected to the internet. Easy to use for daily transactions.',
      examples: 'Blue Wallet, Exodus, Trust Wallet',
      security: 3,
      convenience: 5,
      bestFor: 'Daily transactions, small amounts',
      color: 'from-watt-bitcoin to-watt-bitcoin/70'
    },
    {
      title: 'Cold Wallets',
      subtitle: 'Hardware Wallets',
      icon: HardDrive,
      description: 'Physical devices that store your private keys completely offline. Industry standard for secure storage.',
      examples: 'Ledger, Trezor, ColdCard',
      security: 5,
      convenience: 3,
      bestFor: 'Long-term storage, large amounts',
      color: 'from-watt-trust to-watt-trust/70'
    },
    {
      title: 'Paper Wallets',
      subtitle: 'Physical Backup',
      icon: FileText,
      description: 'Private keys printed or written on paper. Completely offline but requires careful physical storage.',
      examples: 'Printed QR codes, metal backups',
      security: 4,
      convenience: 1,
      bestFor: 'Cold storage backups, gifts',
      color: 'from-watt-success to-watt-success/70'
    },
    {
      title: 'Custodial',
      subtitle: 'Exchange Wallets',
      icon: Building2,
      description: 'Third parties hold your keys for you. Convenient but you don\'t have full control of your Bitcoin.',
      examples: 'Coinbase, Kraken, Binance',
      security: 2,
      convenience: 5,
      bestFor: 'Beginners, active trading',
      color: 'from-purple-500 to-purple-500/70'
    }
  ];

  const keyConcepts = [
    {
      title: 'Private Key',
      icon: EyeOff,
      description: 'A secret 256-bit number that proves ownership of your Bitcoin. Never share this with anyone!',
      visual: '5Kb8kLf9zgWQnogidDA76MzPL6TsZZY36hWXMssSzNydYXYB9KF',
      warning: true
    },
    {
      title: 'Public Key',
      icon: Eye,
      description: 'Derived from your private key. Used to generate your Bitcoin address. Safe to share.',
      visual: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      warning: false
    },
    {
      title: 'Seed Phrase',
      icon: Key,
      description: '12 or 24 words that can recover your entire wallet. Store in multiple secure locations.',
      visual: 'word word word word word word word word word word word word',
      warning: true
    }
  ];

  const securityTips = [
    { text: 'Use hardware wallets for significant holdings', icon: HardDrive },
    { text: 'Never share your private keys or seed phrase', icon: ShieldAlert },
    { text: 'Store seed phrase backups in multiple secure locations', icon: Lock },
    { text: 'Enable 2FA on all exchange accounts', icon: ShieldCheck },
    { text: 'Beware of phishing scams and fake wallet apps', icon: AlertTriangle },
    { text: 'Consider multi-signature setups for extra security', icon: Shield }
  ];

  const renderSecurityStars = (level: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`w-2 h-2 rounded-full ${
              star <= level ? 'bg-watt-success' : 'bg-muted-foreground/20'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderConvenienceStars = (level: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`w-2 h-2 rounded-full ${
              star <= level ? 'bg-watt-bitcoin' : 'bg-muted-foreground/20'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-muted">
      <div className="max-w-6xl mx-auto">
        <LearningObjectives
          objectives={[
            "Understand the difference between hot, cold, paper, and custodial wallets",
            "Learn why 'not your keys, not your coins' is the core principle of self-custody",
            "Know the security vs convenience trade-offs for each wallet type",
            "Master best practices for securing your Bitcoin"
          ]}
          estimatedTime="8 min"
          prerequisites={[
            { title: "How Bitcoin Works", href: "/bitcoin#how-it-works" }
          ]}
        />
        
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/20 mb-4">
              <Wallet className="w-4 h-4 text-watt-trust" />
              <span className="text-sm font-medium text-watt-trust">Storage & Security</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Storing Your Bitcoin
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Understanding the different ways to secure your digital assets and why self-custody matters
            </p>
          </div>
        </ScrollReveal>

        {/* Not Your Keys Banner */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-watt-navy rounded-2xl p-6 md:p-8 mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Key className="w-8 h-8 text-watt-bitcoin" />
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                "Not Your Keys, Not Your Coins"
              </h3>
            </div>
            <p className="text-white/80 max-w-2xl mx-auto">
              This famous phrase in Bitcoin means: if you don't control your private keys, you don't truly own your Bitcoin. 
              Self-custody gives you full control—no third party can freeze, seize, or lose your funds.
            </p>
          </div>
        </ScrollReveal>

        {/* Key Concepts */}
        <ScrollReveal direction="up" delay={0.2}>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Understanding Keys</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {keyConcepts.map((concept, index) => (
              <div 
                key={concept.title} 
                className={`bg-card rounded-xl p-5 border ${
                  concept.warning ? 'border-watt-bitcoin/30' : 'border-border'
                } shadow-institutional`}
              >
                <div className="flex items-start justify-between mb-3">
                  <concept.icon className={`w-8 h-8 ${concept.warning ? 'text-watt-bitcoin' : 'text-watt-trust'}`} />
                  {concept.warning && (
                    <span className="text-xs font-medium text-watt-bitcoin bg-watt-bitcoin/10 px-2 py-1 rounded-full">
                      Keep Secret!
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-foreground mb-2">{concept.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{concept.description}</p>
                <div className="bg-muted rounded-lg p-2 font-mono text-xs text-muted-foreground truncate">
                  {concept.visual}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Wallet Types */}
        <ScrollReveal direction="up" delay={0.3}>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Types of Wallets</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {walletTypes.map((wallet, index) => (
              <ScrollReveal key={wallet.title} direction="up" delay={0.1 * index}>
                <div className="bg-card rounded-2xl p-5 border border-border shadow-institutional h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center mb-4`}>
                    <wallet.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-foreground mb-1">{wallet.title}</h4>
                  <p className="text-xs text-muted-foreground/50 mb-3">{wallet.subtitle}</p>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">{wallet.description}</p>
                  
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Security</span>
                      {renderSecurityStars(wallet.security)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Convenience</span>
                      {renderConvenienceStars(wallet.convenience)}
                    </div>
                    <div className="pt-2">
                      <span className="text-xs font-medium text-foreground/80">Best for:</span>
                      <p className="text-xs text-muted-foreground">{wallet.bestFor}</p>
                    </div>
                    <div className="pt-1">
                      <span className="text-xs font-medium text-foreground/80">Examples:</span>
                      <p className="text-xs text-muted-foreground">{wallet.examples}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        {/* Security vs Convenience Visual */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-institutional mb-10">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">Security vs. Convenience Trade-off</h3>
            <div className="relative h-48 md:h-64">
              {/* Axes */}
              <div className="absolute left-8 top-0 bottom-8 w-px bg-border" />
              <div className="absolute left-8 bottom-8 right-0 h-px bg-border" />
              
              {/* Labels */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground whitespace-nowrap">
                Security
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
                Convenience
              </div>

              {/* Wallet positions */}
              <div className="absolute" style={{ left: '25%', top: '15%' }}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-watt-trust/20 flex items-center justify-center mb-1">
                    <HardDrive className="w-5 h-5 text-watt-trust" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Cold</span>
                </div>
              </div>
              
              <div className="absolute" style={{ left: '35%', top: '35%' }}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-watt-success/20 flex items-center justify-center mb-1">
                    <FileText className="w-5 h-5 text-watt-success" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Paper</span>
                </div>
              </div>

              <div className="absolute" style={{ left: '70%', top: '45%' }}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-watt-bitcoin/20 flex items-center justify-center mb-1">
                    <Smartphone className="w-5 h-5 text-watt-bitcoin" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Hot</span>
                </div>
              </div>

              <div className="absolute" style={{ left: '85%', top: '70%' }}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-1">
                    <Building2 className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Custodial</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Security Best Practices */}
        <ScrollReveal direction="up" delay={0.5}>
          <div className="bg-watt-navy rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-watt-bitcoin" />
              Security Best Practices
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityTips.map((tip, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-watt-success/20 flex items-center justify-center flex-shrink-0">
                    <tip.icon className="w-4 h-4 text-watt-success" />
                  </div>
                  <p className="text-sm text-white/80">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
        
        <SectionSummary
          takeaways={[
            "'Not your keys, not your coins' — self-custody is the only way to truly own Bitcoin",
            "Hardware wallets (cold storage) are the gold standard for securing large amounts",
            "Never store your seed phrase digitally or share your private key with anyone",
            "Match your wallet choice to your use case: hot for daily spending, cold for savings"
          ]}
          proTip="Consider a multi-signature setup for serious holdings — requiring 2 of 3 keys to spend adds significant protection against theft or loss of a single device."
          nextSteps={[
            { title: "Bitcoin Benefits", href: "/bitcoin#benefits" },
            { title: "Global Adoption", href: "/bitcoin#adoption" }
          ]}
        />
      </div>
    </section>
  );
};

export default BitcoinWalletsSection;
