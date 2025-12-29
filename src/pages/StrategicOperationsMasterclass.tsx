import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingBackground } from "@/components/landing/LandingBackground";
import { SectionDivider } from "@/components/landing/SectionDivider";
import { SmoothScroll } from "@/components/landing/ScrollAnimations";
import LastReviewed from "@/components/academy/LastReviewed";
import EducationSectionNav from "@/components/academy/EducationSectionNav";
import { useEffect, lazy, Suspense } from "react";
import { StrategicFoundationsIntro } from "@/components/masterclass/StrategicFoundationsIntro";
import { StrategicJourneyDiagram } from "@/components/masterclass/StrategicJourneyDiagram";
import { IntegratedDecisionFramework } from "@/components/masterclass/IntegratedDecisionFramework";
import { PortfolioRiskDashboard } from "@/components/masterclass/PortfolioRiskDashboard";
import { MasterclassCTASection } from "@/components/masterclass/MasterclassCTASection";
import { MapPin, ShieldAlert, Zap, TrendingUp, GraduationCap, DollarSign, BookOpen, BarChart3 } from "lucide-react";

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

// Lazy load new academic enhancement components
const AcademicEnhancementsSection = lazy(() => import("@/components/academy/AcademicEnhancementsSection"));
const Glossary = lazy(() => import("@/components/academy/Glossary"));

