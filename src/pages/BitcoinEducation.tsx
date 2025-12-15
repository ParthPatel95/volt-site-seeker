// Bitcoin Education Page
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import { PageTranslationButton } from '@/components/translation/PageTranslationButton';
import { 
  Bitcoin, 
  HelpCircle, 
  History, 
  Workflow, 
  Pickaxe, 
  Thermometer, 
  Users, 
  Leaf, 
  TrendingUp, 
  Shield, 
  Globe, 
  Rocket, 
  ArrowRight,
  ArrowUp
} from 'lucide-react';

// Eager load hero for faster initial paint
import BitcoinHeroSection from '@/components/bitcoin-education/BitcoinHeroSection';

// Lazy load remaining sections
const WhatIsBitcoinSection = lazy(() => import('@/components/bitcoin-education/WhatIsBitcoinSection'));
const BitcoinHistorySection = lazy(() => import('@/components/bitcoin-education/BitcoinHistorySection'));
const HowBitcoinWorksSection = lazy(() => import('@/components/bitcoin-education/HowBitcoinWorksSection'));
const BitcoinMiningSection = lazy(() => import('@/components/bitcoin-education/BitcoinMiningSection'));
const DatacenterCoolingSection = lazy(() => import('@/components/bitcoin-education/DatacenterCoolingSection'));
const MiningPoolsSection = lazy(() => import('@/components/bitcoin-education/MiningPoolsSection'));
const MiningSustainabilitySection = lazy(() => import('@/components/bitcoin-education/MiningSustainabilitySection'));
const BitcoinEconomicsSection = lazy(() => import('@/components/bitcoin-education/BitcoinEconomicsSection'));
const BitcoinBenefitsSection = lazy(() => import('@/components/bitcoin-education/BitcoinBenefitsSection'));
const GlobalBitcoinAdoptionSection = lazy(() => import('@/components/bitcoin-education/GlobalBitcoinAdoptionSection'));
const BitcoinFutureSection = lazy(() => import('@/components/bitcoin-education/BitcoinFutureSection'));
const BitcoinCTASection = lazy(() => import('@/components/bitcoin-education/BitcoinCTASection'));

const sections = [
  { id: 'hero', label: 'Overview', icon: Bitcoin },
  { id: 'what-is-bitcoin', label: 'What is Bitcoin', icon: HelpCircle },
  { id: 'history', label: 'History', icon: History },
  { id: 'how-it-works', label: 'How It Works', icon: Workflow },
  { id: 'mining', label: 'Mining', icon: Pickaxe },
  { id: 'cooling', label: 'Cooling', icon: Thermometer },
  { id: 'pools', label: 'Pools', icon: Users },
  { id: 'sustainability', label: 'Sustainability', icon: Leaf },
  { id: 'economics', label: 'Economics', icon: TrendingUp },
  { id: 'benefits', label: 'Benefits', icon: Shield },
  { id: 'adoption', label: 'Adoption', icon: Globe },
  { id: 'future', label: 'Future', icon: Rocket },
  { id: 'cta', label: 'Get Started', icon: ArrowRight },
];

