import React, { useState } from 'react';
import { Globe, Zap, MapPin, FileText, ArrowRight, CheckCircle, Building2, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const EnergySourceSection = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'ppa' | 'site'>('grid');

  const gridConnectionSteps = [
    {
      step: 1,
      title: 'Transmission System',
      voltage: '138kV - 500kV',
      description: 'High-voltage bulk power transmission from generation sources to load centers. Mining facilities connect at 69kV-138kV substations.',
      icon: Zap,
      color: 'from-red-500 to-orange-500',
    },
    {
      step: 2,
      title: 'Transmission Substation',
      voltage: '138kV → 69kV/25kV',
      description: 'Step-down transformers reduce voltage for regional distribution. Large mining facilities may connect directly here.',
      icon: Building2,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      step: 3,
      title: 'Distribution System',
      voltage: '25kV - 15kV',
      description: 'Medium voltage feeders to commercial/industrial customers. Smaller facilities connect via distribution.',
      icon: MapPin,
      color: 'from-yellow-500 to-green-500',
    },
    {
      step: 4,
      title: 'Service Entrance',
      voltage: '600V (Canada) / 480V (US)',
      description: 'Customer-owned substation with metering, protection, and step-down to facility voltage.',
      icon: Globe,
      color: 'from-green-500 to-cyan-500',
    },
  ];

  const powerPurchaseTypes = [
    {
      type: 'Self-Retailer (Wholesale)',
      description: 'Direct pool access with no retailer markup. Purchase power at real-time market prices. Best for large loads with risk tolerance.',
      pros: ['Lowest average cost', 'Access to negative prices', 'Full market exposure'],
      cons: ['Price volatility risk', 'Requires 24/7 monitoring', 'Minimum load requirements'],
      typicalRate: '$40-80/MWh average',
      minLoad: '5+ MW typically',
      savings: '15-30% vs retail',
    },
    {
      type: 'Fixed PPA (Power Purchase Agreement)',
      description: 'Long-term contract with fixed or indexed pricing. Price certainty for project financing. Common for new builds.',
      pros: ['Price certainty', 'Bankable for financing', 'Hedge against volatility'],
      cons: ['May miss low prices', 'Contract obligations', 'Termination penalties'],
      typicalRate: '$50-70/MWh fixed',
      minLoad: '10+ MW typical',
      savings: '5-15% vs retail',
    },
    {
      type: 'Behind-the-Meter (BTM)',
      description: 'Co-located with generation source. No transmission/distribution charges. Stranded gas, hydro, solar, or curtailed wind.',
      pros: ['Lowest possible cost', 'No grid fees', 'Excess energy monetized'],
      cons: ['Site-specific', 'Generation variability', 'Remote locations often'],
      typicalRate: '$20-50/MWh',
      minLoad: 'Varies by source',
      savings: '40-60% vs retail',
    },
    {
      type: 'Regulated Retail',
      description: 'Standard utility rate. Simplest to implement. Higher cost but predictable. Suitable for smaller operations.',
      pros: ['Simple billing', 'Predictable', 'No minimum load'],
      cons: ['Highest cost', 'No optimization', 'Rate increases'],
      typicalRate: '$80-120/MWh',
      minLoad: 'Any size',
      savings: 'Baseline',
    },
  ];

  const siteSelectionCriteria = [
    {
      category: 'Power Infrastructure',
      weight: 35,
      factors: [
        { name: 'Substation proximity', detail: '<5 km to HV substation ideal' },
        { name: 'Available capacity', detail: 'MW headroom on existing circuits' },
        { name: 'Interconnection cost', detail: '$200-500/kW typical' },
        { name: 'Grid stability', detail: 'Frequency deviation history' },
      ],
    },
    {
      category: 'Energy Cost',
      weight: 30,
      factors: [
        { name: 'Wholesale market access', detail: 'Self-retailer eligibility' },
        { name: 'Average pool price', detail: 'Historical price analysis' },
        { name: 'Transmission charges', detail: '$10-15/MWh in AESO' },
        { name: 'Peak demand charges', detail: 'Can add $5-20/MWh' },
      ],
    },
    {
      category: 'Climate & Cooling',
      weight: 20,
      factors: [
        { name: 'Average temperature', detail: '<15°C avg = free cooling' },
        { name: 'Humidity levels', detail: '<60% RH optimal for evap' },
        { name: 'Heating degree days', detail: 'Cold climate advantage' },
        { name: 'Extreme weather risk', detail: 'Storms, floods, etc.' },
      ],
    },
    {
      category: 'Land & Logistics',
      weight: 15,
      factors: [
        { name: 'Land cost', detail: '$5-50K/acre varies widely' },
        { name: 'Zoning/permits', detail: 'Industrial or agricultural' },
        { name: 'Road access', detail: 'Heavy equipment delivery' },
        { name: 'Internet connectivity', detail: 'Fiber or fixed wireless' },
      ],
    },
  ];

  const interconnectionTimeline = [
    { phase: 'Application', duration: '1-2 months', description: 'Submit interconnection request, initial studies' },
    { phase: 'System Impact Study', duration: '2-4 months', description: 'Grid operator analyzes network effects' },
    { phase: 'Facilities Study', duration: '2-3 months', description: 'Detailed engineering and cost estimate' },
    { phase: 'Agreement & Permits', duration: '1-2 months', description: 'Sign agreements, obtain permits' },
    { phase: 'Construction', duration: '6-18 months', description: 'Build substation, run feeders' },
    { phase: 'Testing & Commissioning', duration: '1-2 months', description: 'Protection testing, energization' },
  ];

  return (
    <section id="energy-source" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 1 • Grid Connection
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Energy Source to Facility
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              How Bitcoin mining facilities connect to the electrical grid and purchase power at wholesale rates
            </p>
          </div>
        </ScrollReveal>

        {/* Tab Navigation */}
        <ScrollReveal delay={0.05}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { id: 'grid', label: 'Grid Connection', icon: Zap },
              { id: 'ppa', label: 'Power Purchasing', icon: DollarSign },
              { id: 'site', label: 'Site Selection', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-watt-bitcoin text-white shadow-lg shadow-watt-bitcoin/30'
                    : 'bg-card border border-border text-muted-foreground hover:border-watt-bitcoin/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Grid Connection Tab */}
        {activeTab === 'grid' && (
          <>
            {/* Animated Power Flow Diagram */}
            <ScrollReveal delay={0.1}>
              <div className="relative mb-12">
                {/* Desktop Horizontal Flow */}
                <div className="hidden md:block">
                  <div className="relative py-8">
                    {/* Connection Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-cyan-500 rounded-full -translate-y-1/2 opacity-30" />
                    
                    {/* Animated Flow Particles */}
                    <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 overflow-hidden rounded-full">
                      <div className="h-full w-20 bg-gradient-to-r from-transparent via-white to-transparent animate-[flowAcross_2s_linear_infinite]" />
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-4 gap-4 relative z-10">
                      {gridConnectionSteps.map((step, i) => (
                        <div key={step.step} className="flex flex-col items-center text-center">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-lg`}>
                            <step.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="font-semibold text-foreground text-sm mb-1">{step.title}</div>
                          <div className="text-xs text-watt-bitcoin font-mono mb-2">{step.voltage}</div>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Vertical Flow */}
                <div className="md:hidden space-y-4">
                  {gridConnectionSteps.map((step, i) => (
                    <div key={step.step} className="relative">
                      <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground text-sm">{step.title}</div>
                          <div className="text-xs text-watt-bitcoin font-mono mb-1">{step.voltage}</div>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      {i < gridConnectionSteps.length - 1 && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Interconnection Timeline */}
            <ScrollReveal delay={0.2}>
              <div className="bg-card rounded-2xl border border-border p-6 mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-watt-bitcoin" />
                  Interconnection Timeline
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Typical timeline from application to energization: 12-30 months for large facilities
                </p>
                
                <div className="relative">
                  {/* Timeline bar */}
                  <div className="hidden md:block absolute top-6 left-0 right-0 h-1 bg-muted rounded-full" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {interconnectionTimeline.map((phase, i) => (
                      <div key={phase.phase} className="relative text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-watt-bitcoin/10 border-2 border-watt-bitcoin flex items-center justify-center font-bold text-watt-bitcoin">
                          {i + 1}
                        </div>
                        <div className="font-semibold text-foreground text-xs mb-1">{phase.phase}</div>
                        <div className="text-xs text-watt-bitcoin font-medium mb-1">{phase.duration}</div>
                        <p className="text-[10px] text-muted-foreground">{phase.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </>
        )}

        {/* Power Purchasing Tab */}
        {activeTab === 'ppa' && (
          <ScrollReveal delay={0.1}>
            <div className="grid md:grid-cols-2 gap-4">
              {powerPurchaseTypes.map((ppa) => (
                <div key={ppa.type} className="bg-card rounded-2xl border border-border p-5 hover:border-watt-bitcoin/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-foreground">{ppa.type}</h3>
                    <span className="px-2 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded text-xs font-medium">
                      {ppa.typicalRate}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{ppa.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Advantages
                      </h4>
                      <ul className="space-y-1">
                        {ppa.pros.map((pro, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-red-500 mb-2">Considerations</h4>
                      <ul className="space-y-1">
                        {ppa.cons.map((con, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                    <span className="text-muted-foreground">Min Load: <span className="text-foreground font-medium">{ppa.minLoad}</span></span>
                    <span className={`font-medium ${ppa.savings === 'Baseline' ? 'text-muted-foreground' : 'text-green-600'}`}>
                      {ppa.savings !== 'Baseline' && <TrendingUp className="w-3 h-3 inline mr-1" />}
                      {ppa.savings}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Site Selection Tab */}
        {activeTab === 'site' && (
          <ScrollReveal delay={0.1}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {siteSelectionCriteria.map((category) => (
                <div key={category.category} className="bg-card rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground text-sm">{category.category}</h3>
                    <span className="px-2 py-1 bg-watt-bitcoin text-white rounded-full text-xs font-bold">
                      {category.weight}%
                    </span>
                  </div>
                  
                  {/* Weight bar */}
                  <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
                    <div 
                      className="h-full bg-watt-bitcoin rounded-full transition-all duration-500"
                      style={{ width: `${category.weight}%` }}
                    />
                  </div>
                  
                  <ul className="space-y-3">
                    {category.factors.map((factor, i) => (
                      <li key={i} className="text-sm">
                        <div className="font-medium text-foreground">{factor.name}</div>
                        <div className="text-xs text-muted-foreground">{factor.detail}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {/* Key Metrics Banner */}
            <div className="mt-8 p-5 bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl text-white">
              <h3 className="text-lg font-semibold mb-4">WattByte Site Selection Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <div className="text-xs text-white/70">Sites Evaluated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    $<AnimatedCounter end={40} suffix="/MWh" />
                  </div>
                  <div className="text-xs text-white/70">Target All-In Cost</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter end={5} suffix=" km" />
                  </div>
                  <div className="text-xs text-white/70">Max Substation Distance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter end={8000} suffix="+" />
                  </div>
                  <div className="text-xs text-white/70">Free Cooling Hours/Year</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Animation keyframes */}
        <style>{`
          @keyframes flowAcross {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
      </div>
    </section>
  );
};

export default EnergySourceSection;
