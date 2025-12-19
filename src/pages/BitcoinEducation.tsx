// Bitcoin Education Page
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';
import { ProgressTracker, Section } from '@/components/academy/ProgressTracker';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { ArrowUp } from 'lucide-react';
import LastReviewed from '@/components/academy/LastReviewed';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { BITCOIN_QUIZZES } from '@/constants/quiz-data';
import { BITCOIN_FLASHCARDS } from '@/constants/flashcard-data';

// Eager load hero for faster initial paint
import BitcoinHeroSection from '@/components/bitcoin-education/BitcoinHeroSection';

// Lazy load remaining sections
const WhatIsBitcoinSection = lazy(() => import('@/components/bitcoin-education/WhatIsBitcoinSection'));
const BitcoinHistorySection = lazy(() => import('@/components/bitcoin-education/BitcoinHistorySection'));
const HowBitcoinWorksSection = lazy(() => import('@/components/bitcoin-education/HowBitcoinWorksSection'));
const BitcoinWalletsSection = lazy(() => import('@/components/bitcoin-education/BitcoinWalletsSection'));
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

// Define sections for progress tracking
const BITCOIN_SECTIONS: Section[] = [
  { id: 'what-is-bitcoin', title: 'What is Bitcoin?', anchor: 'what-is-bitcoin' },
  { id: 'history', title: 'Bitcoin History', anchor: 'history' },
  { id: 'how-it-works', title: 'How Bitcoin Works', anchor: 'how-it-works' },
  { id: 'wallets', title: 'Wallets & Storage', anchor: 'wallets' },
  { id: 'mining', title: 'Bitcoin Mining', anchor: 'mining' },
  { id: 'cooling', title: 'Datacenter Cooling', anchor: 'cooling' },
  { id: 'pools', title: 'Mining Pools', anchor: 'pools' },
  { id: 'sustainability', title: 'Sustainability', anchor: 'sustainability' },
  { id: 'economics', title: 'Bitcoin Economics', anchor: 'economics' },
  { id: 'benefits', title: 'Benefits', anchor: 'benefits' },
  { id: 'adoption', title: 'Global Adoption', anchor: 'adoption' },
  { id: 'future', title: 'Future Outlook', anchor: 'future' },
];

