import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Users, User, Clock, Shield } from "lucide-react";
import { LearningObjectives } from "@/components/electrical-education/LearningObjectives";
import { SectionSummary } from "@/components/electrical-education/SectionSummary";
import { StaffingCalculator } from "./StaffingCalculator";

const roles = [
  {
    title: "NOC Operator",
    ratio: "1 per 5-10 MW",
    responsibilities: [
      "24/7 monitoring of dashboards",
      "First response to alerts",
      "Basic troubleshooting and reboots",
      "Shift handoff documentation"
    ],
    skills: "Basic IT, attention to detail"
  },
  {
    title: "Field Technician",
    ratio: "1 per 10-20 MW",
    responsibilities: [
      "Physical hardware maintenance",
      "Component replacement",
      "Cleaning and inspections",
      "Cable management"
    ],
    skills: "Electronics repair, physical stamina"
  },
  {
    title: "Electrical Technician",
    ratio: "1 per 20-50 MW",
    responsibilities: [
      "Electrical system maintenance",
      "PDU and breaker management",
      "Power quality monitoring",
      "Electrical troubleshooting"
    ],
    skills: "Licensed electrician preferred"
  },
  {
    title: "Site Manager",
    ratio: "1 per site",
    responsibilities: [
      "Overall facility operations",
      "Team scheduling and management",
      "Vendor relationships",
      "Budget and reporting"
    ],
    skills: "Management experience, technical background"
  }
];

const shiftStructure = [
  {
    shift: "Day Shift",
    hours: "6 AM - 6 PM",
    coverage: "Full team",
    focus: "Maintenance, projects, optimization"
  },
  {
    shift: "Night Shift",
    hours: "6 PM - 6 AM",
    coverage: "Reduced team",
    focus: "Monitoring, emergency response"
  },
  {
    shift: "Weekend",
    hours: "Rotating",
    coverage: "Skeleton crew",
    focus: "Monitoring, critical issues only"
  }
];

const trainingTopics = [
  "Safety procedures and PPE",
  "Equipment-specific training",
  "Monitoring system usage",
  "Emergency response protocols",
  "Electrical safety (NFPA 70E)",
  "Performance optimization techniques"
];

const learningObjectives = [
  "Define staffing ratios for different facility sizes",
  "Structure shift schedules for 24/7 coverage",
  "Identify key roles and responsibilities",
  "Develop training programs for operations staff"
];

const takeaways = [
  "Typical staffing: 1 NOC operator per 5-10 MW, 1 technician per 10-20 MW",
  "24/7 coverage requires ~4.2 FTEs per position for shifts and PTO coverage",
  "Cross-training creates operational resilience",
  "Day shifts focus on maintenance, night shifts on monitoring"
];

export const TeamStructureSection = () => {
  return (
    <section id="team-structure" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-blue/10 text-watt-blue rounded-full text-sm font-medium mb-4">
              Lesson 6
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Team Structure & Staffing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Build and organize an effective operations team
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div className="mb-12">
            <LearningObjectives 
              objectives={learningObjectives}
              sectionTitle="Team Structure"
              accentColor="watt-blue"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {roles.map((role, index) => (
              <div key={role.title} className="bg-card border border-border rounded-xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-watt-blue/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-watt-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{role.title}</h3>
                    <span className="text-xs text-watt-bitcoin">{role.ratio}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {role.responsibilities.map(resp => (
                    <li key={resp} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-watt-blue">•</span>
                      {resp}
                    </li>
                  ))}
                </ul>
                <div className="text-xs bg-muted px-3 py-2 rounded">
                  <span className="font-medium">Skills:</span> {role.skills}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mb-12">
            <StaffingCalculator />
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={200}>
            <div className="bg-card border border-border rounded-2xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Shift Structure</h3>
              </div>
              <div className="space-y-4">
                {shiftStructure.map(shift => (
                  <div key={shift.shift} className="bg-background rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{shift.shift}</h4>
                      <span className="text-sm bg-watt-bitcoin/10 text-watt-bitcoin px-2 py-1 rounded">
                        {shift.hours}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="text-foreground ml-1">{shift.coverage}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Focus:</span>
                        <span className="text-foreground ml-1">{shift.focus}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="bg-card border border-border rounded-2xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-watt-success" />
                <h3 className="text-xl font-bold text-foreground">Training Requirements</h3>
              </div>
              <div className="space-y-3">
                {trainingTopics.map((topic, index) => (
                  <div key={topic} className="flex items-center gap-3 bg-background rounded-lg p-3 border border-border">
                    <span className="w-6 h-6 bg-watt-success/10 text-watt-success rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{topic}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-watt-success/10 border border-watt-success/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Pro Tip:</span> Invest in cross-training 
                  to ensure coverage during absences. A flexible team is a resilient team.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={350}>
          <SectionSummary
            title="Team Structure Summary"
            takeaways={takeaways}
            nextSectionId="safety"
            nextSectionLabel="Safety Protocols"
            accentColor="watt-blue"
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