// Section navigation config
const masterclassSections = [
  { id: 'intro', icon: GraduationCap, label: 'Introduction', time: '5 min' },
  { id: 'track-1', icon: MapPin, label: 'Site Selection', time: '25 min' },
  { id: 'track-2', icon: ShieldAlert, label: 'Risk Assessment', time: '20 min' },
  { id: 'track-3', icon: Zap, label: 'Execution', time: '15 min' },
  { id: 'track-4', icon: TrendingUp, label: 'Scaling', time: '25 min' },
  { id: 'track-5', icon: DollarSign, label: 'Capital', time: '20 min' },
  { id: 'frameworks', icon: BarChart3, label: 'Frameworks', time: '15 min' },
  { id: 'glossary', icon: BookOpen, label: 'Glossary', time: '5 min' },
];

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const StrategicOperationsMasterclass = () => {
  useEffect(() => {
    document.title = "Strategic Operations Masterclass | WattByte Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <SmoothScroll />
      <LandingBackground />
      <LandingNavigation />
      
      {/* Section Navigation */}
      <EducationSectionNav sections={masterclassSections} accentColor="primary" />
      
      <main className="pt-16 relative z-10">
        {/* Intro with Journey Diagram */}
        <div id="intro">
          <StrategicFoundationsIntro />
        </div>
        
        <SectionDivider color="purple" />
        
        {/* Strategic Journey Visual */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Your Strategic Journey</h2>
            <StrategicJourneyDiagram currentTrack={1} />
          </div>
        </section>

        <SectionDivider color="cyan" />

        {/* Interactive Decision Framework */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <IntegratedDecisionFramework />
          </div>
        </section>

        <SectionDivider color="purple" />

        {/* Track 1: Foundation & Site Development */}
        <div id="track-1" className="border-t-4 border-purple-500">
          <div className="bg-purple-500/10 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground">Track 1: Foundation & Site Development</h2>
              <p className="text-muted-foreground">Power infrastructure, energy markets, and site selection fundamentals</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><PowerInfrastructureSection /></Suspense>
          <SectionDivider color="cyan" />
          <Suspense fallback={<SectionLoader />}><EnergyMarketsSection /></Suspense>
          <SectionDivider color="yellow" />
          <Suspense fallback={<SectionLoader />}><RegulatoryEnvironmentSection /></Suspense>
          <SectionDivider color="purple" />
          <Suspense fallback={<SectionLoader />}><ClimateAnalysisSection /></Suspense>
        </div>

        <SectionDivider color="cyan" />

        {/* Track 2: Due Diligence & Risk Assessment */}
        <div id="track-2" className="border-t-4 border-orange-500">
          <div className="bg-orange-500/10 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground">Track 2: Due Diligence & Risk Assessment</h2>
              <p className="text-muted-foreground">Comprehensive risk evaluation and site scoring frameworks</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><DueDiligenceSection /></Suspense>
          <SectionDivider color="yellow" />
          <Suspense fallback={<SectionLoader />}><RiskIntroSection /></Suspense>
          <SectionDivider color="purple" />
          <Suspense fallback={<SectionLoader />}><MarketRiskSection /></Suspense>
          <SectionDivider color="cyan" />
          <Suspense fallback={<SectionLoader />}><FinancialRiskSection /></Suspense>
          <SectionDivider color="yellow" />
          <Suspense fallback={<SectionLoader />}><RiskMatrixSection /></Suspense>
          <SectionDivider color="purple" />
          <Suspense fallback={<SectionLoader />}><SiteScoringSection /></Suspense>
        </div>

        <SectionDivider color="yellow" />

        {/* Track 3: Project Execution & Operations */}
        <div id="track-3" className="border-t-4 border-blue-500">
          <div className="bg-blue-500/10 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground">Track 3: Project Execution & Operations</h2>
              <p className="text-muted-foreground">Development timelines, insurance, and crisis management</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><OperationalRiskSection /></Suspense>
          <SectionDivider color="cyan" />
          <Suspense fallback={<SectionLoader />}><InsuranceSection /></Suspense>
          <SectionDivider color="purple" />
          <Suspense fallback={<SectionLoader />}><CrisisManagementSection /></Suspense>
        </div>

        <SectionDivider color="cyan" />

        {/* Track 4: Scaling Your Operation */}
        <div id="track-4" className="border-t-4 border-green-500">
          <div className="bg-green-500/10 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground">Track 4: Scaling Your Operation</h2>
              <p className="text-muted-foreground">Capacity planning, multi-site strategy, and portfolio management</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><CapacityPlanningSection /></Suspense>
          <SectionDivider color="yellow" />
          <Suspense fallback={<SectionLoader />}><SiteExpansionSection /></Suspense>
          <SectionDivider color="purple" />
          <Suspense fallback={<SectionLoader />}><MultiSiteStrategySection /></Suspense>
          
          {/* Portfolio Risk Dashboard */}
          <section className="py-16 bg-muted">
            <div className="container mx-auto px-4">
              <PortfolioRiskDashboard />
            </div>
          </section>
        </div>

        <SectionDivider color="purple" />

        {/* Track 5: Capital & Strategic Growth */}
        <div id="track-5" className="border-t-4 border-pink-500">
          <div className="bg-pink-500/10 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground">Track 5: Capital & Strategic Growth</h2>
              <p className="text-muted-foreground">Fundraising, partnerships, M&A, and exit strategies</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}><CapitalRaisingSection /></Suspense>
          <SectionDivider color="cyan" />
          <Suspense fallback={<SectionLoader />}><PartnershipModelsSection /></Suspense>
          <SectionDivider color="yellow" />
          <Suspense fallback={<SectionLoader />}><MergersAcquisitionsSection /></Suspense>
        </div>

        <SectionDivider color="purple" />

        {/* Strategic Frameworks Section */}
        <div id="frameworks" className="border-t-4 border-indigo-500">
          <div className="bg-indigo-500/10 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground">Strategic Analysis Frameworks</h2>
              <p className="text-muted-foreground">Academic tools for strategic decision-making</p>
            </div>
          </div>
          <Suspense fallback={<SectionLoader />}>
            <AcademicEnhancementsSection variant="strategic-frameworks" />
          </Suspense>
          <SectionDivider color="cyan" />
          <Suspense fallback={<SectionLoader />}>
            <AcademicEnhancementsSection variant="quantitative-tools" />
          </Suspense>
        </div>

        <SectionDivider color="yellow" />

        {/* Glossary Section */}
        <div id="glossary" className="border-t-4 border-teal-500">
          <div className="bg-teal-500/10 py-4">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground">Mining Glossary</h2>
              <p className="text-muted-foreground">Comprehensive terminology reference</p>
            </div>
          </div>
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-4xl">
              <Suspense fallback={<SectionLoader />}>
                <Glossary />
              </Suspense>
            </div>
          </section>
        </div>

        <SectionDivider color="purple" />

        {/* Completion CTA */}
        <MasterclassCTASection />

        {/* Last Reviewed Footer */}
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <LastReviewed
            date="December 2024"
            reviewer="WattByte Education Team"
            variant="footer"
          />
        </div>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default StrategicOperationsMasterclass;
