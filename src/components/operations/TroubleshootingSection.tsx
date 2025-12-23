import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Search, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { LearningObjectives } from "@/components/electrical-education/LearningObjectives";
import { SectionSummary } from "@/components/electrical-education/SectionSummary";

const commonIssues = [
  {
    symptom: "ASIC Not Hashing",
    possibleCauses: ["Power supply failure", "Control board issue", "Network disconnection", "Overheating shutdown"],
    diagnosticSteps: [
      "Check LED indicators on PSU and control board",
      "Verify network connectivity and IP assignment",
      "Check temperature readings in management interface",
      "Test with known-good power supply"
    ],
    resolution: "Replace failed component or reset if software issue"
  },
  {
    symptom: "Low Hashrate",
    possibleCauses: ["Overheating", "Dusty hashboards", "Failing chips", "Undervolting"],
    diagnosticSteps: [
      "Compare current hashrate to baseline",
      "Check individual chip temperatures",
      "Review voltage and frequency settings",
      "Inspect for dust accumulation"
    ],
    resolution: "Clean, adjust cooling, or replace failing components"
  },
  {
    symptom: "High Reject Rate",
    possibleCauses: ["Network latency", "Pool issues", "Hardware errors", "Incorrect settings"],
    diagnosticSteps: [
      "Check network latency to pool",
      "Review pool dashboard for issues",
      "Examine ASIC error logs",
      "Verify mining software configuration"
    ],
    resolution: "Optimize network, switch pools, or fix configuration"
  },
  {
    symptom: "Frequent Reboots",
    possibleCauses: ["Power instability", "Overheating", "Firmware bugs", "Memory errors"],
    diagnosticSteps: [
      "Monitor power quality at PDU",
      "Check thermal paste condition",
      "Review reboot patterns and logs",
      "Test with different firmware version"
    ],
    resolution: "Stabilize power, improve cooling, or reflash firmware"
  }
];

const escalationMatrix = [
  { level: "L1 - Operator", scope: "Basic troubleshooting, reboots, cleaning", time: "0-15 min" },
  { level: "L2 - Technician", scope: "Component replacement, diagnostics", time: "15-60 min" },
  { level: "L3 - Engineer", scope: "Complex repairs, system issues", time: "1-4 hours" },
  { level: "L4 - Vendor/Expert", scope: "Warranty claims, major failures", time: "4+ hours" }
];

const learningObjectives = [
  "Apply systematic troubleshooting methodologies",
  "Diagnose common ASIC issues including hashrate loss and connectivity problems",
  "Implement escalation procedures for different issue severities",
  "Document and learn from troubleshooting incidents"
];

const takeaways = [
  "Systematic diagnostics: identify symptom → possible causes → diagnostic steps → resolution",
  "Four-level escalation matrix ensures issues reach the right expertise level",
  "Most common issues: power problems, overheating, network issues, and firmware bugs",
  "Document all troubleshooting for knowledge base building"
];

export const TroubleshootingSection = () => {
  return (
    <section id="troubleshooting" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Lesson 4
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Troubleshooting & Diagnostics
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Systematic approaches to identify and resolve issues quickly
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div className="mb-12">
            <LearningObjectives 
              objectives={learningObjectives}
              sectionTitle="Troubleshooting"
              accentColor="bitcoin"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="space-y-6 mb-12">
            {commonIssues.map((issue, index) => (
              <div key={issue.symptom} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="bg-watt-bitcoin/5 border-b border-border px-6 py-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-watt-bitcoin" />
                    <h3 className="text-lg font-semibold text-foreground">{issue.symptom}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Possible Causes</h4>
                      <ul className="space-y-2">
                        {issue.possibleCauses.map(cause => (
                          <li key={cause} className="flex items-center gap-2 text-sm text-foreground">
                            <span className="w-1.5 h-1.5 bg-watt-bitcoin rounded-full"></span>
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Diagnostic Steps</h4>
                      <ol className="space-y-2">
                        {issue.diagnosticSteps.map((step, i) => (
                          <li key={step} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="w-5 h-5 bg-watt-blue/10 text-watt-blue rounded-full flex items-center justify-center text-xs flex-shrink-0">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Resolution</h4>
                      <div className="flex items-start gap-2 text-sm text-foreground bg-watt-success/10 rounded-lg p-4">
                        <CheckCircle2 className="w-5 h-5 text-watt-success flex-shrink-0" />
                        {issue.resolution}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-6 h-6 text-watt-purple" />
              <h3 className="text-2xl font-bold text-foreground">Escalation Matrix</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {escalationMatrix.map((level, index) => (
                <div key={level.level} className="relative">
                  <div className="bg-background border border-border rounded-xl p-4 h-full">
                    <div className="text-sm font-bold text-watt-purple mb-2">{level.level}</div>
                    <p className="text-sm text-foreground mb-3">{level.scope}</p>
                    <div className="text-xs bg-muted px-2 py-1 rounded inline-block">
                      Response: {level.time}
                    </div>
                  </div>
                  {index < escalationMatrix.length - 1 && (
                    <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={250}>
          <SectionSummary
            title="Troubleshooting Summary"
            takeaways={takeaways}
            nextSectionId="performance"
            nextSectionLabel="Performance Optimization"
            accentColor="bitcoin"
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
