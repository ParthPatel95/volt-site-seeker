import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useEffect, lazy, Suspense } from "react";
import { TrendingUp, BarChart3, Building2, MapPin, Banknote, Handshake, Users } from "lucide-react";
import EducationSectionNav from "@/components/academy/EducationSectionNav";

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

// Navigation sections config
const navSections = [
  { id: 'intro', icon: TrendingUp, label: 'Introduction', time: '5 min' },
  { id: 'capacity-planning', icon: BarChart3, label: 'Capacity Planning', time: '7 min' },
  { id: 'site-expansion', icon: Building2, label: 'Site Expansion', time: '6 min' },
  { id: 'multi-site', icon: MapPin, label: 'Multi-Site', time: '7 min' },
  { id: 'capital-raising', icon: Banknote, label: 'Capital Raising', time: '8 min' },
  { id: 'partnerships', icon: Handshake, label: 'Partnerships', time: '6 min' },
  { id: 'mergers', icon: Users, label: 'M&A', time: '7 min' },
];

const ScalingGrowthEducation = () => {
  useEffect(() => {
    document.title = "Scaling & Growth 101 | WattByte Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      {/* Section Navigation - hidden on mobile, toggleable on desktop */}
      <EducationSectionNav sections={navSections} accentColor="watt-success" />
      
      <main className="lg:pr-56">
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
