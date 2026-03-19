import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import DatacenterHeroSectionV2 from '@/components/datacenter-education/DatacenterHeroSectionV2';
import SectionNavigation from '@/components/datacenter-education/SectionNavigation';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { NextModuleRecommendation } from '@/components/academy/NextModuleRecommendation';
import { DATACENTER_QUIZZES } from '@/constants/quiz-data';
import { DATACENTER_FLASHCARDS } from '@/constants/flashcard-data';

const EnergySourceSection = lazy(() => import('@/components/datacenter-education/EnergySourceSection'));
const ElectricalInfrastructureSection = lazy(() => import('@/components/datacenter-education/ElectricalInfrastructureSection'));
const FacilityDesignSection = lazy(() => import('@/components/datacenter-education/FacilityDesignSection'));
const AirflowContainmentSection = lazy(() => import('@/components/datacenter-education/AirflowContainmentSection'));
const CoolingSystemsVisualSection = lazy(() => import('@/components/datacenter-education/CoolingSystemsVisualSection'));
const MiningHardwareShowcaseSection = lazy(() => import('@/components/datacenter-education/MiningHardwareShowcaseSection'));
const OperationsMonitoringSection = lazy(() => import('@/components/datacenter-education/OperationsMonitoringSection'));
const DatacenterEconomicsSection = lazy(() => import('@/components/datacenter-education/DatacenterEconomicsSection'));
const InteractiveFacilityTour = lazy(() => import('@/components/datacenter-education/InteractiveFacilityTour'));
const EnhancedCTASection = lazy(() => import('@/components/datacenter-education/EnhancedCTASection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-[hsl(var(--watt-bitcoin))] border-t-transparent rounded-full animate-spin" />
  </div>
);

const facilityQuiz = DATACENTER_QUIZZES.find(q => q.sectionId === 'facility-design');
const coolingQuiz = DATACENTER_QUIZZES.find(q => q.sectionId === 'cooling-systems');
const hardwareQuiz = DATACENTER_QUIZZES.find(q => q.sectionId === 'hardware');

const DatacenterEducation = () => {
  return (
    <div className="min-h-screen bg-background">
      <SmoothScroll />
      <LandingNavigation />
      <SectionNavigation />
      
      <div>
        <DatacenterHeroSectionV2 />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <QuickFlashcard deck={DATACENTER_FLASHCARDS} />
        </div>
      
        <Suspense fallback={<SectionLoader />}><EnergySourceSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><ElectricalInfrastructureSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><FacilityDesignSection /></Suspense>
        {facilityQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={facilityQuiz.title} questions={facilityQuiz.questions} /></div>}
        
        <Suspense fallback={<SectionLoader />}><AirflowContainmentSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><CoolingSystemsVisualSection /></Suspense>
        {coolingQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={coolingQuiz.title} questions={coolingQuiz.questions} /></div>}
        
        <Suspense fallback={<SectionLoader />}><MiningHardwareShowcaseSection /></Suspense>
        {hardwareQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={hardwareQuiz.title} questions={hardwareQuiz.questions} /></div>}
        
        <Suspense fallback={<SectionLoader />}><OperationsMonitoringSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><DatacenterEconomicsSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><InteractiveFacilityTour /></Suspense>
        <Suspense fallback={<SectionLoader />}><EnhancedCTASection /></Suspense>
      </div>
      
      <NextModuleRecommendation moduleId="datacenters" />
      <LandingFooter />
      <PageTranslationButton pageId="datacenters-101" />
    </div>
  );
};

export default DatacenterEducation;
