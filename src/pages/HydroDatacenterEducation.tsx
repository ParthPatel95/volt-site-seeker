import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import HydroHeroSection from '@/components/hydro-education/HydroHeroSection';
import HydroSectionNavigation from '@/components/hydro-education/HydroSectionNavigation';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';

// Lazy load all sections for performance
const HydroAdvantagesSection = lazy(() => import('@/components/hydro-education/HydroAdvantagesSection'));
const HydroContainerProductsSection = lazy(() => import('@/components/hydro-education/HydroContainerProductsSection'));
const HydroCoolingMethodsSection = lazy(() => import('@/components/hydro-education/HydroCoolingMethodsSection'));
const HydroSiteSelectionSection = lazy(() => import('@/components/hydro-education/HydroSiteSelectionSection'));
const HydroLayoutSection = lazy(() => import('@/components/hydro-education/HydroLayoutSection'));
const HydroWaterSystemsSection = lazy(() => import('@/components/hydro-education/HydroWaterSystemsSection'));
const HydroElectricalSection = lazy(() => import('@/components/hydro-education/HydroElectricalSection'));
const HydroNetworkSecuritySection = lazy(() => import('@/components/hydro-education/HydroNetworkSecuritySection'));
const HydroConstructionSection = lazy(() => import('@/components/hydro-education/HydroConstructionSection'));
const HydroEconomicsSection = lazy(() => import('@/components/hydro-education/HydroEconomicsSection'));
const HydroWasteHeatSection = lazy(() => import('@/components/hydro-education/HydroWasteHeatSection'));
const HydroCTASection = lazy(() => import('@/components/hydro-education/HydroCTASection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-watt-bitcoin border-t-transparent rounded-full animate-spin" />
  </div>
);

const HydroDatacenterEducation = () => {
  return (
    <div className="min-h-screen bg-background">
      <SmoothScroll />
      <LandingNavigation />
      <HydroSectionNavigation />
      
      {/* Immersive Hero Section */}
      <HydroHeroSection />
      
      {/* Section 1: Why Hydro-cooling */}
      <Suspense fallback={<SectionLoader />}>
        <div id="advantages">
          <HydroAdvantagesSection />
        </div>
      </Suspense>
      
      {/* Section 2: Container Products */}
      <Suspense fallback={<SectionLoader />}>
        <div id="containers">
          <HydroContainerProductsSection />
        </div>
      </Suspense>
      
      {/* Section 3: Cooling Methods */}
      <Suspense fallback={<SectionLoader />}>
        <div id="cooling-methods">
          <HydroCoolingMethodsSection />
        </div>
      </Suspense>
      
      {/* Section 4: Site Selection */}
      <Suspense fallback={<SectionLoader />}>
        <div id="site-selection">
          <HydroSiteSelectionSection />
        </div>
      </Suspense>
      
      {/* Section 5: Modular Layout */}
      <Suspense fallback={<SectionLoader />}>
        <div id="layout">
          <HydroLayoutSection />
        </div>
      </Suspense>
      
      {/* Section 6: Water Systems */}
      <Suspense fallback={<SectionLoader />}>
        <div id="water-systems">
          <HydroWaterSystemsSection />
        </div>
      </Suspense>
      
      {/* Section 7: Electrical Infrastructure */}
      <Suspense fallback={<SectionLoader />}>
        <div id="electrical">
          <HydroElectricalSection />
        </div>
      </Suspense>
      
      {/* Section 8: Network & Security */}
      <Suspense fallback={<SectionLoader />}>
        <div id="network-security">
          <HydroNetworkSecuritySection />
        </div>
      </Suspense>
      
      {/* Section 9: Construction & Acceptance */}
      <Suspense fallback={<SectionLoader />}>
        <div id="construction">
          <HydroConstructionSection />
        </div>
      </Suspense>
      
      {/* Section 10: Economics */}
      <Suspense fallback={<SectionLoader />}>
        <div id="economics">
          <HydroEconomicsSection />
        </div>
      </Suspense>
      
      {/* Section 11: Waste Heat Recovery */}
      <Suspense fallback={<SectionLoader />}>
        <div id="waste-heat">
          <HydroWasteHeatSection />
        </div>
      </Suspense>
      
      {/* CTA Section */}
      <Suspense fallback={<SectionLoader />}>
        <HydroCTASection />
      </Suspense>
      
      <LandingFooter />

      {/* Page Translation Button */}
      <PageTranslationButton pageId="hydro-datacenters-101" />
    </div>
  );
};

export default HydroDatacenterEducation;
