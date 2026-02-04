import { useState } from 'react';
import { Zap, DollarSign, TrendingDown, Shield, Scale, CheckCircle, Calculator, FileText, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AESOSectionWrapper, 
  AESOSectionHeader, 
  AESOContentCard, 
  AESOKeyInsight,
  AESODeepDive,
  AESOStepByStep
} from './shared';
import { FORTISALBERTA_RATE_65_2026 } from '@/constants/tariff-rates';

const benefits = [
  {
    icon: TrendingDown,
    title: 'Bypass Distribution',
    description: 'Eliminate ~$26/MWh in distribution charges by connecting directly to the transmission grid',
    savings: 'Up to 90% lower delivery costs',
    color: 'hsl(var(--watt-success))'
  },
  {
    icon: Zap,
    title: 'Direct Pool Access',
    description: 'As a Self-Retailer, access wholesale pool prices without retailer markup or hedging premiums',
    savings: 'Real-time market pricing',
    color: 'hsl(var(--watt-bitcoin))'
  },
  {
    icon: DollarSign,
    title: '12CP Optimization',
    description: 'Full transmission cost reduction through strategic peak avoidance during coincident peaks',
    savings: 'Up to 85% transmission savings',
    color: 'hsl(var(--watt-trust))'
  },
  {
    icon: Calculator,
    title: 'Demand-Based Billing',
    description: `Predictable $${FORTISALBERTA_RATE_65_2026.DEMAND_CHARGE_KW_MONTH}/kW/month demand charge instead of volatile volumetric rates`,
    savings: 'Budget certainty',
    color: 'hsl(var(--watt-navy))'
  },
  {
    icon: Shield,
    title: 'Power Quality',
    description: 'Direct transmission connection provides higher reliability and fewer voltage fluctuations',
    savings: '99.99% grid reliability',
    color: 'hsl(var(--watt-success))'
  },
  {
    icon: Scale,
    title: 'Unlimited Scalability',
    description: 'No upper limit on capacity — scale from 5MW to 500MW+ without changing rate structure',
    savings: 'Future-proof infrastructure',
    color: 'hsl(var(--watt-bitcoin))'
  }
];

const rateComparison = [
  {
    rate: 'Rate 11',
    type: 'Residential',
    delivery: '$45-55/MWh',
    transmission: 'Bundled',
    distribution: 'Bundled',
    eligible12CP: false,
    selfRetailer: false,
    minLoad: '< 1 MW',
    highlight: false
  },
  {
    rate: 'Rate 63',
    type: 'Large General Service',
    delivery: '$25-35/MWh',
    transmission: '~$15/MWh',
    distribution: '~$15/MWh',
    eligible12CP: 'Limited',
    selfRetailer: 'Possible',
    minLoad: '> 150 kW',
    highlight: false
  },
  {
    rate: 'Rate 65',
    type: 'Transmission Connected',
    delivery: '$2-5/MWh',
    transmission: '~$1.50/MWh',
    distribution: 'Bypassed',
    eligible12CP: true,
    selfRetailer: true,
    minLoad: '> 5 MW',
    highlight: true
  }
];

