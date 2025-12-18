import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Search, CheckCircle2, AlertTriangle, FileText, Users, Hammer } from 'lucide-react';

const DueDiligenceSection = () => {
  const dueDiligencePhases = [
    {
      phase: "Phase 1: Initial Screening",
      duration: "1-2 weeks",
      icon: Search,
      tasks: [
        "Verify power availability (utility confirmation letter)",
        "Confirm zoning compatibility",
        "Review satellite imagery and site access",
        "Preliminary rate analysis",
        "Check for environmental red flags"
      ],
      deliverables: ["Go/No-Go decision", "Initial site score"],
      costRange: "$5K-15K"
    },
    {
      phase: "Phase 2: Technical Assessment",
      duration: "2-4 weeks",
      icon: FileText,
      tasks: [
        "Site visit and physical inspection",
        "Utility interconnection pre-application",
        "Geotechnical survey (soil conditions)",
        "Environmental Phase I assessment",
        "Topographic survey",
        "Fiber/internet availability check"
      ],
      deliverables: ["Technical feasibility report", "Interconnection cost estimate"],
      costRange: "$25K-75K"
    },
    {
      phase: "Phase 3: Legal & Financial",
      duration: "2-4 weeks",
      icon: Users,
      tasks: [
        "Title search and property survey",
        "Review existing easements and encumbrances",
        "Environmental Phase II (if needed)",
        "Negotiate purchase/lease terms",
        "Review utility tariffs and contracts",
        "Tax incentive analysis"
      ],
      deliverables: ["Legal opinion", "Pro forma financial model"],
      costRange: "$15K-50K"
    },
    {
      phase: "Phase 4: Final Approval",
      duration: "1-2 weeks",
      icon: CheckCircle2,
      tasks: [
        "Internal investment committee review",
        "Final negotiation of terms",
        "Prepare closing documents",
        "Execute purchase/lease agreement",
        "Submit interconnection application"
      ],
      deliverables: ["Executed contracts", "Project kickoff"],
      costRange: "$10K-25K (legal)"
    }
  ];

  const redFlags = [
    { flag: "Utility capacity uncertainty", severity: "Critical", action: "Get written capacity confirmation before proceeding" },
    { flag: "Environmental contamination history", severity: "Critical", action: "Require Phase II assessment and remediation estimates" },
    { flag: "Zoning requires variance", severity: "High", action: "Assess political climate and timeline for approval" },
    { flag: "Single access road", severity: "Medium", action: "Verify road capacity for construction and operations" },
    { flag: "Flood zone or wetlands", severity: "High", action: "Review FEMA maps, consider alternative sites" },
    { flag: "Proximity to residential areas", severity: "High", action: "Noise study required, community engagement plan" },
    { flag: "Disputed property boundaries", severity: "Medium", action: "Survey required before proceeding" },
    { flag: "Water scarcity region", severity: "Medium", action: "Evaluate cooling alternatives, water rights" }
  ];

  const expertTeam = [
    { role: "Real Estate Attorney", responsibility: "Title, contracts, zoning" },
    { role: "Electrical Engineer", responsibility: "Interconnection, power systems" },
    { role: "Environmental Consultant", responsibility: "Phase I/II, permitting" },
    { role: "Civil Engineer", responsibility: "Geotechnical, site design" },
    { role: "Energy Broker/Consultant", responsibility: "Rate analysis, PPA negotiation" },
    { role: "Tax Advisor", responsibility: "Incentives, depreciation, structure" }
  ];

  return (
    <section id="due-diligence" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Due Diligence
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Comprehensive Due Diligence Process
            </h2>
            <p className="text-watt-navy/70 max-w-2xl mx-auto">
              A thorough due diligence process protects your investment and prevents 
              costly surprises. Budget 6-12 weeks and $50-150K for proper assessment.
            </p>
          </div>
        </ScrollReveal>

        {/* Due Diligence Phases */}
        <ScrollReveal delay={100}>
          <div className="space-y-6 mb-12">
            {dueDiligencePhases.map((phase, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-watt-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <phase.icon className="w-6 h-6 text-watt-purple" />
                    </div>
                    <div>
                      <h3 className="font-bold text-watt-navy">{phase.phase}</h3>
                      <p className="text-sm text-watt-purple">{phase.duration} • {phase.costRange}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-watt-navy mb-2">Key Tasks</h4>
                      <ul className="space-y-1">
                        {phase.tasks.map((task, i) => (
                          <li key={i} className="text-sm text-watt-navy/70 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-watt-purple rounded-full mt-2 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-watt-navy mb-2">Deliverables</h4>
                      <ul className="space-y-1">
                        {phase.deliverables.map((d, i) => (
                          <li key={i} className="text-sm text-watt-success flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Red Flags & Expert Team */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Red Flags */}
          <ScrollReveal delay={200}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Red Flags to Watch
              </h3>
              <div className="space-y-3">
                {redFlags.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-watt-navy text-sm">{item.flag}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                        item.severity === 'High' ? 'bg-orange-100 text-orange-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-xs text-watt-navy/60">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Expert Team */}
          <ScrollReveal delay={300}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-watt-purple" />
                Build Your Expert Team
              </h3>
              <p className="text-sm text-watt-navy/70 mb-4">
                Don't try to do it alone. Engage specialists early to avoid costly mistakes:
              </p>
              <div className="space-y-3">
                {expertTeam.map((expert, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-watt-purple/5 rounded-lg">
                    <div className="w-8 h-8 bg-watt-purple/20 rounded-full flex items-center justify-center">
                      <span className="text-watt-purple font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-watt-navy text-sm">{expert.role}</div>
                      <div className="text-xs text-watt-navy/60">{expert.responsibility}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-watt-success/10 rounded-lg">
                <p className="text-xs text-watt-navy/70">
                  <strong className="text-watt-success">Pro Tip:</strong> Experienced site developers 
                  often have pre-negotiated relationships with these specialists, reducing costs and timelines.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Checklist Summary */}
        <ScrollReveal delay={400}>
          <div className="mt-12 bg-gradient-to-r from-watt-purple/10 to-watt-bitcoin/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-watt-navy mb-6 text-center flex items-center justify-center gap-2">
              <Hammer className="w-5 h-5 text-watt-purple" />
              Pre-Acquisition Checklist Summary
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { category: "Power", items: ["Utility LOI", "Rate analysis", "Interconnection estimate"] },
                { category: "Land", items: ["Title clear", "Survey complete", "Zoning confirmed"] },
                { category: "Environment", items: ["Phase I clean", "No wetlands", "Noise plan"] },
                { category: "Financial", items: ["Pro forma complete", "Incentives identified", "Financing secured"] }
              ].map((cat, idx) => (
                <div key={idx} className="bg-white/60 rounded-xl p-4">
                  <h4 className="font-semibold text-watt-navy mb-3">{cat.category}</h4>
                  <ul className="space-y-2">
                    {cat.items.map((item, i) => (
                      <li key={i} className="text-sm text-watt-navy/70 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-watt-purple/30 rounded" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DueDiligenceSection;
