import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Building2, Scale, Users, ArrowRight, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { TISectionWrapper, TISectionHeader, TIContentCard, TIKeyInsight, TIDeepDive, TICallout } from './shared';

const structures = [
  {
    name: "Corporation (Inc.)",
    type: "Separate Legal Entity",
    taxRate: "23% Combined (AB)",
    liability: "Limited",
    pros: ["Limited liability protection", "Access to small business deduction", "Credibility with investors", "Easier ownership transfer"],
    cons: ["Double taxation on dividends", "More compliance requirements", "Formation costs", "Less flexibility in profit distribution"],
    bestFor: "Larger operations with multiple shareholders or external investors",
    icon: Building2,
  },
  {
    name: "Limited Partnership (LP)",
    type: "Flow-through Entity",
    taxRate: "Personal rates",
    liability: "Limited (LP) / Unlimited (GP)",
    pros: ["Flow-through taxation", "Losses can offset partner income", "Flexible profit allocation", "No double taxation"],
    cons: ["GP has unlimited liability", "More complex structure", "Limited access to some credits", "Partner disputes possible"],
    bestFor: "Joint ventures or operations where losses will be utilized by partners",
    icon: Users,
  },
  {
    name: "Holding Company Structure",
    type: "Multi-tier Corporate",
    taxRate: "Deferred until distribution",
    liability: "Limited at each tier",
    pros: ["Asset protection", "Tax deferral on inter-corporate dividends", "Estate planning flexibility", "Risk isolation"],
    cons: ["Complex to administer", "Higher professional fees", "Must maintain substance", "Attribution rules apply"],
    bestFor: "Mature operations with significant retained earnings or multiple business lines",
    icon: TrendingUp,
  },
];

const CorporateTaxStructureSection = () => {
  return (
    <TISectionWrapper id="corporate-structure" theme="light">
      <ScrollReveal>
        <TISectionHeader
          badge="Lesson 3"
          badgeIcon={Building2}
          title="Corporate Structure & Tax Planning"
          description="Choose the right business structure to optimize tax efficiency, liability protection, and operational flexibility."
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Structure Cards */}
      <ScrollReveal delay={100}>
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {structures.map((structure, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="bg-[hsl(var(--watt-purple)/0.1)] p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <structure.icon className="w-8 h-8" style={{ color: 'hsl(var(--watt-purple))' }} />
                  <div>
                    <h3 className="font-bold text-foreground">{structure.name}</h3>
                    <p className="text-xs text-muted-foreground">{structure.type}</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Tax Rate</div>
                    <div className="font-bold text-foreground text-sm">{structure.taxRate}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Liability</div>
                    <div className="font-bold text-foreground text-sm">{structure.liability}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-medium text-green-600 mb-2">Advantages</div>
                  <div className="space-y-1">
                    {structure.pros.slice(0, 3).map((pro, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-medium text-amber-600 mb-2">Considerations</div>
                  <div className="space-y-1">
                    {structure.cons.slice(0, 3).map((con, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="text-xs font-medium text-[hsl(var(--watt-purple))] mb-1">Best For</div>
                  <p className="text-sm text-muted-foreground">{structure.bestFor}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Small Business Deduction */}
      <ScrollReveal delay={200}>
        <TIDeepDive title="Canadian Small Business Deduction (SBD)" icon={Scale}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">What is the SBD?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                The Small Business Deduction reduces the federal corporate tax rate from 15% to 9% 
                on the first $500,000 of active business income for Canadian-controlled private corporations (CCPCs).
              </p>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">Effective Combined Rate (Alberta)</div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">11%</div>
                    <div className="text-xs text-muted-foreground">With SBD</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">23%</div>
                    <div className="text-xs text-muted-foreground">Without SBD</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Limitations for Mining Operations</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Most Bitcoin mining operations quickly exceed the $500,000 threshold, limiting the SBD benefit. 
                However, the first year of operations often qualifies.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-purple))] mt-2" />
                  SBD phases out when taxable capital exceeds $10M
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-purple))] mt-2" />
                  Associated corporations share the $500K limit
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-purple))] mt-2" />
                  Passive income can reduce SBD eligibility
                </li>
              </ul>
            </div>
          </div>
        </TIDeepDive>
      </ScrollReveal>

      {/* 45MW Case Study Structure */}
      <ScrollReveal delay={300}>
        <TIKeyInsight title="45MW Alberta Facility: Our Structure" type="insight">
          <p className="mb-4">
            Our Heartland facility uses a <strong>holding company structure</strong> with an operating 
            subsidiary for optimal tax efficiency and liability protection:
          </p>
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Building2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-purple))' }} />
                <div className="font-medium text-foreground">Holdco</div>
                <div className="text-xs text-muted-foreground">Asset Protection</div>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="text-center p-4 bg-muted rounded-lg">
                <Building2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
                <div className="font-medium text-foreground">Opco (AB)</div>
                <div className="text-xs text-muted-foreground">Mining Operations</div>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="text-center p-4 bg-muted rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-success))' }} />
                <div className="font-medium text-foreground">45MW Facility</div>
                <div className="text-xs text-muted-foreground">Heartland, AB</div>
              </div>
            </div>
          </div>
        </TIKeyInsight>
      </ScrollReveal>

      {/* Callout */}
      <ScrollReveal delay={400}>
        <TICallout title="Professional Advice Required" variant="warning">
          Corporate structure decisions have long-term tax and legal implications. Always consult with 
          qualified tax lawyers and accountants before establishing or restructuring your data center 
          operations. The optimal structure depends on your specific circumstances, investor requirements, 
          and growth plans.
        </TICallout>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default CorporateTaxStructureSection;
