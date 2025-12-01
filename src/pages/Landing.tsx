
import React, { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedSignUpForm } from '@/components/EnhancedSignUpForm';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { OptimizedHeroSection } from '@/components/landing/OptimizedHeroSection';
import { LiveDataSection } from '@/components/landing/LiveDataSection';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';

// Lazy load sections for better performance
const ProblemSolutionSection = lazy(() => import('@/components/landing/ProblemSolutionSection').then(module => ({ default: module.ProblemSolutionSection })));
const InvestmentThesisSection = lazy(() => import('@/components/landing/InvestmentThesisSection').then(module => ({ default: module.InvestmentThesisSection })));
const VoltScoutSection = lazy(() => import('@/components/landing/VoltScoutSection').then(module => ({ default: module.VoltScoutSection })));

// New Alberta facility sections
const AlbertaFacilityShowcase = lazy(() => import('@/components/landing/AlbertaFacilityShowcase').then(module => ({ default: module.AlbertaFacilityShowcase })));
const InfrastructureHighlights = lazy(() => import('@/components/landing/InfrastructureHighlights').then(module => ({ default: module.InfrastructureHighlights })));
const AlbertaFacilityHub = lazy(() => import('@/components/landing/AlbertaFacilityHub').then(module => ({ default: module.AlbertaFacilityHub })));

const SectionLoader = () => (
  <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-watt-trust border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Landing: React.FC = () => {
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      {/* Smooth scroll functionality */}
      <SmoothScroll />
      
      {/* SEO content */}
      <header>
        <h1 className="sr-only">WattByte Infrastructure Fund - AI-Powered Energy Discovery Platform</h1>
        <p className="sr-only">
          WattByte is a leading infrastructure investment fund specializing in renewable energy and data center development. 
          Our AI-powered platform identifies power-rich land opportunities across North America for strategic investment.
        </p>
      </header>

      {/* Optimized background */}
      <LandingBackground />
      
      <LandingNavigation />
      
      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10 safe-area-pt">
        <main>
          <OptimizedHeroSection />
          
          <SectionDivider color="blue" />
          
          <section aria-label="Problem and Solution" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <ProblemSolutionSection />
            </Suspense>
          </section>
          
          <SectionDivider color="blue" />
          
          {/* Alberta Facility Hub - Operations, Technical, Location */}
          <section aria-label="Facility Overview Hub" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <AlbertaFacilityHub />
            </Suspense>
          </section>
          
          <SectionDivider color="green" />
          
          {/* Infrastructure Highlights - NEW */}
          <section aria-label="Infrastructure Highlights" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <InfrastructureHighlights />
            </Suspense>
          </section>
          
          <SectionDivider color="blue" />
          
          <LiveDataSection />
          
          <SectionDivider color="yellow" />
          
          <section aria-label="Investment Thesis" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <InvestmentThesisSection />
            </Suspense>
          </section>
          
          <SectionDivider color="green" />
          
          <section aria-label="VoltScout Platform" className="relative">
            <Suspense fallback={<SectionLoader />}>
              <VoltScoutSection />
            </Suspense>
          </section>
          
        </main>

        {/* Sign-Up Section */}
        {showSignUpForm && (
          <section className="relative z-20 py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6" aria-label="Investment Access Form">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200 shadow-institutional">
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-watt-navy">
                    Request <span className="text-watt-bitcoin">Investment Access</span>
                  </h2>
                  <p className="text-watt-navy/70 text-base sm:text-lg md:text-xl">
                    Join accredited investors backing the future of digital infrastructure
                  </p>
                </div>
                
                <EnhancedSignUpForm />
                
                <div className="text-center mt-4 sm:mt-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSignUpForm(false)}
                    className="text-watt-navy/60 hover:text-watt-navy hover:bg-watt-light transition-all duration-200 text-sm sm:text-base"
                  >
                    Close Form
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <LandingFooter />
      </div>

      {/* SEO content */}
      <div className="sr-only">
        <h2>About WattByte Infrastructure Fund</h2>
        <p>
          WattByte Infrastructure Fund is a premier investment firm focused on renewable energy infrastructure and data center development. 
          Our Fund I targets $25M with a 2.0-2.5x MOIC, specializing in power-rich land acquisition across North America for AI, HPC, 
          and cryptocurrency data centers. With 675MW+ of deal experience, we turn power into profit through intelligent infrastructure investment.
        </p>
        
        <h3>Our Investment Focus</h3>
        <ul>
          <li>Renewable energy infrastructure development</li>
          <li>Data center real estate acquisition and development</li>
          <li>Power infrastructure optimization</li>
          <li>AI and high-performance computing facilities</li>
          <li>Cryptocurrency mining infrastructure</li>
          <li>Smart grid and energy storage technologies</li>
        </ul>
        
        <h3>Geographic Coverage</h3>
        <p>
          WattByte operates across North America, identifying strategic opportunities in the United States and Canada 
          for power infrastructure and data center development.
        </p>
      </div>
    </div>
  );
};

export default Landing;
