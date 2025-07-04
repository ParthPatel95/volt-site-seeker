
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, Zap, Bitcoin, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

export const MarketOpportunitySection = () => {
  const aiGrowthData = [
    { year: '2020', aiDataCenters: 2.1, bitcoinMining: 8.5, totalDemand: 15.2 },
    { year: '2021', aiDataCenters: 3.8, bitcoinMining: 12.3, totalDemand: 22.4 },
    { year: '2022', aiDataCenters: 7.2, bitcoinMining: 15.1, totalDemand: 31.8 },
    { year: '2023', aiDataCenters: 15.4, bitcoinMining: 18.7, totalDemand: 48.9 },
    { year: '2024', aiDataCenters: 28.6, bitcoinMining: 22.1, totalDemand: 67.3 },
    { year: '2025', aiDataCenters: 45.2, bitcoinMining: 25.8, totalDemand: 89.7 },
    { year: '2026', aiDataCenters: 68.9, bitcoinMining: 29.4, totalDemand: 125.1 }
  ];

  const powerCostComparison = [
    { region: 'Newfoundland', cost: 1.2, capacity: '150MW+' },
    { region: 'Rural TX', cost: 2.8, capacity: '500MW+' },
    { region: 'Alberta', cost: 2.6, capacity: '400MW+' },
    { region: 'Ohio', cost: 3.4, capacity: '300MW+' },
    { region: 'Wyoming', cost: 3.9, capacity: '200MW+' },
    { region: 'WA State', cost: 4.2, capacity: '400MW+' },
    { region: 'VA (T1)', cost: 6.8, capacity: '100MW+' },
    { region: 'CA Bay', cost: 18.4, capacity: '50MW+' }
  ];

  const bitcoinMiningReturns = [
    { hashrate: '1 EH/s', monthlyRevenue: 245000, powerCost: 108000, netProfit: 137000 },
    { hashrate: '5 EH/s', monthlyRevenue: 1225000, powerCost: 540000, netProfit: 685000 },
    { hashrate: '10 EH/s', monthlyRevenue: 2450000, powerCost: 1080000, netProfit: 1370000 },
    { hashrate: '25 EH/s', monthlyRevenue: 6125000, powerCost: 2700000, netProfit: 3425000 }
  ];

  const aiHpcDemandGrowth = [
    { quarter: 'Q1 23', training: 45, inference: 28, hpc: 15 },
    { quarter: 'Q2 23', training: 52, inference: 34, hpc: 18 },
    { quarter: 'Q3 23', training: 68, inference: 41, hpc: 22 },
    { quarter: 'Q4 23', training: 89, inference: 53, hpc: 27 },
    { quarter: 'Q1 24', training: 124, inference: 68, hpc: 34 },
    { quarter: 'Q2 24', training: 156, inference: 87, hpc: 41 }
  ];

  const chartConfig = {
    aiDataCenters: { label: "AI Data Centers (GW)", color: "#0EA5E9" },
    bitcoinMining: { label: "Bitcoin Mining (GW)", color: "#F59E0B" },
    totalDemand: { label: "Total Demand (GW)", color: "#10B981" },
    cost: { label: "Cost (¢/kWh)", color: "#8B5CF6" },
    training: { label: "AI Training", color: "#0EA5E9" },
    inference: { label: "AI Inference", color: "#F59E0B" },
    hpc: { label: "HPC Workloads", color: "#10B981" }
  };

  return (
    <section className="relative z-10 py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-white">
            Explosive Market Opportunity
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-2">
            AI revolution and Bitcoin adoption creating unprecedented demand for power infrastructure
          </p>
        </div>
        
        {/* Primary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* AI & Bitcoin Power Demand Growth */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <CardTitle className="text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
                <TrendingUp className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-electric-blue flex-shrink-0" />
                <span className="leading-tight truncate">Digital Infrastructure Power Demand</span>
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm truncate">
                Exponential growth in AI and Bitcoin mining power requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="w-full overflow-hidden">
                <ChartContainer config={chartConfig} className="h-[180px] sm:h-[220px] md:h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiGrowthData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748b" />
                      <XAxis 
                        dataKey="year" 
                        stroke="#cbd5e1" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={35}
                      />
                      <YAxis 
                        stroke="#cbd5e1" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        width={30}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="aiDataCenters" 
                        stackId="1"
                        stroke="#0EA5E9" 
                        fill="#0EA5E9"
                        fillOpacity={0.6}
                        name="AI Data Centers (GW)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="bitcoinMining" 
                        stackId="1"
                        stroke="#F59E0B" 
                        fill="#F59E0B"
                        fillOpacity={0.6}
                        name="Bitcoin Mining (GW)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="mt-2 text-center">
                <p className="text-electric-blue font-semibold text-xs sm:text-sm">125+ GW total demand by 2026</p>
              </div>
            </CardContent>
          </Card>

          {/* Power Cost Arbitrage */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <CardTitle className="text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
                <Zap className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-electric-yellow flex-shrink-0" />
                <span className="leading-tight truncate">Power Cost Arbitrage Opportunity</span>
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm truncate">
                Massive cost differentials across North American markets
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="w-full overflow-hidden">
                <ChartContainer config={chartConfig} className="h-[180px] sm:h-[220px] md:h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={powerCostComparison} 
                      layout="vertical" 
                      margin={{ top: 10, right: 15, left: 60, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748b" />
                      <XAxis 
                        type="number" 
                        stroke="#cbd5e1" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        domain={[0, 'dataMax + 2']}
                      />
                      <YAxis 
                        dataKey="region" 
                        type="category" 
                        stroke="#cbd5e1" 
                        width={55}
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        interval={0}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${value}¢/kWh`, 'Power Cost']}
                      />
                      <Bar 
                        dataKey="cost" 
                        fill="#10B981"
                        name="Cost (¢/kWh)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="mt-2 text-center">
                <p className="text-neon-green font-semibold text-xs sm:text-sm">93% cost savings in Newfoundland vs CA Bay</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* Bitcoin Mining Economics */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <CardTitle className="text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
                <Bitcoin className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-electric-yellow flex-shrink-0" />
                <span className="leading-tight truncate">Bitcoin Mining Revenue Potential</span>
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm truncate">
                Monthly net profit by mining operation scale (at current BTC price)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="w-full overflow-hidden">
                <ChartContainer config={chartConfig} className="h-[180px] sm:h-[220px] md:h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bitcoinMiningReturns} margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748b" />
                      <XAxis 
                        dataKey="hashrate" 
                        stroke="#cbd5e1" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis 
                        stroke="#cbd5e1" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        width={35}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`$${(value as number).toLocaleString()}`, '']}
                      />
                      <Bar 
                        dataKey="netProfit" 
                        fill="#F59E0B"
                        name="Monthly Net Profit"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="mt-2 text-center">
                <p className="text-electric-yellow font-semibold text-xs sm:text-sm">$3.4M+ monthly profit potential at 25 EH/s</p>
              </div>
            </CardContent>
          </Card>

          {/* AI/HPC Compute Demand */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <CardTitle className="text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
                <Cpu className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-electric-blue flex-shrink-0" />
                <span className="leading-tight truncate">AI & HPC Workload Growth</span>
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm truncate">
                Quarterly compute demand by workload type (PetaFLOPs)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="w-full overflow-hidden">
                <ChartContainer config={chartConfig} className="h-[180px] sm:h-[220px] md:h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aiHpcDemandGrowth} margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#64748b" />
                      <XAxis 
                        dataKey="quarter" 
                        stroke="#cbd5e1" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis 
                        stroke="#cbd5e1" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        width={30}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="training" 
                        stroke="#0EA5E9" 
                        strokeWidth={2}
                        name="AI Training"
                        dot={{ r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="inference" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        name="AI Inference"
                        dot={{ r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hpc" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="HPC Workloads"
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="mt-2 text-center">
                <p className="text-electric-blue font-semibold text-xs sm:text-sm">340% growth in AI training demand YoY</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-slate-700/50 text-center min-w-0">
            <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-electric-blue mb-1 truncate">$127B</div>
            <div className="text-slate-300 text-xs sm:text-sm leading-tight">Total Addressable Market</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-slate-700/50 text-center min-w-0">
            <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-electric-yellow mb-1 truncate">6.5x</div>
            <div className="text-slate-300 text-xs sm:text-sm leading-tight">Demand vs Supply Gap</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-slate-700/50 text-center min-w-0">
            <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-neon-green mb-1 truncate">45%</div>
            <div className="text-slate-300 text-xs sm:text-sm leading-tight">Market Share - AI/ML</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-slate-700/50 text-center min-w-0">
            <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-warm-orange mb-1 truncate">25%</div>
            <div className="text-slate-300 text-xs sm:text-sm leading-tight">Market Share - Crypto</div>
          </div>
        </div>
      </div>
    </section>
  );
};
