import { useEffect, useState, useRef } from 'react';
import { TrendingUp, Battery, Zap, Shield, DollarSign, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const programs = [
  {
    name: 'Demand Response',
    icon: Zap,
    description: 'Get paid to reduce load when grid is stressed',
    benefits: [
      'Availability payments: $5-15/MW-hour',
      'Energy payments when curtailed',
      'Capacity payments for commitment',
    ],
    requirements: [
      'Minimum 5 MW controllable load',
      '10-minute response capability',
      'AESO metering requirements',
    ],
    potential: '$50,000 - $500,000/year',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Operating Reserve',
    icon: Battery,
    description: 'Provide grid stability services for premium payments',
    benefits: [
      'Spinning reserve: Higher payments',
      'Supplemental reserve: Flexibility',
      'Hourly market opportunities',
    ],
    requirements: [
      'Load shed within 10 minutes',
      'Minimum 1 MW capacity',
      'AGC communication link',
    ],
    potential: '$100,000 - $1M+/year',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Load Shed Service (LSS)',
    icon: Shield,
    description: 'Last line of defense — highest reliability payments',
    benefits: [
      'Premium reliability payments',
      'Annual capacity contracts',
      'Rarely activated (<1x/year)',
    ],
    requirements: [
      'Shed load within seconds',
      'Minimum 10 MW capacity',
      'Automatic load shedding',
    ],
    potential: '$200,000 - $2M+/year',
    color: 'from-purple-500 to-indigo-500',
  },
];

export const AESOSavingsProgramsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(0);
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
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-4">
            <TrendingUp className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">Revenue Opportunities</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            AESO <span className="text-primary">Savings Programs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Beyond 12CP avoidance, flexible loads can earn revenue by participating in grid programs
          </p>
        </div>

        {/* Program Cards */}
        <div className={`grid lg:grid-cols-3 gap-6 mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {programs.map((program, i) => (
            <div
              key={i}
              onClick={() => setSelectedProgram(i)}
              className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                selectedProgram === i
                  ? 'bg-card border-2 border-primary shadow-lg scale-[1.02]'
                  : 'bg-card/70 border border-border hover:bg-card hover:shadow-md'
              }`}
            >
              {/* Icon with gradient */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center mb-4`}>
                <program.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">{program.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{program.description}</p>

              <div className="flex items-center gap-2 text-primary font-semibold">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">{program.potential}</span>
              </div>

              {selectedProgram === i && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Program Details */}
        <div className={`bg-card rounded-2xl border border-border overflow-hidden transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className={`p-4 bg-gradient-to-r ${programs[selectedProgram].color}`}>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {(() => { const Icon = programs[selectedProgram].icon; return <Icon className="w-5 h-5" />; })()}
              {programs[selectedProgram].name} Details
            </h3>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-8">
            {/* Benefits */}
            <div>
              <h4 className="font-semibold text-watt-navy mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Key Benefits
              </h4>
              <ul className="space-y-3">
                {programs[selectedProgram].benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-green-800">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-semibold text-watt-navy mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Requirements
              </h4>
              <ul className="space-y-3">
                {programs[selectedProgram].requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-800">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Earning Potential Highlight */}
          <div className="p-6 bg-gradient-to-r from-watt-bitcoin/10 to-amber-50 border-t border-watt-navy/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-watt-navy/70">Estimated Annual Revenue Potential</p>
                <p className="text-3xl font-bold text-watt-bitcoin">{programs[selectedProgram].potential}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-watt-navy/70">For WattByte's 135MW Facility</p>
                <p className="text-lg font-semibold text-watt-navy">Combined programs could add $500K-2M+/year</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bitcoin Mining Advantage */}
        <div className={`mt-8 p-6 rounded-2xl bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold mb-4">⚡ Why Bitcoin Mining is Perfect for Grid Programs</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Instant Response', value: '< 1 second', desc: 'Can curtail within milliseconds' },
              { label: 'Flexibility', value: '0-100%', desc: 'Scale load up or down instantly' },
              { label: 'No Product Loss', value: '0% waste', desc: 'Unlike factories, no spoiled inventory' },
              { label: 'Always Online', value: '24/7/365', desc: 'Available for any program' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/10 text-center">
                <p className="text-2xl font-bold text-watt-bitcoin mb-1">{item.value}</p>
                <p className="font-semibold text-white mb-1">{item.label}</p>
                <p className="text-xs text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
