import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { RiskLearningObjectives } from "./RiskLearningObjectives";
import { RiskSectionSummary } from "./RiskSectionSummary";

export const CrisisManagementSection = () => {
  const crisisScenarios = [
    {
      scenario: "Market Crash (BTC -50%+)",
      immediateActions: [
        "Assess current break-even vs market price",
        "Review cash runway and liquidity",
        "Evaluate which miners to keep running",
        "Communicate with lenders/stakeholders"
      ],
      recoveryActions: [
        "Shut down unprofitable miners",
        "Renegotiate power contracts if possible",
        "Sell non-core assets",
        "Explore hosting revenue opportunities"
      ]
    },
    {
      scenario: "Major Facility Incident",
      immediateActions: [
        "Ensure personnel safety first",
        "Activate emergency response plan",
        "Secure the facility",
        "Notify insurance carrier"
      ],
      recoveryActions: [
        "Assess damage and recovery timeline",
        "Implement business continuity plan",
        "Communicate with customers/stakeholders",
        "Document everything for insurance"
      ]
    },
    {
      scenario: "Regulatory Action",
      immediateActions: [
        "Engage legal counsel immediately",
        "Preserve all relevant documentation",
        "Assess compliance status",
        "Prepare response strategy"
      ],
      recoveryActions: [
        "Cooperate with authorities appropriately",
        "Implement required changes",
        "Consider relocation if necessary",
        "Engage PR/communications support"
      ]
    }
  ];

  const recoveryPriorities = [
    { priority: 1, item: "Personnel Safety", timeframe: "Immediate", description: "Ensure all staff are safe and accounted for" },
    { priority: 2, item: "Facility Security", timeframe: "< 1 hour", description: "Secure premises and critical assets" },
    { priority: 3, item: "Stakeholder Communication", timeframe: "< 4 hours", description: "Notify key stakeholders of situation" },
    { priority: 4, item: "Damage Assessment", timeframe: "< 24 hours", description: "Evaluate extent of impact" },
    { priority: 5, item: "Recovery Planning", timeframe: "< 48 hours", description: "Develop detailed recovery roadmap" },
    { priority: 6, item: "Operations Restoration", timeframe: "ASAP", description: "Return to normal operations" }
  ];

  const learningObjectives = [
    "Develop crisis response playbooks for 3 critical scenarios (market crash, incident, regulatory)",
    "Establish recovery priority frameworks with clear timeframes",
    "Build stakeholder communication protocols for crisis situations"
  ];

  const keyTakeaways = [
    "Personnel safety is ALWAYS the #1 priority in any crisis situation",
    "Have documented response plans - during a crisis is not the time to figure things out",
    "Communicate proactively with stakeholders - silence creates uncertainty and erodes trust",
    "Document everything during a crisis for insurance claims and post-incident analysis"
  ];

  return (
    <section id="crisis" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-sm font-medium mb-4">
              Lesson 8
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Crisis Management & Recovery
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Prepare for worst-case scenarios with documented response plans
            </p>
          </div>
        </ScrollReveal>

        <RiskLearningObjectives objectives={learningObjectives} sectionTitle="Crisis Management" />

        <div className="space-y-6 mb-12">
          {crisisScenarios.map((crisis, index) => (
            <ScrollReveal key={crisis.scenario} delay={100 + index * 50}>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="bg-red-500/5 border-b border-border px-6 py-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-foreground">{crisis.scenario}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        Immediate Actions (0-24 hours)
                      </h4>
                      <ul className="space-y-2">
                        {crisis.immediateActions.map((action, i) => (
                          <li key={action} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-5 h-5 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                              {i + 1}
                            </span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-watt-success" />
                        Recovery Actions (24+ hours)
                      </h4>
                      <ul className="space-y-2">
                        {crisis.recoveryActions.map((action, i) => (
                          <li key={action} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-5 h-5 bg-watt-success/10 text-watt-success rounded-full flex items-center justify-center text-xs flex-shrink-0">
                              {i + 1}
                            </span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Recovery Priority Framework</h3>
            <div className="space-y-4">
              {recoveryPriorities.map((item) => (
                <div key={item.priority} className="flex items-center gap-4 bg-background rounded-xl p-4 border border-border">
                  <span className="w-10 h-10 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full flex items-center justify-center font-bold">
                    {item.priority}
                  </span>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{item.item}</h4>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{item.timeframe}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <RiskSectionSummary 
          title="Crisis Management"
          keyTakeaways={keyTakeaways}
        />
      </div>
    </section>
  );
};
