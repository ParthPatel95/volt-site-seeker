import { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { ELECTRICAL_QUIZZES } from '@/constants/quiz-data';
import { ELECTRICAL_FLASHCARDS } from '@/constants/flashcard-data';

const ElectricalFundamentalsSection = lazy(() => import('@/components/electrical-education/ElectricalFundamentalsSection'));
const UtilityGridConnectionSection = lazy(() => import('@/components/electrical-education/UtilityGridConnectionSection'));
const HighVoltageTransmissionSection = lazy(() => import('@/components/electrical-education/HighVoltageTransmissionSection'));
const PowerTransformersSection = lazy(() => import('@/components/electrical-education/PowerTransformersSection'));
const MediumVoltageSwitchgearSection = lazy(() => import('@/components/electrical-education/MediumVoltageSwitchgearSection'));
const LowVoltageDistributionSection = lazy(() => import('@/components/electrical-education/LowVoltageDistributionSection'));
const PowerDistributionUnitsSection = lazy(() => import('@/components/electrical-education/PowerDistributionUnitsSection'));
const MiningEquipmentPowerSection = lazy(() => import('@/components/electrical-education/MiningEquipmentPowerSection'));
const PowerQualitySection = lazy(() => import('@/components/electrical-education/PowerQualitySection'));
const GroundingBondingSection = lazy(() => import('@/components/electrical-education/GroundingBondingSection'));
const ArcFlashSafetySection = lazy(() => import('@/components/electrical-education/ArcFlashSafetySection'));
const RedundancyArchitecturesSection = lazy(() => import('@/components/electrical-education/RedundancyArchitecturesSection'));

const fundQuiz = ELECTRICAL_QUIZZES.find(q => q.sectionId === 'fundamentals');
const txQuiz = ELECTRICAL_QUIZZES.find(q => q.sectionId === 'transformers');
const afQuiz = ELECTRICAL_QUIZZES.find(q => q.sectionId === 'arc-flash');

const SectionLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-8 h-8 animate-spin border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

const ElectricalInfrastructureEducation = () => {
  return (
    <ModuleLayout moduleId="electrical">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={ELECTRICAL_FLASHCARDS} /></div>

      <div id="fundamentals"><Suspense fallback={<SectionLoader />}><ElectricalFundamentalsSection /></Suspense></div>
      {fundQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={fundQuiz.title} questions={fundQuiz.questions} /></div>}

      <div id="grid-connection"><Suspense fallback={<SectionLoader />}><UtilityGridConnectionSection /></Suspense></div>
      <div id="high-voltage"><Suspense fallback={<SectionLoader />}><HighVoltageTransmissionSection /></Suspense></div>
      <div id="transformers"><Suspense fallback={<SectionLoader />}><PowerTransformersSection /></Suspense></div>
      {txQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={txQuiz.title} questions={txQuiz.questions} /></div>}

      <div id="switchgear"><Suspense fallback={<SectionLoader />}><MediumVoltageSwitchgearSection /></Suspense></div>
      <div id="low-voltage"><Suspense fallback={<SectionLoader />}><LowVoltageDistributionSection /></Suspense></div>
      <div id="pdus"><Suspense fallback={<SectionLoader />}><PowerDistributionUnitsSection /></Suspense></div>
      <div id="mining-power"><Suspense fallback={<SectionLoader />}><MiningEquipmentPowerSection /></Suspense></div>
      <div id="power-quality"><Suspense fallback={<SectionLoader />}><PowerQualitySection /></Suspense></div>
      <div id="grounding"><Suspense fallback={<SectionLoader />}><GroundingBondingSection /></Suspense></div>
      <div id="arc-flash"><Suspense fallback={<SectionLoader />}><ArcFlashSafetySection /></Suspense></div>
      {afQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={afQuiz.title} questions={afQuiz.questions} /></div>}

      <div id="redundancy"><Suspense fallback={<SectionLoader />}><RedundancyArchitecturesSection /></Suspense></div>
    </ModuleLayout>
  );
};

export default ElectricalInfrastructureEducation;
