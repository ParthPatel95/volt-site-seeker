import { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { RealWorldInsight } from '@/components/academy/RealWorldInsight';
import { ENGINEERING_PERMITTING_QUIZZES } from '@/constants/quiz-data';
import { ENGINEERING_PERMITTING_FLASHCARDS } from '@/constants/flashcard-data';

const EPIntroSection = lazy(() => import('@/components/engineering-permitting/EPIntroSection'));
const RegulatoryLandscapeSection = lazy(() => import('@/components/engineering-permitting/RegulatoryLandscapeSection'));
const MunicipalPermitsSection = lazy(() => import('@/components/engineering-permitting/MunicipalPermitsSection'));
const SafetyCodesSection = lazy(() => import('@/components/engineering-permitting/SafetyCodesSection'));
const AESOConnectionSection = lazy(() => import('@/components/engineering-permitting/AESOConnectionSection'));
const AUCApprovalSection = lazy(() => import('@/components/engineering-permitting/AUCApprovalSection'));
const ElectricalEngineeringSection = lazy(() => import('@/components/engineering-permitting/ElectricalEngineeringSection'));
const EnvironmentalComplianceSection = lazy(() => import('@/components/engineering-permitting/EnvironmentalComplianceSection'));
const SiteEngineeringSection = lazy(() => import('@/components/engineering-permitting/SiteEngineeringSection'));
const TimelineCostSection = lazy(() => import('@/components/engineering-permitting/TimelineCostSection'));
const EPCTASection = lazy(() => import('@/components/engineering-permitting/EPCTASection'));

const regQuiz = ENGINEERING_PERMITTING_QUIZZES.find(q => q.sectionId === 'regulatory');
const munQuiz = ENGINEERING_PERMITTING_QUIZZES.find(q => q.sectionId === 'municipal');
const aesoQuiz = ENGINEERING_PERMITTING_QUIZZES.find(q => q.sectionId === 'aeso');

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function EngineeringPermittingEducation() {
  return (
    <ModuleLayout moduleId="engineering-permitting">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={ENGINEERING_PERMITTING_FLASHCARDS} /></div>

      <div id="intro"><Suspense fallback={<SectionLoader />}><EPIntroSection /></Suspense></div>
      <div id="regulatory"><Suspense fallback={<SectionLoader />}><RegulatoryLandscapeSection /></Suspense></div>
      {regQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={regQuiz.title} questions={regQuiz.questions} /></div>}

      <div id="municipal"><Suspense fallback={<SectionLoader />}><MunicipalPermitsSection /></Suspense></div>
      {munQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={munQuiz.title} questions={munQuiz.questions} /></div>}

      <div id="safety-codes"><Suspense fallback={<SectionLoader />}><SafetyCodesSection /></Suspense></div>
      <div id="aeso"><Suspense fallback={<SectionLoader />}><AESOConnectionSection /></Suspense></div>
      {aesoQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={aesoQuiz.title} questions={aesoQuiz.questions} /></div>}

      <div id="auc"><Suspense fallback={<SectionLoader />}><AUCApprovalSection /></Suspense></div>
      <div id="electrical"><Suspense fallback={<SectionLoader />}><ElectricalEngineeringSection /></Suspense></div>
      <div id="environmental"><Suspense fallback={<SectionLoader />}><EnvironmentalComplianceSection /></Suspense></div>
      <div id="site"><Suspense fallback={<SectionLoader />}><SiteEngineeringSection /></Suspense></div>
      <div id="timeline"><Suspense fallback={<SectionLoader />}><TimelineCostSection /></Suspense></div>
      <Suspense fallback={<SectionLoader />}><EPCTASection /></Suspense>
    </ModuleLayout>
  );
}
