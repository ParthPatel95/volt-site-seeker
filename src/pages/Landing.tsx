import React, { lazy, Suspense, useEffect } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { AuroraBackground } from '@/components/landing/v2/AuroraBackground';
import { HeroSection } from '@/components/landing/v2/HeroSection';
import { PipelineTicker } from '@/components/landing/v2/PipelineTicker';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES } from '@/data/advisory-pipeline';

// Persistent 3D backdrop — the camera travels through the datacenter hall as
// the visitor scrolls the whole page. Lazy so three.js stays out of the
// first paint; the component self-gates on WebGL + prefers-reduced-motion.
// Persistent realistic energy site — transmission line + substation +
// datacenter — behind the whole page. Camera flies through it on scroll.
// Lazy so three.js stays out of the first paint; self-gates on WebGL +
// prefers-reduced-motion.
const RealisticScene = lazy(() => import('@/components/landing/v2/RealisticScene'));

// Below-the-fold sections load lazily.
const EnergyFlowSection = lazy(() => import('@/components/landing/v2/EnergyFlowSection').then(m => ({ default: m.EnergyFlowSection })));
const ServicesGrid = lazy(() => import('@/components/landing/v2/ServicesGrid').then(m => ({ default: m.ServicesGrid })));
const PipelineSection = lazy(() => import('@/components/landing/v2/PipelineSection').then(m => ({ default: m.PipelineSection })));
const FlagshipSection = lazy(() => import('@/components/landing/v2/FlagshipSection').then(m => ({ default: m.FlagshipSection })));
const PlatformSection = lazy(() => import('@/components/landing/v2/PlatformSection').then(m => ({ default: m.PlatformSection })));
const CryptoHpcSection = lazy(() => import('@/components/landing/v2/CryptoHpcSection').then(m => ({ default: m.CryptoHpcSection })));
const LiveMarketsSection = lazy(() => import('@/components/landing/LiveMarketsSection'));
const ClosingSections = lazy(() => import('@/components/landing/v2/ClosingSections'));

const SectionLoader = () => (
  <div className="flex justify-center items-center py-16">
    <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Landing: React.FC = () => {
  // Landing is light-first — it's a first impression and "welcoming" reads as
  // bright. Force the light token set for this route regardless of the user's
  // saved app-theme; restore on leave so the rest of the app keeps honoring
  // whatever they had set.
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    root.classList.remove('dark');
    return () => { if (hadDark) root.classList.add('dark'); };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* SEO content */}
      <header>
        <h1 className="sr-only">WattByte Infrastructure - Bitcoin Mining & AI Data Center Development</h1>
        <p className="sr-only">
          WattByte is a global infrastructure company specializing in Bitcoin mining and AI data center development.
          With {TOTAL_MW.toLocaleString()}MW in our global pipeline and {UNDER_DEV_MW}MW under development, we transform stranded energy assets into profitable infrastructure.
        </p>
      </header>

      <AuroraBackground />

      {/* Page-wide 3D journey: entrance shot at the hero, down the cool aisle
          through chapters 01–03, top-down overview at the pipeline, pulled
          back for the close. Dims under the reading sections. */}
      <Suspense fallback={null}>
        <RealisticScene />
      </Suspense>

      <LandingNavigation />

      {/* Narrative-ordered: Hook → 01 Our model → 02 What we offer →
          03 What runs on it → 04 Flagship → 05 Pipeline → 06 Platform →
          07 Live data → Close. Chapter labels live inside each section. */}
      <main className="relative z-10">
        <HeroSection />
        <PipelineTicker />

        <Suspense fallback={<SectionLoader />}>
          <section aria-label="Our model"><EnergyFlowSection /></section>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <section aria-label="What we offer"><ServicesGrid /></section>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <section aria-label="What runs on the megawatts"><CryptoHpcSection /></section>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <section aria-label="Alberta flagship facility"><FlagshipSection /></section>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <section aria-label="Global pipeline"><PipelineSection /></section>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <section aria-label="VoltScout platform"><PlatformSection /></section>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <section aria-label="Live energy markets" className="relative">
            {/* Chapter label sits at page level so we don't edit the legacy
                LiveMarketsSection component. */}
            <div className="px-6 sm:px-10 lg:px-20 pt-12 max-w-7xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-widest text-watt-trust">
                <span className="font-mono mr-2 opacity-60">07 /</span> Live data, no hand-waving
              </p>
            </div>
            <LiveMarketsSection />
          </section>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <ClosingSections />
        </Suspense>
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
