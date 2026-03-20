import { Suspense, lazy, useMemo } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { ModuleExam } from '@/components/academy/ModuleExam';
import { CommonMistakes } from '@/components/academy/CommonMistakes';
import { ProcessFlowchart } from '@/components/academy/ProcessFlowchart';
import { OrderingExercise } from '@/components/academy/OrderingExercise';
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
const troubleshootingQuiz = OPERATIONS_QUIZZES.find(q => q.sectionId === 'troubleshooting');
const safetyQuiz = OPERATIONS_QUIZZES.find(q => q.sectionId === 'safety');

const TROUBLESHOOTING_STEPS = [
  { label: 'Alert Triggered', description: 'Monitoring system detects anomaly (hashrate drop, temp spike, network issue)', status: 'complete' as const },
  { label: 'Triage & Classify', description: 'Determine severity (P1-P4) and affected scope (single miner, rack, row, facility)', status: 'complete' as const },
  { label: 'Isolate the Problem', description: 'Check logs, sensor data, and network status to narrow root cause', status: 'active' as const },
  { label: 'Apply Fix', description: 'Execute remediation — restart, replace hardware, adjust config, or escalate', status: 'pending' as const },
  { label: 'Verify & Document', description: 'Confirm resolution, update runbook, and file incident report', status: 'pending' as const },
];

const ALERT_RESPONSE_ORDER = [
  { id: '1', label: 'Acknowledge the alert within SLA window' },
  { id: '2', label: 'Classify severity level (P1–P4)' },
  { id: '3', label: 'Notify on-call team if P1/P2' },
  { id: '4', label: 'Isolate affected systems to prevent cascade' },
  { id: '5', label: 'Diagnose root cause using monitoring data' },
  { id: '6', label: 'Apply fix and verify resolution' },
  { id: '7', label: 'Document incident and update runbook' },
];

const OPERATIONS_MISTAKES = [
  {
    mistake: 'Skipping preventive maintenance schedules',
    consequence: 'Unplanned downtime increases 3-5x. A single failed fan can take out an entire rack if thermal protection triggers.',
    fix: 'Implement a strict calendar-based PM schedule. Track compliance rate — target 95%+ adherence.',
  },
  {
    mistake: 'No monitoring alert escalation path',
    consequence: 'Critical alerts get lost in noise. A P1 outage can go unnoticed for hours during off-shifts.',
    fix: 'Define clear escalation tiers with automatic notification. P1 alerts should page on-call within 5 minutes.',
  },
  {
    mistake: 'Running without environmental monitoring',
    consequence: 'Temperature and humidity drift can reduce hardware lifespan by 30-50% and cause intermittent failures.',
    fix: 'Deploy temperature, humidity, and airflow sensors at every row. Set alerts at 35°C intake and 45°C exhaust.',
  },
];

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const OperationsEducation = () => {
  const examQuestions = useMemo(() => OPERATIONS_QUIZZES.flatMap(q => q.questions), []);

  return (
    <ModuleLayout moduleId="operations">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={OPERATIONS_FLASHCARDS} /></div>

      <div id="intro"><Suspense fallback={<SectionLoader />}><OperationsIntroSection /></Suspense></div>
      <div id="monitoring"><Suspense fallback={<SectionLoader />}><MonitoringSystemsSection /></Suspense></div>
      {monitoringQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={monitoringQuiz.title} questions={monitoringQuiz.questions} /></div>}

      <div id="maintenance"><Suspense fallback={<SectionLoader />}><PreventiveMaintenanceSection /></Suspense></div>
      {maintenanceQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={maintenanceQuiz.title} questions={maintenanceQuiz.questions} /></div>}

      <div id="troubleshooting"><Suspense fallback={<SectionLoader />}><TroubleshootingSection /></Suspense></div>
      {troubleshootingQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={troubleshootingQuiz.title} questions={troubleshootingQuiz.questions} /></div>}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProcessFlowchart title="Troubleshooting Workflow" steps={TROUBLESHOOTING_STEPS} variant="vertical" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <OrderingExercise title="Order the Alert Response Steps" description="Arrange these incident response steps in the correct order." items={ALERT_RESPONSE_ORDER} />
      </div>

      <div id="optimization"><Suspense fallback={<SectionLoader />}><PerformanceOptimizationSection /></Suspense></div>
      <div id="team"><Suspense fallback={<SectionLoader />}><TeamStructureSection /></Suspense></div>
      <div id="safety"><Suspense fallback={<SectionLoader />}><SafetyProtocolsSection /></Suspense></div>
      {safetyQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={safetyQuiz.title} questions={safetyQuiz.questions} /></div>}

      <div id="documentation"><Suspense fallback={<SectionLoader />}><DocumentationSection /></Suspense></div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <CommonMistakes title="Common Operations Mistakes" mistakes={OPERATIONS_MISTAKES} />
      </div>

      <div id="module-exam" className="max-w-4xl mx-auto px-4 py-8">
        <ModuleExam title="Operations & Maintenance Final Exam" questions={examQuestions} moduleId="operations" />
      </div>

      <Suspense fallback={<SectionLoader />}><OperationsCTASection /></Suspense>
    </ModuleLayout>
  );
};

export default OperationsEducation;
