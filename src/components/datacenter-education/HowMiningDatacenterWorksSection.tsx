import React, { useState } from 'react';
import { Zap, Server, Thermometer, Wind, Wifi, Bitcoin, ArrowRight, ArrowDown } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const HowMiningDatacenterWorksSection = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const flowSteps = [
    {
      id: 1,
      icon: Zap,
      title: 'Power Grid',
      subtitle: '69kV - 138kV',
      description: 'High-voltage electricity from the utility grid or direct generation sources like hydro, solar, or natural gas.',
      color: 'from-yellow-500 to-amber-500',
      details: ['Grid connection', 'Power Purchase Agreement', 'Backup generators'],
    },
    {
      id: 2,
      icon: Zap,
      title: 'Substation',
      subtitle: '13.8kV - 34.5kV',
      description: 'Steps down high voltage from the grid to medium voltage for facility distribution.',
      color: 'from-amber-500 to-orange-500',
      details: ['Voltage transformation', 'Circuit protection', 'Power metering'],
    },
    {
      id: 3,
      icon: Zap,
      title: 'Transformers & PDUs',
      subtitle: '208V - 480V',
      description: 'Further reduces voltage and distributes power to individual mining units.',
      color: 'from-orange-500 to-red-500',
      details: ['Power distribution', 'Load balancing', 'Surge protection'],
    },
    {
      id: 4,
      icon: Server,
      title: 'ASIC Miners',
      subtitle: '3-5kW per unit',
      description: 'Specialized hardware that performs SHA-256 calculations to mine Bitcoin blocks.',
      color: 'from-watt-bitcoin to-orange-600',
      details: ['Hash computation', 'Block validation', 'Heat generation'],
    },
    {
      id: 5,
      icon: Thermometer,
      title: 'Heat Generation',
      subtitle: '95%+ of power → heat',
      description: 'Mining hardware converts nearly all electrical energy into heat that must be removed.',
      color: 'from-red-500 to-rose-600',
      details: ['Hot aisle: 40-50°C', 'Thermal management', 'Heat exhaust'],
    },
    {
      id: 6,
      icon: Wind,
      title: 'Cooling System',
      subtitle: 'PUE: 1.1 - 1.5',
      description: 'Removes heat to maintain optimal operating temperatures for mining equipment.',
      color: 'from-cyan-500 to-blue-500',
      details: ['Air/Hydro/Immersion', 'Cold aisle: 18-24°C', 'Heat exchanger'],
    },
    {
      id: 7,
      icon: Wifi,
      title: 'Network',
      subtitle: '<50ms latency',
      description: 'Low-latency connection to mining pools for submitting work and receiving new jobs.',
      color: 'from-blue-500 to-indigo-500',
      details: ['Pool connection', 'Work submission', 'Share validation'],
    },
    {
      id: 8,
      icon: Bitcoin,
      title: 'Bitcoin Rewards',
      subtitle: '3.125 BTC/block',
      description: 'Successful blocks earn Bitcoin rewards distributed among pool participants.',
      color: 'from-watt-bitcoin to-yellow-500',
      details: ['Block rewards', 'Transaction fees', 'Pool payouts'],
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How a Mining Datacenter Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow the flow of power, data, and heat through a Bitcoin mining facility
            </p>
          </div>
        </ScrollReveal>

        {/* Animated Flow Diagram */}
        <div className="relative">
          {/* Desktop: Horizontal flow */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-8 gap-2">
              {flowSteps.map((step, index) => (
                <ScrollReveal key={step.id} delay={index * 0.1}>
                  <div
                    className={`relative group cursor-pointer transition-all duration-300 ${
                      activeStep === step.id ? 'scale-105 z-10' : 'hover:scale-102'
                    }`}
                    onMouseEnter={() => setActiveStep(step.id)}
                    onMouseLeave={() => setActiveStep(null)}
                  >
                    {/* Connection line */}
                    {index < flowSteps.length - 1 && (
                      <div className="absolute top-1/2 -right-1 w-2 h-0.5 bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/20 z-0">
                        <ArrowRight className="absolute -right-3 -top-1.5 w-4 h-4 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    {/* Step card */}
                    <div className={`relative p-4 rounded-xl border transition-all duration-300 ${
                      activeStep === step.id 
                        ? 'bg-card border-watt-bitcoin shadow-lg shadow-watt-bitcoin/20' 
                        : 'bg-card/50 border-border hover:border-watt-bitcoin/50'
                    }`}>
                      {/* Icon with gradient background */}
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-3`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="text-sm font-semibold text-foreground text-center mb-1 line-clamp-1">
                        {step.title}
                      </h3>
                      <p className="text-xs text-watt-bitcoin font-medium text-center">
                        {step.subtitle}
                      </p>

                      {/* Expanded details on hover */}
                      {activeStep === step.id && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-popover border border-border rounded-lg shadow-xl z-20">
                          <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                          <ul className="space-y-1">
                            {step.details.map((detail, i) => (
                              <li key={i} className="text-xs text-foreground flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-watt-bitcoin" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Mobile/Tablet: Vertical flow */}
          <div className="lg:hidden space-y-4">
            {flowSteps.map((step, index) => (
              <ScrollReveal key={step.id} delay={index * 0.05}>
                <div className="relative">
                  {/* Connection line */}
                  {index < flowSteps.length - 1 && (
                    <div className="absolute left-6 top-full h-4 w-0.5 bg-gradient-to-b from-muted-foreground/50 to-muted-foreground/20">
                      <ArrowDown className="absolute -bottom-2 -left-1.5 w-4 h-4 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  <div 
                    className={`flex items-start gap-4 p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors cursor-pointer ${
                      activeStep === step.id ? 'border-watt-bitcoin' : 'border-border'
                    }`}
                    onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{step.title}</h3>
                        <span className="text-xs text-watt-bitcoin font-medium">{step.subtitle}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {activeStep === step.id && (
                        <ul className="mt-2 space-y-1">
                          {step.details.map((detail, i) => (
                            <li key={i} className="text-xs text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <ScrollReveal delay={0.5}>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-muted/30 rounded-2xl border border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-watt-bitcoin">8 Steps</div>
              <div className="text-sm text-muted-foreground">Power to Bitcoin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">~95%</div>
              <div className="text-sm text-muted-foreground">Heat Conversion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">&lt;10ms</div>
              <div className="text-sm text-muted-foreground">Processing Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">24/7</div>
              <div className="text-sm text-muted-foreground">Continuous Operation</div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HowMiningDatacenterWorksSection;
