import { useState } from 'react';
import { Building2, Factory, Users, Zap, ShieldCheck, Home, ArrowRight, CheckCircle2, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AESOSectionWrapper,
  AESOSectionHeader,
  AESOContentCard,
  AESOKeyInsight,
} from './shared';

const participantTypes = [
  {
    id: 'self-retailer',
    icon: Factory,
    title: 'Self-Retailer',
    subtitle: 'Direct Market Access',
    color: 'hsl(var(--watt-bitcoin))',
    gradient: 'from-[hsl(var(--watt-bitcoin))] to-amber-500',
    description: 'Industrial customers who purchase electricity directly from the wholesale pool market, bypassing traditional retailers. This provides maximum cost savings and market visibility for flexible operations.',
    requirements: [
      'Register with AESO as a market participant',
      'Meet financial security requirements (~$500K+ based on load)',
      'Install AESO-approved interval metering (5-minute)',
      'Establish settlement accounts with AESO',
      'Manage own load forecasting and scheduling',
    ],
    benefits: [
      'Direct pool price access — no retailer markup (saves 5-15%)',
      'Full visibility into real-time pricing for optimization',
      'Participate in demand response and ancillary services',
      'Access to 12CP transmission cost optimization',
      'Complete control over energy procurement strategy',
    ],
    risks: [
      'Full exposure to pool price volatility ($0-999/MWh range)',
      'Must manage own price risk or hedge externally',
      'Administrative burden of market participation',
      'Requires sophisticated energy management systems',
    ],
    example: "WattByte's 135MW Alberta Heartland facility operates as a Self-Retailer, enabling direct pool access and transmission cost optimization through strategic load curtailment — saving millions annually.",
    idealFor: 'Large industrial loads (>5 MW) with flexible operations: data centers, Bitcoin miners, industrial manufacturers, large commercial facilities',
  },
  {
    id: 'power-pool',
    icon: Zap,
    title: 'Power Pool Participant',
    subtitle: 'Generators & Importers',
    color: 'hsl(var(--watt-success))',
    gradient: 'from-[hsl(var(--watt-success))] to-emerald-500',
    description: 'Entities that generate electricity or import power into Alberta, selling into the wholesale pool. They submit hourly offers and receive the market clearing price.',
    requirements: [
      'Generation facility connected to AIES (Alberta Interconnected Electric System)',
      'AESO dispatch certification and compliance',
      'Submit hourly price/quantity offers to the market',
      'Meet reliability and operating reserve standards',
    ],
    benefits: [
      'Sell power at market-clearing price',
      'Revenue certainty available through PPAs',
      'Access to ancillary services markets (additional revenue)',
      'Renewable energy credits (RECs) eligible for green projects',
    ],
    risks: [
      'Revenue varies hourly with pool price',
      'Must dispatch when called by AESO or face penalties',
      'Subject to curtailment during oversupply (negative prices)',
    ],
    example: 'TransAlta, Capital Power, ENMAX Energy — major Alberta generators participating in the pool and providing grid reliability services.',
    idealFor: 'Power plants, wind farms, solar facilities, cogeneration units, battery storage systems',
  },
  {
    id: 'competitive-retailer',
    icon: Users,
    title: 'Competitive Retailer',
    subtitle: 'Fixed-Rate Providers',
    color: 'hsl(var(--watt-trust))',
    gradient: 'from-[hsl(var(--watt-trust))] to-indigo-500',
    description: 'Companies that purchase power from the pool and resell to end customers at fixed or variable rates. They provide price stability for customers who cannot manage pool exposure.',
    requirements: [
      'Licensed by Alberta Utilities Commission (AUC)',
      'Meet financial backing and credit requirements',
      'Maintain customer service infrastructure',
      'Operate billing and settlement systems',
    ],
    benefits: [
      'Offer customers price stability and predictability',
      'Build long-term customer relationships',
      'Provide value-added services (green energy, smart home)',
      'Recurring revenue model with customer base',
    ],
    risks: [
      'Must absorb price volatility between pool and customer rates',
      'Regulatory compliance burden from AUC',
      'Customer churn in competitive market',
    ],
    example: 'Direct Energy, EPCOR Energy, Just Energy — offer fixed-rate plans to residential and commercial customers seeking price certainty.',
    idealFor: 'Energy companies, utilities seeking market expansion, aggregators',
  },
  {
    id: 'distribution-utility',
    icon: Building2,
    title: 'Distribution Utility',
    subtitle: 'Wire Owners',
    color: 'hsl(var(--primary))',
    gradient: 'from-[hsl(var(--primary))] to-violet-500',
    description: 'Own and operate local distribution infrastructure that delivers electricity from transmission to end users. They are the "poles and wires" companies with regulated rates.',
    requirements: [
      'AUC approval and ongoing rate regulation',
      'Maintain distribution infrastructure safely',
      'Provide regulated rate option (RRO) as default service',
      'Meet reliability and safety standards',
    ],
    benefits: [
      'Regulated return on infrastructure investment',
      'Stable, predictable revenue stream',
      'Essential service monopoly in service territory',
    ],
    risks: [
      'Capital-intensive infrastructure requirements',
      'Regulatory oversight of rates and operations',
      'Must serve all customers in territory regardless of profitability',
    ],
    example: 'FortisAlberta (rural), ENMAX (Calgary), EPCOR (Edmonton), ATCO Electric — own and maintain local distribution networks.',
    idealFor: 'Existing utilities, infrastructure investors, municipalities',
  },
  {
    id: 'rro-customer',
    icon: Home,
    title: 'RRO Customer',
    subtitle: 'Default Rate Option',
    color: 'hsl(var(--muted-foreground))',
    gradient: 'from-gray-500 to-slate-500',
    description: 'Customers who have not chosen a competitive retailer receive power through the Regulated Rate Option at a floating monthly rate set by their local utility.',
    requirements: [
      'No action needed — automatic default service',
      'Billed by local distribution utility',
    ],
    benefits: [
      'No contract commitment or signup required',
      'Consumer protection regulations apply',
      'Easy to switch to competitive retailer anytime',
    ],
    risks: [
      'Exposed to monthly rate fluctuations',
      'Often higher than fixed competitive rates',
      'No price certainty for budgeting',
    ],
    example: 'Default service for residential customers: ENMAX RRO (Calgary), EPCOR RRO (Edmonton), Direct Energy RRO (ATCO territory).',
    idealFor: 'Customers who prefer no contract, renters, or those unaware of competitive options',
  },
];

