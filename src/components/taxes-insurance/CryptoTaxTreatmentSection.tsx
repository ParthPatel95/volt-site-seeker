import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, FileText, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { TISectionWrapper, TISectionHeader, TIContentCard, TIKeyInsight, TIDeepDive, TICallout, TIStepByStep } from './shared';

const accountingMethods = [
  {
    method: "Revenue Method",
    description: "Bitcoin recognized as revenue at FMV when mined",
    taxTiming: "Taxed immediately on mining",
    bestFor: "Operations that sell immediately",
    craCompliant: true,
    pros: ["Simple to implement", "Clear tax treatment", "Matches cash flow if selling"],
    cons: ["Taxed even if holding", "Potential cash flow mismatch"],
  },
  {
    method: "Inventory Method",
    description: "Bitcoin treated as inventory; taxed on sale",
    taxTiming: "Taxed when sold or exchanged",
    bestFor: "HODL strategies",
    craCompliant: true,
    pros: ["Tax deferral until sale", "Lower valuation methods available", "Matches economic reality"],
    cons: ["More complex tracking", "FIFO/Average cost required", "CRA scrutiny possible"],
  },
];

const taxScenarios = [
  {
    scenario: "Immediate Sell Strategy",
    btcMined: "10 BTC",
    fmvAtMining: "$60,000",
    sellPrice: "$60,000",
    taxableIncome: "$600,000",
    timing: "Same year",
    notes: "Simplest approach. Revenue = Sale proceeds. No unrealized gain/loss."
  },
  {
    scenario: "HODL 1 Year Strategy",
    btcMined: "10 BTC",
    fmvAtMining: "$60,000",
    sellPrice: "$80,000",
    taxableIncome: "$600K + $200K",
    timing: "Mining year + Sale year",
    notes: "Mining income taxed immediately. Capital gain on appreciation ($200K) taxed at 50% inclusion rate."
  },
  {
    scenario: "HODL with Decline",
    btcMined: "10 BTC",
    fmvAtMining: "$60,000",
    sellPrice: "$40,000",
    taxableIncome: "$600K - $200K loss",
    timing: "Mining year + Sale year",
    notes: "Still taxed $600K on mining. Capital loss of $200K can offset other capital gains."
  },
];

