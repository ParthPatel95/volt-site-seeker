import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Calculator, Zap, Server, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

export const CapacityPlanningSection = () => {
  const [targetMW, setTargetMW] = useState(50);
  
  const calculateRequirements = (mw: number) => ({
    miners: Math.round(mw * 1000 / 3.5), // ~3.5kW per miner average
    hashrate: (mw * 1000 / 3.5 * 140 / 1000).toFixed(1), // ~140 TH/s per miner
    landAcres: Math.round(mw * 0.5), // ~0.5 acres per MW
    transformerMVA: Math.round(mw * 1.1), // 10% buffer
    coolingTons: Math.round(mw * 285), // ~285 tons per MW
    monthlyPowerMWh: Math.round(mw * 720), // 720 hours/month
    staffRequired: Math.round(mw / 10 + 5) // 1 per 10MW + base staff
  });

  const requirements = calculateRequirements(targetMW);

  const planningSteps = [
    {
      step: 1,
      title: "Market Analysis",
      description: "Evaluate hashprice projections, network difficulty trends, and competitive landscape",
      duration: "2-4 weeks"
    },
    {
      step: 2,
      title: "Site Assessment",
      description: "Identify locations with power availability, cooling capacity, and favorable economics",
      duration: "4-8 weeks"
    },
    {
      step: 3,
      title: "Financial Modeling",
      description: "Build detailed pro forma with multiple scenarios and sensitivity analysis",
      duration: "2-3 weeks"
    },
    {
      step: 4,
      title: "Engineering Design",
      description: "Develop electrical, mechanical, and civil engineering specifications",
      duration: "6-12 weeks"
    },
    {
      step: 5,
      title: "Procurement Planning",
      description: "Source equipment, negotiate contracts, and establish supply chain",
      duration: "8-16 weeks"
    },
    {
      step: 6,
      title: "Execution Timeline",
      description: "Create detailed project schedule with milestones and contingencies",
      duration: "2-4 weeks"
    }
  ];

  return (
    <section id="capacity-planning" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Capacity Planning
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Strategic planning framework for determining optimal expansion size and resource requirements.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-12">
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-market-positive" />
              Capacity Requirements Calculator
            </h3>
            
            <div className="mb-8">
              <label className="block text-foreground font-medium mb-3">
                Target Capacity: {targetMW} MW
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={targetMW}
                onChange={(e) => setTargetMW(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-market-positive"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>10 MW</span>
                <span>50 MW</span>
                <span>100 MW</span>
                <span>150 MW</span>
                <span>200 MW</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-market-positive/10 rounded-xl p-4 border border-market-positive/20">
                <Server className="w-5 h-5 text-market-positive mb-2" />
                <div className="text-2xl font-bold text-foreground">{requirements.miners.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">ASIC Miners</div>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <TrendingUp className="w-5 h-5 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{requirements.hashrate} PH/s</div>
                <div className="text-sm text-muted-foreground">Total Hashrate</div>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <Zap className="w-5 h-5 text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">{requirements.transformerMVA} MVA</div>
                <div className="text-sm text-muted-foreground">Transformer Capacity</div>
              </div>
              <div className="bg-muted rounded-xl p-4 border border-border">
                <Calculator className="w-5 h-5 text-foreground mb-2" />
                <div className="text-2xl font-bold text-foreground">{requirements.landAcres} acres</div>
                <div className="text-sm text-muted-foreground">Land Required</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-lg font-semibold text-foreground">{requirements.coolingTons.toLocaleString()} tons</div>
                <div className="text-sm text-muted-foreground">Cooling Capacity</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-lg font-semibold text-foreground">{requirements.monthlyPowerMWh.toLocaleString()} MWh</div>
                <div className="text-sm text-muted-foreground">Monthly Power Consumption</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-lg font-semibold text-foreground">{requirements.staffRequired} people</div>
                <div className="text-sm text-muted-foreground">Operations Staff</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Planning Process Timeline
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planningSteps.map((step, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-market-positive rounded-full flex items-center justify-center text-white font-bold">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{step.title}</h4>
                    <span className="text-xs text-market-positive font-medium">{step.duration}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Planning Best Practices
              </h4>
              <ul className="space-y-2 text-green-700 text-sm">
                <li>• Build 20-30% capacity buffer for future growth</li>
                <li>• Plan electrical infrastructure for 10-year horizon</li>
                <li>• Include cooling redundancy (N+1 minimum)</li>
                <li>• Factor in local permitting timelines</li>
                <li>• Create multiple expansion phases</li>
              </ul>
            </div>
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Common Planning Pitfalls
              </h4>
              <ul className="space-y-2 text-amber-700 text-sm">
                <li>• Underestimating permitting complexity</li>
                <li>• Ignoring utility interconnection timelines</li>
                <li>• Insufficient contingency budget (25% minimum)</li>
                <li>• Not securing power before equipment</li>
                <li>• Overlooking cooling requirements for climate</li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
