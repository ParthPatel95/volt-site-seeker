import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { HostingPackagesSection } from '@/components/hosting/HostingPackagesSection';
import { WhyHostSection } from '@/components/hosting/WhyHostSection';
import { FlagshipFacilitySection } from '@/components/hosting/FlagshipFacilitySection';
import { HostingCTASection } from '@/components/hosting/HostingCTASection';
import { HowHostingWorksSection } from '@/components/hosting/HowHostingWorksSection';
import { HostingCalculatorWidget } from '@/components/hosting/HostingCalculatorWidget';
import { HostingFAQSection } from '@/components/hosting/HostingFAQSection';
import { LiveFacilityStats } from '@/components/hosting/LiveFacilityStats';
import { SocialProofSection } from '@/components/hosting/SocialProofSection';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, Zap, Shield, Sparkles } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const Hosting = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavigation />
      
      {/* Hero Section - Enhanced with particles and animations */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy/90 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            >
              <Bitcoin className="w-8 h-8 text-watt-bitcoin/20" />
            </div>
          ))}
        </div>

        {/* Glowing Orb Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-watt-bitcoin/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-watt-bitcoin/10 border border-watt-bitcoin/20 rounded-full mb-6 animate-pulse">
                <Sparkles className="w-4 h-4 text-watt-bitcoin" />
                <span className="text-sm font-medium text-watt-bitcoin">Professional Bitcoin Mining Hosting</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                <span className="block">Power Your Mining</span>
                <span className="block text-watt-bitcoin">With WattByte</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-4">
                Professional colocation services starting at <span className="text-watt-bitcoin font-bold">7.1¢/kWh</span>
              </p>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                World-class infrastructure, competitive rates, and 24/7 expert support for your mining operations
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-watt-success/10">
                <Shield className="w-10 h-10 text-watt-success mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter end={95} suffix="%" />
                </div>
                <div className="text-sm text-white/70">Guaranteed Uptime</div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-watt-bitcoin/10">
                <Zap className="w-10 h-10 text-watt-bitcoin mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter end={135} suffix="MW" />
                </div>
                <div className="text-sm text-white/70">Total Capacity</div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-watt-trust/10">
                <Bitcoin className="w-10 h-10 text-watt-trust mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-white/70">Fully Owned Site</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider color="blue" />
      
      {/* How It Works - New Section */}
      <HowHostingWorksSection />
      
      <SectionDivider color="green" />
      
      {/* Pricing Packages */}
      <HostingPackagesSection />
      
      <SectionDivider color="yellow" />
      
      {/* Interactive Calculator - New Section */}
      <HostingCalculatorWidget />
      
      <SectionDivider color="blue" />
      
      {/* Live Facility Stats - New Section */}
      <LiveFacilityStats />
      
      <SectionDivider color="green" />
      
      {/* Why Host With Us */}
      <WhyHostSection />
      
      <SectionDivider color="yellow" />
      
      {/* Flagship Facility */}
      <FlagshipFacilitySection />
      
      <SectionDivider color="blue" />
      
      {/* Social Proof / Testimonials - New Section */}
      <SocialProofSection />
      
      <SectionDivider color="green" />
      
      {/* FAQ - New Section */}
      <HostingFAQSection />
      
      <SectionDivider color="yellow" />
      
      {/* CTA */}
      <HostingCTASection />
      
      <LandingFooter />
    </div>
  );
};

export default Hosting;
