import React, { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Globe, Landmark, Building2, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number | null = null;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <div ref={countRef}>{count.toLocaleString()}{suffix}</div>;
};

const GlobalBitcoinAdoptionSection: React.FC = () => {
  const governmentHoldings = [
    { country: 'United States', flag: '🇺🇸', btc: '~213,000', source: 'Seized assets' },
    { country: 'China', flag: '🇨🇳', btc: '~194,000', source: 'Seized assets' },
    { country: 'United Kingdom', flag: '🇬🇧', btc: '~61,000', source: 'Seized assets' },
    { country: 'El Salvador', flag: '🇸🇻', btc: '~6,000', source: 'Purchased' },
    { country: 'Ukraine', flag: '🇺🇦', btc: '~46,000', source: 'Donations' },
    { country: 'Bhutan', flag: '🇧🇹', btc: '~13,000', source: 'Mining' }
  ];

  const corporateHoldings = [
    { company: 'MicroStrategy', btc: '~528,000', value: '~$54B' },
    { company: 'Marathon Digital', btc: '~46,000', value: '~$4.7B' },
    { company: 'Tesla', btc: '~9,700', value: '~$1B' },
    { company: 'Coinbase', btc: '~9,400', value: '~$960M' },
    { company: 'Block (Square)', btc: '~8,000', value: '~$820M' }
  ];

  const adoptionMilestones = [
    { metric: 'Bitcoin Holders', value: 560, suffix: 'M+', description: 'People own Bitcoin globally' },
    { metric: 'Daily Transactions', value: 400, suffix: 'K+', description: 'On-chain transactions per day' },
    { metric: 'ETF AUM', value: 120, suffix: 'B+', description: 'Assets in US Bitcoin ETFs' },
    { metric: 'Active Addresses', value: 1, suffix: 'M+', description: 'Daily active addresses' }
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/20 mb-4">
              <Globe className="w-4 h-4 text-watt-trust" />
              <span className="text-sm font-medium text-watt-trust">Global Adoption</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Bitcoin Around the World
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From individuals to corporations to governments, Bitcoin adoption continues to accelerate globally
            </p>
          </div>
        </ScrollReveal>

        {/* Adoption Stats */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {adoptionMilestones.map((item) => (
              <div key={item.metric} className="bg-muted rounded-2xl p-5 text-center">
                <div className="text-2xl md:text-3xl font-bold text-watt-bitcoin mb-1">
                  <AnimatedCounter end={item.value} suffix={item.suffix} />
                </div>
                <div className="text-sm font-medium text-foreground mb-1">{item.metric}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Legal Tender Countries */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="bg-gradient-to-r from-watt-bitcoin/10 to-watt-trust/10 rounded-2xl p-6 mb-8 border border-watt-bitcoin/20">
            <div className="flex items-center gap-3 mb-4">
              <Landmark className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-foreground">Legal Tender Status</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🇸🇻</span>
                  <div>
                    <div className="font-bold text-foreground">El Salvador</div>
                    <div className="text-sm text-muted-foreground">First country to adopt (Sept 2021)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-watt-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bitcoin accepted for all transactions</span>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🇨🇫</span>
                  <div>
                    <div className="font-bold text-foreground">Central African Republic</div>
                    <div className="text-sm text-muted-foreground">Adopted April 2022</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-watt-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Legal tender alongside CFA franc</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Government & Corporate Holdings */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Government Holdings */}
          <ScrollReveal direction="left" delay={0.3}>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-institutional h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-watt-trust/10 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-watt-trust" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Government Holdings</h3>
              </div>
              <div className="space-y-3">
                {governmentHoldings.map((item) => (
                  <div key={item.country} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.flag}</span>
                      <div>
                        <div className="font-medium text-foreground text-sm">{item.country}</div>
                        <div className="text-xs text-muted-foreground">{item.source}</div>
                      </div>
                    </div>
                    <div className="font-bold text-watt-bitcoin text-sm">{item.btc} BTC</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Corporate Holdings */}
          <ScrollReveal direction="right" delay={0.3}>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-institutional h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-watt-bitcoin/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-watt-bitcoin" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Corporate Holdings</h3>
              </div>
              <div className="space-y-3">
                {corporateHoldings.map((item) => (
                  <div key={item.company} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium text-foreground text-sm">{item.company}</div>
                      <div className="text-xs text-muted-foreground">{item.btc} BTC</div>
                    </div>
                    <div className="font-bold text-watt-success text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ETF Impact */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="mt-8 bg-watt-navy rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-white">2024: The ETF Era</h3>
            </div>
            <p className="text-white/80 mb-6">
              The SEC's approval of spot Bitcoin ETFs in January 2024 marked a watershed moment, 
              opening Bitcoin investment to traditional finance through familiar investment vehicles.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">11</div>
                <div className="text-white/70 text-sm">Spot ETFs approved</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">$120B+</div>
                <div className="text-white/70 text-sm">Total assets under management</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">Record</div>
                <div className="text-white/70 text-sm">Fastest ETF to $10B AUM</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default GlobalBitcoinAdoptionSection;
