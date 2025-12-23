import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { TrendingUp, Gauge, Thermometer, Zap, Settings } from "lucide-react";
import { LearningObjectives } from "@/components/electrical-education/LearningObjectives";
import { SectionSummary } from "@/components/electrical-education/SectionSummary";
import { UptimeCalculator } from "./UptimeCalculator";

const optimizationStrategies = [
  {
    icon: Thermometer,
    title: "Temperature Management",
    description: "Optimal chip temperature is 65-75°C. Every 10°C increase above optimal reduces chip lifespan by ~50%.",
    techniques: [
      "Maintain cold aisle at 65-75°F (18-24°C)",
      "Hot aisle should not exceed 105°F (40°C)",
      "Monitor differential pressure across miners",
      "Clean filters to maintain airflow"
    ],
    impact: "+5-15% hashrate, +50% equipment life"
  },
  {
    icon: Zap,
    title: "Power Optimization",
    description: "Fine-tune voltage and frequency to maximize hashrate per watt (J/TH efficiency).",
    techniques: [
      "Use auto-tuning firmware when available",
      "Test different voltage profiles",
      "Balance power across phases",
      "Monitor power factor and correct if needed"
    ],
    impact: "+10-20% efficiency improvement"
  },
  {
    icon: Settings,
    title: "Firmware Optimization",
    description: "Custom and third-party firmware can unlock additional performance and features.",
    techniques: [
      "Evaluate BraiinsOS, VNish, or stock+",
      "Enable auto-tuning features",
      "Configure power targets appropriately",
      "Keep firmware updated for bug fixes"
    ],
    impact: "+5-30% hashrate or efficiency"
  }
];

const benchmarkMetrics = [
  { metric: "Hashrate per Unit", target: "Within 95% of spec", good: "90-95%", poor: "<90%" },
  { metric: "J/TH Efficiency", target: "Within 5% of rated", good: "5-15% above", poor: ">15% above" },
  { metric: "Uptime", target: ">98%", good: "95-98%", poor: "<95%" },
  { metric: "Reject Rate", target: "<1%", good: "1-3%", poor: ">3%" },
  { metric: "Power Factor", target: ">0.95", good: "0.90-0.95", poor: "<0.90" }
];

const learningObjectives = [
  "Implement temperature management for optimal chip performance",
  "Optimize power consumption and efficiency (J/TH)",
  "Evaluate and deploy firmware optimizations",
  "Benchmark performance against industry standards"
];

const takeaways = [
  "Temperature is critical: every 10°C above optimal reduces chip lifespan by ~50%",
  "Power optimization can yield 10-20% efficiency improvements",
  "Third-party firmware like BraiinsOS can unlock 5-30% additional performance",
  "Target metrics: >98% uptime, <1% reject rate, >0.95 power factor"
];

export const PerformanceOptimizationSection = () => {
  return (
    <section id="performance" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Lesson 5
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Performance Optimization
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Extract maximum performance and efficiency from your mining hardware
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div className="mb-12">
            <LearningObjectives 
              objectives={learningObjectives}
              sectionTitle="Performance Optimization"
              accentColor="coinbase"
            />
          </div>
        </ScrollReveal>

        <div className="space-y-8 mb-12">
          {optimizationStrategies.map((strategy, index) => (
            <ScrollReveal key={strategy.title} delay={100 + index * 50}>
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-watt-purple/10 rounded-2xl flex items-center justify-center">
                      <strategy.icon className="w-8 h-8 text-watt-purple" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-foreground mb-2">{strategy.title}</h3>
                    <p className="text-muted-foreground mb-4">{strategy.description}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Techniques:</h4>
                        <ul className="space-y-1">
                          {strategy.techniques.map(tech => (
                            <li key={tech} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-watt-purple">•</span>
                              {tech}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-end">
                        <div className="bg-watt-success/10 border border-watt-success/20 rounded-xl p-4 w-full">
                          <div className="text-sm text-muted-foreground mb-1">Expected Impact</div>
                          <div className="text-lg font-bold text-watt-success">{strategy.impact}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={250}>
          <div className="mb-12">
            <UptimeCalculator />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Gauge className="w-6 h-6 text-watt-blue" />
              <h3 className="text-2xl font-bold text-foreground">Performance Benchmarks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Metric</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Target</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Acceptable</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Needs Attention</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkMetrics.map(metric => (
                    <tr key={metric.metric} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">{metric.metric}</td>
                      <td className="py-3 px-4">
                        <span className="bg-watt-success/10 text-watt-success px-2 py-1 rounded text-sm">
                          {metric.target}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded text-sm">
                          {metric.good}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-sm">
                          {metric.poor}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={350}>
          <SectionSummary
            title="Optimization Summary"
            takeaways={takeaways}
            nextSectionId="team-structure"
            nextSectionLabel="Team Structure"
            accentColor="coinbase"
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
