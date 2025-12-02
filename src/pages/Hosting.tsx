import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { HostingPackagesSection } from '@/components/hosting/HostingPackagesSection';
import { WhyHostSection } from '@/components/hosting/WhyHostSection';
import { FlagshipFacilitySection } from '@/components/hosting/FlagshipFacilitySection';
import { HostingCTASection } from '@/components/hosting/HostingCTASection';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, Zap, Shield } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const Hosting = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy/90 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-watt-bitcoin/10 border border-watt-bitcoin/20 rounded-full mb-6">
                <Bitcoin className="w-4 h-4 text-watt-bitcoin" />
                <span className="text-sm font-medium text-watt-bitcoin">Professional Mining Hosting</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Bitcoin Mining Hosting
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
                Professional colocation services starting at <span className="text-watt-bitcoin font-bold">7.1¢/kWh</span>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
                <Shield className="w-8 h-8 text-watt-success mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter end={95} suffix="%" />
                </div>
                <div className="text-sm text-white/70">Guaranteed Uptime</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
                <Zap className="w-8 h-8 text-watt-bitcoin mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter end={135} suffix="MW" />
                </div>
                <div className="text-sm text-white/70">Total Capacity</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
                <Bitcoin className="w-8 h-8 text-watt-trust mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-white/70">Fully Owned Site</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider color="blue" />
      
      <HostingPackagesSection />
      
      <SectionDivider color="green" />
      
      <WhyHostSection />
      
      <SectionDivider color="yellow" />
      
      <FlagshipFacilitySection />
      
      <SectionDivider color="blue" />
      
      <HostingCTASection />
      
      <LandingFooter />
    </div>
  );
};

export default Hosting;
