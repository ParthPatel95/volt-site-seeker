import { lazy, Suspense, useMemo } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { ModuleExam } from '@/components/academy/ModuleExam';
import { ProcessFlowchart } from '@/components/academy/ProcessFlowchart';
import { OrderingExercise } from '@/components/academy/OrderingExercise';
import { RealWorldInsight } from '@/components/academy/RealWorldInsight';
import { ELECTRICAL_QUIZZES } from '@/constants/quiz-data';
import { ELECTRICAL_FLASHCARDS } from '@/constants/flashcard-data';
import { Zap, Building2, ArrowDownToLine, ShieldCheck, Cpu, PlugZap } from 'lucide-react';
import type { FlowStep } from '@/components/academy/ProcessFlowchart';

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

const fundamentalsQuiz = ELECTRICAL_QUIZZES.find(q => q.sectionId === 'fundamentals');
const transformersQuiz = ELECTRICAL_QUIZZES.find(q => q.sectionId === 'transformers');
const arcFlashQuiz = ELECTRICAL_QUIZZES.find(q => q.sectionId === 'arc-flash');

const VOLTAGE_STEPDOWN_STEPS: FlowStep[] = [
  { title: 'Utility Grid (69–240 kV)', description: 'High-voltage transmission from the grid to your facility', icon: Zap, status: 'complete' },
  { title: 'Main Substation', description: 'Utility metering, protective relaying, and main disconnect', icon: Building2, status: 'complete' },
  { title: 'Step-Down Transformer', description: 'Oil-filled or dry-type transformers reduce voltage (25kV → 600V)', icon: ArrowDownToLine, status: 'active' },
  { title: 'Main Switchgear (600V)', description: 'Circuit breakers, bus bars, and protective devices', icon: ShieldCheck, status: 'upcoming' },
  { title: 'Power Distribution Units', description: 'Final voltage regulation and circuit protection', icon: PlugZap, status: 'upcoming' },
  { title: 'Mining Hardware (120–240V)', description: 'Individual ASIC miners receive clean, regulated power', icon: Cpu, status: 'upcoming' },
];

const VOLTAGE_CHAIN_ORDER = [
  { id: '1', label: 'Utility grid high-voltage transmission (69–240 kV)' },
  { id: '2', label: 'Main substation with protective relaying' },
  { id: '3', label: 'Step-down transformer (to 600V or 480V)' },
  { id: '4', label: 'Main switchgear and circuit breakers' },
  { id: '5', label: 'Power distribution units (PDUs)' },
  { id: '6', label: 'Individual miner connections (120–240V)' },
];

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const ElectricalEducation = () => {
  const examQuestions = useMemo(() => ELECTRICAL_QUIZZES.flatMap(q => q.questions), []);

  return (
    <ModuleLayout moduleId="electrical">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={ELECTRICAL_FLASHCARDS} /></div>

      <div id="fundamentals"><Suspense fallback={<SectionLoader />}><ElectricalIntroSection /></Suspense></div>
      {fundamentalsQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={fundamentalsQuiz.title} questions={fundamentalsQuiz.questions} /></div>}

      <div id="grid-connection"><Suspense fallback={<SectionLoader />}><GridConnectionSection /></Suspense></div>
      <div id="high-voltage"><Suspense fallback={<SectionLoader />}><HighVoltageSection /></Suspense></div>
      <div id="transformers"><Suspense fallback={<SectionLoader />}><TransformersSection /></Suspense></div>
      {transformersQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={transformersQuiz.title} questions={transformersQuiz.questions} /></div>}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RealWorldInsight insight="Always size transformers for 120-150% of initial deployment capacity. Transformers are long-lead items (12-18 months) and the most expensive single component to retrofit." source="Electrical Engineering Best Practice" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProcessFlowchart title="Voltage Step-Down Path" steps={VOLTAGE_STEPDOWN_STEPS} variant="vertical" />
      </div>

      <div id="switchgear"><Suspense fallback={<SectionLoader />}><SwitchgearSection /></Suspense></div>
      <div id="low-voltage"><Suspense fallback={<SectionLoader />}><LowVoltageSection /></Suspense></div>
      <div id="pdu"><Suspense fallback={<SectionLoader />}><PDUSection /></Suspense></div>
      <div id="mining-power"><Suspense fallback={<SectionLoader />}><MiningPowerSection /></Suspense></div>
      <div id="power-quality"><Suspense fallback={<SectionLoader />}><PowerQualitySection /></Suspense></div>
      <div id="grounding"><Suspense fallback={<SectionLoader />}><GroundingSection /></Suspense></div>
      <div id="arc-flash"><Suspense fallback={<SectionLoader />}><ArcFlashSection /></Suspense></div>
      {arcFlashQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={arcFlashQuiz.title} questions={arcFlashQuiz.questions} /></div>}

      <div id="redundancy"><Suspense fallback={<SectionLoader />}><RedundancySection /></Suspense></div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <OrderingExercise title="Order the Voltage Step-Down Chain" instruction="Arrange the electrical infrastructure components from highest to lowest voltage." items={VOLTAGE_CHAIN_ORDER} />
      </div>

      <div id="module-exam" className="max-w-4xl mx-auto px-4 py-8">
        <ModuleExam title="Electrical Infrastructure Final Exam" questions={examQuestions} moduleId="electrical" />
      </div>
    </ModuleLayout>
  );
};

export default ElectricalEducation;
