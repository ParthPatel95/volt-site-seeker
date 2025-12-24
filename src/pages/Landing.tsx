import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { OptimizedHeroSection } from '@/components/landing/OptimizedHeroSection';

// Lazy load heavy sections
const ProblemSolutionSection = lazy(() => import('@/components/landing/ProblemSolutionSection').then(module => ({ default: module.ProblemSolutionSection })));
const InvestmentThesisSection = lazy(() => import('@/components/landing/InvestmentThesisSection').then(module => ({ default: module.InvestmentThesisSection })));
const AlbertaFacilityHub = lazy(() => import('@/components/landing/AlbertaFacilityHub').then(module => ({ default: module.AlbertaFacilityHub })));
const InfrastructureHighlights = lazy(() => import('@/components/landing/InfrastructureHighlights').then(module => ({ default: module.InfrastructureHighlights })));
const LiveMarketsSection = lazy(() => import('@/components/landing/LiveMarketsSection'));
const VoltScoutIntelligenceHub = lazy(() => import('@/components/landing/VoltScoutIntelligenceHub').then(module => ({ default: module.VoltScoutIntelligenceHub })));
const LandingAcademySection = lazy(() => import('@/components/landing/LandingAcademySection').then(module => ({ default: module.LandingAcademySection })));

const SectionLoader = () => (
  <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-watt-trust border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      {/* Smooth scroll functionality */}
      <SmoothScroll />
      
      {/* SEO content */}
      <header>
        <h1 className="sr-only">WattByte Infrastructure - Bitcoin Mining & AI Data Center Development</h1>
        <p className="sr-only">
          WattByte is a global infrastructure company specializing in Bitcoin mining and AI data center development.
          With 1,429MW in our global pipeline and 135MW under development, we transform stranded energy assets into profitable infrastructure.
        </p>
      </header>

      {/* Background */}
      <LandingBackground />
      
      {/* Navigation */}
      <LandingNavigation />
      
      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10 safe-area-pt">
        <main>
          {/* Hero Section */}
          <OptimizedHeroSection />

          <SectionDivider color="cyan" />

          {/* Problem & Solution Section */}
          <section aria-label="Problem and Solution" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <ProblemSolutionSection />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Investment Thesis Section */}
          <section aria-label="Investment Thesis" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <InvestmentThesisSection />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* Alberta Facility Hub */}
          <section aria-label="Alberta Facility" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <AlbertaFacilityHub />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

          {/* Development Pipeline Section */}
          <section aria-label="Development Pipeline" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <InfrastructureHighlights />
            </Suspense>
          </section>

          <SectionDivider color="purple" />

          {/* Live Energy Markets Section */}
          <section aria-label="Live Energy Markets" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <LiveMarketsSection />
            </Suspense>
          </section>

          <SectionDivider color="yellow" />

          {/* VoltScout Intelligence Hub */}
          <section aria-label="VoltScout Platform" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <VoltScoutIntelligenceHub />
            </Suspense>
          </section>

          <SectionDivider color="cyan" />

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
          <li>1,429MW total global pipeline across 6 countries</li>
          <li>135MW currently under development in Alberta, Canada</li>
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
