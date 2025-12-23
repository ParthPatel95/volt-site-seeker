// Bitcoin Education Page
import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';
import { Bitcoin, History, Settings, Wallet, Cpu, Thermometer, Users, Leaf, TrendingUp, Gift, Globe, Rocket } from 'lucide-react';
import LastReviewed from '@/components/academy/LastReviewed';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { BITCOIN_QUIZZES } from '@/constants/quiz-data';
import { BITCOIN_FLASHCARDS } from '@/constants/flashcard-data';
import EducationSectionNav from '@/components/academy/EducationSectionNav';

// Section navigation config
const bitcoinSections = [
  { id: 'what-is-bitcoin', icon: Bitcoin, label: 'What is Bitcoin', time: '5 min' },
  { id: 'history', icon: History, label: 'History', time: '6 min' },
  { id: 'how-it-works', icon: Settings, label: 'How it Works', time: '8 min' },
  { id: 'wallets', icon: Wallet, label: 'Wallets', time: '5 min' },
  { id: 'mining', icon: Cpu, label: 'Mining', time: '7 min' },
  { id: 'cooling', icon: Thermometer, label: 'Cooling', time: '6 min' },
  { id: 'pools', icon: Users, label: 'Mining Pools', time: '5 min' },
  { id: 'sustainability', icon: Leaf, label: 'Sustainability', time: '6 min' },
  { id: 'economics', icon: TrendingUp, label: 'Economics', time: '7 min' },
  { id: 'benefits', icon: Gift, label: 'Benefits', time: '5 min' },
  { id: 'adoption', icon: Globe, label: 'Adoption', time: '6 min' },
  { id: 'future', icon: Rocket, label: 'Future', time: '5 min' },
];

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
      
      {/* Section Navigation - hidden on mobile, appears on scroll */}
      <EducationSectionNav sections={bitcoinSections} accentColor="watt-bitcoin" />
      
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
