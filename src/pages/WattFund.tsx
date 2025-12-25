import React, { lazy, useState } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { LazySection } from '@/components/LazyErrorBoundary';
import { WattFundHero } from '@/components/wattfund/WattFundHero';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InvestmentInquiryForm } from '@/components/landing/InvestmentInquiryForm';

// Lazy load sections
const MarketOpportunitySection = lazy(() => import('@/components/landing/MarketOpportunitySection').then(module => ({ default: module.MarketOpportunitySection })));
const FundOverviewSection = lazy(() => import('@/components/landing/FundOverviewSection').then(module => ({ default: module.FundOverviewSection })));
const FundGrowthPlanSection = lazy(() => import('@/components/landing/FundGrowthPlanSection').then(module => ({ default: module.FundGrowthPlanSection })));
const InvestmentThesisSection = lazy(() => import('@/components/landing/InvestmentThesisSection').then(module => ({ default: module.InvestmentThesisSection })));
const WhyInvestSection = lazy(() => import('@/components/landing/WhyInvestSection').then(module => ({ default: module.WhyInvestSection })));
const InvestmentProcessSection = lazy(() => import('@/components/landing/InvestmentProcessSection').then(module => ({ default: module.InvestmentProcessSection })));
const InvestorCTASection = lazy(() => import('@/components/landing/InvestorCTASection').then(module => ({ default: module.InvestorCTASection })));

const WattFund: React.FC = () => {
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  const handleFormSuccess = () => {
    setShowInquiryForm(false);
  };

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

      {/* Investment Inquiry Dialog */}
      <Dialog open={showInquiryForm} onOpenChange={setShowInquiryForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-watt-navy">
              Start Your Investment Journey
            </DialogTitle>
            <DialogDescription className="text-watt-navy/70">
              Fill out the form below and our investment team will contact you to discuss opportunities in WattFund.
            </DialogDescription>
          </DialogHeader>
          <InvestmentInquiryForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Optimized background */}
      <LandingBackground />
      
      <LandingNavigation />
      
      <div className="relative z-10 safe-area-pt">
        <main>
          {/* New Enhanced Hero Section */}
          <WattFundHero onInquiryClick={() => setShowInquiryForm(true)} />

          <SectionDivider color="cyan" />

          {/* Investment Thesis Section */}
          <section aria-label="Investment Thesis" className="relative">
            <LazySection componentName="Investment Thesis">
              <InvestmentThesisSection />
            </LazySection>
          </section>

          <SectionDivider color="purple" />

          {/* Fund Overview Section */}
          <section aria-label="Fund Overview" className="relative">
            <LazySection componentName="Fund Overview">
              <FundOverviewSection />
            </LazySection>
          </section>

          <SectionDivider color="yellow" />

          {/* Fund Growth Plan Section */}
          <section aria-label="Fund Growth Plan" className="relative">
            <LazySection componentName="Fund Growth Plan">
              <FundGrowthPlanSection />
            </LazySection>
          </section>

          <SectionDivider color="cyan" />

          {/* Why Invest Section */}
          <section aria-label="Why Invest With WattFund" className="relative">
            <LazySection componentName="Why Invest">
              <WhyInvestSection />
            </LazySection>
          </section>

          <SectionDivider color="purple" />

          {/* Market Opportunity Section */}
          <section aria-label="Market Opportunity" className="relative">
            <LazySection componentName="Market Opportunity">
              <MarketOpportunitySection />
            </LazySection>
          </section>

          <SectionDivider color="yellow" />

          {/* Investment Process Section */}
          <section aria-label="Investment Process" className="relative">
            <LazySection componentName="Investment Process">
              <InvestmentProcessSection />
            </LazySection>
          </section>

          <SectionDivider color="cyan" />

          {/* Investor CTA Section */}
          <section aria-label="Ready to Invest" className="relative">
            <LazySection componentName="Investment CTA">
              <InvestorCTASection />
            </LazySection>
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