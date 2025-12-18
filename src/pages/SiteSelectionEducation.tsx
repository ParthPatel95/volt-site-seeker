import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';

const SiteSelectionIntroSection = lazy(() => import('@/components/site-selection/SiteSelectionIntroSection'));
const PowerInfrastructureSection = lazy(() => import('@/components/site-selection/PowerInfrastructureSection'));
const EnergyMarketsSection = lazy(() => import('@/components/site-selection/EnergyMarketsSection'));
const RegulatoryEnvironmentSection = lazy(() => import('@/components/site-selection/RegulatoryEnvironmentSection'));
const ClimateAnalysisSection = lazy(() => import('@/components/site-selection/ClimateAnalysisSection'));
const LandAcquisitionSection = lazy(() => import('@/components/site-selection/LandAcquisitionSection'));
const DueDiligenceSection = lazy(() => import('@/components/site-selection/DueDiligenceSection'));
const SiteScoringSection = lazy(() => import('@/components/site-selection/SiteScoringSection'));
const DevelopmentTimelineSection = lazy(() => import('@/components/site-selection/DevelopmentTimelineSection'));
const SiteSelectionCTASection = lazy(() => import('@/components/site-selection/SiteSelectionCTASection'));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-watt-purple border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function SiteSelectionEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main className="pt-16">
        <Suspense fallback={<SectionLoader />}>
          <SiteSelectionIntroSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PowerInfrastructureSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <EnergyMarketsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <RegulatoryEnvironmentSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ClimateAnalysisSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <LandAcquisitionSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <DueDiligenceSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <SiteScoringSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <DevelopmentTimelineSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <SiteSelectionCTASection />
        </Suspense>
      </main>
      
      <LandingFooter />
    </div>
  );
}
