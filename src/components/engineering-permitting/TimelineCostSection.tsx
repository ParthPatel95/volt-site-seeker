import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Calendar, DollarSign } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight } from './shared';

const TimelineCostSection = () => {
  const timeline = [
    { phase: "Municipal Development Permit", duration: "60-90 days", cost: "$2,000-$10,000" },
    { phase: "Safety Code Permits", duration: "30-60 days", cost: "$10,000-$50,000" },
    { phase: "AESO Connection Process", duration: "12-24 months", cost: "$50,000-$500,000+" },
    { phase: "Construction", duration: "6-12 months", cost: "Varies by scope" },
  ];

  return (
    <EPSectionWrapper id="timeline" theme="dark">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 10 • Timeline & Costs"
          badgeIcon={Calendar}
          title="45MW Project Timeline & Costs"
          description="Real timeline and cost estimates based on our Lamont County 45MW facility experience."
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
              </tr>
            </thead>
            <tbody>
              {timeline.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="p-4 text-white/80">{item.phase}</td>
                  <td className="p-4 text-white/60">{item.duration}</td>
                  <td className="p-4" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{item.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <EPKeyInsight title="Total Development Timeline" type="success" theme="dark">
          <p><strong>18-36 months</strong> from initial planning to energization. The AESO connection process is typically the longest lead-time item. Start early and maintain consistent communication with all regulatory bodies.</p>
        </EPKeyInsight>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default TimelineCostSection;
