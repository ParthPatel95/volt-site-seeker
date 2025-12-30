import { useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { TrendingUp, Bitcoin, Zap, Calculator, DollarSign, BarChart3, BookOpen, Target, Clock, Lightbulb } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { MECSectionWrapper, MECSectionHeader, MECProcessFlow, MECKeyInsight } from './shared';

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

const MiningEconomicsIntroSection = () => {
  const equationRef = useRef(null);
  const isEquationInView = useInView(equationRef, { once: true, margin: "-100px" });

  const keyMetrics = [
    { icon: Bitcoin, title: "Hash Price", description: "Revenue per TH/s per day", value: "~$0.045" },
    { icon: Zap, title: "Energy Cost", description: "Primary operating expense", value: "60-80%" },
    { icon: Calculator, title: "Break-even", description: "$/kWh threshold", value: "$0.05-0.08" },
    { icon: TrendingUp, title: "Difficulty", description: "Network competition factor", value: "+3-5%/mo" },
  ];

  const equationSteps = [
    { 
      icon: DollarSign, 
      label: "Revenue", 
      sublabel: "BTC Mined × Price",
      color: "success" as const,
    },
    { 
      icon: Zap, 
      label: "Energy", 
      sublabel: "kWh × Rate",
      color: "red" as const,
    },
    { 
      icon: BarChart3, 
      label: "OpEx", 
      sublabel: "Staff, Maint, Other",
      color: "bitcoin" as const,
    },
    { 
      icon: TrendingUp, 
      label: "Profit", 
      sublabel: "Margin %",
      color: "purple" as const,
    },
  ];

  const learningObjectives = [
    { icon: Target, text: "Calculate revenue based on hashrate, price, and network difficulty" },
    { icon: DollarSign, text: "Analyze cost structures including energy, labor, and maintenance" },
    { icon: Calculator, text: "Determine break-even energy rates for different hardware" },
    { icon: Lightbulb, text: "Make strategic decisions about timing, hardware, and operations" },
  ];

  return (
    <MECSectionWrapper id="intro" theme="dark">
      <ScrollReveal>
        <MECSectionHeader
          badge="Module 9 • Mining Economics"
          badgeIcon={BookOpen}
          title="Bitcoin Mining Economics"
          description="Master the financial fundamentals of Bitcoin mining. Understand revenue drivers, cost structures, profitability analysis, and strategic decision-making for sustainable mining operations."
          theme="dark"
          accentColor="success"
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
                <obj.icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--watt-success))' }} />
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
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:border-[hsl(var(--watt-success)/0.3)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <metric.icon className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-success))' }} />
              <div className="text-2xl font-bold mb-1" style={{ color: 'hsl(var(--watt-bitcoin))' }}>
                <AnimatedNumber value={metric.value} />
              </div>
              <div className="text-white font-medium text-sm">{metric.title}</div>
              <div className="text-white/50 text-xs">{metric.description}</div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Animated Profitability Equation */}
      <ScrollReveal delay={200}>
        <div 
          ref={equationRef}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            The Mining Profitability Equation
          </h2>
          <p className="text-white/60 text-center text-sm mb-8 max-w-2xl mx-auto">
            Mining profit is fundamentally simple: revenue from Bitcoin mined minus all operating costs. 
            Understanding each component is key to building a profitable operation.
          </p>
          
          <MECProcessFlow
            steps={equationSteps}
            connectorSymbol="−"
          />

          {/* Animated flow indicator */}
          <motion.div
            className="mt-6 flex justify-center"
            initial={{ opacity: 0 }}
            animate={isEquationInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'hsl(var(--watt-success))' }}
                animate={isEquationInView ? {
                  x: [0, 60, 120, 180],
                } : {}}
                transition={{
                  delay: 1,
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
              <span className="text-xs text-white/50 ml-4">Money flow through your operation</span>
            </div>
          </motion.div>
        </div>
      </ScrollReveal>

      {/* Key Concepts Overview */}
      <ScrollReveal delay={300}>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Revenue Drivers",
              items: ["Bitcoin price volatility", "Network hashrate competition", "Block rewards & halvings", "Transaction fees income", "Mining efficiency (J/TH)"],
              color: "hsl(var(--watt-success))"
            },
            {
              title: "Cost Structure",
              items: ["Electricity (60-80% of costs)", "Hardware depreciation", "Hosting & facility rent", "Labor & maintenance", "Cooling overhead (PUE)"],
              color: "hsl(var(--watt-bitcoin))"
            },
            {
              title: "Strategic Factors",
              items: ["Halving cycle timing", "Difficulty adjustment trends", "Hardware generation upgrades", "Energy contract negotiations", "HODL vs. sell strategy"],
              color: "hsl(var(--watt-purple))"
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
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Estimated Reading Time */}
      <ScrollReveal delay={400}>
        <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
          <Clock className="w-4 h-4" />
          <span>Estimated module time: 54 minutes</span>
        </div>
      </ScrollReveal>
    </MECSectionWrapper>
  );
};

export default MiningEconomicsIntroSection;
