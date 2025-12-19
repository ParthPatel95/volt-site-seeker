import { useEffect, useState } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { AESOHeroSection } from '@/components/aeso-education/AESOHeroSection';
import { WhatIsAESOSection } from '@/components/aeso-education/WhatIsAESOSection';
import { PoolPricingSection } from '@/components/aeso-education/PoolPricingSection';
import { AESOPriceTrendsSection } from '@/components/aeso-education/AESOPriceTrendsSection';
import { TwelveCPExplainedSection } from '@/components/aeso-education/TwelveCPExplainedSection';
import { AESOSavingsProgramsSection } from '@/components/aeso-education/AESOSavingsProgramsSection';
import { Rate65ExplainedSection } from '@/components/aeso-education/Rate65ExplainedSection';
import { GridOperationsSection } from '@/components/aeso-education/GridOperationsSection';
import { GenerationMixSection } from '@/components/aeso-education/GenerationMixSection';
import { EnergyForecastSection } from '@/components/aeso-education/EnergyForecastSection';
import { AESOCTASection } from '@/components/aeso-education/AESOCTASection';
import { MarketParticipantsSection } from '@/components/aeso-education/MarketParticipantsSection';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';
import { ProgressTracker, Section } from '@/components/academy/ProgressTracker';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { ChevronUp } from 'lucide-react';
import LastReviewed from '@/components/academy/LastReviewed';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { AESO_QUIZZES } from '@/constants/quiz-data';
import { AESO_FLASHCARDS } from '@/constants/flashcard-data';

// Define sections for progress tracking
const AESO_SECTIONS: Section[] = [
  { id: 'what-is-aeso', title: 'What is AESO?', anchor: 'what-is-aeso' },
  { id: 'market-participants', title: 'Market Participants', anchor: 'market-participants' },
  { id: 'pool-pricing', title: 'Pool Pricing', anchor: 'pool-pricing' },
  { id: 'price-trends', title: 'Price Trends', anchor: 'price-trends' },
  { id: 'twelve-cp', title: '12CP Explained', anchor: 'twelve-cp' },
  { id: 'savings-programs', title: 'Savings Programs', anchor: 'savings-programs' },
  { id: 'rate-65', title: 'Rate 65 (DTS)', anchor: 'rate-65' },
  { id: 'grid-operations', title: 'Grid Operations', anchor: 'grid-operations' },
  { id: 'generation-mix', title: 'Generation Mix', anchor: 'generation-mix' },
  { id: 'forecast', title: 'Energy Forecast', anchor: 'forecast' },
];

const AESOEducation = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const {
    progress,
    toggleSection,
    resetProgress,
  } = useProgressTracking('aeso', AESO_SECTIONS.length);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">

      <LandingNavigation />

      {/* Progress Tracker - Fixed on desktop */}
      <div className="fixed bottom-24 right-4 z-40 hidden lg:block w-72">
        <ProgressTracker
          moduleTitle="AESO 101"
          sections={AESO_SECTIONS}
          completedSections={progress.completedSections}
          onToggleSection={toggleSection}
          onReset={resetProgress}
        />
      </div>

      {/* Mobile Progress Tracker */}
      <div className="fixed bottom-20 left-4 right-4 z-40 lg:hidden">
        <ProgressTracker
          moduleTitle="AESO 101"
          sections={AESO_SECTIONS}
          completedSections={progress.completedSections}
          onToggleSection={toggleSection}
          onReset={resetProgress}
        />
      </div>

      <main className="pt-16">
        <div id="hero">
          <AESOHeroSection />
        </div>

        {/* Flashcard Deck */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <QuickFlashcard deck={AESO_FLASHCARDS} />
        </div>

        <div id="what-is-aeso">
          <WhatIsAESOSection />
        </div>

        {/* Knowledge Check after What is AESO */}
        {AESO_QUIZZES.find(q => q.sectionId === 'what-is-aeso') && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <KnowledgeCheck
              title="Check Your Understanding: What is AESO?"
              questions={AESO_QUIZZES.find(q => q.sectionId === 'what-is-aeso')!.questions}
            />
          </div>
        )}

        <div id="market-participants">
          <MarketParticipantsSection />
        </div>
        <div id="pool-pricing">
          <PoolPricingSection />
        </div>

        {/* Knowledge Check after Pool Pricing */}
        {AESO_QUIZZES.find(q => q.sectionId === 'pool-pricing') && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <KnowledgeCheck
              title="Check Your Understanding: Pool Pricing"
              questions={AESO_QUIZZES.find(q => q.sectionId === 'pool-pricing')!.questions}
            />
          </div>
        )}

        <div id="price-trends">
          <AESOPriceTrendsSection />
        </div>
        <div id="twelve-cp">
          <TwelveCPExplainedSection />
        </div>

        {/* Knowledge Check after 12CP */}
        {AESO_QUIZZES.find(q => q.sectionId === 'twelve-cp') && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <KnowledgeCheck
              title="Check Your Understanding: 12CP"
              questions={AESO_QUIZZES.find(q => q.sectionId === 'twelve-cp')!.questions}
            />
          </div>
        )}

        <div id="savings-programs">
          <AESOSavingsProgramsSection />
        </div>
        <div id="rate-65">
          <Rate65ExplainedSection />
        </div>

        {/* Knowledge Check after Rate 65 */}
        {AESO_QUIZZES.find(q => q.sectionId === 'rate-65') && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <KnowledgeCheck
              title="Check Your Understanding: Rate 65"
              questions={AESO_QUIZZES.find(q => q.sectionId === 'rate-65')!.questions}
            />
          </div>
        )}

        <div id="grid-operations">
          <GridOperationsSection />
        </div>
        <div id="generation-mix">
          <GenerationMixSection />
        </div>
        <div id="forecast">
          <EnergyForecastSection />
        </div>
        <div id="cta">
          <AESOCTASection />
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

      {/* Page Translation Button */}
      <PageTranslationButton pageId="aeso-101" />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-watt-bitcoin text-white shadow-lg transition-all duration-300 hover:bg-watt-bitcoin/90 lg:bottom-[400px] ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AESOEducation;
