
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

      {/* Enhanced dynamic background with animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'float 20s ease-in-out infinite alternate'
          }}
        ></div>
        
        {/* Multiple animated gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 via-transparent to-neon-green/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-electric-yellow/10 via-transparent to-purple-500/10 animate-pulse delay-1000"></div>
        
        {/* Floating orbs with different sizes and animations */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-float delay-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-green/15 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-electric-yellow/10 rounded-full blur-3xl animate-float delay-500"></div>
        <div className="absolute bottom-1/3 left-1/5 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float delay-1500"></div>
        <div className="absolute top-1/5 right-1/5 w-56 h-56 bg-cyan-400/10 rounded-full blur-3xl animate-float delay-2000"></div>
        
        {/* Subtle particle effect using CSS */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <LandingNavigation />
      
      {/* Add top padding to account for fixed navigation */}
      <div className="pt-16 sm:pt-20 relative z-10">
        <main>
          <HeroSection />
          
          {/* Enhanced section dividers with animated elements */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-blue/30 to-transparent h-px"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent h-px animate-pulse"></div>
          </div>
          
          <section aria-label="Problem and Solution" className="relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-electric-blue/5 rounded-full blur-2xl animate-pulse"></div>
            <ProblemSolutionSection />
          </section>
          
          <div className="relative my-16">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/30 to-transparent h-px"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent h-px animate-pulse delay-500"></div>
          </div>
          
          <section aria-label="Market Opportunity" className="relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-neon-green/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <MarketOpportunitySection />
          </section>
          
          <div className="relative my-16">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-yellow/30 to-transparent h-px"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent h-px animate-pulse delay-1000"></div>
          </div>
          
          <section aria-label="Fund Overview" className="relative">
            <div className="absolute top-0 left-1/4 w-36 h-36 bg-electric-yellow/5 rounded-full blur-2xl animate-pulse delay-500"></div>
            <FundOverviewSection />
          </section>
          
          <div className="relative my-16">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent h-px"></div>
          </div>
          
          <section aria-label="Leadership Team" className="relative">
            <div className="absolute top-0 right-1/3 w-44 h-44 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-1500"></div>
            <LeadershipTeamSection />
          </section>
          
          <div className="relative my-16">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent h-px"></div>
          </div>
          
          <section aria-label="Fund Growth Plan" className="relative">
            <FundGrowthPlanSection />
          </section>
          
          <div className="relative my-16">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-blue/30 to-transparent h-px"></div>
          </div>
          
          <section aria-label="Investment Thesis" className="relative">
            <div className="absolute top-0 left-1/2 w-52 h-52 bg-electric-blue/5 rounded-full blur-2xl animate-pulse"></div>
            <InvestmentThesisSection />
          </section>
          
          <div className="relative my-16">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/30 to-transparent h-px"></div>
          </div>
          
          <section aria-label="VoltScout Platform" className="relative">
            <div className="absolute top-0 right-1/4 w-48 h-48 bg-neon-green/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
            <VoltScoutSection />
          </section>
          
          <div className="relative my-16">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-yellow/30 to-transparent h-px"></div>
          </div>
          
          <section aria-label="LP Portal" className="relative">
            <LPPortalSection />
          </section>
        </main>

        {/* Enhanced Sign-Up Section with improved visual appeal */}
        {showSignUpForm && (
          <section className="relative z-20 py-16 px-6" aria-label="Investment Access Form">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Enhanced background with multiple layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-neon-green/5 rounded-3xl"></div>
                <div className="absolute inset-0 border border-slate-700/50 rounded-3xl shadow-2xl shadow-electric-blue/10"></div>
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-electric-blue/20 via-neon-green/20 to-electric-yellow/20 p-[1px]">
                  <div className="h-full w-full rounded-3xl bg-slate-900/95"></div>
                </div>
                
                <div className="relative p-10">
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold mb-4 text-white">
                      Get <span className="bg-gradient-to-r from-electric-blue to-neon-green bg-clip-text text-transparent">Access</span>
                    </h2>
                    <p className="text-slate-200 text-xl">
                      Join accredited investors backing the future of digital infrastructure
                    </p>
                    
                    {/* Animated accent line */}
                    <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-electric-blue via-neon-green to-electric-yellow rounded-full animate-pulse"></div>
                  </div>
                  
                  <EnhancedSignUpForm />
                  
                  <div className="text-center mt-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowSignUpForm(false)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
                    >
                      Close Form
                    </Button>
                  </div>
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

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float.delay-500 {
          animation-delay: 0.5s;
        }
        
        .animate-float.delay-1000 {
          animation-delay: 1s;
        }
        
        .animate-float.delay-1500 {
          animation-delay: 1.5s;
        }
        
        .animate-float.delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Landing;
