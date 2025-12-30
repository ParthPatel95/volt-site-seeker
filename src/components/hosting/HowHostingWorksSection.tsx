import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Truck, Wrench, MonitorCheck, Coins, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const steps = [
  {
    number: 1,
    icon: Truck,
    title: 'Ship Your Miners',
    description: 'Send your hardware to our secure facility. We handle receiving and inspection.',
    colorClass: 'text-[hsl(var(--watt-trust))]',
    bgClass: 'bg-[hsl(var(--watt-trust))]',
    bgLightClass: 'bg-[hsl(var(--watt-trust)/0.1)]',
    bgHoverClass: 'bg-[hsl(var(--watt-trust)/0.2)]',
    borderClass: 'border-[hsl(var(--watt-trust))]',
    delay: 0
  },
  {
    number: 2,
    icon: Wrench,
    title: 'Professional Setup',
    description: 'Expert installation, configuration, and optimization of your mining equipment.',
    colorClass: 'text-[hsl(var(--watt-bitcoin))]',
    bgClass: 'bg-[hsl(var(--watt-bitcoin))]',
    bgLightClass: 'bg-[hsl(var(--watt-bitcoin)/0.1)]',
    bgHoverClass: 'bg-[hsl(var(--watt-bitcoin)/0.2)]',
    borderClass: 'border-[hsl(var(--watt-bitcoin))]',
    delay: 0.1
  },
  {
    number: 3,
    icon: MonitorCheck,
    title: '24/7 Monitoring',
    description: 'Real-time performance tracking with proactive maintenance and support.',
    colorClass: 'text-[hsl(var(--watt-success))]',
    bgClass: 'bg-[hsl(var(--watt-success))]',
    bgLightClass: 'bg-[hsl(var(--watt-success)/0.1)]',
    bgHoverClass: 'bg-[hsl(var(--watt-success)/0.2)]',
    borderClass: 'border-[hsl(var(--watt-success))]',
    delay: 0.2
  },
  {
    number: 4,
    icon: Coins,
    title: 'Collect Earnings',
    description: 'Receive your mining rewards directly to your wallet. Simple and transparent.',
    colorClass: 'text-[hsl(var(--watt-bitcoin))]',
    bgClass: 'bg-[hsl(var(--watt-bitcoin))]',
    bgLightClass: 'bg-[hsl(var(--watt-bitcoin)/0.1)]',
    bgHoverClass: 'bg-[hsl(var(--watt-bitcoin)/0.2)]',
    borderClass: 'border-[hsl(var(--watt-bitcoin))]',
    delay: 0.3
  }
];

export const HowHostingWorksSection = () => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <section className="py-12 md:py-16 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[hsl(var(--watt-navy)/0.05)] border border-[hsl(var(--watt-navy)/0.1)] rounded-full mb-4">
              <span className="text-sm font-medium text-[hsl(var(--watt-navy))]">Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[hsl(var(--watt-navy))] mb-4">
              How Hosting Works
            </h2>
            <p className="text-lg text-[hsl(var(--watt-navy)/0.7)] max-w-2xl mx-auto">
              Get your mining operation running in four simple steps
            </p>
          </div>
        </ScrollReveal>

        {/* Desktop Flow */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--watt-trust))] via-[hsl(var(--watt-bitcoin))] to-[hsl(var(--watt-success))] transform -translate-y-1/2 z-0 opacity-20" />
            
            {/* Animated Progress Line */}
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[hsl(var(--watt-trust))] via-[hsl(var(--watt-bitcoin))] to-[hsl(var(--watt-success))] transform -translate-y-1/2 z-0"
              style={{
                width: hoveredStep ? `${(hoveredStep / 4) * 100}%` : '0%',
                transition: 'width 0.5s ease-out'
              }}
            />

            <div className="grid grid-cols-4 gap-4 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isHovered = hoveredStep === step.number;
                const isPast = hoveredStep !== null && step.number <= hoveredStep;
                
                return (
                  <ScrollReveal key={step.number} delay={step.delay}>
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredStep(step.number)}
                      onMouseLeave={() => setHoveredStep(null)}
                    >
                      {/* Arrow Connector */}
                      {index < steps.length - 1 && (
                        <div className={`absolute top-12 -right-2 z-20 transition-all duration-300 ${isPast ? 'opacity-100 translate-x-1' : 'opacity-40'}`}>
                          <ArrowRight className={`w-6 h-6 ${step.colorClass}`} />
                        </div>
                      )}
                      
                      <div className={`bg-card rounded-2xl p-6 text-center transition-all duration-300 border-2 ${
                        isHovered 
                          ? `${step.borderClass} shadow-lg scale-105` 
                          : 'border-transparent shadow-sm'
                      }`}>
                        {/* Number Badge */}
                        <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
                          isPast ? step.bgClass : 'bg-[hsl(var(--watt-navy)/0.3)]'
                        }`}>
                          {step.number}
                        </div>

                        {/* Icon */}
                        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                          isHovered 
                            ? `${step.bgHoverClass} scale-110` 
                            : step.bgLightClass
                        }`}>
                          <Icon className={`w-8 h-8 ${step.colorClass} transition-all duration-300 ${isHovered ? 'scale-110' : ''}`} />
                        </div>

                        <h3 className="text-lg font-bold text-[hsl(var(--watt-navy))] mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-[hsl(var(--watt-navy)/0.6)]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Flow */}
        <div className="md:hidden space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.number} delay={step.delay}>
                <div className="relative">
                  {/* Vertical Connector */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-full h-4 w-0.5 bg-[hsl(var(--watt-navy)/0.2)]" />
                  )}
                  
                  <div className="flex items-start space-x-4 bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center ${step.bgLightClass} relative`}>
                      <Icon className={`w-7 h-7 ${step.colorClass}`} />
                      <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full ${step.bgClass} flex items-center justify-center text-white text-xs font-bold`}>
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[hsl(var(--watt-navy))] mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[hsl(var(--watt-navy)/0.6)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
