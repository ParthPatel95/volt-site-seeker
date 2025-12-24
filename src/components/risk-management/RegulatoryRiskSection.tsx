import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Scale, FileText, MapPin, AlertCircle } from "lucide-react";
import { RiskLearningObjectives } from "./RiskLearningObjectives";
import { RiskSectionSummary } from "./RiskSectionSummary";

export const RegulatoryRiskSection = () => {
  const regulatoryAreas = [
    {
      area: "Energy & Utility Regulations",
      risks: [
        "Rate structure changes increasing power costs",
        "Demand response program modifications",
        "Grid interconnection rule changes",
        "Renewable energy mandates"
      ],
      jurisdictions: "State/Provincial utility commissions"
    },
    {
      area: "Environmental Compliance",
      risks: [
        "Noise ordinance violations",
        "Air quality permits for generators",
        "Water usage restrictions",
        "Carbon emission regulations"
      ],
      jurisdictions: "EPA, state environmental agencies"
    },
    {
      area: "Zoning & Land Use",
      risks: [
        "Industrial zoning requirements",
        "Special use permit conditions",
        "Setback and buffer requirements",
        "Community opposition (NIMBYism)"
      ],
      jurisdictions: "Local/municipal governments"
    },
    {
      area: "Financial Regulations",
      risks: [
        "Money transmission licensing",
        "Securities law compliance",
        "Tax treatment changes",
        "AML/KYC requirements"
      ],
      jurisdictions: "SEC, FinCEN, state regulators"
    }
  ];

  const jurisdictionRatings = [
    { jurisdiction: "Texas (ERCOT)", rating: "Favorable", notes: "Deregulated market, crypto-friendly governor" },
    { jurisdiction: "Alberta (AESO)", rating: "Favorable", notes: "Direct pool access, cold climate" },
    { jurisdiction: "New York", rating: "Restrictive", notes: "Mining moratorium, environmental focus" },
    { jurisdiction: "China", rating: "Banned", notes: "Complete ban since 2021" },
    { jurisdiction: "Kazakhstan", rating: "Mixed", notes: "Low costs but regulatory uncertainty" },
    { jurisdiction: "Paraguay", rating: "Emerging", notes: "Cheap hydro but infrastructure challenges" }
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Favorable": return "bg-watt-success/10 text-watt-success";
      case "Restrictive": return "bg-orange-500/10 text-orange-500";
      case "Banned": return "bg-red-500/10 text-red-500";
      case "Mixed": return "bg-yellow-500/10 text-yellow-600";
      case "Emerging": return "bg-watt-blue/10 text-watt-blue";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const learningObjectives = [
    "Score jurisdictions by regulatory friendliness using a structured framework",
    "Identify required permits and compliance requirements before site commitment",
    "Recognize regulatory red flags that could threaten your operation"
  ];

  const keyTakeaways = [
    "Jurisdiction selection is a long-term decision - regulatory changes can destroy profitability",
    "Engage with regulators proactively; build relationships before issues arise",
    "Maintain detailed compliance documentation for audits and legal protection",
    "Monitor legislative developments in energy, environmental, and financial regulations"
  ];

  return (
    <section id="regulatory-risk" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Lesson 4
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Regulatory & Compliance Risk
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Navigate the evolving regulatory landscape across jurisdictions
            </p>
          </div>
        </ScrollReveal>

        <RiskLearningObjectives objectives={learningObjectives} sectionTitle="Regulatory Risk" />

        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {regulatoryAreas.map((area) => (
              <div key={area.area} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-5 h-5 text-watt-purple" />
                  <h3 className="text-lg font-semibold text-foreground">{area.area}</h3>
                </div>
                <ul className="space-y-2 mb-4">
                  {area.risks.map(risk => (
                    <li key={risk} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
                <div className="text-xs bg-muted px-3 py-2 rounded">
                  <span className="font-medium">Oversight:</span> {area.jurisdictions}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-watt-blue" />
              <h3 className="text-2xl font-bold text-foreground">Jurisdiction Risk Assessment</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Jurisdiction</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rating</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {jurisdictionRatings.map(item => (
                    <tr key={item.jurisdiction} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">{item.jurisdiction}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${getRatingColor(item.rating)}`}>
                          {item.rating}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-purple/10 to-watt-blue/10 border border-watt-purple/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-watt-purple" />
              <h3 className="text-xl font-bold text-foreground">Compliance Best Practices</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Proactive Engagement</h4>
                <p className="text-sm text-muted-foreground">
                  Build relationships with regulators before issues arise. 
                  Participate in industry associations and comment on proposed rules.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Documentation</h4>
                <p className="text-sm text-muted-foreground">
                  Maintain detailed records of all permits, compliance activities, 
                  and regulatory communications for audits.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Expert Counsel</h4>
                <p className="text-sm text-muted-foreground">
                  Engage specialized legal and regulatory consultants familiar 
                  with energy and cryptocurrency industries.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <RiskSectionSummary 
          title="Regulatory Risk"
          keyTakeaways={keyTakeaways}
          nextSection={{ name: "Financial Risk", href: "#financial-risk" }}
        />
      </div>
    </section>
  );
};
