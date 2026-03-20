import React, { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
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

const facilityQuiz = DATACENTER_QUIZZES.find(q => q.sectionId === 'facility-design');
const coolingQuiz = DATACENTER_QUIZZES.find(q => q.sectionId === 'cooling-systems');
const hardwareQuiz = DATACENTER_QUIZZES.find(q => q.sectionId === 'hardware');

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const DatacenterEducation = () => {
  return (
    <ModuleLayout moduleId="datacenters">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={DATACENTER_FLASHCARDS} /></div>

      <div id="power-journey"><Suspense fallback={<SectionLoader />}><EnergySourceSection /></Suspense></div>
      <div id="electrical"><Suspense fallback={<SectionLoader />}><ElectricalInfrastructureSection /></Suspense></div>
      <div id="facility-layout"><Suspense fallback={<SectionLoader />}><FacilityDesignSection /></Suspense></div>
      {facilityQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={facilityQuiz.title} questions={facilityQuiz.questions} /></div>}

      <div id="airflow"><Suspense fallback={<SectionLoader />}><AirflowContainmentSection /></Suspense></div>
      <div id="cooling"><Suspense fallback={<SectionLoader />}><CoolingSystemsVisualSection /></Suspense></div>
      {coolingQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={coolingQuiz.title} questions={coolingQuiz.questions} /></div>}

      <div id="hardware"><Suspense fallback={<SectionLoader />}><MiningHardwareShowcaseSection /></Suspense></div>
      {hardwareQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={hardwareQuiz.title} questions={hardwareQuiz.questions} /></div>}

      <div id="operations"><Suspense fallback={<SectionLoader />}><OperationsMonitoringSection /></Suspense></div>
      <div id="economics"><Suspense fallback={<SectionLoader />}><DatacenterEconomicsSection /></Suspense></div>
      <div id="tour"><Suspense fallback={<SectionLoader />}><InteractiveFacilityTour /></Suspense></div>
      <div id="cta"><Suspense fallback={<SectionLoader />}><EnhancedCTASection /></Suspense></div>
    </ModuleLayout>
  );
};

export default DatacenterEducation;
