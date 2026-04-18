import { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { KeyTermsGlossary } from '@/components/academy/KeyTermsGlossary';
import { HYDRO_COOLING_QUIZZES } from '@/constants/quiz-data';
import { HYDRO_COOLING_FLASHCARDS } from '@/constants/flashcard-data';
import { HYDRO_COOLING_KEY_TERMS } from '@/constants/academy-glossary';

const HydroAdvantagesSection = lazy(() => import('@/components/hydro-education/HydroAdvantagesSection'));
const HydroContainerProductsSection = lazy(() => import('@/components/hydro-education/HydroContainerProductsSection'));
const HydroCoolingMethodsSection = lazy(() => import('@/components/hydro-education/HydroCoolingMethodsSection'));
const HydroSiteSelectionSection = lazy(() => import('@/components/hydro-education/HydroSiteSelectionSection'));
const HydroLayoutSection = lazy(() => import('@/components/hydro-education/HydroLayoutSection'));
const HydroWaterSystemsSection = lazy(() => import('@/components/hydro-education/HydroWaterSystemsSection'));
const HydroElectricalSection = lazy(() => import('@/components/hydro-education/HydroElectricalSection'));
const HydroNetworkSecuritySection = lazy(() => import('@/components/hydro-education/HydroNetworkSecuritySection'));
const HydroConstructionSection = lazy(() => import('@/components/hydro-education/HydroConstructionSection'));
const HydroEconomicsSection = lazy(() => import('@/components/hydro-education/HydroEconomicsSection'));
const HydroWasteHeatSection = lazy(() => import('@/components/hydro-education/HydroWasteHeatSection'));
const HydroNoiseManagementSection = lazy(() => import('@/components/hydro-education/HydroNoiseManagementSection'));
const HydroCTASection = lazy(() => import('@/components/hydro-education/HydroCTASection'));

const coolingQuiz = HYDRO_COOLING_QUIZZES.find(q => q.sectionId === 'cooling-methods');
const waterQuiz = HYDRO_COOLING_QUIZZES.find(q => q.sectionId === 'water-systems');
const econQuiz = HYDRO_COOLING_QUIZZES.find(q => q.sectionId === 'economics');

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const HydroDatacenterEducation = () => {
  return (
    <ModuleLayout moduleId="hydro">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <QuickFlashcard deck={HYDRO_COOLING_FLASHCARDS} />
        <KeyTermsGlossary moduleTitle="Hydro Cooling" terms={HYDRO_COOLING_KEY_TERMS} />
      </div>

      <div id="advantages"><Suspense fallback={<SectionLoader />}><HydroAdvantagesSection /></Suspense></div>
      <div id="containers"><Suspense fallback={<SectionLoader />}><HydroContainerProductsSection /></Suspense></div>
      <div id="cooling-methods"><Suspense fallback={<SectionLoader />}><HydroCoolingMethodsSection /></Suspense></div>
      {coolingQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={coolingQuiz.title} questions={coolingQuiz.questions} /></div>}

      <div id="site-selection"><Suspense fallback={<SectionLoader />}><HydroSiteSelectionSection /></Suspense></div>
      <div id="layout"><Suspense fallback={<SectionLoader />}><HydroLayoutSection /></Suspense></div>
      <div id="water-systems"><Suspense fallback={<SectionLoader />}><HydroWaterSystemsSection /></Suspense></div>
      {waterQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={waterQuiz.title} questions={waterQuiz.questions} /></div>}

      <div id="electrical"><Suspense fallback={<SectionLoader />}><HydroElectricalSection /></Suspense></div>
      <div id="network-security"><Suspense fallback={<SectionLoader />}><HydroNetworkSecuritySection /></Suspense></div>
      <div id="construction"><Suspense fallback={<SectionLoader />}><HydroConstructionSection /></Suspense></div>
      <div id="economics"><Suspense fallback={<SectionLoader />}><HydroEconomicsSection /></Suspense></div>
      {econQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={econQuiz.title} questions={econQuiz.questions} /></div>}

      <div id="waste-heat"><Suspense fallback={<SectionLoader />}><HydroWasteHeatSection /></Suspense></div>
      <div id="noise-management"><Suspense fallback={<SectionLoader />}><HydroNoiseManagementSection /></Suspense></div>
      <Suspense fallback={<SectionLoader />}><HydroCTASection /></Suspense>
    </ModuleLayout>
  );
};

export default HydroDatacenterEducation;
