import React, { useState } from 'react';
import { Zap, Building2, Gauge, Server, Thermometer, Wind, Bitcoin, ArrowRight, ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const PowerJourneySection = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeRedundancy, setActiveRedundancy] = useState('n1');

  const powerSteps = [
    {
      id: 1,
      icon: Building2,
      title: 'Grid Connection',
      voltage: '69-138kV',
      color: 'from-red-500 to-orange-500',
      description: 'High-voltage transmission lines from the power grid deliver electricity to the facility substation.',
      details: ['Direct utility feed', '10-200 MW capacity', 'Redundant supply options'],
    },
    {
      id: 2,
      icon: Zap,
      title: 'Substation',
      voltage: '13.8-34.5kV',
      color: 'from-orange-500 to-yellow-500',
      description: 'Step-down transformers reduce voltage for medium-voltage distribution across the facility.',
      details: ['Primary transformer', 'Protective relays', 'Metering equipment'],
    },
    {
      id: 3,
      icon: Gauge,
      title: 'Distribution',
      voltage: '480V',
      color: 'from-yellow-500 to-green-500',
      description: 'Power Distribution Units (PDUs) manage and monitor electricity flow to server rows.',
      details: ['Smart PDUs', 'Load balancing', 'Real-time monitoring'],
    },
    {
      id: 4,
      icon: Server,
      title: 'Mining Rigs',
      voltage: '208-240V',
      color: 'from-green-500 to-watt-bitcoin',
      description: 'ASIC miners receive power and perform SHA-256 computations to secure the Bitcoin network.',
      details: ['3-5kW per unit', 'Continuous operation', 'Hash computation'],
    },
    {
      id: 5,
      icon: Thermometer,
      title: 'Heat Output',
      voltage: '95% thermal',
      color: 'from-watt-bitcoin to-red-500',
      description: 'Nearly all electrical energy converts to heat, requiring efficient cooling systems.',
      details: ['Hot aisle: 95-105°F', 'Exhaust management', 'Heat recovery options'],
    },
    {
      id: 6,
      icon: Wind,
      title: 'Cooling Cycle',
      voltage: 'Continuous',
      color: 'from-cyan-500 to-blue-500',
      description: 'Cooling systems remove heat and maintain optimal operating temperatures.',
      details: ['Air/liquid cooling', 'PUE optimization', 'Ambient assist'],
    },
  ];

  const redundancyConfigs = [
    { id: 'n1', name: 'N+1', uptime: 99.9, cost: '$', paths: 2, description: 'One backup for every N active' },
    { id: '2n', name: '2N', uptime: 99.99, cost: '$$', paths: 2, description: 'Fully redundant dual paths' },
    { id: '2n1', name: '2N+1', uptime: 99.999, cost: '$$$', paths: 3, description: 'Dual paths plus backup' },
  ];

  const efficiencyMetrics = [
    { label: 'Power Utilization', value: 95, suffix: '%', description: 'Energy to computation' },
    { label: 'Switching Speed', value: 10, suffix: 'ms', description: 'Failover time' },
    { label: 'Uptime Target', value: 99.9, suffix: '%', description: 'Availability SLA' },
    { label: 'PUE Range', value: 1.1, suffix: '-1.5', description: 'Power efficiency' },
  ];

  return (
    <section id="power-journey" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 1
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              The Power Journey
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow the complete path of electricity from the grid to Bitcoin, understanding every transformation step
            </p>
          </div>
        </ScrollReveal>

        {/* Interactive Power Flow Diagram */}
        <ScrollReveal delay={0.1}>
          <div className="relative mb-20">
            {/* Desktop: Horizontal flow */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Connection lines */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-watt-bitcoin to-cyan-500 rounded-full -translate-y-1/2 opacity-30" />
                
                {/* Animated flow */}
                <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 overflow-hidden rounded-full">
                  <div 
                    className="h-full w-32 bg-gradient-to-r from-transparent via-white to-transparent"
                    style={{ animation: 'flowAcross 3s linear infinite' }}
                  />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-6 gap-4 relative z-10">
                  {powerSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex flex-col items-center"
                      onMouseEnter={() => setActiveStep(index)}
                      onMouseLeave={() => setActiveStep(null)}
                    >
                      <div 
                        className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center cursor-pointer transition-all duration-300 ${
                          activeStep === index ? 'scale-110 shadow-lg shadow-current/30' : 'hover:scale-105'
                        }`}
                      >
                        <step.icon className="w-10 h-10 text-white" />
                        {activeStep === index && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <ChevronDown className="w-4 h-4 text-foreground animate-bounce" />
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-center">
                        <div className="font-semibold text-foreground text-sm">{step.title}</div>
                        <div className="text-xs text-watt-bitcoin font-mono">{step.voltage}</div>
                      </div>
                      
                      {/* Expanded details */}
                      <div className={`mt-4 p-4 bg-card rounded-xl border border-border transition-all duration-300 ${
                        activeStep === index ? 'opacity-100 max-h-48' : 'opacity-0 max-h-0 overflow-hidden'
                      }`}>
                        <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                        <ul className="space-y-1">
                          {step.details.map((detail, i) => (
                            <li key={i} className="text-xs text-foreground flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-watt-bitcoin" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile: Vertical flow */}
            <div className="lg:hidden space-y-4">
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
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{step.title}</div>
                      <div className="text-sm text-watt-bitcoin font-mono">{step.voltage}</div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${
                      activeStep === index ? 'rotate-180' : ''
                    }`} />
                  </div>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${
                    activeStep === index ? 'max-h-48 mt-4' : 'max-h-0'
                  }`}>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.details.map((detail, i) => (
                        <span key={i} className="px-2 py-1 bg-muted rounded text-xs text-foreground">
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Connection arrow */}
                  {index < powerSteps.length - 1 && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Power Redundancy Section */}
        <ScrollReveal delay={0.2}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
              Power Redundancy Configurations
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {redundancyConfigs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setActiveRedundancy(config.id)}
                  className={`p-6 rounded-2xl border text-left transition-all ${
                    activeRedundancy === config.id
                      ? 'bg-watt-bitcoin/10 border-watt-bitcoin shadow-lg'
                      : 'bg-card border-border hover:border-watt-bitcoin/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-2xl font-bold ${
                      activeRedundancy === config.id ? 'text-watt-bitcoin' : 'text-foreground'
                    }`}>
                      {config.name}
                    </span>
                    <span className="text-muted-foreground text-lg">{config.cost}</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-3xl font-bold text-foreground">
                      <AnimatedCounter end={config.uptime} decimals={config.uptime < 100 ? (config.uptime === 99.9 ? 1 : 2) : 0} suffix="%" />
                    </div>
                    <div className="text-sm text-muted-foreground">Uptime SLA</div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  
                  {/* Visual representation */}
                  <div className="flex items-center gap-2 mt-4">
                    {[...Array(config.paths)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full ${
                          i === config.paths - 1 && config.id !== '2n'
                            ? 'bg-yellow-500/50 border border-dashed border-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Efficiency Metrics */}
        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {efficiencyMetrics.map((metric, index) => (
              <div 
                key={index}
                className="p-6 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border border-border text-center group hover:border-watt-bitcoin/50 transition-colors"
              >
                <div className="text-3xl md:text-4xl font-bold text-watt-bitcoin mb-1">
                  <AnimatedCounter 
                    end={metric.value} 
                    decimals={metric.value % 1 !== 0 ? 1 : 0} 
                    suffix={metric.suffix} 
                  />
                </div>
                <div className="font-medium text-foreground mb-1">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
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
