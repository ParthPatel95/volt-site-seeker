import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Suspense, lazy, useEffect } from "react";

const RiskIntroSection = lazy(() => import("@/components/risk-management/RiskIntroSection").then(m => ({ default: m.RiskIntroSection })));
const MarketRiskSection = lazy(() => import("@/components/risk-management/MarketRiskSection").then(m => ({ default: m.MarketRiskSection })));
const OperationalRiskSection = lazy(() => import("@/components/risk-management/OperationalRiskSection").then(m => ({ default: m.OperationalRiskSection })));
const RegulatoryRiskSection = lazy(() => import("@/components/risk-management/RegulatoryRiskSection").then(m => ({ default: m.RegulatoryRiskSection })));
const FinancialRiskSection = lazy(() => import("@/components/risk-management/FinancialRiskSection").then(m => ({ default: m.FinancialRiskSection })));
const RiskMatrixSection = lazy(() => import("@/components/risk-management/RiskMatrixSection").then(m => ({ default: m.RiskMatrixSection })));
const InsuranceSection = lazy(() => import("@/components/risk-management/InsuranceSection").then(m => ({ default: m.InsuranceSection })));
const CrisisManagementSection = lazy(() => import("@/components/risk-management/CrisisManagementSection").then(m => ({ default: m.CrisisManagementSection })));
const RiskCTASection = lazy(() => import("@/components/risk-management/RiskCTASection").then(m => ({ default: m.RiskCTASection })));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-watt-bitcoin border-t-transparent rounded-full animate-spin" />
  </div>
);

const RiskManagementEducation = () => {
  useEffect(() => {
    document.title = "Risk Management 101 | WattByte Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main>
        <Suspense fallback={<SectionLoader />}>
          <RiskIntroSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <MarketRiskSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <OperationalRiskSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <RegulatoryRiskSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FinancialRiskSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <RiskMatrixSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <InsuranceSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <CrisisManagementSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <RiskCTASection />
        </Suspense>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default RiskManagementEducation;
