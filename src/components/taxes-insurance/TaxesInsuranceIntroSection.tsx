import { useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Receipt, Building2, Shield, Calculator, DollarSign, FileText, BookOpen, Target, Clock, Lightbulb, MapPin, Scale } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { TISectionWrapper, TISectionHeader, TIProcessFlow, TIKeyInsight } from './shared';

const AnimatedNumber = ({ value, prefix = '', suffix = '' }: { value: string; prefix?: string; suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="inline-block"
    >
      {prefix}{value}{suffix}
    </motion.span>
  );
};

const TaxesInsuranceIntroSection = () => {
  const equationRef = useRef(null);
  const isEquationInView = useInView(equationRef, { once: true, margin: "-100px" });

  const keyMetrics = [
    { icon: Receipt, title: "Corporate Tax", description: "Alberta combined rate", value: "23%" },
    { icon: Shield, title: "Insurance Cost", description: "Annual premium (45MW)", value: "$500K+" },
    { icon: DollarSign, title: "CCA Rate", description: "Computer equipment", value: "55%" },
    { icon: MapPin, title: "Jurisdiction", description: "No PST in Alberta", value: "0% PST" },
  ];

  const taxFlowSteps = [
    { icon: DollarSign, label: "Revenue", sublabel: "Mining Income", color: "success" as const },
    { icon: FileText, label: "Deductions", sublabel: "OpEx + CCA", color: "bitcoin" as const },
    { icon: Calculator, label: "Taxable", sublabel: "Net Income", color: "purple" as const },
    { icon: Receipt, label: "Tax Due", sublabel: "23% Combined", color: "red" as const },
  ];

  const learningObjectives = [
    { icon: Target, text: "Understand tax treatment for Bitcoin mining vs traditional data centers" },
    { icon: Scale, text: "Compare jurisdictions: Alberta, US states, and international options" },
    { icon: Calculator, text: "Calculate optimal depreciation strategies using CCA classes" },
    { icon: Shield, text: "Build comprehensive insurance portfolios for data center operations" },
  ];

  return (
    <TISectionWrapper id="intro" theme="dark">
      <ScrollReveal>
        <TISectionHeader
          badge="Module 11 • Taxes & Insurance Masterclass"
          badgeIcon={BookOpen}
          title="Data Center Taxes & Insurance"
          description="Master the financial and risk management fundamentals for Bitcoin mining and traditional data centers. Using our Alberta 45MW facility as a real-world case study."
          theme="dark"
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Learning Objectives */}
      <ScrollReveal delay={50}>
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-white/80 mb-4 text-center">What You'll Learn</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningObjectives.map((obj, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <obj.icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--watt-purple))' }} />
                <span className="text-sm text-white/70">{obj.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Key Metrics */}
      <ScrollReveal delay={100}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {keyMetrics.map((metric, idx) => (
            <motion.div 
              key={idx} 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:border-[hsl(var(--watt-purple)/0.3)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <metric.icon className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-purple))' }} />
              <div className="text-2xl font-bold mb-1" style={{ color: 'hsl(var(--watt-bitcoin))' }}>
                <AnimatedNumber value={metric.value} />
              </div>
              <div className="text-white font-medium text-sm">{metric.title}</div>
              <div className="text-white/50 text-xs">{metric.description}</div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Tax Flow Visualization */}
      <ScrollReveal delay={200}>
        <div 
          ref={equationRef}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            The Tax Liability Flow
          </h2>
          <p className="text-white/60 text-center text-sm mb-8 max-w-2xl mx-auto">
            Understanding how mining revenue flows through deductions to taxable income. 
            Proper planning at each stage can significantly reduce your tax burden.
          </p>
          
          <TIProcessFlow steps={taxFlowSteps} connectorSymbol="→" theme="dark" />
        </div>
      </ScrollReveal>

      {/* Key Topics Overview */}
      <ScrollReveal delay={300}>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Tax Considerations",
              items: ["Corporate structure optimization", "Capital cost allowance (CCA)", "Operating expense deductions", "Crypto revenue recognition", "SR&ED tax credits"],
              color: "hsl(var(--watt-purple))"
            },
            {
              title: "Insurance Coverage",
              items: ["Property & equipment insurance", "Business interruption", "Cyber liability coverage", "Directors & Officers (D&O)", "Equipment breakdown"],
              color: "hsl(var(--watt-bitcoin))"
            },
            {
              title: "Alberta 45MW Case Study",
              items: ["$75M CapEx depreciation", "~$15M annual energy deduction", "Provincial tax advantages", "Insurance portfolio design", "Risk mitigation strategies"],
              color: "hsl(var(--watt-success))"
            }
          ].map((category, idx) => (
            <motion.div 
              key={idx} 
              className="bg-white/5 rounded-r-xl p-6 border-l-4"
              style={{ borderColor: category.color }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-bold text-white mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.items.map((item, i) => (
                  <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Bitcoin vs Traditional DC Comparison */}
      <ScrollReveal delay={350}>
        <TIKeyInsight title="Bitcoin Mining vs Traditional Data Centers" type="insight" theme="dark">
          <p className="mb-3">While both share infrastructure costs, tax and insurance treatment differs significantly:</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h5 className="font-medium text-white mb-2">Bitcoin Mining</h5>
              <ul className="space-y-1 text-sm text-white/60">
                <li>• Revenue recognized at FMV when mined</li>
                <li>• Faster hardware depreciation (3-4 years)</li>
                <li>• Crypto custody insurance required</li>
                <li>• BI insurance tied to BTC price volatility</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h5 className="font-medium text-white mb-2">Traditional (AI/HPC)</h5>
              <ul className="space-y-1 text-sm text-white/60">
                <li>• Standard service revenue recognition</li>
                <li>• Longer depreciation periods (7-10 years)</li>
                <li>• Standard property coverage</li>
                <li>• BI insurance tied to SLA penalties</li>
              </ul>
            </div>
          </div>
        </TIKeyInsight>
      </ScrollReveal>

      {/* Estimated Reading Time */}
      <ScrollReveal delay={400}>
        <div className="flex items-center justify-center gap-2 text-white/50 text-sm mt-8">
          <Clock className="w-4 h-4" />
          <span>Estimated module time: 75 minutes</span>
        </div>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default TaxesInsuranceIntroSection;