export const MarketParticipantsSection = () => {
  const [selectedParticipant, setSelectedParticipant] = useState<string>('self-retailer');

  const activeParticipant = participantTypes.find(p => p.id === selectedParticipant) || participantTypes[0];

  return (
    <AESOSectionWrapper theme="gradient" id="market-participants">
      {/* Header */}
      <AESOSectionHeader
        badge="Market Structure"
        badgeIcon={Users}
        title="Market Participants & Self-Retailers"
        description="Understanding how different entities interact with Alberta's deregulated electricity market — and why Self-Retailer status is ideal for flexible industrial loads like Bitcoin mining."
      />

      {/* Market Flow Diagram */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 p-6 rounded-2xl bg-card border border-border"
      >
        <h3 className="text-lg font-bold text-foreground mb-6 text-center">How Electricity Flows Through Alberta's Market</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {[
            { label: 'Generators', desc: 'Sell power into pool', color: 'bg-[hsl(var(--watt-success)/0.1)] border-[hsl(var(--watt-success)/0.3)] text-[hsl(var(--watt-success))]' },
            { label: 'AESO Pool', desc: 'Clears at single price', color: 'bg-[hsl(var(--watt-bitcoin)/0.1)] border-[hsl(var(--watt-bitcoin)/0.3)] text-[hsl(var(--watt-bitcoin))]' },
            { label: 'Retailers / Self-Retailers', desc: 'Buy from pool', color: 'bg-[hsl(var(--watt-trust)/0.1)] border-[hsl(var(--watt-trust)/0.3)] text-[hsl(var(--watt-trust))]' },
            { label: 'Distribution', desc: 'Deliver to users', color: 'bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]' },
            { label: 'End Users', desc: 'Consume power', color: 'bg-muted border-border text-muted-foreground' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 md:gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`px-4 py-3 rounded-xl border ${step.color} text-center min-w-[100px]`}
              >
                <p className="font-semibold text-sm">{step.label}</p>
                <p className="text-xs opacity-70">{step.desc}</p>
              </motion.div>
              {i < 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <ArrowRight className="w-5 h-5 text-muted-foreground/50 hidden md:block" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Participant Type Selector */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {participantTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                onClick={() => setSelectedParticipant(type.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedParticipant === type.id
                    ? 'bg-[hsl(var(--watt-bitcoin))] text-white shadow-lg'
                    : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.title}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Participant Details */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Left - Overview */}
        <div>
          <motion.div 
            key={activeParticipant.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-2xl bg-gradient-to-br ${activeParticipant.gradient} text-white mb-6`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-white/20">
                <activeParticipant.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{activeParticipant.title}</h3>
                <p className="text-white/80">{activeParticipant.subtitle}</p>
              </div>
            </div>
            <p className="text-white/90 leading-relaxed">{activeParticipant.description}</p>
          </motion.div>

          {/* Requirements */}
          <AESOContentCard className="mb-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
              Requirements
            </h4>
            <ul className="space-y-2">
              {activeParticipant.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-[hsl(var(--watt-bitcoin))] mt-1">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </AESOContentCard>

          {/* Ideal For */}
          <div className="p-4 rounded-xl bg-[hsl(var(--watt-bitcoin)/0.1)] border border-[hsl(var(--watt-bitcoin)/0.2)]">
            <p className="text-sm">
              <span className="font-semibold text-foreground">Ideal for: </span>
              <span className="text-muted-foreground">{activeParticipant.idealFor}</span>
            </p>
          </div>
        </div>

        {/* Right - Benefits, Risks, Example */}
        <div className="space-y-4">
          {/* Benefits */}
          <AESOContentCard className="bg-[hsl(var(--watt-success)/0.05)] border-[hsl(var(--watt-success)/0.2)]">
            <h4 className="font-semibold text-[hsl(var(--watt-success))] mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Benefits
            </h4>
            <ul className="space-y-2">
              {activeParticipant.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--watt-success))] flex-shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </AESOContentCard>

          {/* Risks */}
          <AESOContentCard className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Risks & Considerations
            </h4>
            <ul className="space-y-2">
              {activeParticipant.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-amber-600 mt-1">⚠️</span>
                  {risk}
                </li>
              ))}
            </ul>
          </AESOContentCard>

          {/* Example */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] text-white">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
              Real-World Example
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">{activeParticipant.example}</p>
          </div>
        </div>
      </div>

      {/* Self-Retailer Deep Dive (always visible when selected) */}
      {selectedParticipant === 'self-retailer' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-[hsl(var(--watt-bitcoin)/0.05)] to-amber-50 dark:to-amber-950/20 border border-[hsl(var(--watt-bitcoin)/0.2)] mb-12"
        >
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Why Self-Retailer Status is Ideal for Bitcoin Mining</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <AESOContentCard icon={DollarSign} iconColor="hsl(var(--watt-bitcoin))" title="Direct Pool Access">
              <p className="text-sm leading-relaxed">
                No retailer markup — pay exactly what the market clears at. During low-price hours (often $0-30/MWh), 
                miners can run at maximum capacity for minimal cost. During negative prices, you get <strong>paid to consume</strong>.
              </p>
            </AESOContentCard>
            
            <AESOContentCard icon={Zap} iconColor="hsl(var(--watt-success))" title="12CP Optimization">
              <p className="text-sm leading-relaxed">
                By curtailing during the 12 monthly system peaks (~12 hours/year total), self-retailers can eliminate 
                up to 100% of transmission costs — worth <strong>$13M+/year for a 135MW facility</strong>.
              </p>
            </AESOContentCard>
            
            <AESOContentCard icon={TrendingUp} iconColor="hsl(var(--watt-trust))" title="Flexible Load = Profit">
              <p className="text-sm leading-relaxed">
                Bitcoin mining's instant on/off capability is perfect for pool price optimization. 
                Run at 100% during cheap hours, curtail during spikes — no production loss, just shifted timing.
              </p>
            </AESOContentCard>
          </div>

          <AESOKeyInsight variant="pro-tip" className="mt-6">
            <strong>VoltScout Advantage:</strong> Our AI platform provides 12CP predictions, real-time price alerts, 
            and automated curtailment recommendations — enabling self-retailers to maximize savings without 24/7 manual monitoring.
          </AESOKeyInsight>
        </motion.div>
      )}

      {/* Data Source Badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--watt-success)/0.1)] border border-[hsl(var(--watt-success)/0.2)] text-xs text-[hsl(var(--watt-success))]">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-success))]"></span>
          Market structure based on AESO Market Rules & AUC regulations
        </span>
      </div>
    </AESOSectionWrapper>
  );
};
