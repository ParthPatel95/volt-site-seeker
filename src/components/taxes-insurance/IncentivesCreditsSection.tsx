import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Gift, Beaker, DollarSign, MapPin, FileText, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { TISectionWrapper, TISectionHeader, TIContentCard, TIKeyInsight, TIDeepDive, TICallout, TIStatCard } from './shared';

const incentives = [
  {
    name: "SR&ED Tax Credit",
    jurisdiction: "Canada (Federal + Provincial)",
    type: "Tax Credit",
    value: "15-35%",
    description: "Scientific Research & Experimental Development credit for qualifying R&D activities",
    eligibleActivities: [
      "Custom cooling system development",
      "Energy efficiency optimization research",
      "Hashboard repair/upgrade innovation",
      "Waste heat recovery engineering",
      "Firmware modifications for mining"
    ],
    tips: "Engage a SR&ED consultant before starting projects to ensure proper documentation.",
    color: "hsl(var(--watt-purple))"
  },
  {
    name: "Alberta AITC",
    jurisdiction: "Alberta",
    type: "Tax Credit",
    value: "10%",
    description: "Alberta Innovation Tax Credit for qualifying R&D expenditures",
    eligibleActivities: [
      "Adds to federal SR&ED",
      "Available to CCPCs",
      "Up to $4M expenditure limit",
      "Refundable for qualifying corps"
    ],
    tips: "Stack with federal SR&ED for combined 25%+ credit on qualifying R&D.",
    color: "hsl(var(--watt-bitcoin))"
  },
  {
    name: "Clean Technology ITC",
    jurisdiction: "Canada",
    type: "Tax Credit",
    value: "30%",
    description: "Investment Tax Credit for clean technology equipment",
    eligibleActivities: [
      "Heat recovery systems",
      "Renewable energy generation",
      "Energy storage equipment",
      "District heating infrastructure"
    ],
    tips: "Waste heat recovery systems at mining facilities likely qualify.",
    color: "hsl(var(--watt-success))"
  },
  {
    name: "Opportunity Zones",
    jurisdiction: "USA",
    type: "Tax Deferral",
    value: "Varies",
    description: "Capital gains deferral and reduction for investments in designated zones",
    eligibleActivities: [
      "Defer capital gains until 2026",
      "10% basis step-up at 5 years",
      "No cap gains on OZ investment after 10 years"
    ],
    tips: "Several mining-friendly areas in Texas and Wyoming are in Opportunity Zones.",
    color: "hsl(280, 60%, 60%)"
  },
];

const srsedEligibility = [
  { category: "Eligible", items: ["Novel cooling system design", "Custom firmware development", "Energy optimization algorithms", "Heat exchanger engineering"] },
  { category: "Ineligible", items: ["Routine mining operations", "Standard equipment installation", "Market research", "Quality control testing"] },
];

