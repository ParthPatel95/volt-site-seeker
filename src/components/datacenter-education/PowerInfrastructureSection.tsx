import React, { useState } from 'react';
import { Zap, Battery, AlertTriangle, CheckCircle, ArrowDown } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const PowerInfrastructureSection = () => {
  const [activeConfig, setActiveConfig] = useState('n1');

  const voltageSteps = [
    { voltage: '69-138kV', label: 'Transmission', description: 'High voltage from grid', color: 'bg-red-500' },
    { voltage: '13.8-34.5kV', label: 'Substation', description: 'Medium voltage distribution', color: 'bg-orange-500' },
    { voltage: '480V', label: 'Transformer', description: 'Facility distribution', color: 'bg-yellow-500' },
    { voltage: '208-240V', label: 'PDU', description: 'Equipment power', color: 'bg-green-500' },
  ];

  const redundancyConfigs = [
    {
      id: 'n1',
      name: 'N+1',
      reliability: 99.9,
      description: 'One backup component for every N active components',
      diagram: ['Primary', 'Backup'],
      useCase: 'Standard mining operations',
      cost: 'Low',
    },
    {
      id: '2n',
      name: '2N',
      reliability: 99.99,
      description: 'Fully redundant system with two complete power paths',
      diagram: ['Path A', 'Path B'],
      useCase: 'High-value operations',
      cost: 'Medium',
    },
    {
      id: '2n1',
      name: '2N+1',
      reliability: 99.999,
      description: 'Two complete paths plus additional backup capacity',
      diagram: ['Path A', 'Path B', 'Backup'],
      useCase: 'Mission-critical facilities',
      cost: 'High',
    },
  ];

  const powerComponents = [
    { name: 'Utility Feed', icon: Zap, desc: 'Primary grid connection', power: '10-200 MW' },
    { name: 'Backup Generators', icon: Battery, desc: 'Diesel/natural gas backup', power: 'Full capacity' },
    { name: 'UPS Systems', icon: Battery, desc: 'Battery bridge power', power: '10-30 min runtime' },
    { name: 'Automatic Transfer Switch', icon: AlertTriangle, desc: 'Seamless failover', power: '<10s switchover' },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Power Infrastructure
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding voltage transformation and power redundancy in mining facilities
            </p>
          </div>
        </ScrollReveal>

        {/* Voltage Step-Down Animation */}
        <ScrollReveal delay={0.1}>
          <div className="mb-16">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              Voltage Step-Down Process
            </h3>
            <div className="relative max-w-3xl mx-auto">
              {voltageSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-4 md:gap-8 mb-4">
                    {/* Animated bar showing voltage reduction */}
                    <div className="flex-1">
                      <div 
                        className={`h-8 md:h-12 ${step.color} rounded-lg flex items-center justify-center relative overflow-hidden`}
                        style={{ 
                          width: `${100 - index * 20}%`,
                          animation: 'expandWidth 1s ease-out forwards',
                          animationDelay: `${index * 0.3}s`,
                        }}
                      >
                        <span className="text-white font-bold text-sm md:text-lg relative z-10">
                          {step.voltage}
                        </span>
                        {/* Animated pulse effect */}
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                    <div className="w-32 md:w-40">
                      <div className="font-semibold text-foreground text-sm md:text-base">{step.label}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  {index < voltageSteps.length - 1 && (
                    <div className="flex items-center gap-2 ml-4 mb-4">
                      <ArrowDown className="w-5 h-5 text-muted-foreground animate-bounce" />
                      <span className="text-xs text-muted-foreground">Step-down transformer</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Power Redundancy Configurations */}
        <ScrollReveal delay={0.2}>
          <div className="mb-16">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              Power Redundancy Configurations
            </h3>
            
            {/* Config selector */}
            <div className="flex justify-center gap-2 mb-8">
              {redundancyConfigs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setActiveConfig(config.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeConfig === config.id
                      ? 'bg-watt-bitcoin text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {config.name}
                </button>
              ))}
            </div>

            {/* Active config display */}
            {redundancyConfigs.filter(c => c.id === activeConfig).map((config) => (
              <div key={config.id} className="max-w-2xl mx-auto bg-card rounded-2xl border border-border p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-2xl font-bold text-foreground">{config.name} Redundancy</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-watt-bitcoin">
                      <AnimatedCounter end={config.reliability} decimals={config.reliability % 1 !== 0 ? 3 : 1} suffix="%" />
                    </div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">{config.description}</p>
                
                {/* Visual diagram */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  {config.diagram.map((path, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        path === 'Backup' ? 'bg-yellow-500/20 border-2 border-dashed border-yellow-500' : 'bg-green-500/20 border-2 border-green-500'
                      }`}>
                        <Zap className={`w-8 h-8 ${path === 'Backup' ? 'text-yellow-500' : 'text-green-500'}`} />
                      </div>
                      <span className="text-sm font-medium text-foreground mt-2">{path}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Use Case:</span>
                    <span className="text-foreground ml-2">{config.useCase}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Relative Cost:</span>
                    <span className="text-foreground ml-2">{config.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Power Components Grid */}
        <ScrollReveal delay={0.3}>
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            Critical Power Components
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {powerComponents.map((component, index) => (
              <div 
                key={index}
                className="p-6 bg-card rounded-xl border border-border hover:border-watt-bitcoin/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-watt-bitcoin/10 flex items-center justify-center mb-4 group-hover:bg-watt-bitcoin/20 transition-colors">
                  <component.icon className="w-6 h-6 text-watt-bitcoin" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{component.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{component.desc}</p>
                <div className="text-sm font-medium text-watt-bitcoin">{component.power}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Power density comparison */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 p-6 bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl text-white">
            <h3 className="text-xl font-semibold mb-4">Power Density Comparison</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-watt-bitcoin">5-10 MW</div>
                <div className="text-sm text-white/70">Per acre - Air Cooled</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-watt-bitcoin">15-25 MW</div>
                <div className="text-sm text-white/70">Per acre - Hydro Cooled</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-watt-bitcoin">30-50 MW</div>
                <div className="text-sm text-white/70">Per acre - Immersion</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes expandWidth {
          from { width: 0%; opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default PowerInfrastructureSection;
