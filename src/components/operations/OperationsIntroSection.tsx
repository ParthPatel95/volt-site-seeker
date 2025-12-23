import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Settings, Clock, Shield, TrendingUp } from "lucide-react";
import { LearningObjectives } from "@/components/electrical-education/LearningObjectives";
import { SectionSummary } from "@/components/electrical-education/SectionSummary";

const keyPrinciples = [
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Continuous oversight of all systems to maximize uptime and catch issues early"
  },
  {
    icon: Shield,
    title: "Preventive Maintenance",
    description: "Scheduled maintenance prevents costly failures and extends equipment life"
  },
  {
    icon: TrendingUp,
    title: "Performance Optimization",
    description: "Constant tuning to extract maximum efficiency from every watt consumed"
  },
  {
    icon: Settings,
    title: "Systematic Procedures",
    description: "Documented processes ensure consistency and enable rapid scaling"
  }
];

const learningObjectives = [
  "Understand the pillars of operational excellence in mining facilities",
  "Recognize the financial impact of operations on mining profitability",
  "Identify key performance indicators (KPIs) for mining operations",
  "Learn the difference between top-quartile and average operators"
];

const takeaways = [
  "Operations determine profitability more than initial facility design",
  "Top operators achieve 15-20% higher hashrate per MW through operational excellence",
  "Target uptime for profitable operations is 98%+",
  "Four pillars: Monitoring, Maintenance, Optimization, and Documentation"
];

export const OperationsIntroSection = () => {
  return (
    <section id="intro" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-blue/10 text-watt-blue rounded-full text-sm font-medium mb-4">
              Module 10: Operations & Maintenance
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Operations & Maintenance 101
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Master the day-to-day operations that separate profitable mining facilities from 
              struggling ones. Learn monitoring, maintenance, and optimization strategies.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div className="mb-12">
          <LearningObjectives 
              objectives={learningObjectives}
              sectionTitle="Introduction"
              accentColor="trust"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Operations Excellence Matters</h2>
            <p className="text-muted-foreground mb-6">
              A mining facility's profitability is determined more by operational excellence than initial 
              design. Even the best-designed facility will underperform without proper monitoring, 
              maintenance, and optimization. Industry data shows that top-quartile operators achieve 
              <span className="text-watt-blue font-semibold"> 15-20% higher hashrate per MW</span> than 
              average operators through superior operational practices.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-background rounded-xl p-4">
                <div className="text-3xl font-bold text-watt-blue">98%+</div>
                <div className="text-sm text-muted-foreground">Target Uptime</div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="text-3xl font-bold text-watt-success">15-20%</div>
                <div className="text-sm text-muted-foreground">Efficiency Gain</div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="text-3xl font-bold text-watt-bitcoin">3-5yr</div>
                <div className="text-sm text-muted-foreground">Equipment Life</div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="text-3xl font-bold text-watt-purple">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {keyPrinciples.map((principle, index) => (
            <ScrollReveal key={principle.title} delay={150 + index * 50}>
              <div className="bg-card border border-border rounded-xl p-6 h-full hover:border-watt-blue/50 transition-colors">
                <div className="w-12 h-12 bg-watt-blue/10 rounded-xl flex items-center justify-center mb-4">
                  <principle.icon className="w-6 h-6 text-watt-blue" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{principle.title}</h3>
                <p className="text-muted-foreground text-sm">{principle.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <SectionSummary
            title="Introduction Summary"
            takeaways={takeaways}
            nextSectionId="monitoring"
            nextSectionLabel="Monitoring Systems"
            accentColor="trust"
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
