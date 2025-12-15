import { useEffect, useState } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { AESOHeroSection } from '@/components/aeso-education/AESOHeroSection';
import { WhatIsAESOSection } from '@/components/aeso-education/WhatIsAESOSection';
import { PoolPricingSection } from '@/components/aeso-education/PoolPricingSection';
import { AESOPriceTrendsSection } from '@/components/aeso-education/AESOPriceTrendsSection';
import { TwelveCPExplainedSection } from '@/components/aeso-education/TwelveCPExplainedSection';
import { AESOSavingsProgramsSection } from '@/components/aeso-education/AESOSavingsProgramsSection';
import { GridOperationsSection } from '@/components/aeso-education/GridOperationsSection';
import { GenerationMixSection } from '@/components/aeso-education/GenerationMixSection';
import { EnergyForecastSection } from '@/components/aeso-education/EnergyForecastSection';
import { AESOCTASection } from '@/components/aeso-education/AESOCTASection';
import { MarketParticipantsSection } from '@/components/aeso-education/MarketParticipantsSection';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';
import { ChevronUp, Zap, DollarSign, Activity, TrendingUp, PiggyBank, Settings, Wind, LineChart, ArrowRight, Users } from 'lucide-react';

const sections = [
  { id: 'hero', label: 'Overview', icon: Zap },
  { id: 'what-is-aeso', label: 'What is AESO', icon: Settings },
  { id: 'market-participants', label: 'Participants', icon: Users },
  { id: 'pool-pricing', label: 'Pool Pricing', icon: DollarSign },
  { id: 'price-trends', label: 'Price Trends', icon: LineChart },
  { id: 'twelve-cp', label: '12CP Savings', icon: PiggyBank },
  { id: 'savings-programs', label: 'Programs', icon: TrendingUp },
  { id: 'grid-operations', label: 'Grid Ops', icon: Activity },
  { id: 'generation-mix', label: 'Generation', icon: Wind },
  { id: 'forecast', label: 'Forecasting', icon: TrendingUp },
  { id: 'cta', label: 'Get Started', icon: ArrowRight },
];

const AESOEducation = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      
      // Determine active section
      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      }));
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">

      <LandingNavigation />

      {/* Sticky Section Navigation */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-watt-bitcoin text-white'
                  : 'bg-white/80 hover:bg-watt-bitcoin/10 text-watt-navy/70 hover:text-watt-bitcoin'
              }`}
              title={section.label}
            >
              <Icon className="w-4 h-4" />
              <span className={`text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                activeSection === section.id ? 'max-w-24 opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-24 group-hover:opacity-100'
              }`}>
                {section.label}
              </span>
            </button>
          );
        })}
      </div>

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