const SectionLoader = () => (
  <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-watt-bitcoin border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const BitcoinEducation: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      
      // Show/hide scroll to top button
      setShowScrollTop(scrollTop > 500);

      // Determine active section
      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      })).filter(s => s.element);

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      <SmoothScroll />
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-watt-bitcoin transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* SEO content */}
      <header>
        <h1 className="sr-only">Understanding Bitcoin - A Comprehensive Guide</h1>
        <p className="sr-only">
          Learn everything about Bitcoin: what it is, how it works, Bitcoin mining, datacenter cooling technologies,
          mining pools, economics, benefits, global adoption, and the future of cryptocurrency.
        </p>
      </header>

      <LandingBackground />
      <LandingNavigation />
      
      {/* Desktop Side Navigation */}
      <nav className="hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`group flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-watt-bitcoin text-white' 
                  : 'bg-white/80 hover:bg-watt-bitcoin/10 text-watt-navy/60 hover:text-watt-bitcoin'
              } shadow-sm backdrop-blur-sm`}
              title={section.label}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className={`text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${
                isActive ? 'max-w-24 opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-24 group-hover:opacity-100'
              }`}>
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 safe-area-pb">
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] flex-shrink-0 ${
                  isActive 
                    ? 'bg-watt-bitcoin text-white' 
                    : 'text-watt-navy/60 hover:bg-watt-bitcoin/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-20 xl:bottom-8 right-4 z-40 p-3 rounded-full bg-watt-bitcoin text-white shadow-lg transition-all duration-300 hover:bg-watt-bitcoin/90 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
      
      <div className="pt-14 sm:pt-16 md:pt-20 pb-20 xl:pb-0 relative z-10 safe-area-pt">
        <main>
          {/* Hero Section */}
          <div id="hero">
            <BitcoinHeroSection />
          </div>

          <SectionDivider color="yellow" />

          {/* What is Bitcoin */}
          <div id="what-is-bitcoin">
            <section aria-label="What is Bitcoin">
              <Suspense fallback={<SectionLoader />}>
                <WhatIsBitcoinSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="cyan" />

          {/* Bitcoin History */}
          <div id="history">
            <section aria-label="Bitcoin History">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinHistorySection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="purple" />

          {/* How Bitcoin Works */}
          <div id="how-it-works">
            <section aria-label="How Bitcoin Works">
              <Suspense fallback={<SectionLoader />}>
                <HowBitcoinWorksSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="yellow" />

          {/* Bitcoin Mining Basics */}
          <div id="mining">
            <section aria-label="Bitcoin Mining">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinMiningSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="cyan" />

          {/* Datacenter Cooling Technologies */}
          <div id="cooling">
            <section aria-label="Datacenter Cooling Technologies">
              <Suspense fallback={<SectionLoader />}>
                <DatacenterCoolingSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="purple" />

          {/* Mining Pools */}
          <div id="pools">
            <section aria-label="Mining Pools">
              <Suspense fallback={<SectionLoader />}>
                <MiningPoolsSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="yellow" />

          {/* Mining Sustainability */}
          <div id="sustainability">
            <section aria-label="Mining and Energy Sustainability">
              <Suspense fallback={<SectionLoader />}>
                <MiningSustainabilitySection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="cyan" />

          {/* Bitcoin Economics */}
          <div id="economics">
            <section aria-label="Bitcoin Economics">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinEconomicsSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="purple" />

          {/* Bitcoin Benefits */}
          <div id="benefits">
            <section aria-label="Bitcoin Benefits">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinBenefitsSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="yellow" />

          {/* Global Adoption */}
          <div id="adoption">
            <section aria-label="Global Bitcoin Adoption">
              <Suspense fallback={<SectionLoader />}>
                <GlobalBitcoinAdoptionSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="cyan" />

          {/* Future Outlook */}
          <div id="future">
            <section aria-label="Bitcoin Future">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinFutureSection />
              </Suspense>
            </section>
          </div>

          <SectionDivider color="purple" />

          {/* CTA Section */}
          <div id="cta">
            <section aria-label="Start Your Bitcoin Journey">
              <Suspense fallback={<SectionLoader />}>
                <BitcoinCTASection />
              </Suspense>
            </section>
          </div>
        </main>

        <LandingFooter />
      </div>

      {/* Page Translation Button */}
      <PageTranslationButton pageId="bitcoin-101" />

      {/* SEO content */}
      <div className="sr-only">
        <h2>Comprehensive Bitcoin Education</h2>
        <p>
          This guide covers everything you need to know about Bitcoin: its creation by Satoshi Nakamoto,
          how blockchain technology works, the mining process, datacenter cooling technologies (air-cooled, 
          hydro cooling, immersion cooling), mining pools, economic principles like halving and scarcity,
          benefits as a store of value, global adoption trends, and future developments like the Lightning Network.
        </p>
      </div>
    </div>
  );
};

export default BitcoinEducation;
