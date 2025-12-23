import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Suspense, lazy, useEffect } from "react";
import { Settings, Monitor, Wrench, Search, TrendingUp, Users, ShieldCheck, FileText } from "lucide-react";
import EducationSectionNav from "@/components/academy/EducationSectionNav";

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

// Navigation sections config
const navSections = [
  { id: 'intro', icon: Settings, label: 'Introduction', time: '5 min' },
  { id: 'monitoring', icon: Monitor, label: 'Monitoring', time: '7 min' },
  { id: 'preventive-maintenance', icon: Wrench, label: 'Maintenance', time: '7 min' },
  { id: 'troubleshooting', icon: Search, label: 'Troubleshooting', time: '6 min' },
  { id: 'performance', icon: TrendingUp, label: 'Optimization', time: '7 min' },
  { id: 'team-structure', icon: Users, label: 'Team', time: '5 min' },
  { id: 'safety', icon: ShieldCheck, label: 'Safety', time: '6 min' },
  { id: 'documentation', icon: FileText, label: 'Documentation', time: '5 min' },
];

const OperationsEducation = () => {
  useEffect(() => {
    document.title = "Operations & Maintenance 101 | WattByte Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      {/* Section Navigation - hidden on mobile, toggleable on desktop */}
      <EducationSectionNav sections={navSections} accentColor="watt-bitcoin" />
      
      <main className="lg:pr-56">
        <Suspense fallback={<SectionLoader />}>
          <OperationsIntroSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <MonitoringSystemsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <PreventiveMaintenanceSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <TroubleshootingSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <PerformanceOptimizationSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <TeamStructureSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <SafetyProtocolsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <DocumentationSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <OperationsCTASection />
        </Suspense>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default OperationsEducation;
