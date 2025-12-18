import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Suspense, lazy, useEffect } from "react";

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

const OperationsEducation = () => {
  useEffect(() => {
    document.title = "Operations & Maintenance 101 | WattByte Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main>
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
