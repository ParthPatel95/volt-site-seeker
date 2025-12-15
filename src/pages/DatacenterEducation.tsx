import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import DatacenterHeroSection from '@/components/datacenter-education/DatacenterHeroSection';
// Lazy load sections below the fold
const HowMiningDatacenterWorksSection = lazy(() => import('@/components/datacenter-education/HowMiningDatacenterWorksSection'));
const PowerInfrastructureSection = lazy(() => import('@/components/datacenter-education/PowerInfrastructureSection'));
const CoolingSystemsVisualSection = lazy(() => import('@/components/datacenter-education/CoolingSystemsVisualSection'));
const MiningHardwareShowcaseSection = lazy(() => import('@/components/datacenter-education/MiningHardwareShowcaseSection'));
const DatacenterLayoutSection = lazy(() => import('@/components/datacenter-education/DatacenterLayoutSection'));
const EnergyFlowVisualizationSection = lazy(() => import('@/components/datacenter-education/EnergyFlowVisualizationSection'));
const MiningPoolsSection = lazy(() => import('@/components/bitcoin-education/MiningPoolsSection'));
const MiningSustainabilitySection = lazy(() => import('@/components/bitcoin-education/MiningSustainabilitySection'));
const DatacenterCTASection = lazy(() => import('@/components/datacenter-education/DatacenterCTASection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-watt-bitcoin border-t-transparent rounded-full animate-spin" />
  </div>
);

const DatacenterEducation = () => {
  return (
    <div className="min-h-screen bg-background">
      <SmoothScroll />
      <LandingNavigation />
      
      {/* Hero Section - Eager loaded */}
      <DatacenterHeroSection />
      
      {/* Lazy loaded sections */}
      <Suspense fallback={<SectionLoader />}>
        <HowMiningDatacenterWorksSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <PowerInfrastructureSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <CoolingSystemsVisualSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <MiningHardwareShowcaseSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <DatacenterLayoutSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <EnergyFlowVisualizationSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <MiningPoolsSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <MiningSustainabilitySection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <DatacenterCTASection />
      </Suspense>
      
      <LandingFooter />
    </div>
  );
};

export default DatacenterEducation;
