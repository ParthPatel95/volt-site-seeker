import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useEffect, lazy, Suspense } from "react";
import { StrategicFoundationsIntro } from "@/components/masterclass/StrategicFoundationsIntro";
import { StrategicJourneyDiagram } from "@/components/masterclass/StrategicJourneyDiagram";
import { IntegratedDecisionFramework } from "@/components/masterclass/IntegratedDecisionFramework";
import { PortfolioRiskDashboard } from "@/components/masterclass/PortfolioRiskDashboard";
import { MasterclassCTASection } from "@/components/masterclass/MasterclassCTASection";

// Lazy load existing sections from the 3 modules
const PowerInfrastructureSection = lazy(() => import("@/components/site-selection/PowerInfrastructureSection"));
const EnergyMarketsSection = lazy(() => import("@/components/site-selection/EnergyMarketsSection"));
const RegulatoryEnvironmentSection = lazy(() => import("@/components/site-selection/RegulatoryEnvironmentSection"));
const ClimateAnalysisSection = lazy(() => import("@/components/site-selection/ClimateAnalysisSection"));
const DueDiligenceSection = lazy(() => import("@/components/site-selection/DueDiligenceSection"));
const SiteScoringSection = lazy(() => import("@/components/site-selection/SiteScoringSection"));
const RiskIntroSection = lazy(() => import("@/components/risk-management/RiskIntroSection").then(m => ({ default: m.RiskIntroSection })));
const MarketRiskSection = lazy(() => import("@/components/risk-management/MarketRiskSection").then(m => ({ default: m.MarketRiskSection })));
const OperationalRiskSection = lazy(() => import("@/components/risk-management/OperationalRiskSection").then(m => ({ default: m.OperationalRiskSection })));
const FinancialRiskSection = lazy(() => import("@/components/risk-management/FinancialRiskSection").then(m => ({ default: m.FinancialRiskSection })));
const RiskMatrixSection = lazy(() => import("@/components/risk-management/RiskMatrixSection").then(m => ({ default: m.RiskMatrixSection })));
const InsuranceSection = lazy(() => import("@/components/risk-management/InsuranceSection").then(m => ({ default: m.InsuranceSection })));
const CrisisManagementSection = lazy(() => import("@/components/risk-management/CrisisManagementSection").then(m => ({ default: m.CrisisManagementSection })));
const CapacityPlanningSection = lazy(() => import("@/components/scaling/CapacityPlanningSection").then(m => ({ default: m.CapacityPlanningSection })));
const SiteExpansionSection = lazy(() => import("@/components/scaling/SiteExpansionSection").then(m => ({ default: m.SiteExpansionSection })));
const MultiSiteStrategySection = lazy(() => import("@/components/scaling/MultiSiteStrategySection").then(m => ({ default: m.MultiSiteStrategySection })));
const CapitalRaisingSection = lazy(() => import("@/components/scaling/CapitalRaisingSection").then(m => ({ default: m.CapitalRaisingSection })));
const PartnershipModelsSection = lazy(() => import("@/components/scaling/PartnershipModelsSection").then(m => ({ default: m.PartnershipModelsSection })));
const MergersAcquisitionsSection = lazy(() => import("@/components/scaling/MergersAcquisitionsSection").then(m => ({ default: m.MergersAcquisitionsSection })));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-watt-blue border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const StrategicOperationsMasterclass = () => {
  useEffect(() => {
    document.title = "Strategic Operations Masterclass | WattByte Academy";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <LandingNavigation />
      
      <main className="pt-16">
        {/* Intro with Journey Diagram */}
        <StrategicFoundationsIntro />
        
        {/* Strategic Journey Visual */}
        <section className="py-12 bg-watt-light">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8 text-watt-navy">Your Strategic Journey</h2>
            <StrategicJourneyDiagram currentTrack={1} />
          </div>
        </section>

        {/* Interactive Decision Framework */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <IntegratedDecisionFramework />
          </div>
        </section>

        {/* Track 1: Foundation & Site Development */}
        <div id="track-1" className="border-t-4 border-purple-500">
          <div className="bg-purple-50 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-watt-navy">Track 1: Foundation & Site Development</h2>
              <p className="text-watt-navy/60">Power infrastructure, energy markets, and site selection fundamentals</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><PowerInfrastructureSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><EnergyMarketsSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><RegulatoryEnvironmentSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><ClimateAnalysisSection /></Suspense>
        </div>

        {/* Track 2: Due Diligence & Risk Assessment */}
        <div id="track-2" className="border-t-4 border-orange-500">
          <div className="bg-orange-50 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-watt-navy">Track 2: Due Diligence & Risk Assessment</h2>
              <p className="text-watt-navy/60">Comprehensive risk evaluation and site scoring frameworks</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><DueDiligenceSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><RiskIntroSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><MarketRiskSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><FinancialRiskSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><RiskMatrixSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><SiteScoringSection /></Suspense>
        </div>

        {/* Track 3: Project Execution & Operations */}
        <div id="track-3" className="border-t-4 border-blue-500">
          <div className="bg-blue-50 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-watt-navy">Track 3: Project Execution & Operations</h2>
              <p className="text-watt-navy/60">Development timelines, insurance, and crisis management</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><OperationalRiskSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><InsuranceSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><CrisisManagementSection /></Suspense>
        </div>

        {/* Track 4: Scaling Your Operation */}
        <div id="track-4" className="border-t-4 border-green-500">
          <div className="bg-green-50 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-watt-navy">Track 4: Scaling Your Operation</h2>
              <p className="text-watt-navy/60">Capacity planning, multi-site strategy, and portfolio management</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><CapacityPlanningSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><SiteExpansionSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><MultiSiteStrategySection /></Suspense>
          
          {/* Portfolio Risk Dashboard */}
          <section className="py-16 bg-watt-light">
            <div className="container mx-auto px-4">
              <PortfolioRiskDashboard />
            </div>
          </section>
        </div>

        {/* Track 5: Capital & Strategic Growth */}
        <div id="track-5" className="border-t-4 border-pink-500">
          <div className="bg-pink-50 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-watt-navy">Track 5: Capital & Strategic Growth</h2>
              <p className="text-watt-navy/60">Fundraising, partnerships, M&A, and exit strategies</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><CapitalRaisingSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><PartnershipModelsSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><MergersAcquisitionsSection /></Suspense>
        </div>

        {/* Completion CTA */}
        <MasterclassCTASection />
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default StrategicOperationsMasterclass;
