import { useEffect, useState } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { AESOHeroSection } from '@/components/aeso-education/AESOHeroSection';
import { WhatIsAESOSection } from '@/components/aeso-education/WhatIsAESOSection';
import { PoolPricingSection } from '@/components/aeso-education/PoolPricingSection';
import { AESOPriceTrendsSection } from '@/components/aeso-education/AESOPriceTrendsSection';
import { TwelveCPExplainedSection } from '@/components/aeso-education/TwelveCPExplainedSection';
import { AESOSavingsProgramsSection } from '@/components/aeso-education/AESOSavingsProgramsSection';
import { Rate65ExplainedSection } from '@/components/aeso-education/Rate65ExplainedSection';
import { GridOperationsSection } from '@/components/aeso-education/GridOperationsSection';
import { GenerationMixSection } from '@/components/aeso-education/GenerationMixSection';
import { EnergyForecastSection } from '@/components/aeso-education/EnergyForecastSection';
import { AESOCTASection } from '@/components/aeso-education/AESOCTASection';
import { MarketParticipantsSection } from '@/components/aeso-education/MarketParticipantsSection';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';
import { ChevronUp } from 'lucide-react';

const AESOEducation = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">

      <LandingNavigation />

      <main className="pt-16">
        <div id="hero">
          <AESOHeroSection />
        </div>
        <div id="what-is-aeso">
          <WhatIsAESOSection />
        </div>
        <div id="market-participants">
          <MarketParticipantsSection />
        </div>
        <div id="pool-pricing">
          <PoolPricingSection />
        </div>
        <div id="price-trends">
          <AESOPriceTrendsSection />
        </div>
        <div id="twelve-cp">
          <TwelveCPExplainedSection />
        </div>
        <div id="savings-programs">
          <AESOSavingsProgramsSection />
        </div>
        <div id="rate-65">
          <Rate65ExplainedSection />
        </div>
        <div id="grid-operations">
          <GridOperationsSection />
        </div>
        <div id="generation-mix">
          <GenerationMixSection />
        </div>
        <div id="forecast">
          <EnergyForecastSection />
        </div>
        <div id="cta">
          <AESOCTASection />
        </div>
      </main>

      <LandingFooter />

      {/* Page Translation Button */}
      <PageTranslationButton pageId="aeso-101" />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-watt-bitcoin text-white shadow-lg transition-all duration-300 hover:bg-watt-bitcoin/90 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AESOEducation;