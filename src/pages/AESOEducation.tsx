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
import { AncillaryServicesSection } from '@/components/aeso-education/AncillaryServicesSection';
import { PPAGuidanceSection } from '@/components/aeso-education/PPAGuidanceSection';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';
import { Zap, Users, DollarSign, TrendingUp, Calendar, Percent, Banknote, Activity, PieChart, BarChart3, FileText, Battery } from 'lucide-react';
import LastReviewed from '@/components/academy/LastReviewed';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { AESO_QUIZZES } from '@/constants/quiz-data';
import { AESO_FLASHCARDS } from '@/constants/flashcard-data';
import EducationSectionNav from '@/components/academy/EducationSectionNav';

// Navigation sections config
const navSections = [
  { id: 'what-is-aeso', icon: Zap, label: 'What is AESO', time: '5 min' },
  { id: 'market-participants', icon: Users, label: 'Participants', time: '6 min' },
  { id: 'pool-pricing', icon: DollarSign, label: 'Pool Pricing', time: '10 min' },
  { id: 'price-trends', icon: TrendingUp, label: 'Price Trends', time: '6 min' },
  { id: 'twelve-cp', icon: Calendar, label: '12CP', time: '8 min' },
  { id: 'savings-programs', icon: Percent, label: 'Savings', time: '6 min' },
  { id: 'rate-65', icon: Banknote, label: 'Rate 65', time: '6 min' },
  { id: 'ancillary-services', icon: Battery, label: 'Ancillary', time: '12 min' },
  { id: 'ppa-guidance', icon: FileText, label: 'PPAs', time: '15 min' },
  { id: 'grid-operations', icon: Activity, label: 'Grid Ops', time: '6 min' },
  { id: 'generation-mix', icon: PieChart, label: 'Gen Mix', time: '5 min' },
  { id: 'forecast', icon: BarChart3, label: 'Forecast', time: '5 min' },
];

const AESOEducation = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavigation />
      
      {/* Section Navigation - hidden on mobile, toggleable on desktop */}
      <EducationSectionNav sections={navSections} accentColor="watt-bitcoin" />

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

        <div id="ancillary-services">
          <AncillaryServicesSection />
        </div>

        {/* Knowledge Check after Ancillary Services */}
        {AESO_QUIZZES.find(q => q.sectionId === 'ancillary-services') && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <KnowledgeCheck
              title="Check Your Understanding: Ancillary Services"
              questions={AESO_QUIZZES.find(q => q.sectionId === 'ancillary-services')!.questions}
            />
          </div>
        )}

        <div id="ppa-guidance">
          <PPAGuidanceSection />
        </div>

        {/* Knowledge Check after PPA Guidance */}
        {AESO_QUIZZES.find(q => q.sectionId === 'ppa-guidance') && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <KnowledgeCheck
              title="Check Your Understanding: Power Purchase Agreements"
              questions={AESO_QUIZZES.find(q => q.sectionId === 'ppa-guidance')!.questions}
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
    </div>
  );
};

export default AESOEducation;
