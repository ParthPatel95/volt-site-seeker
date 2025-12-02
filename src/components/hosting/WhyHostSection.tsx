import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Shield, Zap, Headphones, Snowflake } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: '95% Guaranteed Uptime',
    description: 'Industry-leading reliability SLA backed by redundant power systems and proactive monitoring',
    color: 'text-watt-success'
  },
  {
    icon: Zap,
    title: 'Direct AESO Grid',
    description: 'Premium grid connectivity with competitive wholesale rates and strategic positioning',
    color: 'text-watt-bitcoin'
  },
  {
    icon: Headphones,
    title: '24/7 Expert Support',
    description: 'Round-the-clock monitoring and technical assistance from our experienced operations team',
    color: 'text-watt-trust'
  },
  {
    icon: Snowflake,
    title: 'Cold Climate Advantage',
    description: 'Natural cooling in Alberta reduces operational costs and extends hardware lifespan',
    color: 'text-watt-trust'
  }
];

export const WhyHostSection = () => {
  return (
    <section className="py-12 md:py-16 bg-watt-light">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-watt-navy mb-4">
              Why Host With WattByte?
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Professional infrastructure, competitive rates, and expert support for your mining operations
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="bg-white border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 bg-${benefit.color.replace('text-', '')}/10 rounded-lg flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${benefit.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-watt-navy mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-watt-navy/70">
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
