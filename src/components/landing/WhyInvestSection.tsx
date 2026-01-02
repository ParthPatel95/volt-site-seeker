import { motion } from 'framer-motion';
import { Users, Cpu, Globe, Target, Building2, Sparkles } from 'lucide-react';

export const WhyInvestSection = () => {
  const advantages = [
    {
      icon: Users,
      title: "Experienced Team",
      description: "675MW+ track record in power infrastructure development with proven exits in data center conversions.",
      color: "watt-trust",
      stat: "675MW+",
      statLabel: "Track Record"
    },
    {
      icon: Cpu,
      title: "Proprietary Technology",
      description: "VoltScout AI-powered platform identifies and underwrites opportunities 10x faster than traditional methods.",
      color: "watt-bitcoin",
      stat: "10x",
      statLabel: "Faster Analysis"
    },
    {
      icon: Globe,
      title: "Diversified Portfolio",
      description: "Multi-geography, multi-asset strategy spanning natural gas, hydro, solar, and hybrid power infrastructure.",
      color: "watt-success",
      stat: "4+",
      statLabel: "Asset Types"
    },
    {
      icon: Target,
      title: "Clear Exit Strategy",
      description: "Structured 2-year holds with defined exit paths to hyperscalers, data center operators, and strategic buyers.",
      color: "watt-trust",
      stat: "2 Years",
      statLabel: "Hold Period"
    },
    {
      icon: Building2,
      title: "Real Asset Security",
      description: "Tangible infrastructure with intrinsic value, operating cash flows, and multiple use-case optionality.",
      color: "watt-bitcoin",
      stat: "100%",
      statLabel: "Asset-Backed"
    },
  ];

  return (
    <section id="why-invest" className="relative z-10 py-20 md:py-28 px-4 sm:px-6 bg-[hsl(220_50%_8%)] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[hsl(142_76%_36%/0.05)] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[hsl(195_85%_41%/0.05)] rounded-full blur-[150px]" />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(142_76%_36%/0.1)] border border-[hsl(142_76%_36%/0.3)] mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-[hsl(142_76%_36%)]" />
            <span className="text-sm font-medium text-[hsl(142_76%_36%)]">Competitive Advantages</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[hsl(210_40%_98%)]">
            Why Invest With <span className="bg-gradient-to-r from-[hsl(142_76%_36%)] to-[hsl(195_85%_41%)] bg-clip-text text-transparent">WattFund</span>
          </h2>
          <p className="text-lg text-[hsl(210_40%_98%/0.6)] max-w-3xl mx-auto">
            Proven expertise, proprietary technology, and strategic positioning in high-growth markets
          </p>
        </motion.div>

        {/* Hexagon-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.slice(0, 3).map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className={`absolute -inset-1 rounded-2xl bg-${advantage.color}/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
              
              <div className="relative bg-[hsl(210_40%_98%/0.05)] backdrop-blur-md rounded-2xl p-6 border border-[hsl(210_40%_98%/0.1)] hover:border-[hsl(210_40%_98%/0.2)] transition-all h-full">
                {/* Icon and stat */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className={`w-14 h-14 rounded-2xl bg-${advantage.color}/20 flex items-center justify-center`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <advantage.icon className={`w-7 h-7 text-${advantage.color}`} />
                  </motion.div>
                  
                  <div className="text-right">
                    <p className={`text-2xl font-bold text-${advantage.color}`}>{advantage.stat}</p>
                    <p className="text-xs text-[hsl(210_40%_98%/0.4)]">{advantage.statLabel}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-[hsl(210_40%_98%)] mb-3">
                  {advantage.title}
                </h3>
                <p className="text-[hsl(210_40%_98%/0.6)] text-sm leading-relaxed">
                  {advantage.description}
                </p>

                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-${advantage.color}/10 to-transparent rounded-tr-2xl rounded-bl-[80px]`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom row - centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
          {advantages.slice(3).map((advantage, index) => (
            <motion.div
              key={index + 3}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index + 3) * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className={`absolute -inset-1 rounded-2xl bg-${advantage.color}/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
              
              <div className="relative bg-[hsl(210_40%_98%/0.05)] backdrop-blur-md rounded-2xl p-6 border border-[hsl(210_40%_98%/0.1)] hover:border-[hsl(210_40%_98%/0.2)] transition-all h-full">
                {/* Icon and stat */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className={`w-14 h-14 rounded-2xl bg-${advantage.color}/20 flex items-center justify-center`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <advantage.icon className={`w-7 h-7 text-${advantage.color}`} />
                  </motion.div>
                  
                  <div className="text-right">
                    <p className={`text-2xl font-bold text-${advantage.color}`}>{advantage.stat}</p>
                    <p className="text-xs text-[hsl(210_40%_98%/0.4)]">{advantage.statLabel}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-[hsl(210_40%_98%)] mb-3">
                  {advantage.title}
                </h3>
                <p className="text-[hsl(210_40%_98%/0.6)] text-sm leading-relaxed">
                  {advantage.description}
                </p>

                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-${advantage.color}/10 to-transparent rounded-tr-2xl rounded-bl-[80px]`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
