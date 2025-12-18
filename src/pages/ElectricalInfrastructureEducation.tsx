import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useEffect, lazy, Suspense } from "react";
import { Zap, Loader2 } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";

// Lazy load sections for performance
const ElectricalFundamentalsSection = lazy(() => import("@/components/electrical-education/ElectricalFundamentalsSection"));
const UtilityGridConnectionSection = lazy(() => import("@/components/electrical-education/UtilityGridConnectionSection"));
const HighVoltageTransmissionSection = lazy(() => import("@/components/electrical-education/HighVoltageTransmissionSection"));
const PowerTransformersSection = lazy(() => import("@/components/electrical-education/PowerTransformersSection"));
const MediumVoltageSwitchgearSection = lazy(() => import("@/components/electrical-education/MediumVoltageSwitchgearSection"));
const LowVoltageDistributionSection = lazy(() => import("@/components/electrical-education/LowVoltageDistributionSection"));
const PowerDistributionUnitsSection = lazy(() => import("@/components/electrical-education/PowerDistributionUnitsSection"));
const MiningEquipmentPowerSection = lazy(() => import("@/components/electrical-education/MiningEquipmentPowerSection"));
const PowerQualitySection = lazy(() => import("@/components/electrical-education/PowerQualitySection"));
const GroundingBondingSection = lazy(() => import("@/components/electrical-education/GroundingBondingSection"));
const ArcFlashSafetySection = lazy(() => import("@/components/electrical-education/ArcFlashSafetySection"));
const RedundancyArchitecturesSection = lazy(() => import("@/components/electrical-education/RedundancyArchitecturesSection"));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-24">
    <Loader2 className="w-8 h-8 animate-spin text-watt-bitcoin" />
  </div>
);

const ElectricalInfrastructureEducation = () => {
  useEffect(() => {
    document.title = "Electrical Infrastructure 101 | WattByte Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-watt-navy to-watt-navy/95 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Animated Circuit Lines */}
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute w-full h-full opacity-20" viewBox="0 0 1200 600">
              <path
                d="M0,300 L200,300 L250,250 L400,250 L450,300 L600,300 L650,350 L800,350 L850,300 L1000,300 L1050,250 L1200,250"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-watt-bitcoin animate-pulse"
              />
              <path
                d="M0,400 L150,400 L200,350 L350,350 L400,400 L550,400 L600,450 L750,450 L800,400 L950,400 L1000,350 L1200,350"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-watt-success animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/30 text-watt-bitcoin mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">WattByte Academy</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Electrical Infrastructure
                <span className="block text-watt-bitcoin">101</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
                A comprehensive deep-dive into every aspect of Bitcoin datacenter electrical systems. 
                From grid connection to miner power supplies, learn the engineering behind 
                industrial-scale mining operations.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10">
                  <span className="w-2 h-2 rounded-full bg-watt-bitcoin" />
                  <span>12 Detailed Sections</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10">
                  <span className="w-2 h-2 rounded-full bg-watt-success" />
                  <span>Interactive Calculators</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10">
                  <span className="w-2 h-2 rounded-full bg-watt-coinbase" />
                  <span>Engineer-Grade Content</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* All Sections */}
        <Suspense fallback={<SectionLoader />}>
          <ElectricalFundamentalsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <UtilityGridConnectionSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <HighVoltageTransmissionSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PowerTransformersSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <MediumVoltageSwitchgearSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <LowVoltageDistributionSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PowerDistributionUnitsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <MiningEquipmentPowerSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PowerQualitySection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <GroundingBondingSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ArcFlashSafetySection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <RedundancyArchitecturesSection />
        </Suspense>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default ElectricalInfrastructureEducation;
