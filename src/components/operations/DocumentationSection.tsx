import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { FileText, ClipboardList, Database, BookOpen } from "lucide-react";
import { LearningObjectives } from "@/components/electrical-education/LearningObjectives";
import { SectionSummary } from "@/components/electrical-education/SectionSummary";

const documentTypes = [
  {
    icon: ClipboardList,
    title: "Standard Operating Procedures (SOPs)",
    description: "Step-by-step guides for all routine operations",
    examples: [
      "ASIC deployment procedure",
      "Firmware update process",
      "Scheduled maintenance checklist",
      "Emergency shutdown procedure"
    ],
    format: "Wiki or document management system"
  },
  {
    icon: FileText,
    title: "Shift Logs & Handoffs",
    description: "Continuous record of operations and issues",
    examples: [
      "Start/end of shift summaries",
      "Active issues and status",
      "Completed maintenance",
      "Pending tasks for next shift"
    ],
    format: "Digital logbook or ticketing system"
  },
  {
    icon: Database,
    title: "Asset Inventory",
    description: "Complete record of all equipment",
    examples: [
      "Serial numbers and locations",
      "Purchase dates and warranties",
      "Maintenance history",
      "Performance baselines"
    ],
    format: "CMMS or spreadsheet"
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Accumulated operational knowledge",
    examples: [
      "Troubleshooting guides",
      "Best practices learned",
      "Vendor contacts",
      "Training materials"
    ],
    format: "Wiki or shared documentation"
  }
];

const kpiTracking = [
  { kpi: "Total Hashrate", frequency: "Real-time", owner: "NOC", target: "95%+ of theoretical" },
  { kpi: "Uptime %", frequency: "Daily", owner: "Site Manager", target: ">98%" },
  { kpi: "Energy Efficiency (J/TH)", frequency: "Weekly", owner: "Engineering", target: "Within 10% of spec" },
  { kpi: "Mean Time to Repair", frequency: "Monthly", owner: "Operations", target: "<4 hours" },
  { kpi: "Preventive vs Reactive Ratio", frequency: "Monthly", owner: "Maintenance", target: ">80% preventive" },
  { kpi: "Safety Incidents", frequency: "Monthly", owner: "Safety", target: "Zero" }
];

const learningObjectives = [
  "Create comprehensive Standard Operating Procedures (SOPs)",
  "Implement effective shift handoff documentation",
  "Maintain accurate asset inventory and tracking",
  "Track and report on key performance indicators"
];

const takeaways = [
  "Four pillars of documentation: SOPs, Shift Logs, Asset Inventory, Knowledge Base",
  "Documentation must be simple, current, and accessible to be useful",
  "Track KPIs including uptime, efficiency, MTTR, and safety incidents",
  "Target >80% preventive maintenance vs. reactive maintenance"
];

export const DocumentationSection = () => {
  return (
    <section id="documentation" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-success/10 text-watt-success rounded-full text-sm font-medium mb-4">
              Lesson 8
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Documentation & Reporting
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Systematic documentation enables consistency and continuous improvement
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div className="mb-12">
            <LearningObjectives 
              objectives={learningObjectives}
              sectionTitle="Documentation"
              accentColor="watt-success"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {documentTypes.map((doc, index) => (
              <div key={doc.title} className="bg-card border border-border rounded-xl p-6 h-full">
                <div className="w-12 h-12 bg-watt-success/10 rounded-xl flex items-center justify-center mb-4">
                  <doc.icon className="w-6 h-6 text-watt-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{doc.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                <div className="mb-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Examples:</div>
                  <ul className="space-y-1">
                    {doc.examples.map(ex => (
                      <li key={ex} className="text-xs text-foreground flex items-center gap-1">
                        <span className="w-1 h-1 bg-watt-success rounded-full"></span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs bg-muted px-2 py-1 rounded">
                  Format: {doc.format}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-6">Key Performance Indicators (KPIs)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">KPI</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Frequency</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Owner</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiTracking.map(kpi => (
                    <tr key={kpi.kpi} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">{kpi.kpi}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm bg-watt-blue/10 text-watt-blue px-2 py-1 rounded">
                          {kpi.frequency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{kpi.owner}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm bg-watt-success/10 text-watt-success px-2 py-1 rounded">
                          {kpi.target}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-success/10 to-watt-blue/10 border border-watt-success/20 rounded-2xl p-8 mb-12">
            <h4 className="text-xl font-bold text-foreground mb-4">Documentation Best Practices</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="font-semibold text-foreground mb-2">Keep It Simple</h5>
                <p className="text-sm text-muted-foreground">
                  Documentation only has value if people use it. Write clearly, 
                  use visuals, and keep procedures concise.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-2">Keep It Current</h5>
                <p className="text-sm text-muted-foreground">
                  Outdated documentation is worse than none. Review and update 
                  regularly, especially after process changes.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-2">Make It Accessible</h5>
                <p className="text-sm text-muted-foreground">
                  Store documentation where staff can quickly find it. 
                  Consider tablets or monitors at work stations.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={350}>
          <SectionSummary
            title="Documentation Summary"
            takeaways={takeaways}
            nextSectionId="cta"
            nextSectionLabel="Complete Module"
            accentColor="watt-success"
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
