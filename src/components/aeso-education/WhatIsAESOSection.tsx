import { Building2, Zap, ArrowRight, Shield, BarChart3, Users, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import aesoMeritOrderImage from '@/assets/aeso-merit-order.jpg';
import {
  AESOSectionWrapper,
  AESOSectionHeader,
  AESOContentCard,
  AESOStatCard,
  AESOKeyInsight,
  AESODeepDive,
  AESOQuote,
} from './shared';

const responsibilities = [
  { 
    icon: BarChart3, 
    title: 'Merit Order Dispatch', 
    description: 'Stacks generators by bid price, dispatching lowest-cost first to meet demand. This creates a transparent, competitive market where efficient generators thrive.',
    color: 'hsl(var(--watt-bitcoin))',
  },
  { 
    icon: Shield, 
    title: 'Grid Reliability', 
    description: 'Maintains 99.97%+ transmission reliability across 26,000+ km of high-voltage lines connecting 300+ substations province-wide.',
    color: 'hsl(var(--watt-trust))',
  },
  { 
    icon: Users, 
    title: 'Market Rules', 
    description: 'Enforces fair competition among 260+ market participants, ensuring no single entity can manipulate prices or restrict supply.',
    color: 'hsl(var(--watt-success))',
  },
  { 
    icon: Zap, 
    title: 'Real-Time Balancing', 
    description: 'Matches supply to demand every second, 24/7/365. When you flip a switch in Calgary, AESO ensures a generator somewhere responds instantly.',
    color: 'hsl(var(--primary))',
  },
];

const isoComparison = [
  { name: 'AESO (Alberta)', type: 'Energy-Only', pricing: 'Single Pool Price', marketSize: '~17 GW', highlight: true },
  { name: 'ERCOT (Texas)', type: 'Energy-Only', pricing: 'Nodal LMP', marketSize: '~85 GW', highlight: false },
  { name: 'MISO (Midwest)', type: 'Capacity + Energy', pricing: 'Nodal LMP', marketSize: '~190 GW', highlight: false },
  { name: 'PJM (Mid-Atlantic)', type: 'Capacity + Energy', pricing: 'Nodal LMP', marketSize: '~180 GW', highlight: false },
];

const keyStats = [
  { label: 'Peak Demand (2024)', value: '12,500 MW', description: 'Record set during cold snap' },
  { label: 'Installed Capacity', value: '~19,500 MW', description: 'Total generation capacity' },
  { label: 'Transmission Lines', value: '26,000+ km', description: 'High-voltage network' },
  { label: 'Market Participants', value: '260+', description: 'Generators, retailers, loads' },
];

const historyTimeline = [
  {
    year: '1996',
    title: 'Deregulation Begins',
    description: 'Alberta becomes the first jurisdiction in Canada to deregulate its electricity market, breaking up the provincial utility monopoly and introducing competition.',
  },
  {
    year: '2003',
    title: 'AESO Established',
    description: 'The Alberta Electric System Operator is formally established as an independent, not-for-profit corporation responsible for operating the grid and wholesale market.',
  },
  {
    year: '2015',
    title: 'Renewable Growth',
    description: 'Alberta announces phase-out of coal-fired electricity by 2030 and targets 30% renewable energy. Wind and solar investment accelerates dramatically.',
  },
  {
    year: '2024',
    title: 'Coal-Free Grid',
    description: 'Alberta completes coal phase-out ahead of schedule. The generation mix is now dominated by natural gas, with rapidly growing wind and solar capacity.',
  },
];

export const WhatIsAESOSection = () => {
  return (
    <AESOSectionWrapper theme="gradient" id="what-is-aeso">
      <LearningObjectives
        objectives={[
          "Understand AESO's role as Alberta's Independent System Operator",
          "Learn how the single pool price market differs from other North American ISOs",
          "Know key statistics: 12,500 MW peak demand, 260+ market participants",
          "See how power flows from generators through transmission to end users"
        ]}
        estimatedTime="8 min"
      />
      
      {/* Header */}
      <AESOSectionHeader
        badge="Understanding the Market"
        badgeIcon={Building2}
        title="What is AESO?"
        description="The Alberta Electric System Operator is an Independent System Operator (ISO) that manages Alberta's electricity grid and wholesale market — one of North America's most unique power markets with complete deregulation and energy-only pricing."
      />

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {keyStats.map((stat, i) => (
          <AESOStatCard
            key={i}
            value={stat.value}
            label={stat.label}
            description={stat.description}
            delay={i * 0.1}
          />
        ))}
      </div>

      {/* Power Flow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h3 className="text-xl font-bold text-foreground text-center mb-8">How Power Flows in Alberta</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {['Generators', 'Transmission (AESO)', 'Distribution (Utilities)', 'End Users'].map((step, i) => (
            <div key={i} className="flex items-center gap-2 md:gap-4">
              <motion.div 
                className="px-4 py-3 md:px-6 md:py-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all hover:border-[hsl(var(--watt-bitcoin)/0.3)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <p className="font-semibold text-foreground text-sm md:text-base">{step}</p>
              </motion.div>
              {i < 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
                  className="hidden md:block"
                >
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Two Column Layout - History & Responsibilities */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Left - History & Image */}
        <div>
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <img 
              src={aesoMeritOrderImage} 
              alt="AESO Control Room" 
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.3)] to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-semibold">AESO System Control Centre</p>
              <p className="text-white/70 text-sm">Managing Alberta's power grid 24/7/365</p>
            </div>
          </div>

          <AESODeepDive title="A Brief History of Alberta's Deregulated Market">
            <div className="space-y-6">
              {historyTimeline.map((event, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-16 h-8 rounded-lg bg-[hsl(var(--watt-bitcoin)/0.1)] flex items-center justify-center">
                    <span className="text-sm font-bold text-[hsl(var(--watt-bitcoin))]">{event.year}</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">{event.title}</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AESODeepDive>
        </div>

        {/* Right - Responsibilities */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-6">AESO's Key Responsibilities</h3>
          <div className="space-y-4">
            {responsibilities.map((item, i) => (
              <AESOContentCard
                key={i}
                icon={item.icon}
                iconColor={item.color}
                title={item.title}
                delay={i * 0.1}
              >
                <p className="text-base leading-relaxed">{item.description}</p>
              </AESOContentCard>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <AESOKeyInsight variant="insight" className="mb-16">
        <strong>Energy-Only Market:</strong> Unlike many North American markets that pay generators for both capacity (being available) and energy (actually producing), 
        Alberta's market only pays for energy delivered. This creates <strong>significant price volatility</strong> — prices can range from -$60/MWh to $999.99/MWh in a single day. 
        For flexible loads like Bitcoin mining, this volatility creates massive profit opportunities through strategic load management.
      </AESOKeyInsight>

      {/* ISO Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h3 className="text-xl font-bold text-foreground text-center mb-6 flex items-center justify-center gap-2">
          <Globe className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
          How AESO Compares to Other ISOs
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full bg-card rounded-xl border border-border overflow-hidden">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">ISO/Market</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Market Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Pricing Model</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Market Size</th>
              </tr>
            </thead>
            <tbody>
              {isoComparison.map((iso, i) => (
                <tr key={i} className={`border-t border-border ${iso.highlight ? 'bg-[hsl(var(--watt-bitcoin)/0.05)]' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {iso.highlight && <span className="inline-block w-2 h-2 bg-[hsl(var(--watt-bitcoin))] rounded-full mr-2" />}
                    {iso.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{iso.type}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{iso.pricing}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{iso.marketSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          AESO's single pool price creates transparency — every generator receives the same market-clearing price each hour.
        </p>
      </motion.div>

      {/* Expert Quote */}
      <AESOQuote
        quote="Alberta's deregulated electricity market is unique in North America. The energy-only design, combined with no capacity payments, creates a market where only the most efficient and flexible operators thrive."
        author="Mike Law"
        role="President & CEO, AESO"
        source="AESO 2024 Market Update"
        className="mb-12"
      />

      {/* Data Source Badge */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--watt-success)/0.1)] border border-[hsl(var(--watt-success)/0.2)] text-xs text-[hsl(var(--watt-success))]">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-success))]"></span>
          Statistics from AESO 2024 Annual Report & Market Participant Registry
        </span>
      </div>
      
      <SectionSummary
        takeaways={[
          "AESO operates Alberta's wholesale electricity market — North America's only fully deregulated market with energy-only pricing",
          "Single pool price creates transparency: all generators receive the same hourly market-clearing price, determined by the marginal generator",
          "Energy-only market (no capacity payments) means price volatility from -$60 to $999/MWh creates both risks and opportunities",
          "260+ market participants trade on a grid with 12,500 MW peak demand and 26,000+ km of transmission lines"
        ]}
        proTip="AESO's energy-only market makes strategic load management highly profitable. Unlike capacity markets where you pay for availability, here you only pay for energy consumed — and can be paid to consume during negative price events."
        nextSteps={[
          { title: "Pool Pricing", href: "/aeso-101#pool-pricing" },
          { title: "Rate 65 Explained", href: "/aeso-101#rate-65" }
        ]}
      />
    </AESOSectionWrapper>
  );
};
