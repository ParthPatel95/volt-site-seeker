import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Wrench, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { LearningObjectives } from "@/components/electrical-education/LearningObjectives";
import { SectionSummary } from "@/components/electrical-education/SectionSummary";
import { MaintenanceCycleWheel } from "./MaintenanceCycleWheel";

const cleaningProcedures = [
  {
    component: "ASIC Hashboards",
    method: "Compressed air at 30-40 PSI, 6-inch distance",
    frequency: "Monthly or as needed",
    caution: "Never use liquids, avoid static discharge"
  },
  {
    component: "Fans & Heatsinks",
    method: "Remove dust buildup, check blade integrity",
    frequency: "Monthly",
    caution: "Replace fans showing wear or noise"
  },
  {
    component: "Air Filters",
    method: "Replace disposable, wash reusable filters",
    frequency: "Weekly inspection",
    caution: "Dirty filters reduce cooling efficiency 20-40%"
  },
  {
    component: "Electrical Panels",
    method: "Vacuum dust, check for hot spots",
    frequency: "Quarterly",
    caution: "De-energize before maintenance"
  }
];

const learningObjectives = [
  "Develop a comprehensive preventive maintenance schedule",
  "Implement proper cleaning procedures for mining equipment",
  "Calculate the ROI of preventive vs. reactive maintenance",
  "Understand the cost of maintenance neglect"
];

const takeaways = [
  "Daily, weekly, monthly, and quarterly maintenance tasks each play critical roles",
  "Preventive maintenance reduces unplanned downtime by 70%",
  "Dirty air filters can reduce cooling efficiency by 20-40%",
  "Equipment life extension of 30-50% with proper maintenance"
];

export const PreventiveMaintenanceSection = () => {
  return (
    <section id="preventive-maintenance" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-success/10 text-watt-success rounded-full text-sm font-medium mb-4">
              Lesson 3
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Preventive Maintenance Programs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Structured maintenance prevents failures and extends equipment life
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div className="mb-12">
            <LearningObjectives 
              objectives={learningObjectives}
              sectionTitle="Preventive Maintenance"
              accentColor="success"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-12">
            <MaintenanceCycleWheel />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-6 h-6 text-watt-blue" />
              <h3 className="text-2xl font-bold text-foreground">Cleaning Procedures</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Component</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Method</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Frequency</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Caution</th>
                  </tr>
                </thead>
                <tbody>
                  {cleaningProcedures.map(proc => (
                    <tr key={proc.component} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">{proc.component}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{proc.method}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="bg-watt-blue/10 text-watt-blue px-2 py-1 rounded">{proc.frequency}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-sm text-amber-600">
                          <AlertTriangle className="w-3 h-3" />
                          {proc.caution}
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
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-watt-success/10 to-watt-success/5 border border-watt-success/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">ROI of Preventive Maintenance</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Equipment Life Extension</span>
                  <span className="font-bold text-watt-success">+30-50%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Unplanned Downtime Reduction</span>
                  <span className="font-bold text-watt-success">-70%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Repair Cost Reduction</span>
                  <span className="font-bold text-watt-success">-40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Energy Efficiency Improvement</span>
                  <span className="font-bold text-watt-success">+5-10%</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Cost of Neglect</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ASIC Premature Failure</span>
                  <span className="font-bold text-red-500">$2,000-8,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cooling System Failure</span>
                  <span className="font-bold text-red-500">$10,000-50,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Electrical Fire Risk</span>
                  <span className="font-bold text-red-500">Catastrophic</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lost Hashrate Per Hour</span>
                  <span className="font-bold text-red-500">$500-5,000</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={350}>
          <SectionSummary
            title="Maintenance Summary"
            takeaways={takeaways}
            nextSectionId="troubleshooting"
            nextSectionLabel="Troubleshooting"
            accentColor="success"
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
