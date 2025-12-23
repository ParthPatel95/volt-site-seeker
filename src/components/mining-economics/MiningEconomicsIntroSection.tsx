import { useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { TrendingUp, Bitcoin, Zap, Calculator, DollarSign, BarChart3 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

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
      color: "bg-watt-success/20",
      iconColor: "text-watt-success",
      delay: 0
    },
    { 
      icon: Zap, 
      label: "Energy", 
      sublabel: "kWh × Rate",
      color: "bg-red-500/20",
      iconColor: "text-red-400",
      delay: 0.15
    },
    { 
      icon: BarChart3, 
      label: "OpEx", 
      sublabel: "Staff, Maint, Other",
      color: "bg-watt-bitcoin/20",
      iconColor: "text-watt-bitcoin",
      delay: 0.3
    },
    { 
      icon: TrendingUp, 
      label: "Profit", 
      sublabel: "Margin %",
      color: "bg-watt-purple/20",
      iconColor: "text-watt-purple",
      delay: 0.45
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-watt-navy via-watt-navy/95 to-watt-navy">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-watt-success/20 text-watt-success rounded-full text-sm font-medium mb-4">
              Module 9 • Mining Economics
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Bitcoin Mining Economics
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Master the financial fundamentals of Bitcoin mining. Understand revenue drivers, 
              cost structures, profitability analysis, and strategic decision-making for 
              sustainable mining operations.
            </p>
          </div>
        </ScrollReveal>

        {/* Key Metrics */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {keyMetrics.map((metric, idx) => (
              <motion.div 
                key={idx} 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <metric.icon className="w-8 h-8 text-watt-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-watt-bitcoin mb-1">
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
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              The Mining Profitability Equation
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              {equationSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={isEquationInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ 
                    delay: step.delay, 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="flex items-center gap-4"
                >
                  <motion.div 
                    className={`${step.color} rounded-xl p-4 min-w-[140px]`}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)"
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      animate={isEquationInView && idx === 3 ? {
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{
                        delay: 0.8,
                        duration: 0.5,
                        repeat: 2,
                        repeatDelay: 1
                      }}
                    >
                      <step.icon className={`w-6 h-6 ${step.iconColor} mx-auto mb-1`} />
                    </motion.div>
                    <div className="text-lg font-bold text-white">{step.label}</div>
                    <div className="text-xs text-white/60">{step.sublabel}</div>
                  </motion.div>
                  
                  {idx < equationSteps.length - 1 && (
                    <motion.div 
                      className="text-3xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={isEquationInView ? { opacity: 1 } : {}}
                      transition={{ delay: step.delay + 0.1, duration: 0.3 }}
                    >
                      {idx === 2 ? '=' : '−'}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Animated flow indicator */}
            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0 }}
              animate={isEquationInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <motion.div
                  className="w-2 h-2 bg-watt-success rounded-full"
                  animate={isEquationInView ? {
                    x: [0, 60, 120, 180],
                    backgroundColor: ["#22C55E", "#EF4444", "#F7931A", "#6366F1"]
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
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Revenue Drivers",
                items: ["Bitcoin price", "Network hashrate", "Block rewards", "Transaction fees", "Mining efficiency"],
                color: "border-watt-success"
              },
              {
                title: "Cost Structure",
                items: ["Electricity (60-80%)", "Hardware depreciation", "Hosting/rent", "Labor & maintenance", "Cooling overhead"],
                color: "border-watt-bitcoin"
              },
              {
                title: "Strategic Factors",
                items: ["Halving cycles", "Difficulty adjustments", "Hardware generations", "Energy contracts", "Market timing"],
                color: "border-watt-purple"
              }
            ].map((category, idx) => (
              <motion.div 
                key={idx} 
                className={`bg-white/5 border-l-4 ${category.color} rounded-r-xl p-6`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold text-white mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, i) => (
                    <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MiningEconomicsIntroSection;
