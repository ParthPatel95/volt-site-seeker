import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import DatacenterHeroSectionV2 from '@/components/datacenter-education/DatacenterHeroSectionV2';
import SectionNavigation from '@/components/datacenter-education/SectionNavigation';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';

// Lazy load all sections for performance
const EnergySourceSection = lazy(() => import('@/components/datacenter-education/EnergySourceSection'));
const ElectricalInfrastructureSection = lazy(() => import('@/components/datacenter-education/ElectricalInfrastructureSection'));
const FacilityDesignSection = lazy(() => import('@/components/datacenter-education/FacilityDesignSection'));
const AirflowContainmentSection = lazy(() => import('@/components/datacenter-education/AirflowContainmentSection'));
const CoolingSystemsVisualSection = lazy(() => import('@/components/datacenter-education/CoolingSystemsVisualSection'));
const MiningHardwareShowcaseSection = lazy(() => import('@/components/datacenter-education/MiningHardwareShowcaseSection'));
const OperationsMonitoringSection = lazy(() => import('@/components/datacenter-education/OperationsMonitoringSection'));
const DatacenterEconomicsSection = lazy(() => import('@/components/datacenter-education/DatacenterEconomicsSection'));
const InteractiveFacilityTour = lazy(() => import('@/components/datacenter-education/InteractiveFacilityTour'));
const EnhancedCTASection = lazy(() => import('@/components/datacenter-education/EnhancedCTASection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-[hsl(var(--watt-bitcoin))] border-t-transparent rounded-full animate-spin" />
  </div>
);

const DatacenterEducation = () => {
  return (
    <div className="min-h-screen bg-background">
      <SmoothScroll />
      <LandingNavigation />
      <SectionNavigation />
      
      {/* Main content */}
      <div>
        {/* Immersive Hero Section */}
        <DatacenterHeroSectionV2 />
      
      {/* Section 1: Energy Source to Facility */}
      <Suspense fallback={<SectionLoader />}>
        <EnergySourceSection />
      </Suspense>
      
      {/* Section 2: Electrical Infrastructure */}
      <Suspense fallback={<SectionLoader />}>
        <ElectricalInfrastructureSection />
      </Suspense>
      
      {/* Section 3: Facility Design & Layout */}
      <Suspense fallback={<SectionLoader />}>
        <FacilityDesignSection />
      </Suspense>
      
      {/* Section 4: Airflow & Containment */}
      <Suspense fallback={<SectionLoader />}>
        <AirflowContainmentSection />
      </Suspense>
      
      {/* Section 5: Cooling Systems */}
      <Suspense fallback={<SectionLoader />}>
        <div id="cooling-systems">
          <CoolingSystemsVisualSection />
        </div>
      </Suspense>
      
      {/* Section 6: Mining Hardware */}
      <Suspense fallback={<SectionLoader />}>
        <div id="mining-hardware">
          <MiningHardwareShowcaseSection />
        </div>
      </Suspense>
      
      {/* Section 7: Operations & Monitoring */}
      <Suspense fallback={<SectionLoader />}>
        <OperationsMonitoringSection />
      </Suspense>
      
      {/* Section 8: Datacenter Economics */}
      <Suspense fallback={<SectionLoader />}>
        <DatacenterEconomicsSection />
      </Suspense>
      
      {/* Section 9: Interactive Facility Tour */}
      <Suspense fallback={<SectionLoader />}>
        <InteractiveFacilityTour />
      </Suspense>
      
      {/* CTA Section */}
      <Suspense fallback={<SectionLoader />}>
        <EnhancedCTASection />
      </Suspense>
      </div>
      
      <LandingFooter />

      {/* Page Translation Button */}
      <PageTranslationButton pageId="datacenters-101" />
    </div>
  );
};

export default DatacenterEducation;