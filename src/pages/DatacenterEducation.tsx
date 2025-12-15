import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import DatacenterHeroSectionV2 from '@/components/datacenter-education/DatacenterHeroSectionV2';
import SectionNavigation from '@/components/datacenter-education/SectionNavigation';

// Lazy load sections below the fold
const PowerJourneySection = lazy(() => import('@/components/datacenter-education/PowerJourneySection'));
const CoolingSystemsVisualSection = lazy(() => import('@/components/datacenter-education/CoolingSystemsVisualSection'));
const MiningHardwareShowcaseSection = lazy(() => import('@/components/datacenter-education/MiningHardwareShowcaseSection'));
const InteractiveFacilityTour = lazy(() => import('@/components/datacenter-education/InteractiveFacilityTour'));
const EnhancedCTASection = lazy(() => import('@/components/datacenter-education/EnhancedCTASection'));

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
      <SectionNavigation />
      
      {/* Immersive Hero Section */}
      <DatacenterHeroSectionV2 />
      
      {/* Section 1: The Power Journey (Consolidated) */}
      <Suspense fallback={<SectionLoader />}>
        <PowerJourneySection />
      </Suspense>
      
      {/* Section 2: Cooling Systems */}
      <Suspense fallback={<SectionLoader />}>
        <div id="cooling-systems">
          <CoolingSystemsVisualSection />
        </div>
      </Suspense>
      
      {/* Section 3: Mining Hardware */}
      <Suspense fallback={<SectionLoader />}>
        <div id="mining-hardware">
          <MiningHardwareShowcaseSection />
        </div>
      </Suspense>
      
      {/* Section 4: Interactive Facility Tour */}
      <Suspense fallback={<SectionLoader />}>
        <InteractiveFacilityTour />
      </Suspense>
      
      {/* CTA Section */}
      <Suspense fallback={<SectionLoader />}>
        <EnhancedCTASection />
      </Suspense>
      
      <LandingFooter />
    </div>
  );
};

export default DatacenterEducation;
