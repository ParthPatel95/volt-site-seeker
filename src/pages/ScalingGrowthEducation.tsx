import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useEffect, lazy, Suspense } from "react";

const ScalingIntroSection = lazy(() => import("@/components/scaling/ScalingIntroSection").then(m => ({ default: m.ScalingIntroSection })));
const CapacityPlanningSection = lazy(() => import("@/components/scaling/CapacityPlanningSection").then(m => ({ default: m.CapacityPlanningSection })));
const SiteExpansionSection = lazy(() => import("@/components/scaling/SiteExpansionSection").then(m => ({ default: m.SiteExpansionSection })));
const MultiSiteStrategySection = lazy(() => import("@/components/scaling/MultiSiteStrategySection").then(m => ({ default: m.MultiSiteStrategySection })));
const CapitalRaisingSection = lazy(() => import("@/components/scaling/CapitalRaisingSection").then(m => ({ default: m.CapitalRaisingSection })));
const PartnershipModelsSection = lazy(() => import("@/components/scaling/PartnershipModelsSection").then(m => ({ default: m.PartnershipModelsSection })));
const MergersAcquisitionsSection = lazy(() => import("@/components/scaling/MergersAcquisitionsSection").then(m => ({ default: m.MergersAcquisitionsSection })));
const ScalingCTASection = lazy(() => import("@/components/scaling/ScalingCTASection").then(m => ({ default: m.ScalingCTASection })));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-watt-success border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ScalingGrowthEducation = () => {
  useEffect(() => {
    document.title = "Scaling & Growth 101 | WattByte Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main>
        <Suspense fallback={<SectionLoader />}>
          <ScalingIntroSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <CapacityPlanningSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <SiteExpansionSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <MultiSiteStrategySection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <CapitalRaisingSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <PartnershipModelsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <MergersAcquisitionsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ScalingCTASection />
        </Suspense>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default ScalingGrowthEducation;
