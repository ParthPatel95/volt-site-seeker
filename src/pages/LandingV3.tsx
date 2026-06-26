import React, { lazy, Suspense } from 'react';
import { SmoothScroll } from '@/components/landing/v3/SmoothScroll';
import { LandingNavV3 } from '@/components/landing/v3/LandingNavV3';
import { LandingFooterV3 } from '@/components/landing/v3/LandingFooterV3';
import { HeroV3 } from '@/components/landing/v3/HeroV3';
import { TickerV3 } from '@/components/landing/v3/TickerV3';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES } from '@/data/advisory-pipeline';

// Cinematic chapters (code-split — each is a full-viewport-ish section).
const EnergyToCompute = lazy(() => import('@/components/landing/v3/chapters/EnergyToCompute').then(m => ({ default: m.EnergyToCompute })));
const PowerFirst = lazy(() => import('@/components/landing/v3/chapters/PowerFirst').then(m => ({ default: m.PowerFirst })));
const Services = lazy(() => import('@/components/landing/v3/chapters/Services').then(m => ({ default: m.Services })));
const Flagship = lazy(() => import('@/components/landing/v3/chapters/Flagship').then(m => ({ default: m.Flagship })));
const GlobalPipeline = lazy(() => import('@/components/landing/v3/chapters/GlobalPipeline').then(m => ({ default: m.GlobalPipeline })));
const Platform = lazy(() => import('@/components/landing/v3/chapters/Platform').then(m => ({ default: m.Platform })));
const CryptoHpc = lazy(() => import('@/components/landing/v3/chapters/CryptoHpc').then(m => ({ default: m.CryptoHpc })));
const Faq = lazy(() => import('@/components/landing/v3/chapters/Faq').then(m => ({ default: m.Faq })));
const ClosingCta = lazy(() => import('@/components/landing/v3/chapters/ClosingCta').then(m => ({ default: m.ClosingCta })));

const ChapterLoader = () => (
  <div className="flex justify-center py-20">
    <div className="h-7 w-7 animate-spin rounded-full border-2 border-watt-bitcoin border-t-transparent" />
  </div>
);

const LandingV3: React.FC = () => {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#060b16] text-white">
        {/* SEO */}
        <header className="sr-only">
          <h1>WattByte Infrastructure — turning stranded power into AI and HPC compute</h1>
          <p>
            WattByte develops underutilized energy assets into AI, high-performance computing,
            and Bitcoin-mining datacenters. {TOTAL_MW.toLocaleString()}MW global pipeline across {COUNTRIES} countries,
            {UNDER_DEV_MW}MW under development at our Alberta flagship, sourced with the VoltScout platform.
          </p>
        </header>

        <LandingNavV3 />

        <main className="relative">
          <HeroV3 />
          <TickerV3 />

          <Suspense fallback={<ChapterLoader />}>
            <EnergyToCompute />
            <PowerFirst />
            <Services />
            <Flagship />
            <GlobalPipeline />
            <Platform />
            <CryptoHpc />
            <Faq />
            <ClosingCta />
          </Suspense>
        </main>

        <LandingFooterV3 />
      </div>
    </SmoothScroll>
  );
};

export default LandingV3;