const IncentivesCreditsSection = () => {
  return (
    <TISectionWrapper id="incentives" theme="light">
      <ScrollReveal>
        <TISectionHeader
          badge="Lesson 7"
          badgeIcon={Gift}
          title="Tax Incentives & Credits"
          description="Maximize returns through government incentives for R&D, clean technology, and regional development programs."
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Key Stats */}
      <ScrollReveal delay={50}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <TIStatCard icon={Beaker} value="35%" label="Max SR&ED Rate" sublabel="CCPCs < $500K" accentColor="hsl(var(--watt-purple))" />
          <TIStatCard icon={Sparkles} value="30%" label="Clean Tech ITC" sublabel="Heat recovery" accentColor="hsl(var(--watt-success))" />
          <TIStatCard icon={MapPin} value="10%" label="Alberta AITC" sublabel="Provincial R&D" accentColor="hsl(var(--watt-bitcoin))" />
          <TIStatCard icon={DollarSign} value="$1M+" label="Potential Savings" sublabel="45MW facility" accentColor="hsl(var(--watt-purple))" />
        </div>
      </ScrollReveal>

      {/* Incentives Grid */}
      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {incentives.map((incentive, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
              style={{ borderTopWidth: '4px', borderTopColor: incentive.color }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground">{incentive.name}</h3>
                    <p className="text-xs text-muted-foreground">{incentive.jurisdiction}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: incentive.color }}>{incentive.value}</div>
                    <div className="text-xs text-muted-foreground">{incentive.type}</div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{incentive.description}</p>
                
                <div className="mb-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Eligible Activities</div>
                  <div className="flex flex-wrap gap-1.5">
                    {incentive.eligibleActivities.map((activity, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
                  <strong>💡 Tip:</strong> {incentive.tips}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* SR&ED Deep Dive */}
      <ScrollReveal delay={200}>
        <TIDeepDive title="SR&ED: The Most Valuable Credit for Mining Operations" icon={Beaker}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">How SR&ED Works</h4>
              <p className="text-sm text-muted-foreground mb-4">
                The Scientific Research & Experimental Development (SR&ED) program is Canada's largest 
                R&D tax incentive. Mining operations can claim credits for genuine technological 
                advancement activities.
              </p>
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="text-sm font-medium text-foreground mb-2">Credit Rates</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CCPCs (first $3M):</span>
                    <span className="font-bold" style={{ color: 'hsl(var(--watt-purple))' }}>35% refundable</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other corporations:</span>
                    <span className="font-bold text-foreground">15% non-refundable</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">+ Alberta AITC:</span>
                    <span className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>+10%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Eligibility Test</h4>
              <div className="space-y-4">
                {srsedEligibility.map((cat, idx) => (
                  <div key={idx}>
                    <div className={`text-xs font-medium mb-2 ${cat.category === 'Eligible' ? 'text-green-600' : 'text-red-600'}`}>
                      {cat.category} Activities
                    </div>
                    <div className="space-y-1">
                      {cat.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          {cat.category === 'Eligible' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <span className="w-3.5 h-3.5 text-red-500">✗</span>
                          )}
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TIDeepDive>
      </ScrollReveal>

      {/* 45MW Case Study */}
      <ScrollReveal delay={300}>
        <TIKeyInsight title="45MW Facility: Potential Tax Credit Opportunities" type="success">
          <p className="mb-4">Our Heartland facility has identified several credit opportunities:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Credit Type</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Eligible Spend</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Rate</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Credit Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-foreground">SR&ED (Cooling R&D)</td>
                  <td className="text-right py-2 px-3 text-foreground">$800,000</td>
                  <td className="text-center py-2 px-3" style={{ color: 'hsl(var(--watt-purple))' }}>35%</td>
                  <td className="text-right py-2 px-3 font-medium" style={{ color: 'hsl(var(--watt-success))' }}>$280,000</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-foreground">Alberta AITC (R&D)</td>
                  <td className="text-right py-2 px-3 text-foreground">$800,000</td>
                  <td className="text-center py-2 px-3" style={{ color: 'hsl(var(--watt-bitcoin))' }}>10%</td>
                  <td className="text-right py-2 px-3 font-medium" style={{ color: 'hsl(var(--watt-success))' }}>$80,000</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3 text-foreground">Clean Tech ITC (Heat Recovery)</td>
                  <td className="text-right py-2 px-3 text-foreground">$5,000,000</td>
                  <td className="text-center py-2 px-3" style={{ color: 'hsl(var(--watt-success))' }}>30%</td>
                  <td className="text-right py-2 px-3 font-medium" style={{ color: 'hsl(var(--watt-success))' }}>$1,500,000</td>
                </tr>
                <tr className="bg-muted/50">
                  <td className="py-3 px-3 font-bold text-foreground">Total Potential Credits</td>
                  <td className="text-right py-3 px-3 text-foreground">—</td>
                  <td className="text-center py-3 px-3">—</td>
                  <td className="text-right py-3 px-3 font-bold" style={{ color: 'hsl(var(--watt-success))' }}>$1,860,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TIKeyInsight>
      </ScrollReveal>

      {/* Callout */}
      <ScrollReveal delay={400}>
        <TICallout title="Maximize Your Credits" variant="tip">
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'hsl(var(--watt-success))' }} />
              <span>Engage SR&ED consultants <strong>before</strong> starting R&D projects to ensure proper documentation</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'hsl(var(--watt-success))' }} />
              <span>Document all technical uncertainties and systematic investigation in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'hsl(var(--watt-success))' }} />
              <span>Invest in qualifying clean technology equipment (heat recovery) to access 30% ITC</span>
            </li>
          </ul>
        </TICallout>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default IncentivesCreditsSection;
