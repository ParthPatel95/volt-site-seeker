import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { BookOpen, DollarSign, BarChart3, Calculator, TrendingUp, Cpu, Activity, Lightbulb } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';

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

// Navigation sections config
const navSections = [
  { id: 'intro', icon: BookOpen, label: 'Introduction', time: '5 min' },
  { id: 'revenue-drivers', icon: DollarSign, label: 'Revenue Drivers', time: '8 min' },
  { id: 'cost-structure', icon: BarChart3, label: 'Cost Structure', time: '7 min' },
  { id: 'profitability', icon: TrendingUp, label: 'Profitability', time: '8 min' },
  { id: 'break-even', icon: Calculator, label: 'Break-Even', time: '6 min' },
  { id: 'hardware-roi', icon: Cpu, label: 'Hardware ROI', time: '7 min' },
  { id: 'difficulty', icon: Activity, label: 'Difficulty', time: '6 min' },
  { id: 'strategic', icon: Lightbulb, label: 'Strategic', time: '7 min' },
];

export default function MiningEconomicsEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      {/* Section Navigation - hidden on mobile, toggleable on desktop */}
      <EducationSectionNav sections={navSections} accentColor="watt-success" />
      
      <main className="pt-16 lg:pr-56">
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
