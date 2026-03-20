import { useEffect, lazy, Suspense } from 'react';
import { ModuleLayout } from '@/components/academy/ModuleLayout';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { StrategicFoundationsIntro } from '@/components/masterclass/StrategicFoundationsIntro';
import { StrategicJourneyDiagram } from '@/components/masterclass/StrategicJourneyDiagram';
import { IntegratedDecisionFramework } from '@/components/masterclass/IntegratedDecisionFramework';
import { PortfolioRiskDashboard } from '@/components/masterclass/PortfolioRiskDashboard';
import { MasterclassCTASection } from '@/components/masterclass/MasterclassCTASection';
import { KnowledgeCheck } from '@/components/academy/KnowledgeCheck';
import { QuickFlashcard } from '@/components/academy/QuickFlashcard';
import { STRATEGIC_OPERATIONS_QUIZZES } from '@/constants/quiz-data';
import { STRATEGIC_OPERATIONS_FLASHCARDS } from '@/constants/flashcard-data';

const PowerInfrastructureSection = lazy(() => import('@/components/site-selection/PowerInfrastructureSection'));
const EnergyMarketsSection = lazy(() => import('@/components/site-selection/EnergyMarketsSection'));
const RegulatoryEnvironmentSection = lazy(() => import('@/components/site-selection/RegulatoryEnvironmentSection'));
const ClimateAnalysisSection = lazy(() => import('@/components/site-selection/ClimateAnalysisSection'));
const DueDiligenceSection = lazy(() => import('@/components/site-selection/DueDiligenceSection'));
const SiteScoringSection = lazy(() => import('@/components/site-selection/SiteScoringSection'));
const RiskIntroSection = lazy(() => import('@/components/risk-management/RiskIntroSection').then(m => ({ default: m.RiskIntroSection })));
const MarketRiskSection = lazy(() => import('@/components/risk-management/MarketRiskSection').then(m => ({ default: m.MarketRiskSection })));
const OperationalRiskSection = lazy(() => import('@/components/risk-management/OperationalRiskSection').then(m => ({ default: m.OperationalRiskSection })));
const FinancialRiskSection = lazy(() => import('@/components/risk-management/FinancialRiskSection').then(m => ({ default: m.FinancialRiskSection })));
const RiskMatrixSection = lazy(() => import('@/components/risk-management/RiskMatrixSection').then(m => ({ default: m.RiskMatrixSection })));
const InsuranceSection = lazy(() => import('@/components/risk-management/InsuranceSection').then(m => ({ default: m.InsuranceSection })));
const CrisisManagementSection = lazy(() => import('@/components/risk-management/CrisisManagementSection').then(m => ({ default: m.CrisisManagementSection })));
const CapacityPlanningSection = lazy(() => import('@/components/scaling/CapacityPlanningSection').then(m => ({ default: m.CapacityPlanningSection })));
const SiteExpansionSection = lazy(() => import('@/components/scaling/SiteExpansionSection').then(m => ({ default: m.SiteExpansionSection })));
const MultiSiteStrategySection = lazy(() => import('@/components/scaling/MultiSiteStrategySection').then(m => ({ default: m.MultiSiteStrategySection })));
const CapitalRaisingSection = lazy(() => import('@/components/scaling/CapitalRaisingSection').then(m => ({ default: m.CapitalRaisingSection })));
const PartnershipModelsSection = lazy(() => import('@/components/scaling/PartnershipModelsSection').then(m => ({ default: m.PartnershipModelsSection })));
const MergersAcquisitionsSection = lazy(() => import('@/components/scaling/MergersAcquisitionsSection').then(m => ({ default: m.MergersAcquisitionsSection })));
const AcademicEnhancementsSection = lazy(() => import('@/components/academy/AcademicEnhancementsSection'));
const Glossary = lazy(() => import('@/components/academy/Glossary'));

