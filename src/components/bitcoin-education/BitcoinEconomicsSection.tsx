import React, { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Coins, TrendingUp, Clock, BarChart3, ArrowDown, Percent } from 'lucide-react';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';


const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) => {
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
            setCount(easeOutQuart * end);
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

  return <div ref={countRef}>{prefix}{Math.floor(count).toLocaleString()}{suffix}</div>;
};

const BitcoinEconomicsSection: React.FC = () => {
  const halvingEvents = [
    { year: 2012, reward: 25, priceAtHalving: '$12', priceOneYearLater: '$1,000+' },
    { year: 2016, reward: 12.5, priceAtHalving: '$650', priceOneYearLater: '$2,500+' },
    { year: 2020, reward: 6.25, priceAtHalving: '$8,500', priceOneYearLater: '$55,000+' },
    { year: 2024, reward: 3.125, priceAtHalving: '$64,000', priceOneYearLater: 'TBD' }
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <LearningObjectives
          objectives={[
            "Understand Bitcoin's fixed 21 million supply and why it matters",
            "Learn how halving events reduce new supply every ~4 years",
            "See historical price performance around halving cycles",
            "Grasp the supply/demand dynamics driving Bitcoin's value"
          ]}
          estimatedTime="7 min"
          prerequisites={[
            { title: "What is Bitcoin", href: "/bitcoin#what-is-bitcoin" }
          ]}
        />
        
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-success/10 border border-watt-success/20 mb-4">
              <BarChart3 className="w-4 h-4 text-watt-success" />
              <span className="text-sm font-medium text-watt-success">Economics</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Bitcoin Economics
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Understanding the economic principles that make Bitcoin unique: fixed supply, 
              predictable issuance, and the halving cycle
            </p>
          </div>
        </ScrollReveal>

        {/* Supply Stats */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="bg-muted rounded-2xl p-6 text-center">
              <Coins className="w-8 h-8 text-watt-bitcoin mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">
                <AnimatedCounter end={21} suffix="M" />
              </div>
              <div className="text-sm text-muted-foreground">Maximum Supply</div>
            </div>
            <div className="bg-muted rounded-2xl p-6 text-center">
              <TrendingUp className="w-8 h-8 text-watt-bitcoin mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">
                ~<AnimatedCounter end={19} suffix=".8M" />
              </div>
              <div className="text-sm text-muted-foreground">Currently Mined</div>
            </div>
            <div className="bg-muted rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-watt-bitcoin mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">
                ~<AnimatedCounter end={2140} />
              </div>
              <div className="text-sm text-muted-foreground">Last BTC Mined</div>
            </div>
            <div className="bg-muted rounded-2xl p-6 text-center">
              <Percent className="w-8 h-8 text-watt-bitcoin mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">
                <AnimatedCounter end={94} suffix="%" />
              </div>
              <div className="text-sm text-muted-foreground">Already Mined</div>
            </div>
          </div>
        </ScrollReveal>

        {/* The Halving Explained */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl p-6 md:p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">The Halving Explained</h3>
            <p className="text-white/80 text-center max-w-2xl mx-auto mb-8">
              Every 210,000 blocks (~4 years), the block reward is cut in half. This controlled supply 
              reduction is programmed into Bitcoin's code and cannot be changed.
            </p>
            
            {/* Visual halving representation */}
            <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-4">
              {[50, 25, 12.5, 6.25, 3.125].map((reward, index) => (
                <div key={reward} className="flex items-center">
                  <div className="bg-watt-bitcoin/20 border border-watt-bitcoin/40 rounded-lg p-4 text-center min-w-[80px]">
                    <div className="text-lg font-bold text-white">{reward}</div>
                    <div className="text-xs text-white/60">BTC</div>
                  </div>
                  {index < 4 && (
                    <div className="mx-2 flex items-center">
                      <ArrowDown className="w-4 h-4 text-watt-bitcoin rotate-[-90deg]" />
                      <span className="text-xs text-watt-bitcoin ml-1">÷2</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Halving History Table */}
            <div className="bg-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Year</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Block Reward</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Price at Halving</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">~1 Year Later</th>
                  </tr>
                </thead>
                <tbody>
                  {halvingEvents.map((event) => (
                    <tr key={event.year} className="border-b border-white/5">
                      <td className="py-3 px-4 text-white font-medium">{event.year}</td>
                      <td className="py-3 px-4 text-watt-bitcoin">{event.reward} BTC</td>
                      <td className="py-3 px-4 text-white/80">{event.priceAtHalving}</td>
                      <td className="py-3 px-4 text-watt-success">{event.priceOneYearLater}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Supply vs Demand */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-muted rounded-2xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Supply Dynamics</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-watt-bitcoin/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-watt-bitcoin text-sm">1</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Fixed Maximum</span>
                    <p className="text-sm text-muted-foreground">Only 21 million Bitcoin will ever exist - no central bank can print more</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-watt-bitcoin/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-watt-bitcoin text-sm">2</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Decreasing Issuance</span>
                    <p className="text-sm text-muted-foreground">Halvings reduce new supply every 4 years, creating increasing scarcity</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-watt-bitcoin/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-watt-bitcoin text-sm">3</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Lost Coins</span>
                    <p className="text-sm text-muted-foreground">Estimated 3-4 million BTC are permanently lost, reducing effective supply</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-muted rounded-2xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Demand Drivers</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-watt-trust/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-watt-trust text-sm">1</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Institutional Adoption</span>
                    <p className="text-sm text-muted-foreground">ETFs, corporations, and funds adding Bitcoin to portfolios</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-watt-trust/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-watt-trust text-sm">2</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Store of Value</span>
                    <p className="text-sm text-muted-foreground">Increasing recognition as "digital gold" and inflation hedge</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-watt-trust/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-watt-trust text-sm">3</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Global Access</span>
                    <p className="text-sm text-muted-foreground">Growing adoption in emerging markets seeking financial alternatives</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
        
        <SectionSummary
          takeaways={[
            "Bitcoin has a fixed supply of 21 million — approximately 19.5M already mined",
            "Halving events cut new supply in half every ~210,000 blocks (~4 years)",
            "Historical pattern: significant price appreciation 12-18 months post-halving",
            "Scarcity + growing demand creates long-term value proposition"
          ]}
          proTip="Miners must remain profitable even as block rewards decrease. This is why efficiency ($/kWh) and advanced hardware become more critical after each halving."
          nextSteps={[
            { title: "Bitcoin Mining", href: "/bitcoin#mining" },
            { title: "Mining Economics", href: "/mining-economics" }
          ]}
        />
      </div>
    </section>
  );
};

export default BitcoinEconomicsSection;
