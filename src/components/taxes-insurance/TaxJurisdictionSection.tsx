import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { MapPin, DollarSign, Zap, FileText, Scale, Globe, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { TISectionWrapper, TISectionHeader, TIContentCard, TIKeyInsight, TICallout } from './shared';

const jurisdictions = [
  {
    name: "Alberta, Canada",
    flag: "🇨🇦",
    highlight: true,
    stats: {
      corporateTax: "23%",
      salesTax: "0% PST",
      energyCost: "$0.03-0.05/kWh",
      incentives: "SR&ED, AIIP",
    },
    pros: ["No provincial sales tax", "Low energy costs", "Crypto-friendly regulations", "Accelerated Investment Incentive"],
    cons: ["Cold climate (can be advantage for cooling)", "Federal carbon pricing"],
    notes: "Alberta's deregulated electricity market and zero PST make it one of North America's most competitive jurisdictions for Bitcoin mining."
  },
  {
    name: "Texas, USA",
    flag: "🇺🇸",
    highlight: false,
    stats: {
      corporateTax: "0% State",
      salesTax: "6.25%",
      energyCost: "$0.02-0.06/kWh",
      incentives: "Chapter 313",
    },
    pros: ["No state income tax", "Abundant wind/solar", "ERCOT demand response", "Pro-business environment"],
    cons: ["Grid instability events", "Federal taxes still apply", "Sales tax on equipment"],
    notes: "Texas leads the US in Bitcoin mining due to zero state income tax and competitive ERCOT wholesale rates."
  },
  {
    name: "Wyoming, USA",
    flag: "🇺🇸",
    highlight: false,
    stats: {
      corporateTax: "0% State",
      salesTax: "4%",
      energyCost: "$0.04-0.06/kWh",
      incentives: "DAO-friendly laws",
    },
    pros: ["Most crypto-friendly state", "Special purpose depository institutions", "No income tax", "Low population density"],
    cons: ["Limited infrastructure", "Smaller workforce", "Higher logistics costs"],
    notes: "Wyoming has passed over 30 blockchain-friendly laws, making it ideal for operations requiring regulatory clarity."
  },
  {
    name: "Paraguay",
    flag: "🇵🇾",
    highlight: false,
    stats: {
      corporateTax: "10%",
      salesTax: "10% VAT",
      energyCost: "$0.02-0.03/kWh",
      incentives: "Itaipu power",
    },
    pros: ["Cheapest hydroelectric power", "Low corporate tax", "Growing crypto industry", "Renewable energy source"],
    cons: ["Political instability risk", "Infrastructure challenges", "Currency volatility", "Regulatory uncertainty"],
    notes: "Paraguay's surplus hydroelectric power from Itaipu Dam offers some of the world's cheapest electricity rates."
  },
];

const TaxJurisdictionSection = () => {
  return (
    <TISectionWrapper id="jurisdictions" theme="gradient">
      <ScrollReveal>
        <TISectionHeader
          badge="Lesson 2"
          badgeIcon={MapPin}
          title="Tax Jurisdictions Comparison"
          description="Choose the right location for your data center based on tax efficiency, energy costs, and regulatory environment."
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Jurisdiction Grid */}
      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {jurisdictions.map((jurisdiction, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-xl border p-6 transition-all ${
                jurisdiction.highlight 
                  ? "bg-[hsl(var(--watt-purple)/0.05)] border-[hsl(var(--watt-purple)/0.3)]" 
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{jurisdiction.flag}</span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{jurisdiction.name}</h3>
                  {jurisdiction.highlight && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--watt-purple)/0.2)] text-[hsl(var(--watt-purple))]">
                      Case Study Location
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Corporate Tax</div>
                  <div className="font-bold text-foreground">{jurisdiction.stats.corporateTax}</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Sales Tax</div>
                  <div className="font-bold text-foreground">{jurisdiction.stats.salesTax}</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Energy Cost</div>
                  <div className="font-bold text-foreground">{jurisdiction.stats.energyCost}</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Key Incentives</div>
                  <div className="font-bold text-foreground text-sm">{jurisdiction.stats.incentives}</div>
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs font-medium text-green-600 mb-2">Advantages</div>
                  {jurisdiction.pros.map((pro, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-medium text-red-600 mb-2">Considerations</div>
                  {jurisdiction.cons.map((con, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground mb-1">
                      <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground italic border-t border-border pt-3">
                {jurisdiction.notes}
              </p>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Nexus and PE Rules */}
      <ScrollReveal delay={200}>
        <TIContentCard borderColor="hsl(var(--watt-purple))">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />
            Tax Nexus & Permanent Establishment
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Understanding Tax Nexus</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Tax nexus determines where your business has sufficient presence to be subject to taxation. 
                For data centers, physical equipment typically creates nexus in that jurisdiction.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-purple))] mt-2" />
                  Physical presence (equipment, employees)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-purple))] mt-2" />
                  Economic nexus thresholds (revenue, transactions)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-purple))] mt-2" />
                  Agency relationships (contractors, partners)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">International Considerations</h4>
              <p className="text-sm text-muted-foreground mb-3">
                For multi-jurisdictional operations, permanent establishment (PE) rules and transfer pricing 
                become critical for proper tax allocation.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-bitcoin))] mt-2" />
                  Treaty benefits for cross-border operations
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-bitcoin))] mt-2" />
                  Transfer pricing documentation requirements
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-bitcoin))] mt-2" />
                  Withholding tax on cross-border payments
                </li>
              </ul>
            </div>
          </div>
        </TIContentCard>
      </ScrollReveal>

      {/* Alberta Advantage */}
      <ScrollReveal delay={300}>
        <TIKeyInsight title="Why Alberta for Our 45MW Facility?" type="success">
          <div className="grid md:grid-cols-3 gap-4 mt-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-foreground">8% Provincial Tax</div>
                <div className="text-xs text-muted-foreground">Lowest in Canada</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-foreground">$0.04/kWh Avg</div>
                <div className="text-xs text-muted-foreground">Competitive rates</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-foreground">No PST</div>
                <div className="text-xs text-muted-foreground">On equipment purchases</div>
              </div>
            </div>
          </div>
        </TIKeyInsight>
      </ScrollReveal>

      {/* Callout */}
      <ScrollReveal delay={400}>
        <TICallout title="Key Takeaway" variant="tip">
          When selecting a jurisdiction, consider the total cost of operation including tax rates, 
          energy costs, incentives, and regulatory environment. A lower tax rate doesn't always mean 
          lower total costs—Alberta's combination of competitive energy and zero PST often outweighs 
          jurisdictions with lower headline tax rates.
        </TICallout>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default TaxJurisdictionSection;
