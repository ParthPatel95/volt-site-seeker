import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';

// Lazy load sections
const MarketOpportunitySection = lazy(() => import('@/components/landing/MarketOpportunitySection').then(module => ({ default: module.MarketOpportunitySection })));
const FundOverviewSection = lazy(() => import('@/components/landing/FundOverviewSection').then(module => ({ default: module.FundOverviewSection })));
const FundGrowthPlanSection = lazy(() => import('@/components/landing/FundGrowthPlanSection').then(module => ({ default: module.FundGrowthPlanSection })));

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
          {/* Hero Section */}
          <section className="relative py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-br from-watt-navy via-watt-navy to-watt-trust/20">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6">
                <span className="text-sm font-medium text-watt-bitcoin">Investment Opportunities</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                WattFund
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Strategic infrastructure investment funds targeting renewable energy and data center development across North America
              </p>
            </div>
          </section>

          <SectionDivider color="cyan" />

          {/* Fund Overview Section */}
          <section aria-label="Fund Overview" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <FundOverviewSection />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Fund Growth Plan Section */}
          <section aria-label="Fund Growth Plan" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <FundGrowthPlanSection />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* Market Opportunity Section */}
          <section aria-label="Market Opportunity" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <MarketOpportunitySection />
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
