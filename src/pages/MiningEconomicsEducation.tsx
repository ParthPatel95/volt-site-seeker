import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { BookOpen, DollarSign, BarChart3, Calculator, TrendingUp, Cpu, Activity, Lightbulb } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';
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

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[hsl(var(--watt-success))] border-t-transparent rounded-full animate-spin" />
  </div>
);

const navSections = [
  { id: 'intro', icon: BookOpen, label: 'Introduction', time: '5 min' },
  { id: 'revenue-drivers', icon: DollarSign, label: 'Revenue Drivers', time: '8 min' },
  { id: 'cost-structure', icon: BarChart3, label: 'Cost Structure', time: '7 min' },
  { id: 'profitability', icon: TrendingUp, label: 'Profitability', time: '8 min' },
  { id: 'break-even', icon: Calculator, label: 'Break-Even', time: '6 min' },
  { id: 'hardware-roi', icon: Cpu, label: 'Hardware ROI', time: '7 min' },
  { id: 'difficulty', icon: Activity, label: 'Difficulty', time: '6 min' },
  { id: 'strategic', icon: Lightbulb, label: 'Strategic', time: '7 min' },
];

const revenueQuiz = MINING_ECONOMICS_QUIZZES.find(q => q.sectionId === 'revenue-drivers');
const costQuiz = MINING_ECONOMICS_QUIZZES.find(q => q.sectionId === 'cost-structure');
const breakEvenQuiz = MINING_ECONOMICS_QUIZZES.find(q => q.sectionId === 'break-even');

export default function MiningEconomicsEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      <EducationSectionNav sections={navSections} accentColor="watt-success" />
      
      <main className="pt-16">
        <Suspense fallback={<SectionLoader />}><MiningEconomicsIntroSection /></Suspense>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <QuickFlashcard deck={MINING_ECONOMICS_FLASHCARDS} />
        </div>
        
        <Suspense fallback={<SectionLoader />}><RevenueDriversSection /></Suspense>
        {revenueQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={revenueQuiz.title} questions={revenueQuiz.questions} /></div>}
        
        <Suspense fallback={<SectionLoader />}><CostStructureSection /></Suspense>
        {costQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={costQuiz.title} questions={costQuiz.questions} /></div>}
        
        <Suspense fallback={<SectionLoader />}><ProfitabilityAnalysisSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><BreakEvenAnalysisSection /></Suspense>
        {breakEvenQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={breakEvenQuiz.title} questions={breakEvenQuiz.questions} /></div>}
        
        <Suspense fallback={<SectionLoader />}><HardwareROISection /></Suspense>
        <Suspense fallback={<SectionLoader />}><DifficultyAdjustmentSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><StrategicDecisionsSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><MiningEconomicsCTASection /></Suspense>
      </main>
      
      <NextModuleRecommendation moduleId="mining-economics" />
      <LandingFooter />
    </div>
  );
}
