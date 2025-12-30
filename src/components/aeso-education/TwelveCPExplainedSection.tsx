import { useState, useEffect, useRef } from 'react';
import { PiggyBank, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import ProgressiveDisclosure from '@/components/academy/ProgressiveDisclosure';
import TwelveCPCalculator from './TwelveCPCalculator';
import {
  AESOSectionWrapper,
  AESOSectionHeader,
  AESOContentCard,
  AESOKeyInsight,
  AESODeepDive,
  AESOStepByStep,
} from './shared';

const monthlyPeaks = [
  { month: 'Jan', typicalHour: '17:00-18:00', typicalTemp: '-25°C', risk: 'high' },
  { month: 'Feb', typicalHour: '17:00-18:00', typicalTemp: '-20°C', risk: 'high' },
  { month: 'Mar', typicalHour: '18:00-19:00', typicalTemp: '-5°C', risk: 'medium' },
  { month: 'Apr', typicalHour: '19:00-20:00', typicalTemp: '5°C', risk: 'low' },
  { month: 'May', typicalHour: '19:00-20:00', typicalTemp: '15°C', risk: 'low' },
  { month: 'Jun', typicalHour: '15:00-16:00', typicalTemp: '28°C', risk: 'medium' },
  { month: 'Jul', typicalHour: '15:00-16:00', typicalTemp: '30°C', risk: 'medium' },
  { month: 'Aug', typicalHour: '15:00-16:00', typicalTemp: '28°C', risk: 'medium' },
  { month: 'Sep', typicalHour: '18:00-19:00', typicalTemp: '15°C', risk: 'low' },
  { month: 'Oct', typicalHour: '17:00-18:00', typicalTemp: '5°C', risk: 'medium' },
  { month: 'Nov', typicalHour: '17:00-18:00', typicalTemp: '-10°C', risk: 'high' },
  { month: 'Dec', typicalHour: '17:00-18:00', typicalTemp: '-20°C', risk: 'high' },
];

const howItWorksSteps = [
  {
    title: 'AESO Identifies Monthly Peak',
    description: 'At the end of each month, AESO determines the single hour when provincial demand was highest. This is done retroactively — you don\'t know the peak until after it happens.',
  },
  {
    title: 'Your Load is Measured',
    description: 'Your facility\'s electricity consumption during that peak hour is recorded via interval metering. This becomes your "coincident peak" contribution for that month.',
  },
  {
    title: '12 Monthly Values are Summed',
    description: 'Your 12 monthly coincident peak values are added together. This total determines your share of the ~$2.3B annual transmission cost allocation.',
  },
  {
    title: 'Transmission Bill Calculated',
    description: 'Your transmission charges are based on your percentage of the total system peak. If you reduce your load during peaks, you reduce your transmission bill proportionally.',
  },
];

export const TwelveCPExplainedSection = () => {
  const [facilityMW, setFacilityMW] = useState(135);
  const [avoidedPeaks, setAvoidedPeaks] = useState(12);

  // Calculations
  const transmissionAdder = 11.73; // CAD per MWh
  const hoursPerYear = 8760;
  const baseTransmissionCost = facilityMW * transmissionAdder * hoursPerYear;
  const reductionPercent = (avoidedPeaks / 12) * 100;
  const annualSavings = baseTransmissionCost * (reductionPercent / 100);

  return (
    <AESOSectionWrapper theme="light" id="twelve-cp">
      <LearningObjectives
        objectives={[
          "Understand how 12CP (12 Coincident Peak) billing determines transmission costs",
          "Learn which months and times are highest risk for peak events",
          "Calculate potential savings from strategic peak avoidance",
          "Know the challenge: peaks are announced retroactively, requiring predictive forecasting"
        ]}
        estimatedTime="8 min"
        prerequisites={[
          { title: "Pool Pricing", href: "/aeso-101#pool-pricing" }
        ]}
      />
      
      {/* Header */}
      <AESOSectionHeader
        badge="Cost Reduction Strategy"
        badgeIcon={PiggyBank}
        title="Understanding 12CP (12 Coincident Peak)"
        description="The single most impactful cost-saving opportunity for large industrial loads in Alberta. Avoid the 12 monthly system peaks and eliminate up to 100% of transmission costs."
      />

      {/* Progressive Disclosure Content */}
      <ProgressiveDisclosure
        basicContent={
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                What is 12CP?
              </h3>
              
              <div className="space-y-4 mb-6">
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">12CP (12 Coincident Peak)</strong> is how AESO allocates transmission costs 
                  among industrial consumers. Your share of the ~$2.3B annual transmission cost is based on your demand 
                  during the 12 monthly system peaks — not your total consumption.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Each month, AESO identifies the single hour when provincial demand is highest. Your load during 
                  that hour determines your transmission bill for the entire year. <strong className="text-foreground">This means 12 hours of strategic curtailment 
                  can eliminate 100% of your transmission costs.</strong>
                </p>
              </div>

              {/* Key Points */}
              <div className="space-y-3">
                {[
                  'Each of the 12 monthly peaks contributes ~8.33% to your transmission bill',
                  'Avoiding ALL 12 peaks = up to 100% transmission cost reduction',
                  'Even partial reduction (avoiding 6 peaks) = ~50% savings',
                  "Bitcoin mining's instant on/off capability is IDEAL for 12CP avoidance",
                ].map((point, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--watt-success)/0.1)] border border-[hsl(var(--watt-success)/0.2)]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[hsl(var(--watt-success))] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{point}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Calendar Heat Map */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                When Do Peaks Typically Occur?
              </h3>
              
              <div className="grid grid-cols-4 gap-2 mb-6">
                {monthlyPeaks.map((peak, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
                      peak.risk === 'high' 
                        ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700' 
                        : peak.risk === 'medium'
                          ? 'bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700'
                          : 'bg-[hsl(var(--watt-success)/0.1)] border border-[hsl(var(--watt-success)/0.3)]'
                    }`}
                  >
                    <p className="font-bold text-foreground text-sm">{peak.month}</p>
                    <p className="text-xs text-muted-foreground">{peak.typicalHour}</p>
                    <p className="text-xs text-muted-foreground/70">{peak.typicalTemp}</p>
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-800 border border-red-400 dark:border-red-600" />
                  <span className="text-xs text-muted-foreground">High Risk (Winter)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-200 dark:bg-amber-800 border border-amber-400 dark:border-amber-600" />
                  <span className="text-xs text-muted-foreground">Medium (Shoulder)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--watt-success)/0.2)] border border-[hsl(var(--watt-success)/0.4)]" />
                  <span className="text-xs text-muted-foreground">Low Risk</span>
                </div>
              </div>

              {/* How It Works */}
              <AESOStepByStep
                title="How 12CP Billing Works"
                steps={howItWorksSteps}
              />
            </div>
          </div>
        }
        intermediateContent={
          <div className="space-y-8">
            <TwelveCPCalculator />
          </div>
        }
        expertContent={
          <div className="space-y-6">
            <AESODeepDive title="Technical Details: 12CP Allocation Formula" defaultOpen>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Formula:</strong> Your annual transmission allocation = 
                  (Sum of your loads during each monthly peak ÷ Sum of all system peaks) × Total transmission revenue requirement (~$2.3B)
                </p>
                <p>
                  <strong className="text-foreground">2024 Transmission Adder:</strong> $11.73 CAD/MWh — applied to all consumed energy, 
                  but reducible through 12CP avoidance. This adder funds the provincial transmission infrastructure.
                </p>
                <p>
                  <strong className="text-foreground">Peak Identification:</strong> AESO determines peaks retroactively at month-end. 
                  The peak hour is typically 5-6 PM in winter (heating + lighting demand) or 3-4 PM in summer (AC demand).
                </p>
                <p>
                  <strong className="text-foreground">Prediction Challenge:</strong> Since peaks are announced after they occur, 
                  successful 12CP avoidance requires predictive forecasting. VoltScout uses ML models trained on weather, 
                  historical patterns, and real-time grid data to predict peak events with 85%+ accuracy.
                </p>
              </div>
            </AESODeepDive>
          </div>
        }
        labels={{
          basic: 'Overview',
          intermediate: 'Calculator',
          expert: 'Technical'
        }}
      />

      {/* Inline Savings Calculator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-8 rounded-2xl bg-gradient-to-br from-[hsl(var(--watt-success)/0.1)] to-[hsl(var(--watt-success)/0.05)] border border-[hsl(var(--watt-success)/0.2)] mb-12"
      >
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <PiggyBank className="w-6 h-6 text-[hsl(var(--watt-success))]" />
          Quick Savings Estimate
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Facility Size: <span className="text-[hsl(var(--watt-bitcoin))]">{facilityMW} MW</span>
              </label>
              <input
                type="range"
                min={10}
                max={500}
                step={5}
                value={facilityMW}
                onChange={(e) => setFacilityMW(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-success))]"
              />
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">10 MW</span>
                <span className="text-muted-foreground">500 MW</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Peaks Avoided: <span className="text-[hsl(var(--watt-bitcoin))]">{avoidedPeaks} / 12</span>
              </label>
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={avoidedPeaks}
                onChange={(e) => setAvoidedPeaks(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-success))]"
              />
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">0 peaks</span>
                <span className="text-muted-foreground">12 peaks (all)</span>
              </div>
            </div>

            {/* WattByte Reference */}
            <AESOKeyInsight variant="pro-tip">
              <strong>WattByte's 135MW Alberta Heartland:</strong> By avoiding all 12 peaks 
              (shutting down ~12 hours/year total), we can save up to 
              <span className="font-bold text-[hsl(var(--watt-bitcoin))]"> ${(135 * 11.73 * 8760 / 1000000).toFixed(1)}M/year</span> 
              in transmission costs.
            </AESOKeyInsight>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <AESOContentCard hover={false} className="p-5">
              <p className="text-sm text-muted-foreground mb-1">Base Transmission Cost</p>
              <p className="text-2xl font-bold text-foreground">
                ${(baseTransmissionCost / 1000000).toFixed(2)}M <span className="text-sm text-muted-foreground">CAD/year</span>
              </p>
            </AESOContentCard>

            <AESOContentCard hover={false} className="p-5">
              <p className="text-sm text-muted-foreground mb-1">Transmission Reduction</p>
              <p className="text-2xl font-bold text-[hsl(var(--watt-success))]">
                {reductionPercent.toFixed(0)}%
              </p>
            </AESOContentCard>

            <div className="p-5 rounded-xl bg-gradient-to-r from-[hsl(var(--watt-success))] to-emerald-500 text-white">
              <p className="text-sm text-white/70 mb-1">Annual Savings</p>
              <p className="text-4xl font-bold">
                ${(annualSavings / 1000000).toFixed(2)}M
              </p>
              <p className="text-sm text-white/80 mt-2">
                By curtailing for just {avoidedPeaks} hour{avoidedPeaks !== 1 ? 's' : ''}/year
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Warning */}
      <AESOKeyInsight variant="warning" title="Prediction is the Key Challenge" className="mb-12">
        AESO announces peaks <strong>retroactively</strong> — you don't know when they occurred until after the month ends. 
        This means successful 12CP avoidance requires <strong>predictive forecasting</strong>. VoltScout's ML models 
        analyze weather forecasts, historical patterns, and real-time grid data to predict peak events before they happen.
      </AESOKeyInsight>
      
      <SectionSummary
        takeaways={[
          "12CP = your transmission costs are based on usage during the 12 monthly system peaks, not total consumption",
          "Avoid all 12 peaks = up to 100% transmission cost reduction (worth $13M+/year for a 135MW facility)",
          "High-risk months: Jan, Feb, Nov, Dec (cold snaps at 5-6 PM); Jun-Aug (afternoon AC demand at 3-4 PM)",
          "Key challenge: AESO announces peaks retroactively — you need predictive forecasting to know when to curtail"
        ]}
        proTip="For a 135MW facility, perfect 12CP avoidance can save $13M+ annually in transmission charges. Even 80% success rate yields massive savings — and you only need to curtail for ~12 hours total per year."
        nextSteps={[
          { title: "Rate 65", href: "/aeso-101#rate-65" },
          { title: "VoltScout Forecasting", href: "/app" }
        ]}
      />
    </AESOSectionWrapper>
  );
};
