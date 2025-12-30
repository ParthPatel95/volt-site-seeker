import { useState } from 'react';
import { Zap, DollarSign, Clock, CheckCircle, AlertTriangle, TrendingUp, Battery, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import CaseStudy from '@/components/academy/CaseStudy';
import {
  AESOSectionWrapper,
  AESOSectionHeader,
  AESOContentCard,
  AESOKeyInsight,
  AESOStepByStep,
} from './shared';

const reserveTypes = [
  {
    name: 'Regulating Reserve',
    icon: Zap,
    response: '< 10 seconds',
    duration: 'Continuous',
    minSize: '1 MW',
    revenue: '$15-40/MW/hour',
    description: 'Automatic response to second-by-second frequency deviations. AGC-controlled for instant grid balancing.',
    requirements: ['AGC-capable control system', 'Automatic response to AESO signals', 'Continuous ramping ability'],
    color: 'bg-[hsl(var(--watt-trust))]',
    miningFit: 'Ideal for operations with automated load shedding. Highest revenue but requires AGC integration and fast response.',
  },
  {
    name: 'Spinning Reserve',
    icon: Battery,
    response: '< 10 minutes',
    duration: '60 minutes',
    minSize: '5 MW',
    revenue: '$5-20/MW/hour',
    description: 'Synchronized generation or load ready to ramp immediately on dispatch signal from AESO.',
    requirements: ['Online & synchronized to grid', 'Manual dispatch response', 'Quick ramp capability'],
    color: 'bg-[hsl(var(--watt-success))]',
    miningFit: 'Good fit for most mining operations. Manual dispatch allows planned curtailment with advance notice.',
  },
  {
    name: 'Supplemental Reserve',
    icon: Clock,
    response: '< 10 minutes',
    duration: '60 minutes',
    minSize: '5 MW',
    revenue: '$3-15/MW/hour',
    description: 'Offline generation that can start quickly, or interruptible load that can curtail on demand.',
    requirements: ['Quick start capability', 'Not synchronized (can be offline)', 'Interruptible load eligible'],
    color: 'bg-[hsl(var(--watt-bitcoin))]',
    miningFit: 'Easiest entry point for Bitcoin miners. Treat mining as interruptible load that can shut down within 10 minutes.',
  }
];

const loadParticipationSteps = [
  { 
    title: 'Pre-Qualification', 
    description: 'Submit application to AESO demonstrating load curtailment capability, metering accuracy, and financial standing.',
  },
  { 
    title: 'Metering Upgrade', 
    description: 'Install AESO-approved interval metering with real-time telemetry (< 4 second intervals) for accurate measurement.',
  },
  { 
    title: 'Communication Setup', 
    description: 'Establish secure communication link to AESO Energy Trading System (ETS) for receiving dispatch signals.',
  },
  { 
    title: 'Testing & Certification', 
    description: 'Complete performance tests demonstrating response time, sustained curtailment, and communication reliability.',
  },
  { 
    title: 'Market Participation', 
    description: 'Submit offers into Operating Reserve market, receive dispatch signals, and earn standby + activation revenue.',
  },
];

export const AncillaryServicesSection = () => {
  const [selectedReserve, setSelectedReserve] = useState(0);
  const [participationMW, setParticipationMW] = useState(10);
  const [hoursPerMonth, setHoursPerMonth] = useState(500);

  // Revenue calculator
  const calculateRevenue = () => {
    const avgRate = 15; // Conservative estimate $/MW/hour
    const monthly = participationMW * hoursPerMonth * avgRate;
    const annual = monthly * 12;
    return { monthly, annual };
  };

  const revenue = calculateRevenue();

  return (
    <AESOSectionWrapper theme="light" id="ancillary-services">
      <LearningObjectives
        objectives={[
          "Understand the three types of Operating Reserves in Alberta",
          "Learn how flexible loads can participate and earn revenue",
          "Calculate potential ancillary service revenue for your operation",
          "Know the qualification requirements and timeline"
        ]}
        estimatedTime="12 min"
        prerequisites={[
          { title: "Pool Pricing", href: "/aeso-101#pool-pricing" },
          { title: "Grid Operations", href: "/aeso-101#grid-operations" }
        ]}
      />

      {/* Header */}
      <AESOSectionHeader
        badge="Revenue Opportunity"
        badgeIcon={Zap}
        title="Ancillary Services & Operating Reserves"
        description="Beyond energy arbitrage, flexible loads can earn additional revenue by providing grid stability services. Bitcoin mining's instant on/off capability is perfectly suited for reserve markets."
      />

      {/* Reserve Types */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Battery className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
          Types of Operating Reserves
        </h3>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {reserveTypes.map((reserve, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedReserve(index)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedReserve === index
                  ? 'border-[hsl(var(--watt-bitcoin))] bg-[hsl(var(--watt-bitcoin)/0.05)] shadow-lg'
                  : 'border-border bg-card hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${reserve.color} flex items-center justify-center mb-4`}>
                <reserve.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">{reserve.name}</h4>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{reserve.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-medium text-foreground">{reserve.response}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{reserve.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min Size</span>
                  <span className="font-medium text-foreground">{reserve.minSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-bold text-[hsl(var(--watt-success))]">{reserve.revenue}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Reserve Details */}
        <AESOContentCard>
          <h4 className="font-bold text-foreground mb-4">{reserveTypes[selectedReserve].name} — Details</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Technical Requirements</p>
              <ul className="space-y-2">
                {reserveTypes[selectedReserve].requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-[hsl(var(--watt-success))] flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <AESOKeyInsight variant="pro-tip" title="Best For Bitcoin Mining">
              {reserveTypes[selectedReserve].miningFit}
            </AESOKeyInsight>
          </div>
        </AESOContentCard>
      </div>

      {/* Revenue Calculator */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] text-white"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            Revenue Calculator
          </h3>

          <div className="space-y-6">
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Curtailable Capacity: <span className="text-[hsl(var(--watt-bitcoin))]">{participationMW} MW</span>
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={participationMW}
                onChange={(e) => setParticipationMW(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
              />
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>5 MW</span>
                <span>100 MW</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Participation Hours/Month: <span className="text-[hsl(var(--watt-bitcoin))]">{hoursPerMonth}</span>
              </label>
              <input
                type="range"
                min={100}
                max={720}
                step={20}
                value={hoursPerMonth}
                onChange={(e) => setHoursPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
              />
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>100 hrs (14%)</span>
                <span>720 hrs (100%)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/70">Monthly Revenue</p>
                <p className="text-3xl font-bold text-[hsl(var(--watt-bitcoin))]">${revenue.monthly.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Annual Revenue</p>
                <p className="text-3xl font-bold text-[hsl(var(--watt-success))]">${revenue.annual.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-white/50 mt-4">
              * Based on $15/MW/hour average. Actual rates vary by reserve type and market conditions.
            </p>
          </div>
        </motion.div>

        {/* Participation Steps */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            How to Qualify
          </h3>

          <AESOStepByStep
            title="Qualification Process (6-12 weeks total)"
            steps={loadParticipationSteps}
          />

          <AESOKeyInsight variant="warning" className="mt-6">
            <strong>Start Early:</strong> Pre-qualification can begin before your facility is fully operational. 
            The 6-12 week process runs in parallel with construction in many cases.
          </AESOKeyInsight>
        </div>
      </div>

      {/* Case Study */}
      <div className="mb-12">
        <CaseStudy
          title="Supplemental Reserve Revenue: Bitcoin Miner"
          location="Central Alberta"
          date="2024"
          capacity="20 MW Mining Operation"
          metrics={[
            { label: 'Monthly Reserve Revenue', value: '$45,000' },
            { label: 'Average Curtailment', value: '12 hrs/month' },
            { label: 'Lost Mining Revenue', value: '$8,000' },
            { label: 'Net Additional Profit', value: '$37,000/mo' }
          ]}
          whatWorked={[
            'Registered as Supplemental Reserve provider with 20 MW curtailable capacity',
            'Automated shutdown triggers from AESO dispatch signals integrated with SCADA',
            'Strategic bidding during high-price periods when reserve prices also spike',
            'Combined with 12CP avoidance for stacked benefits — one curtailment, double savings'
          ]}
          lessonsLearned={[
            'Reserve revenue is additive to energy savings, not either/or — stack the benefits',
            'Actual dispatch is rare (< 1% of hours) but standby payments are reliable income',
            'Integration cost was <$50K — paid back in under 2 months of reserve payments',
            'Must maintain 95%+ response compliance or face penalties that wipe out gains'
          ]}
          proTip="Stack ancillary services with 12CP optimization. During system peaks, both reserve prices AND 12CP stakes are highest — curtailing once captures both benefits."
        />
      </div>

      {/* Important Considerations */}
      <AESOContentCard className="mb-12">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-[hsl(var(--watt-trust))]" />
          Important Considerations
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Compliance Requirements</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                Must respond to dispatch within specified time (10 min for most reserves)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                Maintain 95%+ availability during committed hours
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                Real-time telemetry must report accurate load data to AESO
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                Non-compliance results in financial penalties that can exceed revenue
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Strategic Considerations</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                Reserve prices correlate with energy prices — high value during tight supply
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                Can withdraw from market during profitable mining windows (BTC price high)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                Actual dispatch events are rare — mostly collect standby payments for availability
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                Combine with PPA strategy to maximize value from your flexible load
              </li>
            </ul>
          </div>
        </div>
      </AESOContentCard>

      <SectionSummary
        takeaways={[
          "Operating reserves = getting paid to be available to curtail, plus additional payment if actually dispatched",
          "Supplemental Reserve is the easiest entry point for Bitcoin miners — treat mining as interruptible load",
          "Revenue is additive to energy savings and 12CP benefits — stack multiple value streams",
          "Actual dispatch is rare (<1% of hours) but standby payments provide reliable monthly income"
        ]}
        proTip="A 20 MW mining operation earning $45K/month in reserve payments while only curtailing 12 hours equals $37K/month net profit after accounting for lost mining revenue. That's $444K/year of additional income for being flexible."
        nextSteps={[
          { title: "Power Purchase Agreements", href: "/aeso-101#ppas" },
          { title: "Grid Operations", href: "/aeso-101#grid-operations" }
        ]}
      />
    </AESOSectionWrapper>
  );
};
