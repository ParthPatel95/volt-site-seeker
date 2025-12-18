import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';

const MiningEconomicsIntroSection = lazy(() => import('@/components/mining-economics/MiningEconomicsIntroSection'));
const RevenueDriversSection = lazy(() => import('@/components/mining-economics/RevenueDriversSection'));
const CostStructureSection = lazy(() => import('@/components/mining-economics/CostStructureSection'));
const ProfitabilityAnalysisSection = lazy(() => import('@/components/mining-economics/ProfitabilityAnalysisSection'));
const BreakEvenAnalysisSection = lazy(() => import('@/components/mining-economics/BreakEvenAnalysisSection'));
const HardwareROISection = lazy(() => import('@/components/mining-economics/HardwareROISection'));
const DifficultyAdjustmentSection = lazy(() => import('@/components/mining-economics/DifficultyAdjustmentSection'));
const StrategicDecisionsSection = lazy(() => import('@/components/mining-economics/StrategicDecisionsSection'));
const MiningEconomicsCTASection = lazy(() => import('@/components/mining-economics/MiningEconomicsCTASection'));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-watt-success border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function MiningEconomicsEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main className="pt-16">
        <Suspense fallback={<SectionLoader />}>
          <MiningEconomicsIntroSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <RevenueDriversSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CostStructureSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ProfitabilityAnalysisSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <BreakEvenAnalysisSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <HardwareROISection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <DifficultyAdjustmentSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <StrategicDecisionsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <MiningEconomicsCTASection />
        </Suspense>
      </main>
      
      <LandingFooter />
    </div>
  );
}
