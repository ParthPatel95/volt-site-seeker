import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Scale, Shield, FileText, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import SiteSelectionLearningObjectives from './SiteSelectionLearningObjectives';
import SiteSelectionSectionSummary from './SiteSelectionSectionSummary';

const RegulatoryEnvironmentSection = () => {
  const jurisdictions = [
    {
      region: "Texas",
      crypto: "Friendly",
      permits: "Moderate",
      timeline: "6-12 months",
      highlights: ["No state income tax", "ERCOT market access", "Senate Bill 1929 protections"],
      risks: ["Grid reliability scrutiny", "Curtailment requirements"],
      score: 85
    },
    {
      region: "Alberta, Canada",
      crypto: "Friendly",
      permits: "Streamlined",
      timeline: "6-9 months",
      highlights: ["Self-Retailer model", "Clear regulations", "Industrial zoning available"],
      risks: ["Carbon pricing", "Federal scrutiny potential"],
      score: 90
    },
    {
      region: "Wyoming",
      crypto: "Very Friendly",
      permits: "Easy",
      timeline: "3-6 months",
      highlights: ["Digital asset legislation", "No corporate income tax", "Wind PPAs"],
      risks: ["Limited transmission", "Smaller market"],
      score: 88
    },
    {
      region: "New York",
      crypto: "Hostile",
      permits: "Difficult",
      timeline: "18-36 months",
      highlights: ["Existing hydro sites grandfathered"],
      risks: ["Moratorium on new PoW", "Environmental reviews", "Political opposition"],
      score: 25
    },
    {
      region: "Paraguay",
      crypto: "Mixed",
      permits: "Moderate",
      timeline: "6-12 months",
      highlights: ["Cheap hydro ($0.02/kWh)", "USD-denominated contracts"],
      risks: ["Regulatory uncertainty", "Infrastructure quality", "Political instability"],
      score: 65
    },
    {
      region: "Kazakhstan",
      crypto: "Restricted",
      permits: "Complex",
      timeline: "12-24 months",
      highlights: ["Low energy costs", "Existing infrastructure"],
      risks: ["Licensing requirements", "Power quotas", "Political risk"],
      score: 45
    }
  ];

  const permitTypes = [
    {
      permit: "Conditional Use Permit (CUP)",
      authority: "Local County/City",
      timeline: "2-6 months",
      requirements: "Zoning compliance, noise study, traffic analysis",
      tips: "Engage early with planning department, attend community meetings"
    },
    {
      permit: "Building Permit",
      authority: "Local Building Dept",
      timeline: "1-3 months",
      requirements: "Engineered plans, code compliance, inspections",
      tips: "Use experienced local contractors familiar with process"
    },
    {
      permit: "Electrical Permit",
      authority: "Local/State",
      timeline: "1-2 months",
      requirements: "Licensed electrician, load calculations, inspections",
      tips: "Coordinate with utility interconnection timeline"
    },
    {
      permit: "Environmental Review",
      authority: "State/Federal (if applicable)",
      timeline: "3-18 months",
      requirements: "NEPA/SEPA review, species assessment, water permits",
      tips: "Early screening to identify triggers; avoid sensitive areas"
    },
    {
      permit: "Air Quality Permit",
      authority: "State Environmental Agency",
      timeline: "2-6 months",
      requirements: "Emissions inventory (backup generators)",
      tips: "May be exempt for small operations; check thresholds"
    },
    {
      permit: "Utility Interconnection",
      authority: "Utility/ISO",
      timeline: "6-24 months",
      requirements: "Application, studies, agreement, construction",
      tips: "Often the longest lead item; start immediately"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-watt-success bg-watt-success/20';
    if (score >= 60) return 'text-watt-bitcoin bg-watt-bitcoin/20';
    if (score >= 40) return 'text-yellow-500 bg-yellow-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  return (
    <section id="regulatory" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Regulatory Environment
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Navigating Regulations & Permits
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Regulatory environment can make or break a project. Understanding 
              jurisdictional attitudes and permitting requirements is essential.
            </p>
          </div>
        </ScrollReveal>

        {/* Learning Objectives */}
        <ScrollReveal delay={50}>
          <SiteSelectionLearningObjectives
            variant="light"
            objectives={[
              "Score jurisdictions by crypto-friendliness and permitting complexity",
              "Identify required permits and realistic timelines for each",
              "Recognize regulatory red flags that could derail your project",
              "Develop strategies for navigating complex permitting environments"
            ]}
            estimatedTime="8 min"
            prerequisites={[
              { title: "Energy Markets", href: "#energy-markets" }
            ]}
          />
        </ScrollReveal>

        {/* Jurisdiction Scorecard */}
        <ScrollReveal delay={100}>
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-8">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Scale className="w-5 h-5 text-watt-purple" />
              Jurisdiction Scorecard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Region</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Crypto Stance</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Permitting</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Timeline</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {jurisdictions.map((j, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium text-foreground">{j.region}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          j.crypto === 'Very Friendly' ? 'bg-watt-success/20 text-watt-success' :
                          j.crypto === 'Friendly' ? 'bg-blue-100 text-blue-600' :
                          j.crypto === 'Mixed' ? 'bg-yellow-100 text-yellow-600' :
                          j.crypto === 'Restricted' ? 'bg-orange-100 text-orange-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {j.crypto}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{j.permits}</td>
                      <td className="py-3 px-4 text-muted-foreground">{j.timeline}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(j.score)}`}>
                          {j.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Detailed Cards */}
        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {jurisdictions.slice(0, 3).map((j, idx) => (
              <div key={idx} className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-foreground">{j.region}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(j.score)}`}>
                    {j.score}/100
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-watt-success mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Highlights
                    </h5>
                    <ul className="space-y-1">
                      {j.highlights.map((h, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {h}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Risks
                    </h5>
                    <ul className="space-y-1">
                      {j.risks.map((r, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Permit Types */}
        <ScrollReveal delay={300}>
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-watt-purple" />
              Common Permits & Approvals
            </h3>
            <div className="space-y-4">
              {permitTypes.map((permit, idx) => (
                <div key={idx} className="p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{permit.permit}</h4>
                      <p className="text-sm text-muted-foreground">{permit.authority}</p>
                    </div>
                    <span className="text-sm font-medium text-watt-purple bg-watt-purple/10 px-3 py-1 rounded-full w-fit">
                      {permit.timeline}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Requirements:</strong> {permit.requirements}
                  </p>
                  <p className="text-sm text-watt-success">
                    <strong>💡 Tip:</strong> {permit.tips}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Section Summary */}
        <ScrollReveal delay={350}>
          <SiteSelectionSectionSummary
            keyTakeaways={[
              "Wyoming, Alberta, and Texas score highest for crypto-friendly regulations (85-90/100)",
              "Utility interconnection (6-24 months) is often the longest permitting item — start immediately",
              "Engage early with local planning departments and attend community meetings for smoother approvals",
              "Avoid jurisdictions with moratoriums or hostile political environments (e.g., New York for new projects)"
            ]}
            proTip="Before finalizing any site, research recent local news for anti-crypto sentiment. Community opposition can add 12+ months to your timeline even if regulations are favorable."
            nextSection={{
              title: "Climate Analysis",
              id: "climate"
            }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default RegulatoryEnvironmentSection;
