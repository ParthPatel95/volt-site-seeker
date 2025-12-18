import { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';

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

export default function ImmersionCoolingEducation() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main className="pt-16">
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
