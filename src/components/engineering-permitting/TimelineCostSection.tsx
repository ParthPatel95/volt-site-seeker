import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Calendar, DollarSign } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight } from './shared';

const TimelineCostSection = () => {
  const timeline = [
    { 
      phase: "Municipal Development Permit", 
      duration: "60-90 days", 
      cost: "$21,500 - $23,750",
      source: "Lamont County" 
    },
    { 
      phase: "Safety Code Permits", 
      duration: "30-60 days", 
      cost: "$10,000 - $50,000",
      source: "The Inspections Group Inc." 
    },
    { 
      phase: "AESO Connection Process", 
      duration: "12-24 months", 
      cost: "$50,000 - $500,000+",
      source: "AESO" 
    },
    { 
      phase: "AUC Approval (if generating ≥10MW)", 
      duration: "6-12 months", 
      cost: "$25,000 - $100,000",
      source: "AUC Rule 007" 
    },
    { 
      phase: "Noise Impact Assessment", 
      duration: "4-8 weeks", 
      cost: "$15,000 - $40,000",
      source: "If required" 
    },
    { 
      phase: "Construction & Commissioning", 
      duration: "6-12 months", 
      cost: "Varies by scope",
      source: "Site-specific" 
    },
  ];

  const costBreakdown = [
    { category: "Municipal Permits (Lamont County)", min: 21500, max: 23750 },
    { category: "Safety Code Permits", min: 10000, max: 50000 },
    { category: "AESO Connection & Studies", min: 50000, max: 500000 },
    { category: "Environmental Assessments", min: 15000, max: 40000 },
    { category: "Legal & Professional Fees", min: 25000, max: 75000 },
  ];

  const totalMin = costBreakdown.reduce((sum, item) => sum + item.min, 0);
  const totalMax = costBreakdown.reduce((sum, item) => sum + item.max, 0);

  return (
    <EPSectionWrapper id="timeline" theme="dark">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 9 • Timeline & Costs"
          badgeIcon={Calendar}
          title="45MW Project Timeline & Costs"
          description="Real timeline and cost estimates based on our Lamont County 45MW facility experience and verified regulatory data."
          theme="dark"
        />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white font-semibold">Phase</th>
                <th className="text-left p-4 text-white font-semibold">Duration</th>
                <th className="text-left p-4 text-white font-semibold">Estimated Cost</th>
                <th className="text-left p-4 text-white font-semibold hidden md:table-cell">Source</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="p-4 text-white/80">{item.phase}</td>
                  <td className="p-4 text-white/60">{item.duration}</td>
                  <td className="p-4 text-primary font-medium">{item.cost}</td>
                  <td className="p-4 text-white/40 text-sm hidden md:table-cell">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-white">Permit & Regulatory Costs</h3>
            </div>
            <div className="space-y-3">
              {costBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-white/70">{item.category}</span>
                  <span className="text-white font-medium">
                    ${item.min.toLocaleString()} - ${item.max.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-white font-semibold">Total Range</span>
                <span className="text-primary font-bold">
                  ${totalMin.toLocaleString()} - ${totalMax.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-white">Critical Path Items</h3>
            </div>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span><strong className="text-white">AESO Connection</strong> - Start immediately, 12-24+ month lead time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span><strong className="text-white">Development Permit</strong> - Submit within first month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span><strong className="text-white">Safety Codes</strong> - Can parallel with construction design</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span><strong className="text-white">AUC (if applicable)</strong> - Start 18 months before generation needed</span>
              </li>
            </ul>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <EPKeyInsight title="Total Development Timeline" type="success" theme="dark">
          <p><strong>18-36 months</strong> from initial planning to energization. The AESO connection process is typically the longest lead-time item. Start early and maintain consistent communication with all regulatory bodies.</p>
        </EPKeyInsight>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default TimelineCostSection;
