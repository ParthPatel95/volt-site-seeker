import { motion } from 'framer-motion';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, Zap, Bitcoin, Cpu, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export const MarketOpportunitySection = () => {
  const aiGrowthData = [
    { year: '2020', aiDataCenters: 2.1, bitcoinMining: 8.5 },
    { year: '2021', aiDataCenters: 3.8, bitcoinMining: 12.3 },
    { year: '2022', aiDataCenters: 7.2, bitcoinMining: 15.1 },
    { year: '2023', aiDataCenters: 15.4, bitcoinMining: 18.7 },
    { year: '2024', aiDataCenters: 28.6, bitcoinMining: 22.1 },
    { year: '2025', aiDataCenters: 45.2, bitcoinMining: 25.8 },
    { year: '2026', aiDataCenters: 68.9, bitcoinMining: 29.4 },
  ];

  const powerCostComparison = [
    { region: 'Newfoundland', cost: 1.2 },
    { region: 'Rural TX', cost: 2.8 },
    { region: 'Alberta', cost: 2.6 },
    { region: 'Ohio', cost: 3.4 },
    { region: 'WA State', cost: 4.2 },
    { region: 'VA (T1)', cost: 6.8 },
    { region: 'CA Bay', cost: 18.4 },
  ];

  const bitcoinMiningReturns = [
    { hashrate: '1 EH/s', netProfit: 137000 },
    { hashrate: '5 EH/s', netProfit: 685000 },
    { hashrate: '10 EH/s', netProfit: 1370000 },
    { hashrate: '25 EH/s', netProfit: 3425000 },
  ];

  const aiHpcDemandGrowth = [
    { quarter: 'Q1 23', training: 45, inference: 28, hpc: 15 },
    { quarter: 'Q2 23', training: 52, inference: 34, hpc: 18 },
    { quarter: 'Q3 23', training: 68, inference: 41, hpc: 22 },
    { quarter: 'Q4 23', training: 89, inference: 53, hpc: 27 },
    { quarter: 'Q1 24', training: 124, inference: 68, hpc: 34 },
    { quarter: 'Q2 24', training: 156, inference: 87, hpc: 41 },
  ];

  const chartConfig = {
    aiDataCenters: { label: "AI Data Centers", color: "hsl(var(--watt-trust))" },
    bitcoinMining: { label: "Bitcoin Mining", color: "hsl(var(--watt-bitcoin))" },
  };

  return (
    <section id="market" className="relative z-10 py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-watt-navy via-[#0a1628] to-watt-navy overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-watt-success/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-watt-bitcoin/5 rounded-full blur-[150px]" />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Globe className="w-4 h-4 text-watt-bitcoin" />
            <span className="text-sm font-medium text-watt-bitcoin">Market Analysis</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Explosive Market <span className="bg-gradient-to-r from-watt-bitcoin to-watt-success bg-clip-text text-transparent">Opportunity</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            AI revolution and Bitcoin adoption creating unprecedented demand for power infrastructure
          </p>
        </motion.div>

        {/* Main Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Power Demand Growth */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-watt-trust/20 to-watt-bitcoin/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            
            <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-watt-trust/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-watt-trust" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Digital Infrastructure Power Demand</h3>
                  <p className="text-white/50 text-sm">Exponential growth in AI and Bitcoin mining (GW)</p>
                </div>
              </div>
              
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aiGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="year" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="aiDataCenters" stackId="1" stroke="hsl(var(--watt-trust))" fill="hsl(var(--watt-trust))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="bitcoinMining" stackId="1" stroke="hsl(var(--watt-bitcoin))" fill="hsl(var(--watt-bitcoin))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="mt-4 text-center">
                <span className="text-watt-trust font-bold text-lg">
                  <AnimatedCounter end={125} suffix="+ GW" /> total demand by 2026
                </span>
              </div>
            </div>
          </motion.div>

          {/* Power Cost Arbitrage */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-watt-success/20 to-watt-trust/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            
            <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-watt-bitcoin/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-watt-bitcoin" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Power Cost Arbitrage</h3>
                  <p className="text-white/50 text-sm">Massive cost differentials across markets (¢/kWh)</p>
                </div>
              </div>
              
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={powerCostComparison} layout="vertical" margin={{ top: 0, right: 20, left: 70, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                    <YAxis dataKey="region" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={65} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="cost" fill="hsl(var(--watt-success))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="mt-4 text-center">
                <span className="text-watt-success font-bold text-lg">
                  <AnimatedCounter end={93} suffix="%" /> cost savings in Newfoundland vs CA
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Bitcoin Mining Returns */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-1 rounded-3xl bg-watt-bitcoin/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            
            <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-watt-bitcoin/20 flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-watt-bitcoin" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Bitcoin Mining Revenue</h3>
                  <p className="text-white/50 text-sm">Monthly net profit by scale</p>
                </div>
              </div>
              
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bitcoinMiningReturns} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="hashrate" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="netProfit" fill="hsl(var(--watt-bitcoin))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="mt-4 text-center">
                <span className="text-watt-bitcoin font-bold">
                  $<AnimatedCounter end={3.4} decimals={1} suffix="M+" /> monthly at 25 EH/s
                </span>
              </div>
            </div>
          </motion.div>

          {/* AI/HPC Demand */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 rounded-3xl bg-watt-trust/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            
            <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-watt-trust/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-watt-trust" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI & HPC Workload Growth</h3>
                  <p className="text-white/50 text-sm">Quarterly compute demand (PetaFLOPs)</p>
                </div>
              </div>
              
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aiHpcDemandGrowth} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="quarter" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="training" stroke="hsl(var(--watt-trust))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="inference" stroke="hsl(var(--watt-bitcoin))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="hpc" stroke="hsl(var(--watt-success))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="mt-4 text-center">
                <span className="text-watt-trust font-bold">
                  <AnimatedCounter end={247} suffix="%" /> growth in AI training YoY
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Power Demand 2026", value: 125, suffix: "+ GW", color: "text-watt-trust" },
            { label: "Annual Investment Required", value: 85, prefix: "$", suffix: "B+", color: "text-watt-bitcoin" },
            { label: "GPU Shortage Backlog", value: 2, suffix: "+ Years", color: "text-watt-success" },
            { label: "Data Center Growth Rate", value: 35, suffix: "% CAGR", color: "text-white" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
            >
              <p className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                <AnimatedCounter end={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix} />
              </p>
              <p className="text-white/50 text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
