import { useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { FileCheck, Building2, Zap, Scale, Clock, Target, MapPin, HardHat, BookOpen, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { EPSectionWrapper, EPSectionHeader, EPProcessFlow, EPKeyInsight } from './shared';

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

const EPIntroSection = () => {
  const equationRef = useRef(null);
  const isEquationInView = useInView(equationRef, { once: true, margin: "-100px" });

  const keyMetrics = [
    { icon: Calendar, title: "Timeline", description: "Total permit process", value: "18-36 mo" },
    { icon: DollarSign, title: "Permit Costs", description: "45MW facility", value: "$200K+" },
    { icon: FileCheck, title: "Key Permits", description: "Required approvals", value: "12+" },
    { icon: MapPin, title: "Jurisdiction", description: "Lamont County, AB", value: "45MW" },
  ];

  const permitFlowSteps = [
    { icon: MapPin, label: "Municipal", sublabel: "Development Permit", color: "purple" as const },
    { icon: Building2, label: "Safety Codes", sublabel: "Building/Electrical", color: "bitcoin" as const },
    { icon: Zap, label: "AESO", sublabel: "Grid Connection", color: "success" as const },
    { icon: Scale, label: "AUC", sublabel: "Facility Approval", color: "purple" as const },
  ];

  const learningObjectives = [
    { icon: Target, text: "Navigate Alberta's regulatory framework for industrial facilities" },
    { icon: Scale, text: "Understand Lamont County development permit requirements" },
    { icon: Zap, text: "Master the AESO grid connection process for large loads" },
    { icon: HardHat, text: "Apply real engineering standards and safety codes" },
  ];

  return (
    <EPSectionWrapper id="intro" theme="dark">
      <ScrollReveal>
        <EPSectionHeader
          badge="Module 12 • Engineering & Permitting Masterclass"
          badgeIcon={BookOpen}
          title="Engineering & Permitting for Bitcoin Mining"
          description="Master the complete permitting and engineering journey for Bitcoin mining facilities in Alberta. Using our real 45MW Lamont County site as a case study with actual regulatory requirements."
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

      {/* Permit Flow Visualization */}
      <ScrollReveal delay={200}>
        <div 
          ref={equationRef}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            The Permitting Journey
          </h2>
          <p className="text-white/60 text-center text-sm mb-8 max-w-2xl mx-auto">
            From initial development permit to grid energization. Each phase requires specific approvals 
            and careful coordination between regulatory bodies.
          </p>
          
          <EPProcessFlow steps={permitFlowSteps} connectorSymbol="→" theme="dark" />
        </div>
      </ScrollReveal>

      {/* Key Topics Overview */}
      <ScrollReveal delay={300}>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Regulatory Bodies",
              items: ["Alberta Utilities Commission (AUC)", "Alberta Electric System Operator (AESO)", "Alberta Energy Regulator (AER)", "Municipal Planning Departments", "Safety Codes Council"],
              color: "hsl(var(--watt-purple))"
            },
            {
              title: "Required Permits",
              items: ["Development Permit (Municipal)", "Building & Electrical Permits", "AESO System Access Service", "AUC Facility Approval", "Environmental Compliance"],
              color: "hsl(var(--watt-bitcoin))"
            },
            {
              title: "45MW Case Study",
              items: ["Lamont County location", "45MW total capacity", "Real timeline analysis", "Actual cost breakdown", "Lessons learned"],
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

      {/* Important Disclaimer */}
      <ScrollReveal delay={350}>
        <EPKeyInsight title="Real Data Only" type="warning" theme="dark" icon={AlertTriangle}>
          <p className="mb-2">This module contains <strong>only verified information</strong> from official sources:</p>
          <ul className="space-y-1 text-sm">
            <li>• AESO connection processes from aeso.ca (Updated 2025)</li>
            <li>• AUC Rule 007 requirements from auc.ab.ca</li>
            <li>• Lamont County Land Use Bylaw and permit procedures</li>
            <li>• Alberta Safety Codes Act and current building codes</li>
            <li>• AER Directive 038 for noise control (April 2024 edition)</li>
          </ul>
        </EPKeyInsight>
      </ScrollReveal>

      {/* Estimated Reading Time */}
      <ScrollReveal delay={400}>
        <div className="flex items-center justify-center gap-2 text-white/50 text-sm mt-8">
          <Clock className="w-4 h-4" />
          <span>Estimated module time: 90 minutes</span>
        </div>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default EPIntroSection;
