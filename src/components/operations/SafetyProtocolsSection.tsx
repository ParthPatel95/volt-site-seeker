import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Shield, AlertTriangle, Zap, Flame, HardHat } from "lucide-react";
import { LearningObjectives } from "@/components/electrical-education/LearningObjectives";
import { SectionSummary } from "@/components/electrical-education/SectionSummary";

const safetyCategories = [
  {
    icon: Zap,
    title: "Electrical Safety",
    color: "watt-bitcoin",
    protocols: [
      "Lockout/Tagout (LOTO) procedures for all electrical work",
      "NFPA 70E compliance for arc flash protection",
      "PPE requirements: voltage-rated gloves, face shields",
      "Never work on energized equipment without authorization",
      "Ground fault protection on all circuits"
    ]
  },
  {
    icon: Flame,
    title: "Fire Prevention",
    color: "red-500",
    protocols: [
      "Clean air filters regularly to prevent airflow restriction",
      "Monitor for electrical hot spots with thermal imaging",
      "Maintain proper spacing between equipment",
      "Install and test smoke detection systems",
      "Keep fire extinguishers accessible (Class C rated)"
    ]
  },
  {
    icon: HardHat,
    title: "Physical Safety",
    color: "watt-blue",
    protocols: [
      "Hearing protection in high-noise areas (>85 dB)",
      "Steel-toe boots in all operational areas",
      "Proper lifting techniques for heavy equipment",
      "Ladder safety and fall prevention",
      "Clear emergency exit paths at all times"
    ]
  }
];

const emergencyProcedures = [
  {
    emergency: "Power Outage",
    steps: ["Secure all personnel", "Assess UPS/generator status", "Notify utility company", "Document affected equipment", "Plan systematic restart"]
  },
  {
    emergency: "Fire Alarm",
    steps: ["Evacuate immediately", "Call 911", "Account for all personnel", "Do not re-enter without clearance", "Document incident"]
  },
  {
    emergency: "Electrical Shock",
    steps: ["Do not touch victim if still in contact", "Cut power if safe to do so", "Call 911", "Administer first aid/CPR", "Report incident"]
  },
  {
    emergency: "Equipment Failure",
    steps: ["Isolate affected equipment", "Assess scope of damage", "Implement workarounds", "Contact vendors if needed", "Document root cause"]
  }
];

const learningObjectives = [
  "Implement comprehensive electrical safety protocols including LOTO",
  "Develop fire prevention and detection systems",
  "Establish physical safety requirements for personnel",
  "Create and drill emergency response procedures"
];

const takeaways = [
  "No hashrate is worth compromising safety—safety always comes first",
  "NFPA 70E compliance is mandatory for electrical work",
  "Hearing protection required in areas exceeding 85 dB",
  "Emergency procedures must be documented, trained, and drilled regularly"
];

export const SafetyProtocolsSection = () => {
  return (
    <section id="safety" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-sm font-medium mb-4">
              Lesson 7
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Safety Protocols & Emergency Response
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Protect your team and facility with comprehensive safety procedures
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div className="mb-12">
            <LearningObjectives 
              objectives={learningObjectives}
              sectionTitle="Safety Protocols"
              accentColor="bitcoin"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-foreground">Safety First</h3>
            </div>
            <p className="text-muted-foreground">
              Mining facilities present unique hazards including high-voltage electricity, extreme heat, 
              noise levels exceeding 90 dB, and heavy equipment. A single safety incident can result in 
              serious injury, death, or facility destruction. <span className="font-semibold text-foreground">
              No amount of hashrate is worth compromising safety.</span>
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {safetyCategories.map((category, index) => (
            <ScrollReveal key={category.title} delay={150 + index * 50}>
              <div className="bg-card border border-border rounded-xl p-6 h-full">
                <div className={`w-12 h-12 bg-${category.color}/10 rounded-xl flex items-center justify-center mb-4`}>
                  <category.icon className={`w-6 h-6 text-${category.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-4">{category.title}</h3>
                <ul className="space-y-3">
                  {category.protocols.map(protocol => (
                    <li key={protocol} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-watt-success mt-0.5 flex-shrink-0" />
                      {protocol}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-2xl font-bold text-foreground">Emergency Response Procedures</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {emergencyProcedures.map((procedure, index) => (
                <div key={procedure.emergency} className="bg-background border border-border rounded-xl p-6">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    {procedure.emergency}
                  </h4>
                  <ol className="space-y-2">
                    {procedure.steps.map((step, i) => (
                      <li key={step} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-5 h-5 bg-watt-blue/10 text-watt-blue rounded-full flex items-center justify-center text-xs flex-shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={350}>
          <SectionSummary
            title="Safety Summary"
            takeaways={takeaways}
            nextSectionId="documentation"
            nextSectionLabel="Documentation"
            accentColor="bitcoin"
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