export const Rate65ExplainedSection = () => {
  const [facilityMW, setFacilityMW] = useState(50);
  const [hoursPerYear, setHoursPerYear] = useState(8000);
  const [capacityFactor, setCapacityFactor] = useState(90);

  const annualMWh = facilityMW * hoursPerYear * (capacityFactor / 100);
  const rate63Cost = annualMWh * 30;
  const rate65Cost = annualMWh * 3.5;
  const annualSavings = rate63Cost - rate65Cost;
  const savingsPercent = ((annualSavings / rate63Cost) * 100).toFixed(0);

  return (
    <AESOSectionWrapper theme="gradient" id="rate-65">
      <AESOSectionHeader
        badge="FortisAlberta Transmission Connected Service"
        badgeIcon={FileText}
        title="Rate 65: The Industrial Advantage"
        description="For large industrial loads, connecting directly to the transmission grid via Rate 65 unlocks massive savings by bypassing distribution infrastructure entirely."
        theme="light"
        align="center"
      />

      {/* What is Rate 65 Deep Dive */}
      <div className="mb-12">
        <AESODeepDive title="What is Rate 65 and Why Does It Matter?" defaultOpen>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">Rate 65</strong> is FortisAlberta's tariff for customers who 
              connect directly to the transmission grid, bypassing the distribution network entirely. This is 
              how large industrial facilities like data centers, mining operations, and manufacturing plants 
              dramatically reduce their electricity delivery costs.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-foreground mb-3">Transmission vs Distribution Connected</h4>
                <p className="text-sm mb-4">
                  Most commercial customers connect to the <strong>distribution grid</strong> (lower voltage, 
                  local utility infrastructure). Rate 65 customers connect directly to the <strong>transmission 
                  grid</strong> (high voltage, provincial backbone).
                </p>
                <div className="space-y-2">
                  {[
                    { voltage: '240 kV', label: 'Bulk Transmission', opacity: 20 },
                    { voltage: '138 kV', label: 'Regional Transmission', opacity: 40 },
                    { voltage: '69 kV', label: 'Sub-Transmission', opacity: 60 },
                    { voltage: '25 kV', label: 'Rate 65 Minimum', opacity: 80 },
                  ].map((level, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-16 font-medium text-foreground">{level.voltage}</span>
                      <div 
                        className="flex-1 h-3 rounded" 
                        style={{ backgroundColor: `hsl(var(--watt-bitcoin) / ${level.opacity / 100})` }}
                      />
                      <span className="text-muted-foreground text-xs">{level.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-foreground mb-3">Eligibility Requirements</h4>
                <ul className="space-y-3">
                  {[
                    { requirement: '5 MW+ load', detail: 'Minimum demand to justify transmission connection' },
                    { requirement: 'Own substation infrastructure', detail: 'Customer provides transformers, switchgear' },
                    { requirement: 'Direct transmission tap', detail: 'Physical connection to transmission line' },
                    { requirement: 'AESO compliance', detail: 'Meet Facility Technical Requirements' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[hsl(var(--watt-success))] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">{item.requirement}</span>
                        <span className="text-muted-foreground text-sm"> — {item.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AESODeepDive>
      </div>

      {/* Rate Comparison Table */}
      <div className="mb-12">
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">Rate Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[hsl(var(--watt-navy))] text-white">
                <th className="p-4 text-left rounded-tl-lg">Rate</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Delivery Cost</th>
                <th className="p-4 text-left">Min Load</th>
                <th className="p-4 text-center">12CP Eligible</th>
                <th className="p-4 text-center rounded-tr-lg">Self-Retailer</th>
              </tr>
            </thead>
            <tbody>
              {rateComparison.map((rate, idx) => (
                <tr 
                  key={rate.rate}
                  className={`border-b border-border ${
                    rate.highlight 
                      ? 'bg-[hsl(var(--watt-bitcoin)/0.05)]' 
                      : idx % 2 === 0 ? 'bg-card' : 'bg-muted/50'
                  }`}
                >
                  <td className="p-4">
                    <span className={rate.highlight ? 'text-[hsl(var(--watt-bitcoin))] font-bold' : 'text-foreground'}>
                      {rate.rate}
                    </span>
                    {rate.highlight && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-[hsl(var(--watt-bitcoin))] text-white">
                        Best Value
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">{rate.type}</td>
                  <td className="p-4">
                    <span className={rate.highlight ? 'text-[hsl(var(--watt-success))] font-bold' : 'text-foreground'}>
                      {rate.delivery}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{rate.minLoad}</td>
                  <td className="p-4 text-center">
                    {rate.eligible12CP === true ? (
                      <CheckCircle className="w-5 h-5 text-[hsl(var(--watt-success))] mx-auto" />
                    ) : rate.eligible12CP === 'Limited' ? (
                      <span className="text-[hsl(var(--watt-bitcoin))] text-sm">Limited</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {rate.selfRetailer === true ? (
                      <CheckCircle className="w-5 h-5 text-[hsl(var(--watt-success))] mx-auto" />
                    ) : rate.selfRetailer === 'Possible' ? (
                      <span className="text-[hsl(var(--watt-bitcoin))] text-sm">Possible</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-2 text-center">
          Based on FortisAlberta July 2025 Rate Schedule | Rates effective {FORTISALBERTA_RATE_65_2026.effectiveDate} | Actual costs vary by usage profile
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="mb-12">
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">Key Benefits of Rate 65</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-5 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${benefit.color}15` }}
                >
                  <benefit.icon className="w-5 h-5" style={{ color: benefit.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{benefit.description}</p>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-[hsl(var(--watt-success)/0.1)] text-[hsl(var(--watt-success))] border border-[hsl(var(--watt-success)/0.2)]">
                    {benefit.savings}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive Savings Calculator */}
      <div className="mb-12">
        <div className="rounded-2xl overflow-hidden border border-[hsl(var(--watt-bitcoin)/0.2)] shadow-lg">
          <div className="p-4 bg-gradient-to-r from-[hsl(var(--watt-bitcoin))] to-[hsl(var(--watt-bitcoin)/0.8)] text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Rate 65 Savings Calculator
            </h3>
          </div>
          <div className="p-6 bg-card">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-foreground font-medium mb-2 block">
                    Facility Size: <span className="text-[hsl(var(--watt-bitcoin))] font-bold">{facilityMW} MW</span>
                  </label>
                  <input
                    type="range"
                    value={facilityMW}
                    onChange={(e) => setFacilityMW(Number(e.target.value))}
                    min={5}
                    max={500}
                    step={5}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/50 mt-1">
                    <span>5 MW</span>
                    <span>500 MW</span>
                  </div>
                </div>

                <div>
                  <label className="text-foreground font-medium mb-2 block">
                    Operating Hours/Year: <span className="text-[hsl(var(--watt-bitcoin))] font-bold">{hoursPerYear.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    value={hoursPerYear}
                    onChange={(e) => setHoursPerYear(Number(e.target.value))}
                    min={2000}
                    max={8760}
                    step={100}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/50 mt-1">
                    <span>2,000 hrs</span>
                    <span>8,760 hrs (24/7)</span>
                  </div>
                </div>

                <div>
                  <label className="text-foreground font-medium mb-2 block">
                    Capacity Factor: <span className="text-[hsl(var(--watt-bitcoin))] font-bold">{capacityFactor}%</span>
                  </label>
                  <input
                    type="range"
                    value={capacityFactor}
                    onChange={(e) => setCapacityFactor(Number(e.target.value))}
                    min={50}
                    max={100}
                    step={5}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/50 mt-1">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--watt-success)/0.1)] to-[hsl(var(--watt-success)/0.05)] border border-[hsl(var(--watt-success)/0.3)]">
                  <p className="text-sm text-muted-foreground mb-2">Annual Delivery Cost Savings</p>
                  <p className="text-4xl font-bold text-[hsl(var(--watt-success))] mb-2">
                    ${(annualSavings / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {savingsPercent}% reduction vs Rate 63
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-[hsl(var(--watt-success)/0.2)] space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate 63 Cost:</span>
                      <span className="text-foreground">${(rate63Cost / 1000000).toFixed(2)}M/year</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate 65 Cost:</span>
                      <span className="text-[hsl(var(--watt-success))]">${(rate65Cost / 1000000).toFixed(2)}M/year</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Process */}
      <AESOStepByStep
        title="Rate 65 Connection Process"
        theme="light"
        steps={[
          {
            title: 'Submit System Access Service Request (SASR) to AESO',
            description: 'Begin the formal interconnection process by submitting your application to AESO. Include preliminary single-line diagrams, expected load profile, and timeline.'
          },
          {
            title: 'Complete Facility Technical Requirements Assessment',
            description: 'AESO evaluates your facility design against their technical standards. This includes protection systems, metering requirements, and grid impact studies.'
          },
          {
            title: 'Coordinate with Transmission Facility Owner (TFO)',
            description: 'Work with the TFO (usually AltaLink or ATCO Electric) to design the physical connection point and agree on construction responsibilities.'
          },
          {
            title: 'Apply for Rate 65 with FortisAlberta',
            description: 'Submit formal application including single-line diagrams, facility specifications, and connection cost estimates. Finalize Distribution Connection Agreement.'
          },
          {
            title: 'Construction & Commissioning',
            description: 'Build your customer-owned substation infrastructure. Complete testing and commissioning in coordination with TFO and AESO before energization.'
          }
        ]}
      />

      {/* Timeline Note */}
      <AESOKeyInsight variant="info" title="Typical Timeline: 12-24 Months" theme="light" className="mt-8 mb-12">
        <p>
          Plan for a <strong>12-24 month timeline</strong> from initial application to energization for greenfield sites. 
          Brownfield sites with existing infrastructure may be faster. Key timeline components:
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Initial application & feasibility: 2-3 months</li>
          <li>• Engineering & design: 6-9 months</li>
          <li>• Construction & commissioning: 6-12 months</li>
        </ul>
      </AESOKeyInsight>

      {/* Pro Tip */}
      <AESOKeyInsight variant="pro-tip" title="Pro Tip: Combine Rate 65 with Self-Retailer Status" theme="light">
        <p>
          Rate 65 unlocks <strong>delivery cost savings</strong>, but combining it with <strong>Self-Retailer status</strong> 
          unlocks the full potential: direct pool access eliminates retailer margins (typically $3-8/MWh), and 
          12CP optimization can reduce transmission costs by up to 85%. A 50MW facility can save $5-10M+ annually.
        </p>
      </AESOKeyInsight>

      {/* Data Source */}
      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-bitcoin))]"></span>
          Based on FortisAlberta 2024 Approved Rate Schedule and AESO Interconnection Guidelines
        </span>
      </div>
    </AESOSectionWrapper>
  );
};
