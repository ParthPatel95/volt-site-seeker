import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Building, Zap, TrendingUp, Calendar, Target, DollarSign } from 'lucide-react';

export const FundGrowthPlanSection = () => {
  const fundData = [
    {
      fund: "Fund I",
      size: 25,
      investments: "12-15",
      model: "Flip Model",
      focus: "Natural gas and hydroelectric opportunities",
      icon: <Building className="w-8 h-8 text-electric-blue" />
    },
    {
      fund: "Fund II",
      size: 125,
      investments: "20-25",
      model: "Flip & Build Model",
      focus: "Energy storage and smart grid technologies",
      icon: <Zap className="w-8 h-8 text-electric-yellow" />
    },
    {
      fund: "Fund III",
      size: 250,
      investments: "10-15",
      model: "Build & Brown Field Model",
      focus: "Advanced technologies and nuclear energy",
      icon: <TrendingUp className="w-8 h-8 text-neon-green" />
    }
  ];

  const chartConfig = {
    size: { label: "Fund Size ($M USD)", color: "#0EA5E9" }
  };

  const keyMetrics = [
    {
      icon: <DollarSign className="w-5 h-5 text-electric-blue" />,
      label: "Total Capital Target",
      value: "$400M USD",
      description: "Across all three funds"
    },
    {
      icon: <Target className="w-5 h-5 text-electric-yellow" />,
      label: "Total Investments",
      value: "42-55",
      description: "Strategic energy projects"
    },
    {
      icon: <Calendar className="w-5 h-5 text-neon-green" />,
      label: "Timeline",
      value: "5-7 Years",
      description: "Fund deployment period"
    }
  ];

  return (
    <section className="relative z-10 py-8 px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-3 text-white">
            WattByte Energy Fund Growth Plan
          </h2>
          <p className="text-slate-200 text-lg max-w-4xl mx-auto">
            Our strategic multi-fund approach allows us to scale our impact and returns in the renewable energy infrastructure sector over time.
          </p>
        </div>

        {/* Fund Growth Chart with Side Panel */}
        <div className="mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-center">Fund Size Progression</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid lg:grid-cols-5 gap-6">
                {/* Chart Section - Takes up more space */}
                <div className="lg:col-span-3 flex items-center justify-center">
                  <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fundData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="fund" 
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickMargin={10}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickMargin={10}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`$${value}M USD`, 'Fund Size']}
                        />
                        <Bar 
                          dataKey="size" 
                          fill="#0EA5E9"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={80}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Key Metrics Panel - Takes up less space */}
                <div className="lg:col-span-2 space-y-4 flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-white mb-3">Key Metrics</h3>
                  {keyMetrics.map((metric, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {metric.icon}
                        <span className="text-sm text-slate-400">{metric.label}</span>
                      </div>
                      <div className="text-xl font-bold text-white">{metric.value}</div>
                      <div className="text-xs text-slate-400">{metric.description}</div>
                    </div>
                  ))}
                  
                  {/* Growth Strategy Summary */}
                  <div className="bg-gradient-to-br from-electric-blue/10 to-neon-green/10 rounded-lg p-3 border border-slate-600/30">
                    <h4 className="text-sm font-semibold text-electric-blue mb-2">Growth Strategy</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Progressive scaling from land acquisition to full infrastructure deployment, 
                      with each fund building on proven track records and expanding market reach.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Fund Details Grid */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {fundData.map((fund, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  {fund.icon}
                  <div>
                    <CardTitle className="text-white text-xl">{fund.fund}</CardTitle>
                    <p className="text-electric-blue font-bold text-lg">${fund.size}M USD</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 text-sm">Target Investments:</span>
                    <p className="text-white font-semibold">{fund.investments} strategic investments</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Strategy:</span>
                    <p className="text-electric-yellow font-semibold">{fund.model}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Focus:</span>
                    <p className="text-slate-300 text-sm">{fund.focus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Growth Strategy Description */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <p className="text-slate-200 text-center leading-relaxed">
              Each successive fund builds on our established track record, expanding our capability to finance larger projects with significant 
              environmental and financial returns. Our proven methodology scales from strategic land acquisition to full infrastructure deployment.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