const CryptoTaxTreatmentSection = () => {
  return (
    <TISectionWrapper id="crypto-tax" theme="gradient">
      <ScrollReveal>
        <TISectionHeader
          badge="Lesson 6"
          badgeIcon={Bitcoin}
          title="Crypto Tax Treatment"
          description="Navigate the complexities of Bitcoin mining taxation: revenue recognition, HODL strategies, and CRA compliance."
          accentColor="purple"
        />
      </ScrollReveal>

      {/* CRA Position */}
      <ScrollReveal delay={50}>
        <TIKeyInsight title="CRA Position on Bitcoin Mining" type="warning">
          <p className="mb-3">
            The Canada Revenue Agency treats Bitcoin mining as a <strong>business activity</strong>, not a hobby. 
            Key implications:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: 'hsl(var(--watt-purple))' }} />
                Income Tax
              </h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Mining proceeds = business income (100% taxable)</li>
                <li>• Mined BTC recorded at FMV on date received</li>
                <li>• Business expenses fully deductible</li>
              </ul>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
                Capital Gains
              </h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Price increase after mining = capital gain</li>
                <li>• 50% inclusion rate (effectively 50% tax)</li>
                <li>• Losses can offset other capital gains</li>
              </ul>
            </div>
          </div>
        </TIKeyInsight>
      </ScrollReveal>

      {/* Accounting Methods */}
      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {accountingMethods.map((method, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">{method.method}</h3>
                {method.craCompliant && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> CRA Accepted
                  </span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
              
              <div className="bg-muted rounded-lg p-3 mb-4">
                <div className="text-xs text-muted-foreground mb-1">Tax Timing</div>
                <div className="font-medium text-foreground">{method.taxTiming}</div>
              </div>
              
              <div className="mb-4">
                <div className="text-xs font-medium text-green-600 mb-2">Advantages</div>
                <div className="space-y-1">
                  {method.pros.map((pro, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-amber-600 mb-2">Considerations</div>
                <div className="space-y-1">
                  {method.cons.map((con, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs font-medium text-[hsl(var(--watt-purple))]">Best For</div>
                <p className="text-sm text-muted-foreground">{method.bestFor}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Tax Scenarios */}
      <ScrollReveal delay={200}>
        <TIDeepDive title="Tax Scenarios: HODL vs. Sell" icon={Scale}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Scenario</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">FMV @ Mining</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Sale Price</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Taxable Income</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {taxScenarios.map((scenario, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="py-3 px-3">
                      <div className="font-medium text-foreground">{scenario.scenario}</div>
                      <div className="text-xs text-muted-foreground">{scenario.btcMined}</div>
                    </td>
                    <td className="text-right py-3 px-3 text-foreground">{scenario.fmvAtMining}</td>
                    <td className="text-right py-3 px-3 text-foreground">{scenario.sellPrice}</td>
                    <td className="text-right py-3 px-3 font-medium" style={{ color: 'hsl(var(--watt-purple))' }}>{scenario.taxableIncome}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground max-w-xs">{scenario.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TIDeepDive>
      </ScrollReveal>

      {/* 45MW Case Study */}
      <ScrollReveal delay={300}>
        <TIKeyInsight title="45MW Facility: Monthly Mining Tax Implications" type="insight">
          <p className="mb-4">Assuming the facility mines approximately <strong>30 BTC per month</strong> at current difficulty:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg p-4 border border-border text-center">
              <Bitcoin className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
              <div className="text-2xl font-bold text-foreground">30 BTC</div>
              <div className="text-sm text-muted-foreground">Monthly Production</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-success))' }} />
              <div className="text-2xl font-bold text-foreground">$1.8M</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue (@ $60K BTC)</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border text-center">
              <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-purple))' }} />
              <div className="text-2xl font-bold text-foreground">$414K</div>
              <div className="text-sm text-muted-foreground">Monthly Tax Liability (23%)</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 border-t border-border pt-3">
            <strong>Strategy:</strong> We implement a hybrid approach—selling enough BTC to cover operating costs and 
            taxes (~60-70%) while HODLing the remainder for potential appreciation.
          </p>
        </TIKeyInsight>
      </ScrollReveal>

      {/* Record Keeping */}
      <ScrollReveal delay={400}>
        <TIContentCard borderColor="hsl(var(--watt-purple))">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />
            Required Record Keeping
          </h3>
          <TIStepByStep 
            steps={[
              { 
                title: "Mining Timestamps", 
                description: "Record exact date and time each block reward is received with wallet address." 
              },
              { 
                title: "FMV Documentation", 
                description: "Capture Bitcoin price from recognized exchange at time of each mining reward." 
              },
              { 
                title: "Cost Basis Tracking", 
                description: "Maintain FIFO or Average Cost records for all BTC holdings to calculate gains/losses." 
              },
              { 
                title: "Expense Documentation", 
                description: "Keep receipts and invoices for all deductible business expenses." 
              },
              { 
                title: "Annual Reconciliation", 
                description: "Reconcile wallet balances with recorded transactions before tax filing." 
              },
            ]}
          />
        </TIContentCard>
      </ScrollReveal>

      {/* US vs Canada */}
      <ScrollReveal delay={500}>
        <TICallout title="US vs. Canada: Key Differences" variant="info">
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <div>
              <div className="font-medium text-foreground mb-1">🇨🇦 Canada (CRA)</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Business income: 100% taxable</li>
                <li>• Capital gains: 50% inclusion</li>
                <li>• No distinction for holding period</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-foreground mb-1">🇺🇸 USA (IRS)</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Self-employment tax applies (15.3%)</li>
                <li>• Short-term vs. long-term cap gains</li>
                <li>• 1 year holding = lower LTCG rate</li>
              </ul>
            </div>
          </div>
        </TICallout>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default CryptoTaxTreatmentSection;
