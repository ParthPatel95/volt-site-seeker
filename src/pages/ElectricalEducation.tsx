import { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { ELECTRICAL_QUIZZES } from '@/constants/quiz-data';
import { ELECTRICAL_FLASHCARDS } from '@/constants/flashcard-data';

const ElectricalIntroSection = lazy(() => import('@/components/electrical/ElectricalIntroSection'));
const GridConnectionSection = lazy(() => import('@/components/electrical/GridConnectionSection'));
const HighVoltageSection = lazy(() => import('@/components/electrical/HighVoltageSection'));
const TransformersSection = lazy(() => import('@/components/electrical/TransformersSection'));
const SwitchgearSection = lazy(() => import('@/components/electrical/SwitchgearSection'));
const LowVoltageSection = lazy(() => import('@/components/electrical/LowVoltageSection'));
const PDUSection = lazy(() => import('@/components/electrical/PDUSection'));
const MiningPowerSection = lazy(() => import('@/components/electrical/MiningPowerSection'));
const PowerQualitySection = lazy(() => import('@/components/electrical/PowerQualitySection'));
const GroundingSection = lazy(() => import('@/components/electrical/GroundingSection'));
const ArcFlashSection = lazy(() => import('@/components/electrical/ArcFlashSection'));
const RedundancySection = lazy(() => import('@/components/electrical/RedundancySection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const ElectricalEducation = () => {
  return (
    <ModuleLayout moduleId="electrical">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={ELECTRICAL_FLASHCARDS} /></div>

      <div id="fundamentals"><Suspense fallback={<SectionLoader />}><ElectricalIntroSection /></Suspense></div>
      <div id="grid-connection"><Suspense fallback={<SectionLoader />}><GridConnectionSection /></Suspense></div>
      <div id="high-voltage"><Suspense fallback={<SectionLoader />}><HighVoltageSection /></Suspense></div>
      <div id="transformers"><Suspense fallback={<SectionLoader />}><TransformersSection /></Suspense></div>
      <div id="switchgear"><Suspense fallback={<SectionLoader />}><SwitchgearSection /></Suspense></div>
      <div id="low-voltage"><Suspense fallback={<SectionLoader />}><LowVoltageSection /></Suspense></div>
      <div id="pdu"><Suspense fallback={<SectionLoader />}><PDUSection /></Suspense></div>
      <div id="mining-power"><Suspense fallback={<SectionLoader />}><MiningPowerSection /></Suspense></div>
      <div id="power-quality"><Suspense fallback={<SectionLoader />}><PowerQualitySection /></Suspense></div>
      <div id="grounding"><Suspense fallback={<SectionLoader />}><GroundingSection /></Suspense></div>
      <div id="arc-flash"><Suspense fallback={<SectionLoader />}><ArcFlashSection /></Suspense></div>
      <div id="redundancy"><Suspense fallback={<SectionLoader />}><RedundancySection /></Suspense></div>
    </ModuleLayout>
  );
};

export default ElectricalEducation;
