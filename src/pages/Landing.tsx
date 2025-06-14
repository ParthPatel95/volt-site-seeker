import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedSignUpForm } from '@/components/EnhancedSignUpForm';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { MarketOpportunitySection } from '@/components/landing/MarketOpportunitySection';
import { FundOverviewSection } from '@/components/landing/FundOverviewSection';
import { LeadershipTeamSection } from '@/components/landing/LeadershipTeamSection';
import { FundGrowthPlanSection } from '@/components/landing/FundGrowthPlanSection';
import { InvestmentThesisSection } from '@/components/landing/InvestmentThesisSection';
import { VoltScoutSection } from '@/components/landing/VoltScoutSection';
import { LPPortalSection } from '@/components/landing/LPPortalSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing = () => {
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* SEO-friendly structured content with semantic HTML */}
      <header>
        <h1 className="sr-only">WattByte Infrastructure Fund - AI-Powered Energy Discovery Platform</h1>
        <p className="sr-only">
          WattByte is a leading infrastructure investment fund specializing in renewable energy and data center development. 
          Our AI-powered platform identifies power-rich land opportunities across North America for strategic investment.
        </p>
      </header>

      {/* Enhanced background */}
      <div className="absolute inset-0">
        {/* Tech grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        {/* Animated gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 via-electric-yellow/5 to-neon-green/10"></div>
        
        {/* Dynamic background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-electric-blue/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-electric-yellow/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>
      
      <LandingNavigation />
      
      {/* Add top padding to account for fixed navigation */}
      <div className="pt-16 sm:pt-20">
        <main>
          <HeroSection />
          
          <section aria-label="Problem and Solution">
            <ProblemSolutionSection />
          </section>
          
          <section aria-label="Market Opportunity">
            <MarketOpportunitySection />
          </section>
          
          <section aria-label="Fund Overview">
            <FundOverviewSection />
          </section>
          
          <section aria-label="Leadership Team">
            <LeadershipTeamSection />
          </section>
          
          <section aria-label="Fund Growth Plan">
            <FundGrowthPlanSection />
          </section>
          
          <section aria-label="Investment Thesis">
            <InvestmentThesisSection />
          </section>
          
          <section aria-label="VoltScout Platform">
            <VoltScoutSection />
          </section>
          
          <section aria-label="LP Portal">
            <LPPortalSection />
          </section>
        </main>

        {/* Enhanced Sign-Up Section */}
        {showSignUpForm && (
          <section className="relative z-10 py-16 px-6" aria-label="Investment Access Form">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm rounded-3xl p-10 border border-slate-700/50 shadow-2xl">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold mb-4 text-white">
                    Get <span className="bg-gradient-to-r from-electric-blue to-neon-green bg-clip-text text-transparent">Access</span>
                  </h2>
                  <p className="text-slate-200 text-xl">
                    Join accredited investors backing the future of digital infrastructure
                  </p>
                </div>
                
                <EnhancedSignUpForm />
                
                <div className="text-center mt-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSignUpForm(false)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800/50"
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

      {/* Hidden SEO content for better indexing */}
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
