import { useEffect, useState, useRef } from 'react';
import { Building2, Zap, ArrowRight, Shield, BarChart3, Users, Globe } from 'lucide-react';
import aesoMeritOrderImage from '@/assets/aeso-merit-order.jpg';

const responsibilities = [
  { 
    icon: BarChart3, 
    title: 'Merit Order Dispatch', 
    description: 'Stacks generators by bid price, dispatching lowest-cost first to meet demand' 
  },
  { 
    icon: Shield, 
    title: 'Grid Reliability', 
    description: 'Maintains 99.99%+ transmission reliability across 25,000+ km of lines' 
  },
  { 
    icon: Users, 
    title: 'Market Rules', 
    description: 'Enforces fair competition among 300+ market participants' 
  },
  { 
    icon: Zap, 
    title: 'Real-Time Balancing', 
    description: 'Matches supply to demand every second, 24/7/365' 
  },
];

const isoComparison = [
  { name: 'AESO (Alberta)', type: 'Energy-Only', pricing: 'Single Pool Price', marketSize: '~16 GW' },
  { name: 'ERCOT (Texas)', type: 'Energy-Only', pricing: 'Nodal LMP', marketSize: '~85 GW' },
  { name: 'MISO (Midwest)', type: 'Capacity + Energy', pricing: 'Nodal LMP', marketSize: '~200 GW' },
  { name: 'PJM (Mid-Atlantic)', type: 'Capacity + Energy', pricing: 'Nodal LMP', marketSize: '~180 GW' },
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
    <section ref={sectionRef} className="py-16 md:py-20 bg-watt-light">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-navy/5 border border-watt-navy/10 mb-4">
            <Building2 className="w-4 h-4 text-watt-navy" />
            <span className="text-sm font-medium text-watt-navy">Understanding the Market</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
            What is <span className="text-watt-bitcoin">AESO</span>?
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
            The Alberta Electric System Operator is an Independent System Operator (ISO) that manages 
            Alberta's electricity grid and wholesale market — one of North America's most unique power markets.
          </p>
        </div>

        {/* Power Flow Diagram */}
        <div className={`mb-16 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold text-watt-navy text-center mb-8">How Power Flows in Alberta</h3>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {['Generators', 'Transmission (AESO)', 'Distribution (Utilities)', 'End Users'].map((step, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-4">
                <div className="px-4 py-3 md:px-6 md:py-4 rounded-xl bg-white border border-watt-navy/10 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-semibold text-watt-navy text-sm md:text-base">{step}</p>
                </div>
                {i < 3 && <ArrowRight className="w-5 h-5 text-watt-bitcoin hidden md:block" />}
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
                <p>
                  <span className="font-semibold text-watt-navy">1996:</span> Alberta becomes the first jurisdiction in Canada to deregulate its electricity market.
                </p>
                <p>
                  <span className="font-semibold text-watt-navy">2003:</span> AESO formally established as the independent system operator.
                </p>
                <p>
                  <span className="font-semibold text-watt-navy">Today:</span> Over 300 market participants trade ~16,000 MW of power daily in North America's only fully deregulated wholesale market.
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
                  <div>
                    <h4 className="font-semibold text-watt-navy mb-1">{item.title}</h4>
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
                  <tr key={i} className={`border-t border-watt-navy/10 ${i === 0 ? 'bg-watt-bitcoin/5' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-watt-navy">
                      {i === 0 && <span className="inline-block w-2 h-2 bg-watt-bitcoin rounded-full mr-2" />}
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
            💡 AESO's single pool price creates transparency — every generator receives the same market-clearing price.
          </p>
        </div>
      </div>
    </section>
  );
};
