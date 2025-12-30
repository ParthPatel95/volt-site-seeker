import { useState } from 'react';
import { TrendingUp, Battery, Zap, Shield, DollarSign, Clock, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AESOSectionWrapper, 
  AESOSectionHeader, 
  AESOContentCard, 
  AESOKeyInsight,
  AESODeepDive
} from './shared';

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
    color: 'hsl(var(--watt-trust))',
    howItWorks: 'AESO contracts with load customers to reduce consumption during grid emergencies or high-price periods. You receive payments for being available and additional payments when actually curtailed.'
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
    color: 'hsl(var(--watt-success))',
    howItWorks: 'Participate in the AESO Operating Reserve market by offering to curtail load on short notice. Spinning reserve requires faster response (10 minutes) but pays more. Supplemental allows longer response times.'
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
    color: 'hsl(var(--watt-bitcoin))',
    howItWorks: 'LSS is the grid\'s emergency backup. You install automatic underfrequency relays that shed your load within seconds if grid frequency drops. Since activation is rare, you get paid primarily for being available.'
  },
];

const miningAdvantages = [
  { label: 'Instant Response', value: '< 1 second', desc: 'Can curtail within milliseconds' },
  { label: 'Flexibility', value: '0-100%', desc: 'Scale load up or down instantly' },
  { label: 'No Product Loss', value: '0% waste', desc: 'Unlike factories, no spoiled inventory' },
  { label: 'Always Online', value: '24/7/365', desc: 'Available for any program' },
];

export const AESOSavingsProgramsSection = () => {
  const [selectedProgram, setSelectedProgram] = useState(0);

  return (
    <AESOSectionWrapper theme="light" id="savings-programs">
      <AESOSectionHeader
        badge="Revenue Opportunities"
        badgeIcon={TrendingUp}
        title="AESO Savings Programs"
        description="Beyond 12CP avoidance, flexible loads can earn revenue by participating in grid programs. These programs pay you to help stabilize the grid."
        theme="light"
        align="center"
      />

      {/* Understanding Grid Programs */}
      <div className="mb-12">
        <AESODeepDive title="How Grid Programs Create Value" defaultOpen>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Alberta's electricity grid must balance supply and demand in real-time. AESO manages this through 
              various programs that pay customers to provide <strong className="text-foreground">flexibility services</strong>. 
              For operations with controllable loads, these programs create significant revenue opportunities.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-[hsl(var(--watt-trust)/0.05)] border border-[hsl(var(--watt-trust)/0.2)]">
                <h4 className="font-semibold text-foreground mb-2">Why AESO Pays</h4>
                <p className="text-sm">
                  It's cheaper to pay loads to curtail than to build and maintain peaker plants that run 
                  only a few hours per year.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[hsl(var(--watt-success)/0.05)] border border-[hsl(var(--watt-success)/0.2)]">
                <h4 className="font-semibold text-foreground mb-2">Revenue Stacking</h4>
                <p className="text-sm">
                  You can often participate in multiple programs simultaneously, stacking revenue streams 
                  from the same flexible capacity.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[hsl(var(--watt-bitcoin)/0.05)] border border-[hsl(var(--watt-bitcoin)/0.2)]">
                <h4 className="font-semibold text-foreground mb-2">Perfect for Bitcoin Mining</h4>
                <p className="text-sm">
                  Mining operations can respond instantly with no product loss, making them ideal 
                  participants in grid programs.
                </p>
              </div>
            </div>
          </div>
        </AESODeepDive>
      </div>

      {/* Program Cards */}
      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        {programs.map((program, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            onClick={() => setSelectedProgram(i)}
            className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
              selectedProgram === i
                ? 'bg-card border-2 border-[hsl(var(--watt-bitcoin))] shadow-lg scale-[1.02]'
                : 'bg-card border border-border hover:shadow-md hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
            }`}
          >
            {/* Icon */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${program.color}15` }}
            >
              <program.icon className="w-6 h-6" style={{ color: program.color }} />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">{program.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{program.description}</p>

            <div className="flex items-center gap-2 text-[hsl(var(--watt-bitcoin))] font-semibold">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">{program.potential}</span>
            </div>

            {selectedProgram === i && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[hsl(var(--watt-bitcoin))] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Selected Program Details */}
      <motion.div 
        key={selectedProgram}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border overflow-hidden mb-12"
      >
        <div 
          className="p-4"
          style={{ background: `linear-gradient(135deg, ${programs[selectedProgram].color}, ${programs[selectedProgram].color}cc)` }}
        >
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {(() => { const Icon = programs[selectedProgram].icon; return <Icon className="w-5 h-5" />; })()}
            {programs[selectedProgram].name} Details
          </h3>
        </div>

        <div className="p-6">
          {/* How It Works */}
          <div className="mb-6 p-4 rounded-xl bg-muted">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
              How It Works
            </h4>
            <p className="text-sm text-muted-foreground">{programs[selectedProgram].howItWorks}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefits */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[hsl(var(--watt-success))]" />
                Key Benefits
              </h4>
              <ul className="space-y-3">
                {programs[selectedProgram].benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--watt-success)/0.05)] border border-[hsl(var(--watt-success)/0.2)]">
                    <ArrowRight className="w-4 h-4 text-[hsl(var(--watt-success))] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[hsl(var(--watt-trust))]" />
                Requirements
              </h4>
              <ul className="space-y-3">
                {programs[selectedProgram].requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--watt-trust)/0.05)] border border-[hsl(var(--watt-trust)/0.2)]">
                    <ArrowRight className="w-4 h-4 text-[hsl(var(--watt-trust))] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Earning Potential Highlight */}
        <div className="p-6 bg-gradient-to-r from-[hsl(var(--watt-bitcoin)/0.1)] to-[hsl(var(--watt-bitcoin)/0.05)] border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Estimated Annual Revenue Potential</p>
              <p className="text-3xl font-bold text-[hsl(var(--watt-bitcoin))]">{programs[selectedProgram].potential}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">For a 100MW+ Facility</p>
              <p className="text-lg font-semibold text-foreground">Combined programs could add $500K-2M+/year</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bitcoin Mining Advantage */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] text-white">
        <h3 className="text-xl md:text-2xl font-bold mb-6 text-center">
          <Zap className="w-6 h-6 inline mr-2 text-[hsl(var(--watt-bitcoin))]" />
          Why Bitcoin Mining is Perfect for Grid Programs
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          {miningAdvantages.map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-4 rounded-xl bg-white/10 text-center"
            >
              <p className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))] mb-1">{item.value}</p>
              <p className="font-semibold text-white mb-1">{item.label}</p>
              <p className="text-xs text-white/70">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        
        <p className="text-center text-white/80 mt-6 text-sm">
          Unlike traditional industrial loads, Bitcoin mining can curtail instantly with zero product loss, 
          making it the ideal participant for grid flexibility programs.
        </p>
      </div>

      {/* Pro Tip */}
      <AESOKeyInsight variant="pro-tip" title="Revenue Stacking Strategy" theme="light" className="mt-8">
        <p>
          Smart operators <strong>stack multiple revenue streams</strong>: participate in Operating Reserve during 
          normal operations, commit to LSS for emergency availability, and capture Demand Response payments during 
          high-price events. A well-optimized 50MW facility can generate <strong>$300K-1M+</strong> annually from 
          grid programs alone.
        </p>
      </AESOKeyInsight>

      {/* Data Source */}
      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-success))]"></span>
          Based on AESO Ancillary Services and Demand Response program specifications
        </span>
      </div>
    </AESOSectionWrapper>
  );
};
