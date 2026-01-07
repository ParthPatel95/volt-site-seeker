import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { HardHat } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight } from './shared';

const SiteEngineeringSection = () => {
  const siteRequirements = [
    { title: "Grading & Drainage", description: "Proper site grading ensures water runoff management. Stormwater management plan may be required." },
    { title: "Road Access", description: "Adequate access for equipment delivery and emergency services. May require approach permit from Alberta Transportation." },
    { title: "Fire Suppression", description: "Fire Safety Plan required. May need fire suppression systems depending on facility size and local requirements." },
    { title: "Fencing & Security", description: "Perimeter security, access control, and CCTV systems for equipment protection." },
  ];

  return (
    <EPSectionWrapper id="site" theme="gradient">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 9 • Site Engineering"
          badgeIcon={HardHat}
          title="Site Engineering Requirements"
          description="Beyond electrical infrastructure, site engineering covers grading, drainage, access roads, and fire safety systems."
        />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {siteRequirements.map((req, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-foreground mb-2">{req.title}</h4>
              <p className="text-muted-foreground text-sm">{req.description}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <EPKeyInsight title="Cooling Infrastructure" type="insight">
          <p>For hydro-cooled or immersion-cooled facilities, additional engineering for water supply, treatment, and heat rejection systems is required. See our Hydro Cooling and Immersion Cooling modules for details.</p>
        </EPKeyInsight>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default SiteEngineeringSection;
