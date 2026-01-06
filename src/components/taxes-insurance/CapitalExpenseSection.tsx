import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Calculator, Server, Zap, Building, TrendingDown, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TISectionWrapper, TISectionHeader, TIContentCard, TIKeyInsight, TIDeepDive, TIStatCard } from './shared';

const ccaClasses = [
  {
    class: "Class 50",
    rate: "55%",
    items: ["Computer equipment", "ASIC miners", "Networking gear", "Servers"],
    method: "Declining Balance",
    notes: "Primary class for mining hardware. Half-year rule applies in year of acquisition.",
    color: "hsl(var(--watt-purple))"
  },
  {
    class: "Class 8",
    rate: "20%",
    items: ["Electrical infrastructure", "Transformers", "Switchgear", "Furniture"],
    method: "Declining Balance",
    notes: "Used for non-computer equipment and general infrastructure.",
    color: "hsl(var(--watt-bitcoin))"
  },
  {
    class: "Class 1",
    rate: "4%",
    items: ["Buildings", "Permanent structures", "Land improvements"],
    method: "Declining Balance",
    notes: "Buildings used for manufacturing may qualify for 10% rate.",
    color: "hsl(var(--watt-success))"
  },
  {
    class: "Class 43.1/43.2",
    rate: "30-50%",
    items: ["Clean energy equipment", "Heat recovery systems", "Cogeneration"],
    method: "Declining Balance",
    notes: "Enhanced rates for qualifying clean energy generation equipment.",
    color: "hsl(145, 80%, 40%)"
  },
];

