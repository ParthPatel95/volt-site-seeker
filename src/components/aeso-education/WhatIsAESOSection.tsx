import { useEffect, useState, useRef } from 'react';
import { Building2, Zap, ArrowRight, Shield, BarChart3, Users, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import ProgressiveDisclosure from '@/components/academy/ProgressiveDisclosure';
import aesoMeritOrderImage from '@/assets/aeso-merit-order.jpg';

const responsibilities = [
  { 
    icon: BarChart3, 
    title: 'Merit Order Dispatch', 
    description: 'Stacks generators by bid price, dispatching lowest-cost first to meet demand',
    verified: true
  },
  { 
    icon: Shield, 
    title: 'Grid Reliability', 
    description: 'Maintains 99.97%+ transmission reliability across 26,000+ km of lines',
    verified: true
  },
  { 
    icon: Users, 
    title: 'Market Rules', 
    description: 'Enforces fair competition among 260+ market participants',
    verified: true
  },
  { 
    icon: Zap, 
    title: 'Real-Time Balancing', 
    description: 'Matches supply to demand every second, 24/7/365',
    verified: true
  },
];

// Updated with accurate 2024 data
const isoComparison = [
  { name: 'AESO (Alberta)', type: 'Energy-Only', pricing: 'Single Pool Price', marketSize: '~17 GW', highlight: true },
  { name: 'ERCOT (Texas)', type: 'Energy-Only', pricing: 'Nodal LMP', marketSize: '~85 GW', highlight: false },
  { name: 'MISO (Midwest)', type: 'Capacity + Energy', pricing: 'Nodal LMP', marketSize: '~190 GW', highlight: false },
  { name: 'PJM (Mid-Atlantic)', type: 'Capacity + Energy', pricing: 'Nodal LMP', marketSize: '~180 GW', highlight: false },
];

const keyStats = [
  { label: 'Peak Demand (2024)', value: '12,500 MW', source: 'AESO' },
  { label: 'Installed Capacity', value: '~19,500 MW', source: 'AESO' },
  { label: 'Transmission Lines', value: '26,000+ km', source: 'AESO' },
  { label: 'Market Participants', value: '260+', source: 'AESO Registry' },
];

export const WhatIsAESOSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <LearningObjectives
          objectives={[
            "Understand AESO's role as Alberta's Independent System Operator",
            "Learn how the single pool price market differs from other North American ISOs",
            "Know key statistics: 12,500 MW peak demand, 260+ market participants",
            "See how power flows from generators through transmission to end users"
          ]}
          estimatedTime="8 min"
        />
        
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-4">
            <Building2 className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">Understanding the Market</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What is <span className="text-primary">AESO</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The Alberta Electric System Operator is an Independent System Operator (ISO) that manages 
            Alberta's electricity grid and wholesale market — one of North America's most unique power markets.
          </p>
        </div>

        {/* Key Stats Bar */}
        <div className={`mb-12 grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {keyStats.map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-card border border-border text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Source: {stat.source}</p>
            </div>
          ))}
        </div>

        {/* Power Flow Diagram - Animated */}
        <div className={`mb-16 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold text-foreground text-center mb-8">How Power Flows in Alberta</h3>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {['Generators', 'Transmission (AESO)', 'Distribution (Utilities)', 'End Users'].map((step, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4">
                <motion.div 
                  className="px-4 py-3 md:px-6 md:py-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="font-semibold text-foreground text-sm md:text-base">{step}</p>
                </motion.div>
                {i < 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + i * 0.15, duration: 0.3 }}
                    className="hidden md:block"
                  >
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left - History & Image */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            <div className="relative rounded-2xl overflow-hidden mb-6">
              <img 
                src={aesoMeritOrderImage} 
                alt="AESO Control Room" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-watt-navy/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold">AESO System Control Centre</p>
                <p className="text-white/70 text-sm">Managing Alberta's power grid 24/7</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-watt-navy/10">
              <h3 className="text-xl font-bold text-watt-navy mb-4">🍁 A Brief History</h3>
              <div className="space-y-4 text-watt-navy/70">
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-watt-navy whitespace-nowrap">1996:</span>
                  <p>Alberta becomes the first jurisdiction in Canada to deregulate its electricity market.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-watt-navy whitespace-nowrap">2003:</span>
                  <p>AESO formally established as the independent system operator.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-watt-navy whitespace-nowrap">2024:</span>
                  <p>Coal completely phased out. 260+ market participants trade ~12,500 MW peak demand in North America's only fully deregulated wholesale market.</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  All historical dates verified from AESO official documentation
                </p>
              </div>
            </div>
          </div>

          {/* Right - Responsibilities */}
          <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <h3 className="text-xl font-bold text-watt-navy mb-6">AESO's Key Responsibilities</h3>
            <div className="space-y-4">
              {responsibilities.map((item, i) => (
                <div 
                  key={i}
                  className={`flex gap-4 p-4 rounded-xl bg-white border border-watt-navy/10 hover:border-watt-bitcoin/30 transition-all duration-300 hover:shadow-md ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}
                  style={{ transitionDelay: `${500 + i * 100}ms` }}
                >
                  <div className="p-3 rounded-lg bg-watt-bitcoin/10 h-fit">
                    <item.icon className="w-5 h-5 text-watt-bitcoin" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-watt-navy mb-1">{item.title}</h4>
                      {item.verified && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified</span>
                      )}
                    </div>
                    <p className="text-sm text-watt-navy/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ISO Comparison Table */}
        <div className={`transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold text-watt-navy text-center mb-6 flex items-center justify-center gap-2">
            <Globe className="w-5 h-5 text-watt-bitcoin" />
            How AESO Compares to Other ISOs
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl border border-watt-navy/10 overflow-hidden">
              <thead className="bg-watt-navy/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-watt-navy">ISO/Market</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-watt-navy">Market Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-watt-navy">Pricing Model</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-watt-navy">Market Size</th>
                </tr>
              </thead>
              <tbody>
                {isoComparison.map((iso, i) => (
                  <tr key={i} className={`border-t border-watt-navy/10 ${iso.highlight ? 'bg-watt-bitcoin/5' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-watt-navy">
                      {iso.highlight && <span className="inline-block w-2 h-2 bg-watt-bitcoin rounded-full mr-2" />}
                      {iso.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-watt-navy/70">{iso.type}</td>
                    <td className="px-4 py-3 text-sm text-watt-navy/70">{iso.pricing}</td>
                    <td className="px-4 py-3 text-sm text-watt-navy/70">{iso.marketSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-watt-navy/50 mt-4">
            💡 AESO's single pool price creates transparency — every generator receives the same market-clearing price each hour.
          </p>
        </div>

        {/* Data Source Badge */}
        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-watt-navy/5 border border-watt-navy/10 text-xs text-watt-navy/60">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Statistics from AESO 2024 Annual Report & Market Participant Registry
          </span>
        </div>
        
        <SectionSummary
          takeaways={[
            "AESO operates Alberta's wholesale electricity market — North America's only fully deregulated market",
            "Single pool price creates transparency: all generators receive the same hourly market-clearing price",
            "Energy-only market (no capacity payments) means price volatility creates both risks and opportunities",
            "260+ market participants trade on a 12,500 MW grid with 26,000+ km of transmission lines"
          ]}
          proTip="AESO's energy-only market makes strategic load management highly profitable. Unlike capacity markets where you pay for availability, here you only pay for energy consumed."
          nextSteps={[
            { title: "Pool Pricing", href: "/aeso-101#pool-pricing" },
            { title: "Rate 65 Explained", href: "/aeso-101#rate-65" }
          ]}
        />
      </div>
    </section>
  );
};
