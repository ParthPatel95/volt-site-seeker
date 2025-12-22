import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Shield, Globe, TrendingUp, Users, Eye, Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react';

const BitcoinBenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Store of Value',
      description: 'Often called "Digital Gold," Bitcoin\'s fixed supply makes it an attractive hedge against inflation and currency debasement.',
      color: 'bg-watt-bitcoin/10 text-watt-bitcoin'
    },
    {
      icon: Shield,
      title: 'Inflation Hedge',
      description: 'Unlike fiat currencies that can be printed infinitely, Bitcoin\'s supply is mathematically limited and predictable.',
      color: 'bg-watt-trust/10 text-watt-trust'
    },
    {
      icon: Globe,
      title: 'Borderless Transactions',
      description: 'Send value anywhere in the world, 24/7, without intermediaries or currency conversion fees.',
      color: 'bg-watt-success/10 text-watt-success'
    },
    {
      icon: Users,
      title: 'Financial Inclusion',
      description: 'Anyone with internet access can use Bitcoin, providing banking services to the 1.7 billion unbanked people worldwide.',
      color: 'bg-watt-bitcoin/10 text-watt-bitcoin'
    },
    {
      icon: Eye,
      title: 'Transparent & Auditable',
      description: 'Every transaction is recorded on a public ledger, making the system fully transparent and auditable by anyone.',
      color: 'bg-watt-trust/10 text-watt-trust'
    },
    {
      icon: Wallet,
      title: 'Self-Custody',
      description: 'You can be your own bank. No one can freeze, seize, or block access to your Bitcoin if you hold your own keys.',
      color: 'bg-watt-success/10 text-watt-success'
    }
  ];

  const considerations = [
    {
      title: 'Price Volatility',
      description: 'Bitcoin can experience significant price swings in short periods. Only invest what you can afford to hold long-term.'
    },
    {
      title: 'Learning Curve',
      description: 'Understanding wallets, keys, and security best practices takes time. Education is essential before investing.'
    },
    {
      title: 'Regulatory Uncertainty',
      description: 'Regulations vary by country and continue to evolve. Stay informed about rules in your jurisdiction.'
    },
    {
      title: 'Security Responsibility',
      description: 'Self-custody means you\'re responsible for security. Lost keys mean lost Bitcoin - there\'s no customer support.'
    }
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-muted">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/20 mb-4">
              <CheckCircle2 className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Benefits & Considerations</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Why Bitcoin Matters
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Understanding both the benefits and considerations helps you make informed decisions
            </p>
          </div>
        </ScrollReveal>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <ScrollReveal key={benefit.title} direction="up" delay={index * 0.05}>
              <div className="bg-card rounded-2xl p-6 border border-border shadow-institutional h-full hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center mb-4`}>
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Considerations */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-institutional">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Important Considerations</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              A balanced view is essential. While Bitcoin offers unique benefits, there are important 
              factors to understand before getting involved.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {considerations.map((item) => (
                <div key={item.title} className="bg-muted rounded-xl p-4">
                  <h4 className="font-bold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BitcoinBenefitsSection;
