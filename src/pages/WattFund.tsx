import React, { lazy, useState } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { LazySection } from '@/components/LazyErrorBoundary';
import { WattFundHero } from '@/components/wattfund/WattFundHero';
import { WattFundDivider } from '@/components/wattfund/WattFundDivider';
import { StickyProgressNav } from '@/components/wattfund/StickyProgressNav';
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
    <div className="min-h-screen bg-watt-navy text-white relative overflow-hidden">
      {/* Smooth scroll functionality */}
      <SmoothScroll />
      
      {/* Sticky Progress Navigation */}
      <StickyProgressNav />
      
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
      
      <LandingNavigation />
      
      <div className="relative z-10">
        <main>
          {/* Enhanced Hero Section */}
          <WattFundHero onInquiryClick={() => setShowInquiryForm(true)} />

          {/* Investment Thesis Section */}
          <LazySection componentName="Investment Thesis">
            <InvestmentThesisSection />
          </LazySection>

          <WattFundDivider variant="wave" color="bitcoin" />

          {/* Fund Overview Section */}
          <LazySection componentName="Fund Overview">
            <FundOverviewSection />
          </LazySection>

          <WattFundDivider variant="gradient" color="trust" />

          {/* Fund Growth Plan Section */}
          <LazySection componentName="Fund Growth Plan">
            <FundGrowthPlanSection />
          </LazySection>

          <WattFundDivider variant="wave" color="success" />

          {/* Why Invest Section */}
          <LazySection componentName="Why Invest">
            <WhyInvestSection />
          </LazySection>

          <WattFundDivider variant="particles" color="bitcoin" />

          {/* Market Opportunity Section */}
          <LazySection componentName="Market Opportunity">
            <MarketOpportunitySection />
          </LazySection>

          <WattFundDivider variant="wave" color="trust" />

          {/* Investment Process Section */}
          <LazySection componentName="Investment Process">
            <InvestmentProcessSection />
          </LazySection>

          {/* Investor CTA Section */}
          <LazySection componentName="Investment CTA">
            <InvestorCTASection />
          </LazySection>
        </main>

        <LandingFooter />
      </div>

      {/* SEO content */}
      <div className="sr-only">
        <h2>About WattFund Investment Opportunities</h2>
        <p>
          WattFund offers strategic infrastructure investment opportunities in renewable energy and data center development. 
          Our multi-fund approach targets $400M total capital deployment across three strategic funds.
        </p>
      </div>
    </div>
  );
};

export default WattFund;
