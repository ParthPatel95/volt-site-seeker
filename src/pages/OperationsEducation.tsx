import { Suspense, lazy } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { OPERATIONS_QUIZZES } from '@/constants/quiz-data';
import { OPERATIONS_FLASHCARDS } from '@/constants/flashcard-data';

const OperationsIntroSection = lazy(() => import('@/components/operations/OperationsIntroSection').then(m => ({ default: m.OperationsIntroSection })));
const MonitoringSystemsSection = lazy(() => import('@/components/operations/MonitoringSystemsSection').then(m => ({ default: m.MonitoringSystemsSection })));
const PreventiveMaintenanceSection = lazy(() => import('@/components/operations/PreventiveMaintenanceSection').then(m => ({ default: m.PreventiveMaintenanceSection })));
const TroubleshootingSection = lazy(() => import('@/components/operations/TroubleshootingSection').then(m => ({ default: m.TroubleshootingSection })));
const PerformanceOptimizationSection = lazy(() => import('@/components/operations/PerformanceOptimizationSection').then(m => ({ default: m.PerformanceOptimizationSection })));
const TeamStructureSection = lazy(() => import('@/components/operations/TeamStructureSection').then(m => ({ default: m.TeamStructureSection })));
const SafetyProtocolsSection = lazy(() => import('@/components/operations/SafetyProtocolsSection').then(m => ({ default: m.SafetyProtocolsSection })));
const DocumentationSection = lazy(() => import('@/components/operations/DocumentationSection').then(m => ({ default: m.DocumentationSection })));
const OperationsCTASection = lazy(() => import('@/components/operations/OperationsCTASection').then(m => ({ default: m.OperationsCTASection })));

const monitoringQuiz = OPERATIONS_QUIZZES.find(q => q.sectionId === 'monitoring');
const maintenanceQuiz = OPERATIONS_QUIZZES.find(q => q.sectionId === 'preventive-maintenance');

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const OperationsEducation = () => {
  return (
    <ModuleLayout moduleId="operations">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={OPERATIONS_FLASHCARDS} /></div>

      <div id="intro"><Suspense fallback={<SectionLoader />}><OperationsIntroSection /></Suspense></div>
      <div id="monitoring"><Suspense fallback={<SectionLoader />}><MonitoringSystemsSection /></Suspense></div>
      {monitoringQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={monitoringQuiz.title} questions={monitoringQuiz.questions} /></div>}

      <div id="maintenance"><Suspense fallback={<SectionLoader />}><PreventiveMaintenanceSection /></Suspense></div>
      {maintenanceQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={maintenanceQuiz.title} questions={maintenanceQuiz.questions} /></div>}

      <div id="troubleshooting"><Suspense fallback={<SectionLoader />}><TroubleshootingSection /></Suspense></div>
      <div id="optimization"><Suspense fallback={<SectionLoader />}><PerformanceOptimizationSection /></Suspense></div>
      <div id="team"><Suspense fallback={<SectionLoader />}><TeamStructureSection /></Suspense></div>
      <div id="safety"><Suspense fallback={<SectionLoader />}><SafetyProtocolsSection /></Suspense></div>
      <div id="documentation"><Suspense fallback={<SectionLoader />}><DocumentationSection /></Suspense></div>
      <Suspense fallback={<SectionLoader />}><OperationsCTASection /></Suspense>
    </ModuleLayout>
  );
};

export default OperationsEducation;
