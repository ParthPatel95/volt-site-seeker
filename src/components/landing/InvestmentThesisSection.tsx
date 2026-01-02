import { motion } from 'framer-motion';
import { ArrowRight, Target, Bitcoin, Cpu, Sparkles, Zap, Package, Settings, Award, Clock, CheckCircle2 } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export const InvestmentThesisSection = () => {
  const stages = [
    {
      stage: 1,
      icon: Target,
      title: "Identify Stranded Power",
      subtitle: "ACQUIRE",
      color: "gray",
      borderColor: "border-gray-300",
      bgGradient: "from-gray-500 to-gray-600",
      keyPoint: "Below-market acquisition",
      description: "Target undervalued industrial sites with existing power infrastructure",
    },
    {
      stage: 2,
      icon: Bitcoin,
      title: "Deploy Bitcoin Mining",
      subtitle: "MONETIZE",
      color: "bitcoin",
      borderColor: "border-watt-bitcoin",
      bgGradient: "from-watt-bitcoin to-orange-600",
      keyPoint: "$250k/MW deployment",
      description: "Generate immediate cash flow while infrastructure matures",
      badge: "Year 0-1",
    },
    {
      stage: 3,
      icon: Cpu,
      title: "Transition to AI/HPC",
      subtitle: "TRANSFORM",
      color: "trust",
      borderColor: "border-watt-trust",
      bgGradient: "from-watt-trust to-blue-600",
      keyPoint: "$6.5M/MW vs $12.5M traditional",
      description: "Convert proven sites to high-value AI data centers",
      badge: "Year 2+",
      savingsBadge: "48% SAVINGS",
    },
  ];

  const features = [
    { icon: Zap, title: "Rapid Deployment", desc: "12-16 weeks vs 24+ months", color: "text-watt-trust" },
    { icon: Package, title: "Pre-Built & Tested", desc: "Factory-built with QA", color: "text-blue-500" },
    { icon: Settings, title: "Scalable On Demand", desc: "Add capacity as needed", color: "text-watt-bitcoin" },
    { icon: Award, title: "Tier 3 Reliability", desc: "99.99% uptime", color: "text-watt-success" },
  ];

  return (
    <section id="thesis" className="relative z-10 py-20 md:py-28 px-4 sm:px-6 bg-[hsl(220_50%_8%)] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(195_85%_41%/0.1)] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(36_94%_53%/0.1)] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(195_85%_41%/0.1)] border border-[hsl(195_85%_41%/0.3)] mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-[hsl(195_85%_41%)]" />
            <span className="text-sm font-medium text-[hsl(195_85%_41%)]">Investment Strategy</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[hsl(210_40%_98%)]">
            Our <span className="bg-gradient-to-r from-[hsl(195_85%_41%)] to-[hsl(36_94%_53%)] bg-clip-text text-transparent">Thesis</span>
          </h2>
          <p className="text-lg md:text-xl text-[hsl(36_94%_53%)] font-bold">
            Stranded Power → Bitcoin Mining → AI/HPC Premium
          </p>
        </motion.div>
        
        {/* Three Stage Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {stages.map((stage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
            >
              {/* Card glow */}
              <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${stage.bgGradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
              
              <div className={`relative bg-[hsl(210_40%_98%/0.05)] backdrop-blur-sm rounded-2xl p-6 border ${stage.borderColor} border-opacity-50 h-full`}>
                {/* Icon */}
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${stage.bgGradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <stage.icon className="w-8 h-8 text-[hsl(210_40%_98%)]" />
                </motion.div>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-bold text-[hsl(210_40%_98%/0.6)] bg-[hsl(210_40%_98%/0.1)] px-3 py-1 rounded-full">
                    STAGE {stage.stage}
                  </span>
                  {stage.badge && (
                    <span className="text-xs font-bold text-watt-success bg-watt-success/20 px-3 py-1 rounded-full">
                      {stage.badge}
                    </span>
                  )}
                  {stage.savingsBadge && (
                    <span className="text-xs font-bold text-[hsl(210_40%_98%)] bg-[hsl(142_76%_36%)] px-3 py-1 rounded-full shadow">
                      {stage.savingsBadge}
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-[hsl(210_40%_98%)]">{stage.title}</h3>
                
                {/* Key Point */}
                <div className="mb-4 p-3 bg-[hsl(210_40%_98%/0.05)] rounded-lg border border-[hsl(210_40%_98%/0.1)]">
                  <div className="text-sm font-semibold text-[hsl(210_40%_98%/0.8)]">{stage.keyPoint}</div>
                </div>
                
                {/* Description */}
                <p className="text-[hsl(210_40%_98%/0.6)] text-sm leading-relaxed">
                  {stage.description}
                </p>
              </div>
              
              {/* Connecting Arrow */}
              {index < 2 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <motion.div 
                    className={`w-6 h-6 bg-gradient-to-r ${stages[index + 1].bgGradient} rounded-full flex items-center justify-center shadow-lg`}
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4 text-[hsl(210_40%_98%)]" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Proprietary Edge Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[hsl(195_85%_41%/0.2)] via-[hsl(36_94%_53%/0.1)] to-[hsl(142_76%_36%/0.2)] blur-xl" />
          
          <div className="relative bg-[hsl(210_40%_98%/0.05)] backdrop-blur-md rounded-3xl p-8 md:p-12 border border-[hsl(210_40%_98%/0.1)]">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-[hsl(195_85%_41%)]" />
                <h3 className="text-2xl md:text-3xl font-bold text-[hsl(210_40%_98%)]">
                  Our Proprietary Edge
                </h3>
              </div>
              <p className="text-xl font-semibold text-[hsl(210_40%_98%/0.9)] mb-2">Modular AI Infrastructure</p>
              <p className="text-base text-[hsl(195_85%_41%)] font-medium">Deploy enterprise-grade AI compute in weeks, not years</p>
            </div>
            
            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-[hsl(210_40%_98%/0.05)] rounded-xl p-5 border border-[hsl(210_40%_98%/0.1)] hover:border-[hsl(210_40%_98%/0.2)] transition-all group"
                >
                  <motion.div 
                    className="w-12 h-12 bg-[hsl(210_40%_98%/0.05)] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: 10 }}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </motion.div>
                  <h4 className="text-sm font-bold text-[hsl(210_40%_98%)] mb-1.5">{feature.title}</h4>
                  <p className="text-xs text-[hsl(210_40%_98%/0.6)] leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
            
            {/* Cost Comparison */}
            <div className="max-w-4xl mx-auto mb-8">
              <h4 className="text-center text-lg font-bold text-[hsl(210_40%_98%)] mb-6">Infrastructure Cost Comparison</h4>
              <div className="space-y-6">
                {/* Traditional */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-semibold text-[hsl(210_40%_98%/0.6)] w-28">Traditional</span>
                    <div className="flex-1 h-14 bg-[hsl(210_40%_98%/0.05)] rounded-xl overflow-hidden relative">
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-4">
                        <span className="text-[hsl(210_40%_98%)] font-bold text-xl">
                          $<AnimatedCounter end={12.5} duration={2000} />M/MW
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[hsl(210_40%_98%/0.4)] ml-32 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Site prep, construction, equipment • 24-36 months
                  </p>
                </div>
                
                {/* WattByte */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-semibold text-[hsl(195_85%_41%)] w-28">WattByte</span>
                    <div className="flex-1 h-14 bg-[hsl(210_40%_98%/0.05)] rounded-xl overflow-hidden relative">
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-watt-trust to-blue-600 rounded-xl"
                        initial={{ width: 0 }}
                        whileInView={{ width: '52%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-4">
                        <span className="text-[hsl(210_40%_98%)] font-bold text-xl">
                          $<AnimatedCounter end={6.5} duration={2000} />M/MW
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[hsl(195_85%_41%/0.8)] ml-32 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Factory-built modular units • 12-16 weeks
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <motion.div 
                className="bg-[hsl(142_76%_36%/0.1)] rounded-xl p-5 border border-[hsl(142_76%_36%/0.3)] text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-[hsl(142_76%_36%)] mb-1">
                  $<AnimatedCounter end={6} duration={2000} />M/MW
                </div>
                <div className="text-xs font-semibold text-[hsl(210_40%_98%/0.6)]">Cost Savings</div>
              </motion.div>
              
              <motion.div 
                className="bg-[hsl(195_85%_41%/0.1)] rounded-xl p-5 border border-[hsl(195_85%_41%/0.3)] text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-[hsl(195_85%_41%)] mb-1">
                  <AnimatedCounter end={80} duration={2000} />% Faster
                </div>
                <div className="text-xs font-semibold text-[hsl(210_40%_98%/0.6)]">Time to Deploy</div>
              </motion.div>
              
              <motion.div 
                className="bg-[hsl(217_91%_60%/0.1)] rounded-xl p-5 border border-[hsl(217_91%_60%/0.3)] text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-[hsl(217_91%_60%)] mb-1 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  Tier 3
                </div>
                <div className="text-xs font-semibold text-[hsl(210_40%_98%/0.6)]">Same Performance</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
