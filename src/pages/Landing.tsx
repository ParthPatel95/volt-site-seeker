import React, { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedSignUpForm } from '@/components/EnhancedSignUpForm';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { LandingFooter } from '@/components/landing/LandingFooter';

console.log('🔥 LANDING.TSX MODULE LOADED');

// Simple hero section without ScrollReveal for testing
const SimpleHeroSection = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-watt-navy text-white">
    <div className="text-center p-8">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">WattByte Infrastructure</h1>
      <p className="text-xl text-white/80">Testing - If you see this, React is working!</p>
    </div>
  </div>
);

const Landing: React.FC = () => {
  console.log('🔥 LANDING COMPONENT RENDERING');
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  return (
    <div className="min-h-screen bg-white text-watt-navy relative overflow-hidden">
      <LandingBackground />
      <LandingNavigation />
      
      <div className="pt-14 sm:pt-16 md:pt-20 relative z-10">
        <main>
          <SimpleHeroSection />
          
          <div className="py-20 text-center">
            <h2 className="text-3xl font-bold text-watt-navy mb-4">Landing Page Test</h2>
            <p className="text-watt-navy/70">If you can read this, the page is rendering correctly.</p>
            <p className="text-watt-navy/70 mt-2">The issue was likely in one of the lazy-loaded components.</p>
          </div>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
};

export default Landing;
