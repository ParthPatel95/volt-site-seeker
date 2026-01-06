import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { ShieldCheck, Users, Globe, Lock, DollarSign } from 'lucide-react';
import { TISectionWrapper, TISectionHeader, TIKeyInsight, TIStatCard } from './shared';

const LiabilityInsuranceSection = () => {
  return (
    <TISectionWrapper id="liability-insurance" theme="light">
      <ScrollReveal>
        <TISectionHeader badge="Lesson 9" badgeIcon={ShieldCheck} title="Liability Insurance Coverage" description="Protect against third-party claims, cyber threats, and management liability." accentColor="purple" />
      </ScrollReveal>
      <ScrollReveal delay={50}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <TIStatCard icon={Users} value="$5M" label="General Liability" sublabel="Third-party claims" accentColor="hsl(var(--watt-purple))" />
          <TIStatCard icon={Lock} value="$5M" label="Cyber Insurance" sublabel="Data breach coverage" accentColor="hsl(var(--watt-bitcoin))" />
          <TIStatCard icon={Globe} value="$2M" label="D&O Coverage" sublabel="Management protection" accentColor="hsl(var(--watt-success))" />
          <TIStatCard icon={DollarSign} value="$150K" label="Annual Premium" sublabel="Combined liability" accentColor="hsl(var(--watt-purple))" />
        </div>
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <TIKeyInsight title="Critical for Bitcoin Operations" type="insight">
          <p className="mb-3">Cyber insurance is essential for mining operations due to:</p>
          <ul className="space-y-1 text-sm">
            <li>• Wallet security and private key management risks</li>
            <li>• Ransomware targeting high-value operations</li>
            <li>• Network security vulnerabilities in remote monitoring</li>
          </ul>
        </TIKeyInsight>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default LiabilityInsuranceSection;
