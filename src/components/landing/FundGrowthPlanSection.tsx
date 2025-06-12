
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Building, Zap, TrendingUp } from 'lucide-react';

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

        {/* Fund Growth Chart */}
        <div className="mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-center">Fund Size Progression</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fundData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="fund" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`$${value}M USD`, 'Fund Size']}
                    />
                    <Bar 
                      dataKey="size" 
                      fill="#0EA5E9"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
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
