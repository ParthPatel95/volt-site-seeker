import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { Hero3DSection } from '@/components/landing/Hero3DSection';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES } from '@/data/advisory-pipeline';

// Lazy load heavy sections
const ServicesSection = lazy(() => import('@/components/landing/ServicesSection').then(module => ({ default: module.ServicesSection })));
const GlobalSitesSection = lazy(() => import('@/components/landing/GlobalSitesSection').then(module => ({ default: module.GlobalSitesSection })));
const ProblemSolutionSection = lazy(() => import('@/components/landing/ProblemSolutionSection').then(module => ({ default: module.ProblemSolutionSection })));
const LandingInvestmentThesis = lazy(() => import('@/components/landing/LandingInvestmentThesis').then(module => ({ default: module.LandingInvestmentThesis })));
const AlbertaFacilityHub = lazy(() => import('@/components/landing/AlbertaFacilityHub').then(module => ({ default: module.AlbertaFacilityHub })));
const LiveMarketsSection = lazy(() => import('@/components/landing/LiveMarketsSection'));
const VoltScoutIntelligenceHub = lazy(() => import('@/components/landing/VoltScoutIntelligenceHub').then(module => ({ default: module.VoltScoutIntelligenceHub })));
const LandingAcademySection = lazy(() => import('@/components/landing/LandingAcademySection').then(module => ({ default: module.LandingAcademySection })));

const SectionLoader = () => (
  <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Smooth scroll functionality */}
      <SmoothScroll />

      {/* SEO content */}
      <header>
        <h1 className="sr-only">WattByte Infrastructure - Bitcoin Mining & AI Data Center Development</h1>
        <p className="sr-only">
          WattByte is a global infrastructure company specializing in Bitcoin mining and AI data center development.
          With {TOTAL_MW.toLocaleString()}MW in our global pipeline and {UNDER_DEV_MW}MW under development, we transform stranded energy assets into profitable infrastructure.
        </p>
      </header>

      {/* Background */}
      <LandingBackground />

      {/* Navigation */}
      <LandingNavigation />

      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10 safe-area-pt">
        <main>
          {/* Hero — 3D pipeline globe driven by the real site registry */}
          <Hero3DSection />

          <SectionDivider color="cyan" />

          {/* What we offer */}
          <section aria-label="Services" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <ServicesSection />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Current sites */}
          <section aria-label="Global Sites" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <GlobalSitesSection />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* Market thesis */}
          <section aria-label="Problem and Solution" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <ProblemSolutionSection />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

          {/* Alberta flagship deep-dive */}
          <section aria-label="Alberta Facility" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <AlbertaFacilityHub />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Investment Thesis Section */}
          <section aria-label="Investment Thesis" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <LandingInvestmentThesis />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* Live Energy Markets Section */}
          <section aria-label="Live Energy Markets" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <LiveMarketsSection />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

          {/* VoltScout Intelligence Hub */}
          <section aria-label="VoltScout Platform" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <VoltScoutIntelligenceHub />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Academy Section */}
          <section aria-label="WattByte Academy" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <LandingAcademySection />
            </Suspense>
          </section>
        </main>

        <LandingFooter />
      </div>

      {/* SEO content */}
      <div className="sr-only">
        <h2>About WattByte Infrastructure</h2>
        <p>
          WattByte is a leading infrastructure company focused on Bitcoin mining and AI data center development.
          We identify underutilized power assets globally and transform them into high-performance computing facilities.
        </p>

        <h3>Our Global Pipeline</h3>
        <ul>
          <li>{TOTAL_MW.toLocaleString()}MW total global pipeline across {COUNTRIES} countries</li>
          <li>{UNDER_DEV_MW}MW currently under development in Alberta, Canada</li>
          <li>Strategic locations in Uganda, Texas, Nepal, Bhutan, and India</li>
        </ul>

        <h3>VoltScout Platform</h3>
        <p>
          Our proprietary VoltScout platform provides AI-powered site intelligence, infrastructure mapping,
          and price forecasting to identify optimal locations for data center development.
        </p>
      </div>
    </div>
  );
};

export default Landing;
