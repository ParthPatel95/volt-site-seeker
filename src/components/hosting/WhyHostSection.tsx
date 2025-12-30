import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Shield, Zap, Headphones, Snowflake } from 'lucide-react';

const bgColorMap: Record<string, string> = {
  'text-[hsl(var(--watt-success))]': 'bg-[hsl(var(--watt-success)/0.1)]',
  'text-[hsl(var(--watt-bitcoin))]': 'bg-[hsl(var(--watt-bitcoin)/0.1)]',
  'text-[hsl(var(--watt-trust))]': 'bg-[hsl(var(--watt-trust)/0.1)]'
};

const benefits = [
  {
    icon: Shield,
    title: '95% Guaranteed Uptime',
    description: 'Industry-leading reliability SLA backed by redundant power systems and proactive monitoring',
    color: 'text-[hsl(var(--watt-success))]'
  },
  {
    icon: Zap,
    title: 'Direct AESO Grid',
    description: 'Premium grid connectivity with competitive wholesale rates and strategic positioning',
    color: 'text-[hsl(var(--watt-bitcoin))]'
  },
  {
    icon: Headphones,
    title: '24/7 Expert Support',
    description: 'Round-the-clock monitoring and technical assistance from our experienced operations team',
    color: 'text-[hsl(var(--watt-trust))]'
  },
  {
    icon: Snowflake,
    title: 'Cold Climate Advantage',
    description: 'Natural cooling in Alberta reduces operational costs and extends hardware lifespan',
    color: 'text-[hsl(var(--watt-trust))]'
  }
];

export const WhyHostSection = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-[hsl(var(--watt-navy))] mb-4">
              Why Host With WattByte?
            </h2>
            <p className="text-lg text-[hsl(var(--watt-navy)/0.7)] max-w-2xl mx-auto">
              Professional infrastructure, competitive rates, and expert support for your mining operations
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 ${bgColorMap[benefit.color] || 'bg-[hsl(var(--watt-navy)/0.1)]'} rounded-lg flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${benefit.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[hsl(var(--watt-navy))] mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-[hsl(var(--watt-navy)/0.7)]">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
