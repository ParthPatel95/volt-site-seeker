import React, { useState } from 'react';
import { Zap, Building2, Gauge, Server, Thermometer, Wind, ArrowRight, ChevronDown, Calculator, AlertTriangle } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import substationImage from '@/assets/datacenter-substation.jpg';

const PowerJourneySection = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeRedundancy, setActiveRedundancy] = useState('n1');
  const [showCalculator, setShowCalculator] = useState(false);

  // Engineering-accurate voltage step-down chain
  const powerSteps = [
    {
      id: 1,
      icon: Building2,
      title: 'Transmission',
      voltage: '138kV',
      color: 'from-red-600 to-red-500',
      description: 'High-voltage transmission lines from AESO grid deliver power to facility substation via 138kV or 69kV feeders.',
      details: [
        'Primary feed: 138kV 3-phase',
        'Typical capacity: 50-200 MVA',
        'Protection: Relay coordination',
        'Metering: Revenue-grade CT/PTs'
      ],
      engineering: {
        spec: 'IEEE C57.12.00',
        current: '~420A at 138kV for 100MW',
        losses: '<0.5% transmission loss'
      }
    },
    {
      id: 2,
      icon: Zap,
      title: 'Primary Substation',
      voltage: '138kV → 25kV',
      color: 'from-orange-500 to-yellow-500',
      description: 'Main power transformer steps down voltage. Typical sizes: 25MVA, 50MVA, or 100MVA ONAN/ONAF rated.',
      details: [
        'Transformer: 100MVA ONAN/ONAF',
        'Impedance: 8-10% typical',
        'Cooling: Oil-filled with fans',
        'Protection: Differential + Buchholz'
      ],
      engineering: {
        spec: 'IEEE C57.12.90',
        efficiency: '99.5% at full load',
        lifespan: '30-40 years typical'
      }
    },
    {
      id: 3,
      icon: Gauge,
      title: 'Medium Voltage',
      voltage: '25kV → 600V',
      color: 'from-yellow-500 to-green-500',
      description: 'Unit substations with dry-type transformers distribute power to mining halls. Multiple units for redundancy.',
      details: [
        'Transformers: 2000-3000kVA each',
        'Output: 600V 3-phase (Canada)',
        'Type: Cast-resin dry-type',
        'Spacing: One per 2-3MW load'
      ],
      engineering: {
        spec: 'CSA C22.2 No. 66',
        impedance: '5.75% typical',
        cooling: 'AN (Air Natural) or AF'
      }
    },
    {
      id: 4,
      icon: Server,
      title: 'PDU Distribution',
      voltage: '600V → 240V',
      color: 'from-green-500 to-emerald-500',
      description: 'Power Distribution Units (PDUs) with step-down transformers feed individual miner rows at 240V single-phase.',
      details: [
        'PDU size: 225-400kVA typical',
        'Output: 240V 1-phase per circuit',
        'Breakers: 30A-50A per miner',
        'Monitoring: Per-circuit metering'
      ],
      engineering: {
        spec: 'UL 891 / CSA C22.2',
        circuits: '42-84 circuits per PDU',
        derating: '80% continuous load'
      }
    },
    {
      id: 5,
      icon: Thermometer,
      title: 'ASIC Load',
      voltage: '240V AC → 12V DC',
      color: 'from-watt-bitcoin to-orange-500',
      description: 'Each ASIC miner draws 3-5kW at 240V AC. Internal PSU converts to 12VDC for hash boards.',
      details: [
        'Power draw: 3,000-5,500W each',
        'PSU efficiency: 93-95% (Platinum)',
        'Power factor: 0.99 with PFC',
        'Heat output: ~3,400 BTU/hr per kW'
      ],
      engineering: {
        heatPerMiner: '11,000-18,700 BTU/hr',
        cfmPerMiner: '200-350 CFM required',
        ambientMax: '40°C (104°F) max inlet'
      }
    },
    {
      id: 6,
      icon: Wind,
      title: 'Cooling Load',
      voltage: '15-30% of IT Load',
      color: 'from-cyan-500 to-blue-500',
      description: 'Cooling systems consume 15-30% additional power depending on PUE. Air-cooled Alberta sites benefit from cold climate.',
      details: [
        'Fan walls: 5-10 HP motors',
        'Evap cooling: 3-5% of IT load',
        'VFD control: Saves 20-40% power',
        'Free cooling: <15°C ambient'
      ],
      engineering: {
        pueTarget: '1.15-1.25 (Alberta)',
        economizer: '8,000+ hrs/year free cooling',
        waterUsage: 'WUE 0.0 (air-cooled)'
      }
    },
  ];

  // Corrected redundancy with accurate uptime calculations
  const redundancyConfigs = [
    { 
      id: 'n', 
      name: 'N (No Redundancy)', 
      uptime: 95, 
      cost: '$', 
      paths: 1, 
      description: 'Single path, no backup. Typical for cost-optimized mining operations. Any component failure causes full outage.',
      annualDowntime: '438 hours/year',
      useCase: 'Mining operations prioritizing low cost over uptime'
    },
    { 
      id: 'n1', 
      name: 'N+1', 
      uptime: 99, 
      cost: '$$', 
      paths: 2, 
      description: 'One backup component for every N active units. Standard for most mining facilities.',
      annualDowntime: '87.6 hours/year',
      useCase: 'Balanced mining operations'
    },
    { 
      id: '2n', 
      name: '2N', 
      uptime: 99.9, 
      cost: '$$$', 
      paths: 2, 
      description: 'Fully redundant dual paths. A and B feeds operate independently. Either can support full load.',
      annualDowntime: '8.76 hours/year',
      useCase: 'Premium operations, hosting clients'
    },
    { 
      id: '2n1', 
      name: '2N+1', 
      uptime: 99.99, 
      cost: '$$$$', 
      paths: 3, 
      description: 'Dual paths plus additional backup. Highest reliability. Rarely needed for mining.',
      annualDowntime: '52.6 minutes/year',
      useCase: 'Tier III+ datacenters, rarely mining'
    },
  ];

  // Updated efficiency metrics with 95% uptime
  const efficiencyMetrics = [
    { label: 'Target Uptime', value: 95, suffix: '%', description: 'N configuration SLA', icon: Gauge },
    { label: 'Thermal Conversion', value: 100, suffix: '%', description: 'Electrical → Heat', icon: Thermometer },
    { label: 'Failover Time', value: 10, suffix: 'ms', description: 'ATS switch speed', icon: Zap },
    { label: 'Target PUE', value: 1.15, suffix: '', description: 'Alberta climate advantage', icon: Wind },
  ];

  // Transformer sizing calculator
  const transformerSizes = [
    { kva: 1000, mw: 0.8, miners: 230, cost: '$45K' },
    { kva: 2000, mw: 1.6, miners: 460, cost: '$75K' },
    { kva: 2500, mw: 2.0, miners: 575, cost: '$90K' },
    { kva: 3000, mw: 2.4, miners: 690, cost: '$110K' },
  ];

  return (
    <section id="power-journey" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningObjectives
          objectives={[
            "Trace the complete voltage step-down chain: 138kV → 25kV → 600V → 240V → 12VDC",
            "Understand transformer sizing, efficiency, and redundancy configurations (N, N+1, 2N)",
            "Learn about protection systems, switchgear, and power quality requirements",
            "Calculate transformer requirements based on your facility size"
          ]}
          estimatedTime="15 min"
        />
        
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 1 • Engineering Deep Dive
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              The Power Journey
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              From 138kV transmission to 12VDC hash boards — every step of the voltage transformation chain explained
            </p>
          </div>
        </ScrollReveal>

        {/* Substation Image Hero */}
        <ScrollReveal delay={0.05}>
          <div className="relative rounded-2xl overflow-hidden mb-12 h-48 md:h-64">
            <img 
              src={substationImage} 
              alt="High voltage electrical substation with transformers" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-watt-navy/90 via-watt-navy/50 to-transparent" />
            <div className="absolute inset-0 flex items-center p-6 md:p-10">
              <div className="text-white max-w-lg">
                <h3 className="text-xl md:text-2xl font-bold mb-2">Primary Substation</h3>
                <p className="text-white/80 text-sm md:text-base">
                  138kV to 25kV step-down transformers rated at 50-100MVA capacity with oil-immersed cooling
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Interactive Power Flow Diagram */}
        <ScrollReveal delay={0.1}>
          <div className="relative mb-16">
            {/* Desktop: Horizontal flow */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Connection lines */}
                <div className="absolute top-1/2 left-0 right-0 h-3 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-watt-bitcoin to-cyan-500 rounded-full -translate-y-1/2 opacity-20" />
                
                {/* Animated flow */}
                <div className="absolute top-1/2 left-0 right-0 h-3 -translate-y-1/2 overflow-hidden rounded-full">
                  <div 
                    className="h-full w-32 bg-gradient-to-r from-transparent via-white to-transparent"
                    style={{ animation: 'flowAcross 3s linear infinite' }}
                  />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-6 gap-3 relative z-10">
                  {powerSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex flex-col items-center"
                      onMouseEnter={() => setActiveStep(index)}
                      onMouseLeave={() => setActiveStep(null)}
                    >
                      <div 
                        className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center cursor-pointer transition-all duration-300 ${
                          activeStep === index ? 'scale-110 shadow-lg shadow-current/30' : 'hover:scale-105'
                        }`}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                        {activeStep === index && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <ChevronDown className="w-4 h-4 text-foreground animate-bounce" />
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <div className="font-semibold text-foreground text-xs">{step.title}</div>
                        <div className="text-[10px] text-watt-bitcoin font-mono">{step.voltage}</div>
                      </div>
                      
                      {/* Expanded details */}
                      <div className={`mt-3 p-3 bg-card rounded-xl border border-border transition-all duration-300 ${
                        activeStep === index ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
                      }`}>
                        <p className="text-[10px] text-muted-foreground mb-2">{step.description}</p>
                        <ul className="space-y-1 mb-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="text-[10px] text-foreground flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-watt-bitcoin" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                        <div className="pt-2 border-t border-border">
                          <div className="text-[9px] text-watt-bitcoin font-medium mb-1">Engineering Specs:</div>
                          {Object.entries(step.engineering).map(([key, value]) => (
                            <div key={key} className="text-[9px] text-muted-foreground">
                              <span className="capitalize">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile: Vertical flow */}
            <div className="lg:hidden space-y-3">
              {powerSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative p-4 rounded-xl border transition-all ${
                    activeStep === index 
                      ? 'bg-card border-watt-bitcoin shadow-lg' 
                      : 'bg-muted/30 border-border'
                  }`}
                  onClick={() => setActiveStep(activeStep === index ? null : index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground text-sm">{step.title}</div>
                      <div className="text-xs text-watt-bitcoin font-mono">{step.voltage}</div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${
                      activeStep === index ? 'rotate-180' : ''
                    }`} />
                  </div>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${
                    activeStep === index ? 'max-h-96 mt-3' : 'max-h-0'
                  }`}>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {step.details.map((detail, i) => (
                        <span key={i} className="px-2 py-1 bg-muted rounded text-xs text-foreground">
                          {detail}
                        </span>
                      ))}
                    </div>
                    <div className="p-2 bg-watt-bitcoin/10 rounded-lg">
                      <div className="text-xs text-watt-bitcoin font-medium mb-1">Engineering Specs:</div>
                      {Object.entries(step.engineering).map(([key, value]) => (
                        <div key={key} className="text-xs text-muted-foreground">
                          <span className="capitalize">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {index < powerSteps.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Power Redundancy Section - Updated with 95% N config */}
        <ScrollReveal delay={0.2}>
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-2 text-center">
              Power Redundancy Configurations
            </h3>
            <p className="text-center text-muted-foreground mb-6 text-sm">
              WattByte Alberta operates at N configuration (95% uptime) optimized for mining economics
            </p>
            
            <div className="grid md:grid-cols-4 gap-3 max-w-5xl mx-auto">
              {redundancyConfigs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setActiveRedundancy(config.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    activeRedundancy === config.id
                      ? 'bg-watt-bitcoin/10 border-watt-bitcoin shadow-lg'
                      : 'bg-card border-border hover:border-watt-bitcoin/50'
                  } ${config.id === 'n' ? 'ring-2 ring-watt-bitcoin/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-lg font-bold ${
                      activeRedundancy === config.id ? 'text-watt-bitcoin' : 'text-foreground'
                    }`}>
                      {config.name}
                    </span>
                    <span className="text-muted-foreground text-sm">{config.cost}</span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-foreground">
                      <AnimatedCounter end={config.uptime} decimals={config.uptime < 100 ? (config.uptime >= 99.99 ? 2 : config.uptime >= 99 ? 0 : 0) : 0} suffix="%" />
                    </div>
                    <div className="text-xs text-muted-foreground">Uptime SLA</div>
                  </div>

                  <div className="text-xs text-red-500/80 mb-2">
                    ↓ {config.annualDowntime}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
                  
                  {/* Visual representation */}
                  <div className="flex items-center gap-1 mt-3">
                    {[...Array(config.paths)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full ${
                          i === config.paths - 1 && config.id === 'n1'
                            ? 'bg-yellow-500/50 border border-dashed border-yellow-500'
                            : i >= config.paths - 1 && config.id === '2n1'
                              ? 'bg-yellow-500/50 border border-dashed border-yellow-500'
                              : 'bg-green-500'
                        }`}
                      />
                    ))}
                  </div>

                  {config.id === 'n' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-watt-bitcoin">
                      <AlertTriangle className="w-3 h-3" />
                      <span>WattByte Alberta</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Transformer Sizing Calculator */}
        <ScrollReveal delay={0.25}>
          <div className="mb-12">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-full p-4 bg-muted/50 rounded-xl border border-border hover:border-watt-bitcoin/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Calculator className="w-6 h-6 text-watt-bitcoin" />
                <div className="text-left">
                  <div className="font-semibold text-foreground">Transformer Sizing Reference</div>
                  <div className="text-sm text-muted-foreground">Quick reference for unit substation sizing</div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
            </button>
            
            {showCalculator && (
              <div className="mt-4 p-4 bg-card rounded-xl border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-muted-foreground font-medium">Transformer Size</th>
                        <th className="text-center p-2 text-muted-foreground font-medium">IT Load (80%)</th>
                        <th className="text-center p-2 text-muted-foreground font-medium">~Miners (3.5kW ea)</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transformerSizes.map((size, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="p-2 font-semibold text-foreground">{size.kva} kVA</td>
                          <td className="p-2 text-center text-watt-bitcoin">{size.mw} MW</td>
                          <td className="p-2 text-center text-foreground">{size.miners}</td>
                          <td className="p-2 text-right text-muted-foreground">{size.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * Based on 80% continuous loading per NEC 220.87. Costs are approximate for dry-type cast-resin transformers.
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Efficiency Metrics */}
        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {efficiencyMetrics.map((metric, index) => (
              <div 
                key={index}
                className="p-4 bg-gradient-to-br from-muted/50 to-muted rounded-xl border border-border text-center group hover:border-watt-bitcoin/50 transition-colors"
              >
                <metric.icon className="w-6 h-6 text-watt-bitcoin mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-watt-bitcoin mb-1">
                  <AnimatedCounter 
                    end={metric.value} 
                    decimals={metric.value % 1 !== 0 ? 2 : 0} 
                    suffix={metric.suffix} 
                  />
                </div>
                <div className="font-medium text-foreground text-sm mb-1">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
        
        <SectionSummary
          takeaways={[
            "Power flows: 138kV transmission → 25kV substation → 600V site → 240V distribution → 12VDC miners",
            "Transformer efficiency is 99.5%+ — losses are minimal but heat dissipation must be planned",
            "N configuration (95% uptime) is standard for mining; 2N (99.9%) for premium hosting operations",
            "Each 2.5 MVA transformer supports ~575 miners (2 MW IT load)"
          ]}
          proTip="When sizing your electrical, always plan for 15-20% spare capacity. It's far cheaper to overspec transformers upfront than to add capacity later."
          nextSteps={[
            { title: "Cooling Systems", href: "/datacenter-education#cooling" },
            { title: "Grid Connection", href: "/electrical-infrastructure#grid-connection" }
          ]}
        />
      </div>

      <style>{`
        @keyframes flowAcross {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(calc(100vw + 100%)); }
        }
      `}</style>
    </section>
  );
};

export default PowerJourneySection;
