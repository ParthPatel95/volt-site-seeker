import { motion } from 'framer-motion';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Target, Clock, Users, Zap, Leaf, ArrowRight, CheckCircle } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export const FundGrowthPlanSection = () => {
  const fundData = [
    { fund: "Fund I", size: 25, color: "hsl(var(--watt-success))", status: "active" },
    { fund: "Fund II", size: 125, color: "hsl(var(--watt-trust))", status: "planned" },
    { fund: "Fund III", size: 250, color: "hsl(var(--watt-bitcoin))", status: "planned" },
  ];

  const fundDetails = [
    {
      fund: "Fund I",
      size: 25,
      investments: "12-15",
      model: "Flip Model",
      focus: "Natural gas and hydroelectric opportunities",
      icon: Users,
      color: "watt-success",
      status: "Active",
    },
    {
      fund: "Fund II",
      size: 125,
      investments: "20-25",
      model: "Flip & Build Model",
      focus: "Energy storage and smart grid technologies",
      icon: Zap,
      color: "watt-trust",
      status: "2025",
    },
    {
      fund: "Fund III",
      size: 250,
      investments: "10-15",
      model: "Build & Brown Field Model",
      focus: "Advanced technologies and nuclear energy",
      icon: Leaf,
      color: "watt-bitcoin",
      status: "2026",
    },
  ];

  const chartConfig = {
    size: { label: "Fund Size ($M)", color: "hsl(var(--watt-trust))" },
  };

  return (
    <section id="growth-plan" className="relative z-10 py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-[#0a1628] via-watt-navy to-[#0a1628] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-watt-bitcoin/5 rounded-full blur-[150px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-watt-trust/5 rounded-full blur-[150px]" />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-success/10 border border-watt-success/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp className="w-4 h-4 text-watt-success" />
            <span className="text-sm font-medium text-watt-success">Multi-Fund Strategy</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Fund <span className="bg-gradient-to-r from-watt-success via-watt-trust to-watt-bitcoin bg-clip-text text-transparent">Growth Plan</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Multi-fund strategy deploying <span className="font-bold text-white">$<AnimatedCounter end={400} suffix="M" /></span> across three sequential vehicles
          </p>
        </motion.div>

        {/* Visual Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between max-w-4xl mx-auto relative">
              {/* Connecting line */}
              <div className="absolute top-8 left-16 right-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-watt-success via-watt-trust to-watt-bitcoin"
                  initial={{ width: 0 }}
                  whileInView={{ width: '33%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>

              {fundData.map((fund, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex flex-col items-center relative z-10"
                >
                  <motion.div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ${
                      fund.status === 'active' 
                        ? 'bg-watt-success' 
                        : 'bg-white/10 border-2 border-white/30'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    animate={fund.status === 'active' ? {
                      boxShadow: ['0 0 20px rgba(0,211,149,0.3)', '0 0 40px rgba(0,211,149,0.5)', '0 0 20px rgba(0,211,149,0.3)'],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className={`font-bold text-lg ${fund.status === 'active' ? 'text-white' : 'text-white/70'}`}>
                      {['I', 'II', 'III'][index]}
                    </span>
                  </motion.div>
                  
                  <span className="text-lg font-bold text-white">${fund.size}M</span>
                  <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                    fund.status === 'active' 
                      ? 'text-watt-success bg-watt-success/20' 
                      : 'text-white/50 bg-white/10'
                  }`}>
                    {fund.status === 'active' ? 'Active' : `Planned ${2024 + index}`}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chart and Metrics */}
        <div className="grid lg:grid-cols-5 gap-6 mb-12">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 relative"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-watt-trust/10 to-watt-bitcoin/10 blur-xl" />
            
            <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-6">Fund Size Progression</h3>
              
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fundData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <XAxis 
                      dataKey="fund" 
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                    />
                    <Bar dataKey="size" radius={[8, 8, 0, 0]} maxBarSize={80}>
                      {fundData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </motion.div>

          {/* Metrics Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {[
              { icon: Target, label: "Total Capital", value: 400, suffix: "M", prefix: "$", color: "text-watt-trust" },
              { icon: TrendingUp, label: "Total Investments", value: 42, suffix: "-55", color: "text-watt-bitcoin" },
              { icon: Clock, label: "Timeline", value: 5, suffix: "-7 Years", color: "text-watt-success" },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.4 }}
                whileHover={{ x: 5 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-1">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  <span className="text-sm text-white/50">{metric.label}</span>
                </div>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  <AnimatedCounter end={metric.value} prefix={metric.prefix || ''} suffix={metric.suffix} />
                </div>
              </motion.div>
            ))}

            <div className="bg-watt-trust/10 rounded-xl p-4 border border-watt-trust/20">
              <h4 className="text-sm font-semibold text-watt-trust mb-2">Growth Strategy</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Progressive scaling from land acquisition to full infrastructure deployment.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Fund Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {fundDetails.map((fund, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className={`absolute -inset-1 rounded-2xl bg-${fund.color}/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
              
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    className={`w-12 h-12 rounded-xl bg-${fund.color}/20 flex items-center justify-center`}
                    whileHover={{ rotate: 10 }}
                  >
                    <fund.icon className={`w-6 h-6 text-${fund.color}`} />
                  </motion.div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{fund.fund}</h4>
                    <p className={`text-${fund.color} font-bold`}>${fund.size}M</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                    fund.status === 'Active' 
                      ? 'bg-watt-success/20 text-watt-success' 
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {fund.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-watt-success" />
                    <span className="text-white/70 text-sm">{fund.investments} investments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className={`w-4 h-4 text-${fund.color}`} />
                    <span className={`text-${fund.color} text-sm font-medium`}>{fund.model}</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{fund.focus}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
