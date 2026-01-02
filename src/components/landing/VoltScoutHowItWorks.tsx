import { Satellite, Target, Bell, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Satellite,
    number: '01',
    title: 'Discover',
    description: 'AI continuously scans 50,000+ substations, transmission lines, and power infrastructure across North America.',
    color: 'watt-trust',
  },
  {
    icon: Target,
    number: '02',
    title: 'Analyze',
    description: 'VoltScore™ algorithm ranks each opportunity based on power capacity, grid stability, market conditions, and development potential.',
    color: 'watt-bitcoin',
  },
  {
    icon: Bell,
    number: '03',
    title: 'Alert',
    description: 'Real-time notifications when high-value opportunities match your investment criteria and geographic preferences.',
    color: 'watt-success',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Act',
    description: 'One-click to add opportunities to your deal pipeline with full due diligence reports and financial modeling.',
    color: 'watt-trust',
  },
];

export const VoltScoutHowItWorks = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          
          return (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="bg-card rounded-xl border border-border p-6 h-full hover:border-watt-trust/50 hover:shadow-lg transition-all duration-300 group">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-bold text-muted-foreground/30 group-hover:text-watt-trust/20 transition-colors duration-300">
                    {step.number}
                  </span>
                  <div className={`p-3 rounded-lg bg-${step.color}/10 group-hover:bg-${step.color}/20 transition-colors duration-300`}>
                    <Icon className={`w-6 h-6 text-${step.color}`} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-watt-trust transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting Arrow (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/30">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Summary */}
      <div className="mt-8 p-6 bg-gradient-to-r from-watt-trust/10 to-watt-bitcoin/10 rounded-xl border border-watt-trust/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-watt-trust/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-watt-trust" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground mb-2">
              End-to-End Intelligence Platform
            </h4>
            <p className="text-sm text-muted-foreground">
              From initial discovery to deal execution, VoltScout streamlines the entire energy opportunity identification process. 
              Our AI-powered platform provides the insights you need to make informed decisions quickly and confidently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};