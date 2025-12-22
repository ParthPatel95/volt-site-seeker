import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Zap, Building2, Scale, Cpu, ArrowRight, Sparkles } from 'lucide-react';

const BitcoinFutureSection: React.FC = () => {
  const developments = [
    {
      icon: Zap,
      title: 'Lightning Network',
      description: 'Layer 2 solution enabling instant, low-cost payments. Already processing millions of transactions for micropayments and everyday purchases.',
      status: 'Live & Growing',
      color: 'bg-watt-bitcoin/10 text-watt-bitcoin'
    },
    {
      icon: Building2,
      title: 'Institutional Infrastructure',
      description: 'Banks, asset managers, and financial institutions building Bitcoin custody, trading, and investment products at unprecedented scale.',
      status: 'Accelerating',
      color: 'bg-watt-trust/10 text-watt-trust'
    },
    {
      icon: Scale,
      title: 'Regulatory Clarity',
      description: 'Countries developing clear frameworks for Bitcoin. Spot ETF approvals signal growing regulatory acceptance in major markets.',
      status: 'Evolving',
      color: 'bg-watt-success/10 text-watt-success'
    },
    {
      icon: Cpu,
      title: 'AI & HPC Integration',
      description: 'Bitcoin mining infrastructure increasingly co-located with AI and high-performance computing, sharing power and cooling resources.',
      status: 'Emerging',
      color: 'bg-watt-bitcoin/10 text-watt-bitcoin'
    }
  ];

  const trends = [
    {
      title: 'Corporate Treasury',
      description: 'More companies following MicroStrategy\'s lead in holding Bitcoin as a treasury reserve asset'
    },
    {
      title: 'Sovereign Adoption',
      description: 'Additional countries exploring Bitcoin for reserves, payments, or legal tender status'
    },
    {
      title: 'Energy Innovation',
      description: 'Mining driving innovation in renewable energy, stranded gas capture, and grid stabilization'
    },
    {
      title: 'Financial Rails',
      description: 'Bitcoin increasingly used for international settlements and cross-border payments'
    }
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-muted">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/20 mb-4">
              <Sparkles className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Looking Ahead</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              The Future of Bitcoin
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From scaling solutions to institutional adoption, Bitcoin's ecosystem continues to mature and expand
            </p>
          </div>
        </ScrollReveal>

        {/* Key Developments */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {developments.map((item, index) => (
            <ScrollReveal key={item.title} direction="up" delay={index * 0.1}>
              <div className="bg-card rounded-2xl p-6 border border-border shadow-institutional h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-watt-success/10 text-watt-success">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Trends to Watch */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="bg-gradient-to-br from-watt-navy to-watt-navy/90 rounded-2xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Trends to Watch</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {trends.map((trend) => (
                <div key={trend.title} className="flex items-start gap-3 bg-white/10 rounded-xl p-4 border border-white/10">
                  <ArrowRight className="w-5 h-5 text-watt-bitcoin flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-1">{trend.title}</h4>
                    <p className="text-white/70 text-sm">{trend.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* WattByte Connection */}
        <ScrollReveal direction="up" delay={0.5}>
          <div className="mt-8 bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/80 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-white" />
              <h3 className="text-xl font-bold text-white">Where WattByte Fits In</h3>
            </div>
            <p className="text-white/90 mb-4">
              As Bitcoin mining matures, the focus shifts from hashrate alone to sustainable, 
              profitable operations. WattByte is positioned at this intersection:
            </p>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Strategic infrastructure in cold climates with low-cost power
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Integration with AI/HPC workloads for diversified revenue
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Operational expertise to maximize mining profitability
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Investment vehicles for exposure to infrastructure growth
              </li>
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BitcoinFutureSection;
