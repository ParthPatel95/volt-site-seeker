import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Suspense, lazy, useEffect } from "react";
import { Settings, Monitor, Wrench, Search, TrendingUp, Users, ShieldCheck, FileText } from "lucide-react";
import EducationSectionNav from "@/components/academy/EducationSectionNav";
import { KnowledgeCheck } from "@/components/academy/KnowledgeCheck";
import { QuickFlashcard } from "@/components/academy/QuickFlashcard";
import { OPERATIONS_QUIZZES } from "@/constants/quiz-data";
import { OPERATIONS_FLASHCARDS } from "@/constants/flashcard-data";

const OperationsIntroSection = lazy(() => import("@/components/operations/OperationsIntroSection").then(m => ({ default: m.OperationsIntroSection })));
const MonitoringSystemsSection = lazy(() => import("@/components/operations/MonitoringSystemsSection").then(m => ({ default: m.MonitoringSystemsSection })));
const PreventiveMaintenanceSection = lazy(() => import("@/components/operations/PreventiveMaintenanceSection").then(m => ({ default: m.PreventiveMaintenanceSection })));
const TroubleshootingSection = lazy(() => import("@/components/operations/TroubleshootingSection").then(m => ({ default: m.TroubleshootingSection })));
const PerformanceOptimizationSection = lazy(() => import("@/components/operations/PerformanceOptimizationSection").then(m => ({ default: m.PerformanceOptimizationSection })));
const TeamStructureSection = lazy(() => import("@/components/operations/TeamStructureSection").then(m => ({ default: m.TeamStructureSection })));
const SafetyProtocolsSection = lazy(() => import("@/components/operations/SafetyProtocolsSection").then(m => ({ default: m.SafetyProtocolsSection })));
const DocumentationSection = lazy(() => import("@/components/operations/DocumentationSection").then(m => ({ default: m.DocumentationSection })));
const OperationsCTASection = lazy(() => import("@/components/operations/OperationsCTASection").then(m => ({ default: m.OperationsCTASection })));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-watt-bitcoin border-t-transparent rounded-full animate-spin" />
  </div>
);

const navSections = [
  { id: 'intro', icon: Settings, label: 'Introduction', time: '6 min' },
  { id: 'monitoring', icon: Monitor, label: 'Monitoring', time: '8 min' },
  { id: 'preventive-maintenance', icon: Wrench, label: 'Maintenance', time: '8 min' },
  { id: 'troubleshooting', icon: Search, label: 'Troubleshooting', time: '7 min' },
  { id: 'performance', icon: TrendingUp, label: 'Optimization', time: '9 min' },
  { id: 'team-structure', icon: Users, label: 'Team', time: '8 min' },
  { id: 'safety', icon: ShieldCheck, label: 'Safety', time: '7 min' },
  { id: 'documentation', icon: FileText, label: 'Documentation', time: '6 min' },
];

const monitoringQuiz = OPERATIONS_QUIZZES.find(q => q.sectionId === 'monitoring');
const maintenanceQuiz = OPERATIONS_QUIZZES.find(q => q.sectionId === 'preventive-maintenance');

const OperationsEducation = () => {
  useEffect(() => { document.title = "Operations & Maintenance 101 | WattByte Academy"; }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      <EducationSectionNav sections={navSections} accentColor="watt-bitcoin" />
      
      <main>
        <Suspense fallback={<SectionLoader />}><OperationsIntroSection /></Suspense>
        <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={OPERATIONS_FLASHCARDS} /></div>

        <Suspense fallback={<SectionLoader />}><MonitoringSystemsSection /></Suspense>
        {monitoringQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={monitoringQuiz.title} questions={monitoringQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><PreventiveMaintenanceSection /></Suspense>
        {maintenanceQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={maintenanceQuiz.title} questions={maintenanceQuiz.questions} /></div>}

        <Suspense fallback={<SectionLoader />}><TroubleshootingSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><PerformanceOptimizationSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><TeamStructureSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><SafetyProtocolsSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><DocumentationSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><OperationsCTASection /></Suspense>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default OperationsEducation;
