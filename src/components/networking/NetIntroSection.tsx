import { useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Network, Wifi, Shield, Server, Clock, Target, MapPin, BookOpen, Calendar, DollarSign, AlertTriangle, Gauge, Globe } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetProcessFlow, NetKeyInsight } from './shared';

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

const NetIntroSection = () => {
  const equationRef = useRef(null);
  const isEquationInView = useInView(equationRef, { once: true, margin: "-100px" });

  const keyMetrics = [
    { icon: Gauge, title: "Bandwidth", description: "Per 1000 miners", value: "5-20 Mbps" },
    { icon: Clock, title: "Latency", description: "Target to pool", value: "<100ms" },
    { icon: Shield, title: "Uptime", description: "Required reliability", value: "99.9%" },
    { icon: MapPin, title: "Case Study", description: "Lamont County, AB", value: "45MW" },
  ];

  const networkFlowSteps = [
    { icon: Globe, label: "ISP", sublabel: "Primary + Backup", color: "purple" as const },
    { icon: Shield, label: "Firewall", sublabel: "Security Layer", color: "bitcoin" as const },
    { icon: Network, label: "Core Switch", sublabel: "Distribution", color: "success" as const },
    { icon: Server, label: "Miners", sublabel: "~13,000 units", color: "purple" as const },
  ];

  const learningObjectives = [
    { icon: Target, text: "Design redundant internet connectivity for rural Alberta mining facilities" },
    { icon: Network, text: "Implement VLAN segmentation and IP address management at scale" },
    { icon: Wifi, text: "Optimize pool connectivity and minimize stale share rates" },
    { icon: Shield, text: "Secure network infrastructure with proper firewall and access controls" },
  ];

  return (
    <NetSectionWrapper id="intro" theme="dark">
      <ScrollReveal>
        <NetSectionHeader
          badge="Module 13 • Networking Masterclass"
          badgeIcon={BookOpen}
          title="Networking for Bitcoin Datacenters"
          description="Master network infrastructure design for Bitcoin mining facilities. Using our real 45MW Lamont County, Alberta site as a case study—low bandwidth, high reliability."
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

      {/* Network Flow Visualization */}
      <ScrollReveal delay={200}>
        <div 
          ref={equationRef}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Network Architecture Overview
          </h2>
          <p className="text-white/60 text-center text-sm mb-8 max-w-2xl mx-auto">
            Bitcoin mining networks are unique: extremely low bandwidth requirements but 
            ultra-high reliability demands. Every minute of downtime costs real money.
          </p>
          
          <NetProcessFlow steps={networkFlowSteps} connectorSymbol="→" theme="dark" />
        </div>
      </ScrollReveal>

      {/* Key Topics Overview */}
      <ScrollReveal delay={300}>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Connectivity Options",
              items: ["Fiber vs Fixed Wireless", "Dedicated Internet Access (DIA)", "LTE/5G backup options", "Starlink for rural sites", "BGP multi-homing"],
              color: "hsl(var(--watt-purple))"
            },
            {
              title: "Network Design",
              items: ["VLAN segmentation strategy", "IP address management", "Core-Distribution-Access model", "Switch selection & sizing", "Cabling infrastructure"],
              color: "hsl(var(--watt-bitcoin))"
            },
            {
              title: "45MW Case Study",
              items: ["Lamont County ISP options", "Dual-ISP redundancy design", "~13,000 miner fleet", "Real equipment costs", "Lessons learned"],
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

      {/* Key Insight */}
      <ScrollReveal delay={350}>
        <NetKeyInsight title="Low Bandwidth, High Reliability" type="insight" theme="dark">
          <p className="mb-2">Bitcoin mining networks are uniquely simple yet demanding:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Bandwidth:</strong> Each miner uses only 10-20 MB/day (Stratum protocol is tiny)</li>
            <li>• <strong>Latency:</strong> Every 100ms to pool adds ~0.1% stale shares</li>
            <li>• <strong>Uptime:</strong> 1 hour downtime on 45MW = ~$2,000-5,000 lost revenue</li>
            <li>• <strong>Security:</strong> Only outbound connections needed—no inbound required</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* Estimated Reading Time */}
      <ScrollReveal delay={400}>
        <div className="flex items-center justify-center gap-2 text-white/50 text-sm mt-8">
          <Clock className="w-4 h-4" />
          <span>Estimated module time: 75 minutes</span>
        </div>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetIntroSection;
