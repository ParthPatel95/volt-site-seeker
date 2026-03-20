import { lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { MINING_ECONOMICS_QUIZZES } from '@/constants/quiz-data';
import { MINING_ECONOMICS_FLASHCARDS } from '@/constants/flashcard-data';

const MiningEconomicsIntroSection = lazy(() => import('@/components/mining-economics/MiningEconomicsIntroSection'));
const RevenueDriversSection = lazy(() => import('@/components/mining-economics/RevenueDriversSection'));
const CostStructureSection = lazy(() => import('@/components/mining-economics/CostStructureSection'));
const ProfitabilityAnalysisSection = lazy(() => import('@/components/mining-economics/ProfitabilityAnalysisSection'));
const BreakEvenAnalysisSection = lazy(() => import('@/components/mining-economics/BreakEvenAnalysisSection'));
const HardwareROISection = lazy(() => import('@/components/mining-economics/HardwareROISection'));
const DifficultyAdjustmentSection = lazy(() => import('@/components/mining-economics/DifficultyAdjustmentSection'));
const StrategicDecisionsSection = lazy(() => import('@/components/mining-economics/StrategicDecisionsSection'));
const MiningEconomicsCTASection = lazy(() => import('@/components/mining-economics/MiningEconomicsCTASection'));

const revenueQuiz = MINING_ECONOMICS_QUIZZES.find(q => q.sectionId === 'revenue-drivers');
const costQuiz = MINING_ECONOMICS_QUIZZES.find(q => q.sectionId === 'cost-structure');
const breakEvenQuiz = MINING_ECONOMICS_QUIZZES.find(q => q.sectionId === 'break-even');
const profitabilityQuiz = MINING_ECONOMICS_QUIZZES.find(q => q.sectionId === 'profitability');

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function MiningEconomicsEducation() {
  return (
    <ModuleLayout moduleId="mining-economics">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={MINING_ECONOMICS_FLASHCARDS} /></div>

      <div id="intro"><Suspense fallback={<SectionLoader />}><MiningEconomicsIntroSection /></Suspense></div>
      <div id="revenue"><Suspense fallback={<SectionLoader />}><RevenueDriversSection /></Suspense></div>
      {revenueQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={revenueQuiz.title} questions={revenueQuiz.questions} /></div>}

      <div id="costs"><Suspense fallback={<SectionLoader />}><CostStructureSection /></Suspense></div>
      {costQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={costQuiz.title} questions={costQuiz.questions} /></div>}

      <div id="profitability"><Suspense fallback={<SectionLoader />}><ProfitabilityAnalysisSection /></Suspense></div>
      {profitabilityQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={profitabilityQuiz.title} questions={profitabilityQuiz.questions} /></div>}

      <div id="breakeven"><Suspense fallback={<SectionLoader />}><BreakEvenAnalysisSection /></Suspense></div>
      {breakEvenQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={breakEvenQuiz.title} questions={breakEvenQuiz.questions} /></div>}

      <div id="hardware-roi"><Suspense fallback={<SectionLoader />}><HardwareROISection /></Suspense></div>
      <div id="difficulty"><Suspense fallback={<SectionLoader />}><DifficultyAdjustmentSection /></Suspense></div>
      <div id="strategy"><Suspense fallback={<SectionLoader />}><StrategicDecisionsSection /></Suspense></div>
      <Suspense fallback={<SectionLoader />}><MiningEconomicsCTASection /></Suspense>
    </ModuleLayout>
  );
}
