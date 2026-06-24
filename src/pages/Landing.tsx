import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { OptimizedHeroSection } from '@/components/landing/OptimizedHeroSection';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES } from '@/data/advisory-pipeline';

const ProblemSolutionSection = lazy(() => import('@/components/landing/ProblemSolutionSection').then(m => ({ default: m.ProblemSolutionSection })));
const InvestmentThesisSection = lazy(() => import('@/components/landing/InvestmentThesisSection').then(m => ({ default: m.InvestmentThesisSection })));
const AlbertaFacilityHub = lazy(() => import('@/components/landing/AlbertaFacilityHub').then(m => ({ default: m.AlbertaFacilityHub })));
const InfrastructureHighlights = lazy(() => import('@/components/landing/InfrastructureHighlights').then(m => ({ default: m.InfrastructureHighlights })));
const LiveMarketsSection = lazy(() => import('@/components/landing/LiveMarketsSection').then(m => ({ default: m.LiveMarketsSection })));
const VoltScoutIntelligenceHub = lazy(() => import('@/components/landing/VoltScoutIntelligenceHub').then(m => ({ default: m.VoltScoutIntelligenceHub })));

const SectionLoader = () => (
  <div className="flex justify-center items-center py-16">
    <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <SmoothScroll />
      <LandingBackground />

      {/* SEO content */}
      <header>
        <p className="sr-only">
          WattByte is a global infrastructure company specializing in Bitcoin mining and AI data center development.
          With {TOTAL_MW.toLocaleString()}MW in our global pipeline and {UNDER_DEV_MW}MW under development, we transform stranded energy assets into profitable infrastructure.
        </p>
      </header>

      <LandingNavigation />

      <main className="relative z-10 pt-14 sm:pt-16 md:pt-20">
        <OptimizedHeroSection />

        <SectionDivider color="cyan" />

        <section aria-label="Power constraints and WattByte solution" className="relative">
          <Suspense fallback={<SectionLoader />}>
            <ProblemSolutionSection />
          </Suspense>
        </section>

        <SectionDivider color="blue" />

        <section aria-label="Company thesis" className="relative">
          <Suspense fallback={<SectionLoader />}>
            <InvestmentThesisSection />
          </Suspense>
        </section>

        <SectionDivider color="green" />

        <section aria-label="Alberta Heartland 135 facility" className="relative">
          <Suspense fallback={<SectionLoader />}>
            <AlbertaFacilityHub />
          </Suspense>
        </section>

        <SectionDivider color="cyan" />

        <section aria-label="Development pipeline" className="relative">
          <Suspense fallback={<SectionLoader />}>
            <InfrastructureHighlights />
          </Suspense>
        </section>

        <SectionDivider color="purple" />

        <section aria-label="Live energy markets" className="relative">
          <Suspense fallback={<SectionLoader />}>
            <LiveMarketsSection />
          </Suspense>
        </section>

        <SectionDivider color="yellow" />

        <section aria-label="VoltScout Intelligence Hub" className="relative">
          <Suspense fallback={<SectionLoader />}>
            <VoltScoutIntelligenceHub />
          </Suspense>
        </section>
      </main>

      <LandingFooter />

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
