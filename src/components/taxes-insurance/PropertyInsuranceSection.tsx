import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Shield, Building, Zap, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { TISectionWrapper, TISectionHeader, TIKeyInsight, TIStatCard } from './shared';

const coverageTypes = [
  { type: "Property Insurance", coverage: "$80M", premium: "$240K/yr", description: "Equipment and facility replacement value" },
  { type: "Business Interruption", coverage: "6 months", premium: "$120K/yr", description: "Revenue loss during downtime" },
  { type: "Equipment Breakdown", coverage: "$50M", premium: "$60K/yr", description: "Mechanical/electrical failure" },
];

const PropertyInsuranceSection = () => {
  return (
    <TISectionWrapper id="property-insurance" theme="gradient">
      <ScrollReveal>
        <TISectionHeader badge="Lesson 8" badgeIcon={Shield} title="Property & Equipment Insurance" description="Protect your facility and equipment with comprehensive property coverage." accentColor="purple" />
      </ScrollReveal>
      <ScrollReveal delay={50}>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <TIStatCard icon={Building} value="$80M" label="Property Coverage" sublabel="45MW facility" accentColor="hsl(var(--watt-purple))" />
          <TIStatCard icon={Zap} value="$240K" label="Annual Premium" sublabel="~0.3% of value" accentColor="hsl(var(--watt-bitcoin))" />
          <TIStatCard icon={Shield} value="6 mo" label="BI Coverage" sublabel="Revenue protection" accentColor="hsl(var(--watt-success))" />
        </div>
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {coverageTypes.map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-bold text-foreground mb-2">{item.type}</h3>
              <div className="flex justify-between mb-3">
                <span className="text-2xl font-bold" style={{ color: 'hsl(var(--watt-purple))' }}>{item.coverage}</span>
                <span className="text-sm text-muted-foreground">{item.premium}</span>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>
      <ScrollReveal delay={200}>
        <TIKeyInsight title="Bitcoin Mining: Special Considerations" type="warning">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />Business interruption tied to BTC price volatility—consider agreed value endorsements</li>
            <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />ASIC miners depreciate rapidly—ensure replacement cost vs actual cash value coverage</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />Crypto custody insurance available for on-site wallet storage</li>
          </ul>
        </TIKeyInsight>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default PropertyInsuranceSection;
