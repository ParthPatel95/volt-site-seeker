import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Droplets, Layers, FlaskConical, Cpu, Container, Thermometer, Zap, DollarSign, Box, Wrench } from 'lucide-react';
import EducationSectionNav from '@/components/academy/EducationSectionNav';

const ImmersionIntroSection = lazy(() => import('@/components/immersion-education/ImmersionIntroSection'));
const ImmersionTypesSection = lazy(() => import('@/components/immersion-education/ImmersionTypesSection'));
const DielectricFluidsSection = lazy(() => import('@/components/immersion-education/DielectricFluidsSection'));
const HardwarePrepSection = lazy(() => import('@/components/immersion-education/HardwarePrepSection'));
const TankSystemsSection = lazy(() => import('@/components/immersion-education/TankSystemsSection'));
const HeatTransferSection = lazy(() => import('@/components/immersion-education/HeatTransferSection'));
const OverclockingSection = lazy(() => import('@/components/immersion-education/OverclockingSection'));
const ImmersionEconomicsSection = lazy(() => import('@/components/immersion-education/ImmersionEconomicsSection'));
const ImmersionContainersSection = lazy(() => import('@/components/immersion-education/ImmersionContainersSection'));
const ImmersionMaintenanceSection = lazy(() => import('@/components/immersion-education/ImmersionMaintenanceSection'));
const ImmersionCTASection = lazy(() => import('@/components/immersion-education/ImmersionCTASection'));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Navigation sections config
const navSections = [
  { id: 'intro', icon: Droplets, label: 'Introduction', time: '5 min' },
  { id: 'types', icon: Layers, label: 'Types', time: '6 min' },
  { id: 'fluids', icon: FlaskConical, label: 'Fluids', time: '7 min' },
  { id: 'hardware-prep', icon: Cpu, label: 'Hardware Prep', time: '6 min' },
  { id: 'tank-systems', icon: Container, label: 'Tank Systems', time: '7 min' },
  { id: 'heat-transfer', icon: Thermometer, label: 'Heat Transfer', time: '6 min' },
  { id: 'overclocking', icon: Zap, label: 'Overclocking', time: '6 min' },
  { id: 'economics', icon: DollarSign, label: 'Economics', time: '7 min' },
  { id: 'containers', icon: Box, label: 'Containers', time: '6 min' },
  { id: 'maintenance', icon: Wrench, label: 'Maintenance', time: '6 min' },
];

export default function ImmersionCoolingEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      {/* Section Navigation - hidden on mobile, toggleable on desktop */}
      <EducationSectionNav sections={navSections} accentColor="cyan-500" />
      
      <main className="pt-16 lg:pr-56">
        <Suspense fallback={<SectionLoader />}>
          <ImmersionIntroSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ImmersionTypesSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <DielectricFluidsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <HardwarePrepSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <TankSystemsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <HeatTransferSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <OverclockingSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ImmersionEconomicsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ImmersionContainersSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ImmersionMaintenanceSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ImmersionCTASection />
        </Suspense>
      </main>
      
      <LandingFooter />
    </div>
  );
}
