import { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { KeyTermsGlossary } from '@/components/academy/KeyTermsGlossary';
import { IMMERSION_COOLING_QUIZZES } from '@/constants/quiz-data';
import { IMMERSION_COOLING_FLASHCARDS } from '@/constants/flashcard-data';
import { IMMERSION_COOLING_KEY_TERMS } from '@/constants/academy-glossary';

const ImmersionIntroSection = lazy(() => import('@/components/immersion-education/ImmersionIntroSection'));
const ImmersionTypesSection = lazy(() => import('@/components/immersion-education/ImmersionTypesSection'));
const DielectricFluidsSection = lazy(() => import('@/components/immersion-education/DielectricFluidsSection'));
const HardwarePrepSection = lazy(() => import('@/components/immersion-education/HardwarePrepSection'));
const TankSystemsSection = lazy(() => import('@/components/immersion-education/TankSystemsSection'));
const HeatTransferSection = lazy(() => import('@/components/immersion-education/HeatTransferSection'));
const OverclockingSection = lazy(() => import('@/components/immersion-education/OverclockingSection'));
const ImmersionEconomicsSection = lazy(() => import('@/components/immersion-education/ImmersionEconomicsSection'));
const ImmersionContainersSection = lazy(() => import('@/components/immersion-education/ImmersionContainersSection'));
const ImmersionMaintenanceSection = lazy(() => import('@/components/immersion-education/ImmersionMaintenanceSection'));
const ImmersionCTASection = lazy(() => import('@/components/immersion-education/ImmersionCTASection'));

const fluidQuiz = IMMERSION_COOLING_QUIZZES.find(q => q.sectionId === 'fluids');
const tankQuiz = IMMERSION_COOLING_QUIZZES.find(q => q.sectionId === 'tank-systems');
const ocQuiz = IMMERSION_COOLING_QUIZZES.find(q => q.sectionId === 'overclocking');

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function ImmersionCoolingEducation() {
  return (
    <ModuleLayout moduleId="immersion">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <QuickFlashcard deck={IMMERSION_COOLING_FLASHCARDS} />
        <KeyTermsGlossary moduleTitle="Immersion Cooling" terms={IMMERSION_COOLING_KEY_TERMS} />
      </div>

      <div id="introduction"><Suspense fallback={<SectionLoader />}><ImmersionIntroSection /></Suspense></div>
      <div id="types"><Suspense fallback={<SectionLoader />}><ImmersionTypesSection /></Suspense></div>
      <div id="fluids"><Suspense fallback={<SectionLoader />}><DielectricFluidsSection /></Suspense></div>
      {fluidQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={fluidQuiz.title} questions={fluidQuiz.questions} /></div>}

      <div id="hardware-prep"><Suspense fallback={<SectionLoader />}><HardwarePrepSection /></Suspense></div>
      <div id="tank-systems"><Suspense fallback={<SectionLoader />}><TankSystemsSection /></Suspense></div>
      {tankQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={tankQuiz.title} questions={tankQuiz.questions} /></div>}

      <div id="heat-transfer"><Suspense fallback={<SectionLoader />}><HeatTransferSection /></Suspense></div>
      <div id="overclocking"><Suspense fallback={<SectionLoader />}><OverclockingSection /></Suspense></div>
      {ocQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={ocQuiz.title} questions={ocQuiz.questions} /></div>}

      <div id="economics"><Suspense fallback={<SectionLoader />}><ImmersionEconomicsSection /></Suspense></div>
      <div id="containers"><Suspense fallback={<SectionLoader />}><ImmersionContainersSection /></Suspense></div>
      <div id="maintenance"><Suspense fallback={<SectionLoader />}><ImmersionMaintenanceSection /></Suspense></div>
      <Suspense fallback={<SectionLoader />}><ImmersionCTASection /></Suspense>
    </ModuleLayout>
  );
}