const BitcoinEducation: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const {
    progress,
    toggleSection,
    resetProgress,
  } = useProgressTracking('bitcoin', BITCOIN_SECTIONS.length);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollProgress);
      
      // Show/hide scroll to top button
      setShowScrollTop(scrollTop > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      <SmoothScroll />
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-watt-bitcoin transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
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

      {/* Progress Tracker - Fixed on desktop, collapsible */}
      <div className="fixed bottom-24 right-4 z-40 hidden lg:block w-72">
        <ProgressTracker
          moduleTitle="Bitcoin 101"
          sections={BITCOIN_SECTIONS}
          completedSections={progress.completedSections}
          onToggleSection={toggleSection}
          onReset={resetProgress}
        />
      </div>

      {/* Mobile Progress Tracker - Bottom sheet style */}
      <div className="fixed bottom-24 left-4 right-4 z-30 lg:hidden">
        <ProgressTracker
          moduleTitle="Bitcoin 101"
          sections={BITCOIN_SECTIONS}
          completedSections={progress.completedSections}
          onToggleSection={toggleSection}
          onReset={resetProgress}
        />
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-4 z-40 p-3 rounded-full bg-watt-bitcoin text-white shadow-lg transition-all duration-300 hover:bg-watt-bitcoin/90 lg:bottom-[400px] ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
      
      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10 safe-area-pt">
        <main>
          {/* Hero Section */}
          <div id="hero">
            <BitcoinHeroSection />
          </div>

          <SectionDivider color="yellow" />

          {/* Flashcard Deck - Study Key Terms */}
          <div className="max-w-4xl mx-auto px-4 py-8">
            <QuickFlashcard deck={BITCOIN_FLASHCARDS} />
          </div>

          <SectionDivider color="cyan" />

          {/* What is Bitcoin */}
          <div id="what-is-bitcoin">
            <section aria-label="What is Bitcoin">
              <Suspense fallback={<SectionLoader />}>
                <WhatIsBitcoinSection />
              </Suspense>
            </section>
          </div>

          {/* Knowledge Check after What is Bitcoin */}
          {BITCOIN_QUIZZES.find(q => q.sectionId === 'what-is-bitcoin') && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <KnowledgeCheck
                title="Check Your Understanding: What is Bitcoin?"
                questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'what-is-bitcoin')!.questions}
              />
            </div>
          )}

          <SectionDivider color="cyan" />

          {/* Bitcoin History */}
          <div id="history">
            <section aria-label="Bitcoin History">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinHistorySection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="purple" />

          {/* How Bitcoin Works */}
          <div id="how-it-works">
            <section aria-label="How Bitcoin Works">
              <Suspense fallback={<SectionLoader />}>
                <HowBitcoinWorksSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="yellow" />

          {/* Bitcoin Wallets & Storage */}
          <div id="wallets">
            <section aria-label="Bitcoin Wallets and Storage">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinWalletsSection />
              </Suspense>
            </section>
          </div>

          {/* Knowledge Check after Wallets */}
          {BITCOIN_QUIZZES.find(q => q.sectionId === 'wallets') && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <KnowledgeCheck
                title="Check Your Understanding: Bitcoin Wallets"
                questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'wallets')!.questions}
              />
            </div>
          )}

          <SectionDivider color="cyan" />

          {/* Bitcoin Mining Basics */}
          <div id="mining">
            <section aria-label="Bitcoin Mining">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinMiningSection />
              </Suspense>
            </section>
          </div>

          {/* Knowledge Check after Mining */}
          {BITCOIN_QUIZZES.find(q => q.sectionId === 'mining') && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <KnowledgeCheck
                title="Check Your Understanding: Bitcoin Mining"
                questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'mining')!.questions}
              />
            </div>
          )}

          <SectionDivider color="cyan" />

          {/* Datacenter Cooling Technologies */}
          <div id="cooling">
            <section aria-label="Datacenter Cooling Technologies">
              <Suspense fallback={<SectionLoader />}>
                <DatacenterCoolingSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="purple" />

          {/* Mining Pools */}
          <div id="pools">
            <section aria-label="Mining Pools">
              <Suspense fallback={<SectionLoader />}>
                <MiningPoolsSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="yellow" />

          {/* Mining Sustainability */}
          <div id="sustainability">
            <section aria-label="Mining and Energy Sustainability">
              <Suspense fallback={<SectionLoader />}>
                <MiningSustainabilitySection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="cyan" />

          {/* Bitcoin Economics */}
          <div id="economics">
            <section aria-label="Bitcoin Economics">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinEconomicsSection />
              </Suspense>
            </section>
          </div>

          {/* Knowledge Check after Economics */}
          {BITCOIN_QUIZZES.find(q => q.sectionId === 'economics') && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <KnowledgeCheck
                title="Check Your Understanding: Bitcoin Economics"
                questions={BITCOIN_QUIZZES.find(q => q.sectionId === 'economics')!.questions}
              />
            </div>
          )}

          <SectionDivider color="purple" />

          {/* Bitcoin Benefits */}
          <div id="benefits">
            <section aria-label="Bitcoin Benefits">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinBenefitsSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="yellow" />

          {/* Global Adoption */}
          <div id="adoption">
            <section aria-label="Global Bitcoin Adoption">
              <Suspense fallback={<SectionLoader />}>
                <GlobalBitcoinAdoptionSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="cyan" />

          {/* Future Outlook */}
          <div id="future">
            <section aria-label="Bitcoin Future">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinFutureSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="purple" />

          {/* CTA Section */}
          <div id="cta">
            <section aria-label="Start Your Bitcoin Journey">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinCTASection />
              </Suspense>
            </section>
          </div>

          {/* Last Reviewed Footer */}
          <div className="max-w-4xl mx-auto px-4 pb-8">
            <LastReviewed
              date="December 2024"
              reviewer="WattByte Education Team"
              variant="footer"
            />
          </div>
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
