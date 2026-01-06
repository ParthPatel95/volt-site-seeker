import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Zap, Users, Wrench, Building, Thermometer, DollarSign, BarChart3, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { TISectionWrapper, TISectionHeader, TIContentCard, TIKeyInsight, TICallout, TIMetricDisplay } from './shared';

const opexCategories = [
  {
    category: "Electricity",
    percentage: 75,
    annual45MW: "$15,000,000",
    deductibility: "100%",
    notes: "Fully deductible in year incurred. Consider power purchase agreements for rate stability.",
    color: "hsl(var(--watt-bitcoin))",
    icon: Zap,
  },
  {
    category: "Labor & Benefits",
    percentage: 10,
    annual45MW: "$2,000,000",
    deductibility: "100%",
    notes: "Includes salaries, benefits, payroll taxes. Training costs also deductible.",
    color: "hsl(var(--watt-purple))",
    icon: Users,
  },
  {
    category: "Maintenance & Repairs",
    percentage: 5,
    annual45MW: "$1,000,000",
    deductibility: "100%*",
    notes: "*Repairs deductible immediately; betterments must be capitalized.",
    color: "hsl(var(--watt-success))",
    icon: Wrench,
  },
  {
    category: "Facility Costs",
    percentage: 5,
    annual45MW: "$1,000,000",
    deductibility: "100%",
    notes: "Rent, property taxes, insurance, security. Land rent under 20-year lease.",
    color: "hsl(145, 80%, 40%)",
    icon: Building,
  },
  {
    category: "Cooling & HVAC",
    percentage: 3,
    annual45MW: "$600,000",
    deductibility: "100%",
    notes: "Water, cooling fluids, HVAC maintenance. Hydro-cooling reduces this significantly.",
    color: "hsl(200, 80%, 50%)",
    icon: Thermometer,
  },
  {
    category: "Other Operating",
    percentage: 2,
    annual45MW: "$400,000",
    deductibility: "100%",
    notes: "Professional fees, software, internet, office, travel, miscellaneous.",
    color: "hsl(280, 60%, 60%)",
    icon: BarChart3,
  },
];

const OperatingExpenseSection = () => {
  return (
    <TISectionWrapper id="opex" theme="light">
      <ScrollReveal>
        <TISectionHeader
          badge="Lesson 5"
          badgeIcon={DollarSign}
          title="Operating Expense Deductions"
          description="Understand which operating costs are deductible and how to maximize your OpEx deductions."
          accentColor="purple"
        />
      </ScrollReveal>

      {/* OpEx Overview */}
      <ScrollReveal delay={50}>
        <div className="bg-card border border-border rounded-xl p-6 mb-12">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />
            45MW Facility: Annual Operating Expenses (~$20M)
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opexCategories.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-muted rounded-lg p-4 relative overflow-hidden"
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-center gap-3 mb-2">
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  <span className="font-medium text-foreground">{item.category}</span>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl font-bold text-foreground">{item.percentage}%</span>
                  <span className="text-sm text-muted-foreground">{item.annual45MW}/year</span>
                </div>
                <div className="text-xs text-muted-foreground">{item.notes}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Energy Costs Deep Dive */}
      <ScrollReveal delay={100}>
        <TIContentCard borderColor="hsl(var(--watt-bitcoin))">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
            Energy Costs: The Dominant Expense
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">45MW Energy Cost Breakdown</h4>
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Annual consumption</span>
                    <span className="font-bold text-foreground">394,200 MWh</span>
                  </div>
                  <div className="text-xs text-muted-foreground">45MW × 8,760 hours × 0.95 uptime</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Average rate (Alberta)</span>
                    <span className="font-bold text-foreground">$0.038/kWh</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Blended pool price + transmission</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Annual energy cost</span>
                    <span className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>$14,979,600</span>
                  </div>
                  <div className="text-xs text-muted-foreground">100% deductible operating expense</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Tax Deductibility</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-success))] mt-2" />
                  <span><strong>Pool Price:</strong> Fully deductible when paid. Accrual method also acceptable.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-success))] mt-2" />
                  <span><strong>Transmission Charges:</strong> Deductible as operating expense.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-success))] mt-2" />
                  <span><strong>Carbon Levy:</strong> Deductible as a regulatory cost of doing business.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-bitcoin))] mt-2" />
                  <span><strong>Demand Response Credits:</strong> Reduce income when received (not taxable).</span>
                </li>
              </ul>
            </div>
          </div>
        </TIContentCard>
      </ScrollReveal>

      {/* Repairs vs Betterments */}
      <ScrollReveal delay={200}>
        <TIKeyInsight title="Repairs vs. Betterments: A Critical Distinction" type="warning">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-foreground mb-2 text-green-600">Deductible Repairs (OpEx)</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Replacing failed PSUs in miners</li>
                <li>• Fan replacements and cleaning</li>
                <li>• Hashboard repairs</li>
                <li>• Cooling system maintenance</li>
                <li>• Electrical panel repairs</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2 text-amber-600">Capitalize (CapEx)</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Upgrading to new generation miners</li>
                <li>• Adding capacity (new containers)</li>
                <li>• Upgrading electrical infrastructure</li>
                <li>• Installing new cooling systems</li>
                <li>• Building additions or improvements</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 border-t border-border pt-3">
            <strong>Rule of thumb:</strong> If it restores to original condition → repair (deduct now). 
            If it improves, extends life, or adds capacity → betterment (capitalize and depreciate).
          </p>
        </TIKeyInsight>
      </ScrollReveal>

      {/* Tax Saving Summary */}
      <ScrollReveal delay={300}>
        <div className="bg-[hsl(var(--watt-purple)/0.05)] border border-[hsl(var(--watt-purple)/0.2)] rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">45MW Facility: Annual OpEx Tax Benefit</h3>
          <TIMetricDisplay 
            metrics={[
              { label: "Total Annual OpEx", value: "$20M" },
              { label: "Tax Rate", value: "23%" },
              { label: "Tax Reduction", value: "$4.6M", isPositive: true },
              { label: "Effective After-Tax OpEx", value: "$15.4M" },
            ]}
          />
          <p className="text-sm text-muted-foreground mt-4">
            Combined with Year 1 CCA deductions of $45.6M, our 45MW facility generates approximately 
            <strong className="mx-1" style={{ color: 'hsl(var(--watt-success))' }}>$15.1M</strong> 
            in first-year tax savings.
          </p>
        </div>
      </ScrollReveal>

      {/* Callout */}
      <ScrollReveal delay={400}>
        <TICallout title="Documentation is Key" variant="tip">
          Maintain detailed records of all operating expenses with supporting documentation. 
          For large-scale operations, implement a proper expense tracking system that categorizes 
          expenses by type and maintains audit trails. The CRA expects proper documentation for 
          all claimed deductions.
        </TICallout>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default OperatingExpenseSection;
