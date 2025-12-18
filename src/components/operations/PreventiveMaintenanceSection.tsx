import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Wrench, Calendar, CheckCircle, AlertTriangle } from "lucide-react";

export const PreventiveMaintenanceSection = () => {
  const maintenanceSchedule = [
    {
      frequency: "Daily",
      tasks: [
        "Visual inspection of all rows",
        "Check monitoring dashboards",
        "Review overnight alerts",
        "Verify cooling system operation"
      ],
      duration: "30-60 min"
    },
    {
      frequency: "Weekly",
      tasks: [
        "Air filter inspection/replacement",
        "Check electrical connections",
        "Test backup systems",
        "Review performance trends"
      ],
      duration: "2-4 hours"
    },
    {
      frequency: "Monthly",
      tasks: [
        "Deep clean all equipment",
        "Thermal imaging inspection",
        "Calibrate sensors",
        "Update firmware (if needed)"
      ],
      duration: "4-8 hours"
    },
    {
      frequency: "Quarterly",
      tasks: [
        "Full electrical inspection",
        "Cooling system maintenance",
        "Replace consumables",
        "Performance benchmarking"
      ],
      duration: "1-2 days"
    }
  ];

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

  return (
    <section id="maintenance" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
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

        <ScrollReveal delay={100}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-watt-success" />
              <h3 className="text-2xl font-bold text-foreground">Maintenance Schedule</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {maintenanceSchedule.map((schedule, index) => (
                <div key={schedule.frequency} className="bg-background rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground">{schedule.frequency}</h4>
                    <span className="text-xs bg-watt-success/10 text-watt-success px-2 py-1 rounded">
                      {schedule.duration}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {schedule.tasks.map(task => (
                      <li key={task} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-watt-success mt-0.5 flex-shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
          <div className="grid md:grid-cols-2 gap-6">
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
      </div>
    </section>
  );
};
