import { ModuleLayout } from '@/components/academy/ModuleLayout';
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
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { AESO_QUIZZES } from '@/constants/quiz-data';
import { AESO_FLASHCARDS } from '@/constants/flashcard-data';

const AESOEducation = () => {
  return (
    <ModuleLayout moduleId="aeso">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={AESO_FLASHCARDS} /></div>

      <div id="what-is-aeso"><WhatIsAESOSection /></div>
      {AESO_QUIZZES.find(q => q.sectionId === 'what-is-aeso') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: What is AESO?" questions={AESO_QUIZZES.find(q => q.sectionId === 'what-is-aeso')!.questions} /></div>
      )}

      <div id="market-participants"><MarketParticipantsSection /></div>
      <div id="pool-pricing"><PoolPricingSection /></div>
      {AESO_QUIZZES.find(q => q.sectionId === 'pool-pricing') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: Pool Pricing" questions={AESO_QUIZZES.find(q => q.sectionId === 'pool-pricing')!.questions} /></div>
      )}

      <div id="price-trends"><AESOPriceTrendsSection /></div>
      <div id="twelve-cp"><TwelveCPExplainedSection /></div>
      {AESO_QUIZZES.find(q => q.sectionId === 'twelve-cp') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: 12CP" questions={AESO_QUIZZES.find(q => q.sectionId === 'twelve-cp')!.questions} /></div>
      )}

      <div id="savings-programs"><AESOSavingsProgramsSection /></div>
      <div id="rate-65"><Rate65ExplainedSection /></div>
      {AESO_QUIZZES.find(q => q.sectionId === 'rate-65') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: Rate 65" questions={AESO_QUIZZES.find(q => q.sectionId === 'rate-65')!.questions} /></div>
      )}

      <div id="ancillary-services"><AncillaryServicesSection /></div>
      {AESO_QUIZZES.find(q => q.sectionId === 'ancillary-services') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: Ancillary Services" questions={AESO_QUIZZES.find(q => q.sectionId === 'ancillary-services')!.questions} /></div>
      )}

      <div id="ppa-guidance"><PPAGuidanceSection /></div>
      {AESO_QUIZZES.find(q => q.sectionId === 'ppa-guidance') && (
        <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title="Check Your Understanding: Power Purchase Agreements" questions={AESO_QUIZZES.find(q => q.sectionId === 'ppa-guidance')!.questions} /></div>
      )}

      <div id="grid-operations"><GridOperationsSection /></div>
      <div id="generation-mix"><GenerationMixSection /></div>
      <div id="forecast"><EnergyForecastSection /></div>
      <div id="cta"><AESOCTASection /></div>
    </ModuleLayout>
  );
};

export default AESOEducation;
