
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedSignUpForm } from '@/components/EnhancedSignUpForm';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { MarketOpportunitySection } from '@/components/landing/MarketOpportunitySection';
import { FundOverviewSection } from '@/components/landing/FundOverviewSection';
import { InvestmentThesisSection } from '@/components/landing/InvestmentThesisSection';
import { VoltScoutSection } from '@/components/landing/VoltScoutSection';
import { LPPortalSection } from '@/components/landing/LPPortalSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing = () => {
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', { email, message });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 via-electric-yellow/5 to-neon-green/10"></div>
      
      <LandingNavigation />
      <HeroSection />
      <ProblemSolutionSection />
      <MarketOpportunitySection />
      <FundOverviewSection />
      <InvestmentThesisSection />
      <VoltScoutSection />
      <LPPortalSection />

      {/* Enhanced Sign-Up Section */}
      {showSignUpForm && (
        <section className="relative z-10 py-12 px-6 bg-slate-900/80">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 text-white">
                Get Access
              </h2>
              <p className="text-slate-200 text-lg">
                Join accredited investors backing the future of digital infrastructure
              </p>
            </div>
            
            <EnhancedSignUpForm />
            
            <div className="text-center mt-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowSignUpForm(false)}
                className="text-slate-400 hover:text-white"
              >
                Close Form
              </Button>
            </div>
          </div>
        </section>
      )}

      <LandingFooter />
    </div>
  );
};

export default Landing;
