import React, { lazy, Suspense } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES } from '@/data/advisory-pipeline';
import { HeroSection } from '@/components/landing/v2/HeroSection';
import { PipelineTicker } from '@/components/landing/v2/PipelineTicker';

const EnergyFlowSection = lazy(() => import('@/components/landing/v2/EnergyFlowSection').then(m => ({ default: m.EnergyFlowSection })));
const WhyPowerFirstSection = lazy(() => import('@/components/landing/v2/WhyPowerFirstSection').then(m => ({ default: m.WhyPowerFirstSection })));
const ServicesGrid = lazy(() => import('@/components/landing/v2/ServicesGrid').then(m => ({ default: m.ServicesGrid })));
const FlagshipSection = lazy(() => import('@/components/landing/v2/FlagshipSection').then(m => ({ default: m.FlagshipSection })));
const CinematicBand = lazy(() => import('@/components/landing/v2/CinematicBand').then(m => ({ default: m.CinematicBand })));
const PipelineSection = lazy(() => import('@/components/landing/v2/PipelineSection').then(m => ({ default: m.PipelineSection })));
const PlatformSection = lazy(() => import('@/components/landing/v2/PlatformSection').then(m => ({ default: m.PlatformSection })));
const CryptoHpcSection = lazy(() => import('@/components/landing/v2/CryptoHpcSection').then(m => ({ default: m.CryptoHpcSection })));
const FaqSection = lazy(() => import('@/components/landing/v2/FaqSection').then(m => ({ default: m.FaqSection })));
const ClosingSections = lazy(() => import('@/components/landing/v2/ClosingSections'));

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

      <main className="relative z-10">
        <HeroSection />
        <PipelineTicker />

        <Suspense fallback={<SectionLoader />}>
          <EnergyFlowSection />
          <WhyPowerFirstSection />
          <ServicesGrid />
          <FlagshipSection />
          <CinematicBand />
          <PipelineSection />
          <PlatformSection />
          <CryptoHpcSection />
          <FaqSection />
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
