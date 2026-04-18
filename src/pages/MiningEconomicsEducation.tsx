import { lazy, Suspense, useMemo } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { ModuleExam } from '@/components/academy/ModuleExam';
import { CommonMistakes } from '@/components/academy/CommonMistakes';
import { RealWorldInsight } from '@/components/academy/RealWorldInsight';
import { KeyTermsGlossary } from '@/components/academy/KeyTermsGlossary';
import { MINING_ECONOMICS_QUIZZES } from '@/constants/quiz-data';
import { MINING_ECONOMICS_FLASHCARDS } from '@/constants/flashcard-data';
import { MINING_ECONOMICS_KEY_TERMS } from '@/constants/academy-glossary';

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

const MINING_ECONOMICS_MISTAKES = [
  {
    title: 'Ignoring Difficulty Growth',
    description: 'Using static difficulty in multi-month financial projections.',
    consequence: 'Revenue projections become wildly optimistic within months, leading to negative ROI surprises.',
    prevention: 'Model at least 3-5% monthly difficulty growth. Use historical data to stress-test assumptions.',
  },
  {
    title: 'Undersizing Electrical Infrastructure',
    description: 'Sizing transformers and switchgear only for initial deployment capacity.',
    consequence: 'Limits future expansion and requires costly retrofits. Transformers are long-lead items.',
    prevention: 'Size electrical infrastructure for 120-150% of initial capacity to allow growth.',
  },
  {
    title: 'Ignoring Halving Events',
    description: 'Not accounting for the ~4-year block reward halving cycle in projections.',
    consequence: 'Block rewards drop 50%. Miners who don\'t plan face sudden revenue cliffs.',
    prevention: 'Build halving dates into all multi-year models. Ensure profitability at half the current reward.',
  },
  {
    title: 'Using Spot Electricity Rates',
    description: 'Basing long-term projections on current spot energy prices.',
    consequence: 'Energy costs can swing 30-50% seasonally. Spot-based models give false confidence.',
    prevention: 'Negotiate fixed-rate PPAs. Model scenarios with 20-30% energy cost increases.',
  },
];

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function MiningEconomicsEducation() {
  const examQuestions = useMemo(() => MINING_ECONOMICS_QUIZZES.flatMap(q => q.questions), []);

  return (
    <ModuleLayout moduleId="mining-economics">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <QuickFlashcard deck={MINING_ECONOMICS_FLASHCARDS} />
        <KeyTermsGlossary moduleTitle="Mining Economics" terms={MINING_ECONOMICS_KEY_TERMS} />
      </div>

      <div id="intro"><Suspense fallback={<SectionLoader />}><MiningEconomicsIntroSection /></Suspense></div>
      <div id="revenue"><Suspense fallback={<SectionLoader />}><RevenueDriversSection /></Suspense></div>
      {revenueQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={revenueQuiz.title} questions={revenueQuiz.questions} /></div>}

      <div id="costs"><Suspense fallback={<SectionLoader />}><CostStructureSection /></Suspense></div>
      {costQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={costQuiz.title} questions={costQuiz.questions} /></div>}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RealWorldInsight insight="Electricity typically represents 60-80% of ongoing operating costs. Operators who secure fixed-rate Power Purchase Agreements (PPAs) gain predictable margins that spot-rate buyers cannot match." source="Industry Analysis" />
      </div>

      <div id="profitability"><Suspense fallback={<SectionLoader />}><ProfitabilityAnalysisSection /></Suspense></div>
      {profitabilityQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={profitabilityQuiz.title} questions={profitabilityQuiz.questions} /></div>}

      <div id="breakeven"><Suspense fallback={<SectionLoader />}><BreakEvenAnalysisSection /></Suspense></div>
      {breakEvenQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={breakEvenQuiz.title} questions={breakEvenQuiz.questions} /></div>}

      <div id="hardware-roi"><Suspense fallback={<SectionLoader />}><HardwareROISection /></Suspense></div>
      <div id="difficulty"><Suspense fallback={<SectionLoader />}><DifficultyAdjustmentSection /></Suspense></div>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RealWorldInsight insight="Difficulty has historically increased an average of 3-5% per month during bull markets. Successful operators model worst-case difficulty growth when evaluating hardware purchases." source="Historical Network Data" />
      </div>
      <div id="strategy"><Suspense fallback={<SectionLoader />}><StrategicDecisionsSection /></Suspense></div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <CommonMistakes title="Common Mining Economics Mistakes" mistakes={MINING_ECONOMICS_MISTAKES} />
      </div>

      <div id="module-exam" className="max-w-4xl mx-auto px-4 py-8">
        <ModuleExam title="Mining Economics Final Exam" questions={examQuestions} moduleId="mining-economics" />
      </div>

      <Suspense fallback={<SectionLoader />}><MiningEconomicsCTASection /></Suspense>
    </ModuleLayout>
  );
}
