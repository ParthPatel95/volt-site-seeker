
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
      icon: <Building className="w-6 sm:w-8 h-6 sm:h-8 text-electric-blue" />
    },
    {
      fund: "Fund II",
      size: 125,
      investments: "20-25",
      model: "Flip & Build Model",
      focus: "Energy storage and smart grid technologies",
      icon: <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-electric-yellow" />
    },
    {
      fund: "Fund III",
      size: 250,
      investments: "10-15",
      model: "Build & Brown Field Model",
      focus: "Advanced technologies and nuclear energy",
      icon: <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-neon-green" />
    }
  ];

  const chartConfig = {
    size: { label: "Fund Size ($M USD)", color: "#0EA5E9" }
  };

  const keyMetrics = [
    {
      icon: <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-electric-blue" />,
      label: "Total Capital Target",
      value: "$400M USD",
      description: "Across all three funds"
    },
    {
      icon: <Target className="w-4 sm:w-5 h-4 sm:h-5 text-electric-yellow" />,
      label: "Total Investments",
      value: "42-55",
      description: "Strategic energy projects"
    },
    {
      icon: <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-neon-green" />,
      label: "Timeline",
      value: "5-7 Years",
      description: "Fund deployment period"
    }
  ];

  return (
    <section className="relative z-10 py-6 sm:py-8 px-3 sm:px-4 md:px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">
            WattByte Energy Fund Growth Plan
          </h2>
          <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-4xl mx-auto px-2">
            Our strategic multi-fund approach allows us to scale our impact and returns in the renewable energy infrastructure sector over time.
          </p>
        </div>

        {/* Fund Growth Chart with Side Panel */}
        <div className="mb-4 sm:mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-3 flex flex-col items-center justify-center">
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fundData} margin={{ top: 10, right: 15, left: 10, bottom: 15 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="fund" 
                          stroke="#9CA3AF"
                          fontSize={10}
                          tickMargin={5}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          fontSize={10}
                          tickMargin={5}
                          width={30}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`$${value}M USD`, 'Fund Size']}
                        />
                        <Bar 
                          dataKey="size" 
                          fill="#0EA5E9"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mt-2 sm:mt-4">Fund Size Progression</h3>
                </div>

                {/* Key Metrics Panel */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4 flex flex-col justify-center">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Key Metrics</h3>
                  {keyMetrics.map((metric, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {metric.icon}
                        <span className="text-xs sm:text-sm text-slate-400">{metric.label}</span>
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-white">{metric.value}</div>
                      <div className="text-xs text-slate-400">{metric.description}</div>
                    </div>
                  ))}
                  
                  {/* Growth Strategy Summary */}
                  <div className="bg-gradient-to-br from-electric-blue/10 to-neon-green/10 rounded-lg p-2 sm:p-3 border border-slate-600/30">
                    <h4 className="text-xs sm:text-sm font-semibold text-electric-blue mb-1 sm:mb-2">Growth Strategy</h4>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {fundData.map((fund, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  {fund.icon}
                  <div>
                    <CardTitle className="text-white text-lg sm:text-xl">{fund.fund}</CardTitle>
                    <p className="text-electric-blue font-bold text-base sm:text-lg">${fund.size}M USD</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-3 sm:p-4 md:p-6">
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 text-xs sm:text-sm">Target Investments:</span>
                    <p className="text-white font-semibold text-sm sm:text-base">{fund.investments} strategic investments</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs sm:text-sm">Strategy:</span>
                    <p className="text-electric-yellow font-semibold text-sm sm:text-base">{fund.model}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs sm:text-sm">Focus:</span>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{fund.focus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Growth Strategy Description */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-slate-200 text-center leading-relaxed text-sm sm:text-base">
              Each successive fund builds on our established track record, expanding our capability to finance larger projects with significant 
              environmental and financial returns. Our proven methodology scales from strategic land acquisition to full infrastructure deployment.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
