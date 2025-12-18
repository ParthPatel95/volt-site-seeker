import React, { Suspense, lazy } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';

// Lazy load sections for performance
const ElectricalIntroSection = lazy(() => import('@/components/electrical/ElectricalIntroSection'));
const GridConnectionSection = lazy(() => import('@/components/electrical/GridConnectionSection'));
const HighVoltageSection = lazy(() => import('@/components/electrical/HighVoltageSection'));
const TransformersSection = lazy(() => import('@/components/electrical/TransformersSection'));
const SwitchgearSection = lazy(() => import('@/components/electrical/SwitchgearSection'));
const LowVoltageSection = lazy(() => import('@/components/electrical/LowVoltageSection'));
const PDUSection = lazy(() => import('@/components/electrical/PDUSection'));
const MiningPowerSection = lazy(() => import('@/components/electrical/MiningPowerSection'));
const PowerQualitySection = lazy(() => import('@/components/electrical/PowerQualitySection'));
const GroundingSection = lazy(() => import('@/components/electrical/GroundingSection'));
const ArcFlashSection = lazy(() => import('@/components/electrical/ArcFlashSection'));
const RedundancySection = lazy(() => import('@/components/electrical/RedundancySection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-watt-bitcoin"></div>
  </div>
);

const ElectricalEducation = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main>
        <Suspense fallback={<SectionLoader />}>
          <ElectricalIntroSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <GridConnectionSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <HighVoltageSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <TransformersSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <SwitchgearSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <LowVoltageSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PDUSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <MiningPowerSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PowerQualitySection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <GroundingSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ArcFlashSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <RedundancySection />
        </Suspense>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ElectricalEducation;