const CapitalExpenseSection = () => {
  return (
    <TISectionWrapper id="capex" theme="gradient">
      <ScrollReveal>
        <TISectionHeader
          badge="Lesson 4"
          badgeIcon={Calculator}
          title="Capital Expense Treatment"
          description="Maximize tax deductions through proper depreciation strategies using Capital Cost Allowance (CCA) classes."
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Key Stats */}
      <ScrollReveal delay={50}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <TIStatCard icon={Server} value="55%" label="Class 50 Rate" sublabel="Mining hardware" accentColor="hsl(var(--watt-purple))" />
          <TIStatCard icon={Zap} value="20%" label="Class 8 Rate" sublabel="Electrical infra" accentColor="hsl(var(--watt-bitcoin))" />
          <TIStatCard icon={Building} value="4-10%" label="Class 1 Rate" sublabel="Buildings" accentColor="hsl(var(--watt-success))" />
          <TIStatCard icon={TrendingDown} value="1.5x" label="AIIP Multiplier" sublabel="First year bonus" accentColor="hsl(var(--watt-purple))" />
        </div>
      </ScrollReveal>

      {/* CCA Classes */}
      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {ccaClasses.map((cca, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all"
              style={{ borderLeftWidth: '4px', borderLeftColor: cca.color }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground">{cca.class}</h3>
                  <p className="text-xs text-muted-foreground">{cca.method}</p>
                </div>
                <div className="text-3xl font-bold" style={{ color: cca.color }}>{cca.rate}</div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">Applicable Items</div>
                <div className="flex flex-wrap gap-2">
                  {cca.items.map((item, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground italic">{cca.notes}</p>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* AIIP Deep Dive */}
      <ScrollReveal delay={200}>
        <TIDeepDive title="Accelerated Investment Incentive Property (AIIP)" icon={TrendingDown}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">What is AIIP?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                AIIP provides an enhanced first-year depreciation deduction by applying the full CCA rate 
                in the year of acquisition (eliminating the half-year rule) and adding a 50% bonus on top.
              </p>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm font-medium text-foreground mb-2">Example: $1M Mining Hardware</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Year 1 (half-year rule):</span>
                    <span className="font-medium text-foreground">$275,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">With AIIP (1.5x full rate):</span>
                    <span className="font-bold" style={{ color: 'hsl(var(--watt-success))' }}>$825,000</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-muted-foreground">Additional deduction:</span>
                    <span className="font-bold" style={{ color: 'hsl(var(--watt-purple))' }}>$550,000</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">AIIP Eligibility</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-success))] mt-2" />
                  Property acquired after November 20, 2018
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-success))] mt-2" />
                  Property becomes available for use before 2028
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-success))] mt-2" />
                  Not previously owned by taxpayer or related party
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-bitcoin))] mt-2" />
                  Phase-out begins in 2024 (reduced to 75% of normal rate enhancement)
                </li>
              </ul>
            </div>
          </div>
        </TIDeepDive>
      </ScrollReveal>

      {/* 45MW CapEx Breakdown */}
      <ScrollReveal delay={300}>
        <TIKeyInsight title="45MW Facility: CapEx Depreciation Strategy" type="insight">
          <p className="mb-4">Our $75M facility investment is allocated across CCA classes for optimal depreciation:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Asset Category</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Amount</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">CCA Class</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Year 1 CCA (AIIP)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-foreground">ASIC Miners (1,350 units)</td>
                  <td className="text-right py-2 px-3 text-foreground">$13.5M</td>
                  <td className="text-center py-2 px-3" style={{ color: 'hsl(var(--watt-purple))' }}>Class 50 (55%)</td>
                  <td className="text-right py-2 px-3 font-medium" style={{ color: 'hsl(var(--watt-success))' }}>$11.1M</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-foreground">Hydro Containers (30 units)</td>
                  <td className="text-right py-2 px-3 text-foreground">$30.0M</td>
                  <td className="text-center py-2 px-3" style={{ color: 'hsl(var(--watt-purple))' }}>Class 50 (55%)</td>
                  <td className="text-right py-2 px-3 font-medium" style={{ color: 'hsl(var(--watt-success))' }}>$24.8M</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-foreground">Electrical Infrastructure</td>
                  <td className="text-right py-2 px-3 text-foreground">$18.0M</td>
                  <td className="text-center py-2 px-3" style={{ color: 'hsl(var(--watt-bitcoin))' }}>Class 8 (20%)</td>
                  <td className="text-right py-2 px-3 font-medium" style={{ color: 'hsl(var(--watt-success))' }}>$5.4M</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-foreground">Site Improvements</td>
                  <td className="text-right py-2 px-3 text-foreground">$8.5M</td>
                  <td className="text-center py-2 px-3" style={{ color: 'hsl(var(--watt-success))' }}>Class 1 (4%)</td>
                  <td className="text-right py-2 px-3 font-medium" style={{ color: 'hsl(var(--watt-success))' }}>$0.5M</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-foreground">Heat Recovery System</td>
                  <td className="text-right py-2 px-3 text-foreground">$5.0M</td>
                  <td className="text-center py-2 px-3" style={{ color: 'hsl(145, 80%, 40%)' }}>Class 43.2 (50%)</td>
                  <td className="text-right py-2 px-3 font-medium" style={{ color: 'hsl(var(--watt-success))' }}>$3.8M</td>
                </tr>
                <tr className="bg-muted/50">
                  <td className="py-3 px-3 font-bold text-foreground">Total</td>
                  <td className="text-right py-3 px-3 font-bold text-foreground">$75.0M</td>
                  <td className="text-center py-3 px-3">—</td>
                  <td className="text-right py-3 px-3 font-bold" style={{ color: 'hsl(var(--watt-success))' }}>$45.6M</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Tax Savings (Year 1):</strong> $45.6M × 23% = <span className="font-bold" style={{ color: 'hsl(var(--watt-success))' }}>$10.5M</span>
          </p>
        </TIKeyInsight>
      </ScrollReveal>

      {/* US Comparison */}
      <ScrollReveal delay={400}>
        <TIContentCard borderColor="hsl(var(--watt-bitcoin))">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
            US Comparison: Section 179 & Bonus Depreciation
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Section 179 Expensing</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Allows immediate expensing of qualifying equipment up to $1.16M (2024 limit). 
                Phases out when total equipment purchases exceed $2.89M.
              </p>
              <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                ⚠️ Limited utility for large mining operations due to cap
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Bonus Depreciation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                100% first-year deduction for qualifying property (phasing down 20% annually starting 2023). 
                No annual cap—applicable to entire equipment purchase.
              </p>
              <div className="text-xs text-[hsl(var(--watt-success))] bg-green-50 rounded-lg p-3">
                ✓ Preferred method for large data center investments
              </div>
            </div>
          </div>
        </TIContentCard>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default CapitalExpenseSection;
