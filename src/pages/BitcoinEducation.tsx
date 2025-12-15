// Bitcoin Education Page
import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';

// Eager load hero for faster initial paint
import BitcoinHeroSection from '@/components/bitcoin-education/BitcoinHeroSection';

// Lazy load remaining sections
const WhatIsBitcoinSection = lazy(() => import('@/components/bitcoin-education/WhatIsBitcoinSection'));
const BitcoinHistorySection = lazy(() => import('@/components/bitcoin-education/BitcoinHistorySection'));
const HowBitcoinWorksSection = lazy(() => import('@/components/bitcoin-education/HowBitcoinWorksSection'));
const BitcoinMiningSection = lazy(() => import('@/components/bitcoin-education/BitcoinMiningSection'));
const DatacenterCoolingSection = lazy(() => import('@/components/bitcoin-education/DatacenterCoolingSection'));
const MiningPoolsSection = lazy(() => import('@/components/bitcoin-education/MiningPoolsSection'));
const MiningSustainabilitySection = lazy(() => import('@/components/bitcoin-education/MiningSustainabilitySection'));
const BitcoinEconomicsSection = lazy(() => import('@/components/bitcoin-education/BitcoinEconomicsSection'));
const BitcoinBenefitsSection = lazy(() => import('@/components/bitcoin-education/BitcoinBenefitsSection'));
const GlobalBitcoinAdoptionSection = lazy(() => import('@/components/bitcoin-education/GlobalBitcoinAdoptionSection'));
const BitcoinFutureSection = lazy(() => import('@/components/bitcoin-education/BitcoinFutureSection'));
const BitcoinCTASection = lazy(() => import('@/components/bitcoin-education/BitcoinCTASection'));

const SectionLoader = () => (
  <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-watt-bitcoin border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const BitcoinEducation: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      <SmoothScroll />
      
      {/* SEO content */}
      <header>
        <h1 className="sr-only">Understanding Bitcoin - A Comprehensive Guide</h1>
        <p className="sr-only">
          Learn everything about Bitcoin: what it is, how it works, Bitcoin mining, datacenter cooling technologies,
          mining pools, economics, benefits, global adoption, and the future of cryptocurrency.
        </p>
      </header>

      <LandingBackground />
      <LandingNavigation />
      
      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10 safe-area-pt">
        <main>
          {/* Hero Section - Eager loaded for fast initial paint */}
          <BitcoinHeroSection />

          <SectionDivider color="yellow" />

          {/* What is Bitcoin */}
          <section aria-label="What is Bitcoin">
            <Suspense fallback={<SectionLoader />}>
              <WhatIsBitcoinSection />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

          {/* Bitcoin History */}
          <section aria-label="Bitcoin History">
            <Suspense fallback={<SectionLoader />}>
              <BitcoinHistorySection />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* How Bitcoin Works */}
          <section aria-label="How Bitcoin Works">
            <Suspense fallback={<SectionLoader />}>
              <HowBitcoinWorksSection />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* Bitcoin Mining Basics */}
          <section aria-label="Bitcoin Mining">
            <Suspense fallback={<SectionLoader />}>
              <BitcoinMiningSection />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

          {/* Datacenter Cooling Technologies - NEW */}
          <section aria-label="Datacenter Cooling Technologies">
            <Suspense fallback={<SectionLoader />}>
              <DatacenterCoolingSection />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Mining Pools - NEW */}
          <section aria-label="Mining Pools">
            <Suspense fallback={<SectionLoader />}>
              <MiningPoolsSection />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* Mining Sustainability - NEW */}
          <section aria-label="Mining and Energy Sustainability">
            <Suspense fallback={<SectionLoader />}>
              <MiningSustainabilitySection />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

          {/* Bitcoin Economics */}
          <section aria-label="Bitcoin Economics">
            <Suspense fallback={<SectionLoader />}>
              <BitcoinEconomicsSection />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Bitcoin Benefits */}
          <section aria-label="Bitcoin Benefits">
            <Suspense fallback={<SectionLoader />}>
              <BitcoinBenefitsSection />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* Global Adoption */}
          <section aria-label="Global Bitcoin Adoption">
            <Suspense fallback={<SectionLoader />}>
              <GlobalBitcoinAdoptionSection />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

          {/* Future Outlook */}
          <section aria-label="Bitcoin Future">
            <Suspense fallback={<SectionLoader />}>
              <BitcoinFutureSection />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* CTA Section */}
          <section aria-label="Start Your Bitcoin Journey">
            <Suspense fallback={<SectionLoader />}>
              <BitcoinCTASection />
            </Suspense>
          </section>
        </main>

        <LandingFooter />
      </div>

      {/* Page Translation Button */}
      <PageTranslationButton pageId="bitcoin-101" />

      {/* SEO content */}
      <div className="sr-only">
        <h2>Comprehensive Bitcoin Education</h2>
        <p>
          This guide covers everything you need to know about Bitcoin: its creation by Satoshi Nakamoto,
          how blockchain technology works, the mining process, datacenter cooling technologies (air-cooled, 
          hydro cooling, immersion cooling), mining pools, economic principles like halving and scarcity,
          benefits as a store of value, global adoption trends, and future developments like the Lightning Network.
        </p>
      </div>
    </div>
  );
};

export default BitcoinEducation;
