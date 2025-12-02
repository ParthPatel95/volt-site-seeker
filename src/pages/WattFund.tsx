import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll, ScrollReveal } from '@/components/landing/ScrollAnimations';
import { ChevronDown } from 'lucide-react';

// Lazy load sections
const MarketOpportunitySection = lazy(() => import('@/components/landing/MarketOpportunitySection').then(module => ({ default: module.MarketOpportunitySection })));
const FundOverviewSection = lazy(() => import('@/components/landing/FundOverviewSection').then(module => ({ default: module.FundOverviewSection })));
const FundGrowthPlanSection = lazy(() => import('@/components/landing/FundGrowthPlanSection').then(module => ({ default: module.FundGrowthPlanSection })));
const InvestmentThesisSection = lazy(() => import('@/components/landing/InvestmentThesisSection').then(module => ({ default: module.InvestmentThesisSection })));
const WhyInvestSection = lazy(() => import('@/components/landing/WhyInvestSection').then(module => ({ default: module.WhyInvestSection })));
const InvestmentProcessSection = lazy(() => import('@/components/landing/InvestmentProcessSection').then(module => ({ default: module.InvestmentProcessSection })));
const InvestorCTASection = lazy(() => import('@/components/landing/InvestorCTASection').then(module => ({ default: module.InvestorCTASection })));

// Animated Counter Component
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
          const startValue = 0;

          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * (end - startValue) + startValue));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div ref={countRef}>
      {count}{suffix}
    </div>
  );
};

const SectionLoader = () => (
  <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-watt-trust border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const WattFund: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      {/* Smooth scroll functionality */}
      <SmoothScroll />
      
      {/* SEO content */}
      <header>
        <h1 className="sr-only">WattFund - Infrastructure Investment Opportunities</h1>
        <p className="sr-only">
          Explore WattByte's infrastructure investment funds, market opportunities, and fund growth plans. 
          Learn about our strategic approach to renewable energy and data center development.
        </p>
      </header>

      {/* Optimized background */}
      <LandingBackground />
      
      <LandingNavigation />
      
      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10 safe-area-pt">
        <main>
          {/* Enhanced Hero Section */}
          <section className="relative py-28 md:py-36 px-4 sm:px-6 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-trust/20 overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-watt-trust/10 via-transparent to-transparent opacity-50" />
            
            <div className="max-w-6xl mx-auto text-center relative z-10">
              <ScrollReveal direction="up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6 backdrop-blur-sm">
                  <span className="text-sm font-medium text-watt-bitcoin">Investment Opportunities</span>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={100}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                  WattFund
                </h1>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={200}>
                <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
                  Strategic infrastructure investment funds targeting renewable energy and data center development across North America
                </p>
              </ScrollReveal>

              {/* Animated Key Stats */}
              <ScrollReveal direction="up" delay={300}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                      $<AnimatedCounter end={400} suffix="M" />
                    </div>
                    <div className="text-white/70 text-sm">Total Capital Target</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                      <AnimatedCounter end={3} /> Funds
                    </div>
                    <div className="text-white/70 text-sm">Strategic Vehicles</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                      <AnimatedCounter end={30} suffix="%" />-<AnimatedCounter end={40} suffix="%" />
                    </div>
                    <div className="text-white/70 text-sm">Target Net IRR</div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Scroll Indicator */}
              <ScrollReveal direction="up" delay={400}>
                <div className="flex justify-center">
                  <div className="animate-bounce">
                    <ChevronDown className="w-8 h-8 text-white/50" />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          <SectionDivider color="cyan" />

          {/* Investment Thesis Section */}
          <section aria-label="Investment Thesis" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <InvestmentThesisSection />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Fund Overview Section */}
          <section aria-label="Fund Overview" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <FundOverviewSection />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* Fund Growth Plan Section */}
          <section aria-label="Fund Growth Plan" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <FundGrowthPlanSection />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

          {/* Why Invest Section */}
          <section aria-label="Why Invest With WattFund" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <WhyInvestSection />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Market Opportunity Section */}
          <section aria-label="Market Opportunity" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <MarketOpportunitySection />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* Investment Process Section */}
          <section aria-label="Investment Process" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <InvestmentProcessSection />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

          {/* Investor CTA Section */}
          <section aria-label="Ready to Invest" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <InvestorCTASection />
            </Suspense>
          </section>
        </main>

        <LandingFooter />
      </div>

      {/* SEO content */}
      <div className="sr-only">
        <h2>About WattFund Investment Opportunities</h2>
        <p>
          WattFund offers strategic infrastructure investment opportunities in renewable energy and data center development. 
          Our multi-fund approach targets $400M total capital deployment across three strategic funds, with proven market opportunities 
          and explosive growth potential in AI, HPC, and cryptocurrency infrastructure.
        </p>
        
        <h3>Investment Strategy</h3>
        <ul>
          <li>Fund I: $25M targeting 12-15 natural gas and hydroelectric opportunities</li>
          <li>Fund II: $125M focusing on energy storage and smart grid technologies</li>
          <li>Fund III: $250M for advanced technologies and nuclear energy projects</li>
        </ul>
        
        <h3>Market Opportunity</h3>
        <p>
          The digital infrastructure market presents unprecedented growth opportunities with AI and Bitcoin mining creating 
          exponential demand for power infrastructure. WattFund capitalizes on power cost arbitrage and strategic positioning 
          in emerging data center markets.
        </p>
      </div>
    </div>
  );
};

export default WattFund;