const siteQuiz = STRATEGIC_OPERATIONS_QUIZZES.find(q => q.sectionId === 'track-1');
const riskQuiz = STRATEGIC_OPERATIONS_QUIZZES.find(q => q.sectionId === 'track-2');
const executionQuiz = STRATEGIC_OPERATIONS_QUIZZES.find(q => q.sectionId === 'track-3');
const scaleQuiz = STRATEGIC_OPERATIONS_QUIZZES.find(q => q.sectionId === 'track-4');
const capitalQuiz = STRATEGIC_OPERATIONS_QUIZZES.find(q => q.sectionId === 'track-5');

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const StrategicOperationsMasterclass = () => {
  useEffect(() => { document.title = "Strategic Operations Masterclass | WattByte Academy"; }, []);

  return (
    <ModuleLayout moduleId="strategic-operations">
      <div className="max-w-4xl mx-auto px-4 py-8"><QuickFlashcard deck={STRATEGIC_OPERATIONS_FLASHCARDS} /></div>

      <div id="intro"><StrategicFoundationsIntro /></div>

      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Your Strategic Journey</h2>
          <StrategicJourneyDiagram currentTrack={1} />
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4"><IntegratedDecisionFramework /></div>
      </section>

      <div id="track-1">
        <div className="bg-primary/10 py-4"><div className="container mx-auto px-4"><h2 className="text-2xl font-bold text-foreground">Track 1: Foundation & Site Development</h2><p className="text-muted-foreground">Power infrastructure, energy markets, and site selection fundamentals</p></div></div>
        <Suspense fallback={<SectionLoader />}><PowerInfrastructureSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><EnergyMarketsSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><RegulatoryEnvironmentSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><ClimateAnalysisSection /></Suspense>
      </div>
      {siteQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={siteQuiz.title} questions={siteQuiz.questions} /></div>}

      <div id="track-2">
        <div className="bg-primary/10 py-4"><div className="container mx-auto px-4"><h2 className="text-2xl font-bold text-foreground">Track 2: Due Diligence & Risk Assessment</h2><p className="text-muted-foreground">Comprehensive risk evaluation and site scoring frameworks</p></div></div>
        <Suspense fallback={<SectionLoader />}><DueDiligenceSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><RiskIntroSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><MarketRiskSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><FinancialRiskSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><RiskMatrixSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><SiteScoringSection /></Suspense>
      </div>
      {riskQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={riskQuiz.title} questions={riskQuiz.questions} /></div>}

      <div id="track-3">
        <div className="bg-primary/10 py-4"><div className="container mx-auto px-4"><h2 className="text-2xl font-bold text-foreground">Track 3: Project Execution & Operations</h2><p className="text-muted-foreground">Development timelines, insurance, and crisis management</p></div></div>
        <Suspense fallback={<SectionLoader />}><OperationalRiskSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><InsuranceSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><CrisisManagementSection /></Suspense>
      </div>
      {executionQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={executionQuiz.title} questions={executionQuiz.questions} /></div>}

      <div id="track-4">
        <div className="bg-primary/10 py-4"><div className="container mx-auto px-4"><h2 className="text-2xl font-bold text-foreground">Track 4: Scaling Your Operation</h2><p className="text-muted-foreground">Capacity planning, multi-site strategy, and portfolio management</p></div></div>
        <Suspense fallback={<SectionLoader />}><CapacityPlanningSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><SiteExpansionSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><MultiSiteStrategySection /></Suspense>
        <section className="py-16 bg-muted"><div className="container mx-auto px-4"><PortfolioRiskDashboard /></div></section>
      </div>
      {scaleQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={scaleQuiz.title} questions={scaleQuiz.questions} /></div>}

      <div id="track-5">
        <div className="bg-primary/10 py-4"><div className="container mx-auto px-4"><h2 className="text-2xl font-bold text-foreground">Track 5: Capital & Strategic Growth</h2><p className="text-muted-foreground">Fundraising, partnerships, M&A, and exit strategies</p></div></div>
        <Suspense fallback={<SectionLoader />}><CapitalRaisingSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><PartnershipModelsSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><MergersAcquisitionsSection /></Suspense>
      </div>
      {capitalQuiz && <div className="max-w-4xl mx-auto px-4 py-8"><KnowledgeCheck title={capitalQuiz.title} questions={capitalQuiz.questions} /></div>}

      <MasterclassCTASection />
    </ModuleLayout>
  );
};

export default StrategicOperationsMasterclass;
