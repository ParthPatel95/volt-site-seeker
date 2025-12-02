import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Clock, Zap, Users, Leaf, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number | null = null;
          const startValue = 0;

          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * (end - startValue) + startValue));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div ref={countRef}>
      {count}{suffix}
    </div>
  );
};

export const FundGrowthPlanSection = () => {
  const fundData = [
    { fund: "Fund I", size: 25, icon: Users },
    { fund: "Fund II", size: 125, icon: Zap },
    { fund: "Fund III", size: 250, icon: Leaf }
  ];

  const fundDetails = [
    {
      fund: "Fund I",
      size: 25,
      investments: "12-15",
      model: "Flip Model",
      focus: "Natural gas and hydroelectric opportunities",
      icon: Users
    },
    {
      fund: "Fund II",
      size: 125,
      investments: "20-25",
      model: "Flip & Build Model",
      focus: "Energy storage and smart grid technologies",
      icon: Zap
    },
    {
      fund: "Fund III",
      size: 250,
      investments: "10-15",
      model: "Build & Brown Field Model",
      focus: "Advanced technologies and nuclear energy",
      icon: Leaf
    }
  ];

  const chartConfig = {
    size: { label: "Fund Size ($M)", color: "hsl(var(--watt-trust))" }
  };

  const keyMetrics = [
    {
      icon: Target,
      label: "Total Capital Target",
      value: 400,
      suffix: "M",
      description: "Across all three funds"
    },
    {
      icon: TrendingUp,
      label: "Total Investments",
      value: 42,
      suffix: "-55",
      description: "Strategic energy projects"
    },
    {
      icon: Clock,
      label: "Timeline",
      value: 5,
      suffix: "-7 Years",
      description: "Fund deployment period"
    }
  ];

  return (
    <section className="relative z-10 py-12 md:py-16 px-3 sm:px-4 md:px-6 bg-watt-light">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-4">
              <span className="text-sm font-medium text-watt-bitcoin">Multi-Fund Strategy</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-watt-navy">
              Fund Growth Plan
            </h2>
            <p className="text-base md:text-lg text-watt-navy/70 max-w-2xl mx-auto px-2">
              Multi-fund strategy deploying <span className="font-bold text-watt-navy">$<AnimatedCounter end={400} suffix="M" /></span> across three sequential vehicles
            </p>
          </div>
        </ScrollReveal>

        {/* Main Fund Overview with Bar Chart */}
        <ScrollReveal direction="up">
          <Card className="mb-4 sm:mb-6 md:mb-8 bg-white border-gray-200 shadow-institutional overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-3 flex flex-col items-center justify-center">
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fundData} margin={{ top: 10, right: 15, left: 10, bottom: 15 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--watt-navy) / 0.2)" />
                        <XAxis 
                          dataKey="fund" 
                          stroke="hsl(var(--watt-navy) / 0.6)"
                          fontSize={10}
                          tickMargin={5}
                        />
                        <YAxis 
                          stroke="hsl(var(--watt-navy) / 0.6)"
                          fontSize={10}
                          tickMargin={5}
                          width={30}
                        />
                        <Bar 
                          dataKey="size" 
                          fill="hsl(var(--watt-trust))"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-watt-navy mt-2 sm:mt-4">Fund Size Progression</h3>
                </div>

                {/* Key Metrics Panel */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4 flex flex-col justify-center">
                  <h3 className="text-base sm:text-lg font-semibold text-watt-navy mb-2 sm:mb-3">Key Metrics</h3>
                  {keyMetrics.map((metric, index) => (
                    <div key={index} className="bg-watt-light rounded-lg p-2 sm:p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <metric.icon className="w-4 sm:w-5 h-4 sm:h-5 text-watt-trust" />
                        <span className="text-xs sm:text-sm text-watt-navy/60">{metric.label}</span>
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-watt-navy">
                        {metric.label === "Total Capital Target" && "$"}
                        <AnimatedCounter end={metric.value} suffix={metric.suffix} />
                      </div>
                      <div className="text-xs text-watt-navy/60">{metric.description}</div>
                    </div>
                  ))}
                  
                  {/* Growth Strategy Summary */}
                  <div className="bg-watt-trust/10 rounded-lg p-2 sm:p-3 border border-watt-trust/20">
                    <h4 className="text-xs sm:text-sm font-semibold text-watt-trust mb-1 sm:mb-2">Growth Strategy</h4>
                    <p className="text-xs text-watt-navy/70 leading-relaxed">
                      Progressive scaling from land acquisition to full infrastructure deployment, 
                      with each fund building on proven track records and expanding market reach.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
        
        {/* Timeline Visual */}
        <ScrollReveal direction="up" delay={100}>
          <div className="mb-6 md:mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-institutional">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-watt-success flex items-center justify-center mb-2">
                  <span className="text-white font-bold">I</span>
                </div>
                <span className="text-sm font-semibold text-watt-navy">$25M</span>
                <span className="text-xs text-watt-success">Active</span>
              </div>
              <ArrowRight className="w-8 h-8 text-watt-navy/30 mx-4" />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-watt-trust/20 border-2 border-watt-trust flex items-center justify-center mb-2">
                  <span className="text-watt-trust font-bold">II</span>
                </div>
                <span className="text-sm font-semibold text-watt-navy">$125M</span>
                <span className="text-xs text-watt-navy/60">Planned 2025</span>
              </div>
              <ArrowRight className="w-8 h-8 text-watt-navy/30 mx-4" />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-watt-bitcoin/20 border-2 border-watt-bitcoin flex items-center justify-center mb-2">
                  <span className="text-watt-bitcoin font-bold">III</span>
                </div>
                <span className="text-sm font-semibold text-watt-navy">$250M</span>
                <span className="text-xs text-watt-navy/60">Planned 2026</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Individual Fund Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {fundDetails.map((fund, index) => (
            <ScrollReveal key={index} delay={index * 100} direction="up">
              <Card className="bg-white border-gray-200 shadow-institutional overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:px-4 md:px-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <fund.icon className="w-6 sm:w-8 h-6 sm:h-8 text-watt-trust" />
                    <div>
                      <CardTitle className="text-watt-navy text-lg sm:text-xl">{fund.fund}</CardTitle>
                      <p className="text-watt-trust font-bold text-base sm:text-lg">${fund.size}M</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 p-3 sm:px-4 md:px-6">
                  <div className="space-y-2">
                    <div>
                      <span className="text-watt-navy/60 text-xs sm:text-sm">Target Investments:</span>
                      <p className="text-watt-navy font-semibold text-sm sm:text-base">{fund.investments} strategic investments</p>
                    </div>
                    <div>
                      <span className="text-watt-navy/60 text-xs sm:text-sm">Strategy:</span>
                      <p className="text-watt-bitcoin font-semibold text-sm sm:text-base">{fund.model}</p>
                    </div>
                    <div>
                      <span className="text-watt-navy/60 text-xs sm:text-sm">Focus:</span>
                      <p className="text-watt-navy/70 text-xs sm:text-sm leading-relaxed">{fund.focus}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Growth Strategy Description */}
        <ScrollReveal direction="up">
          <Card className="bg-watt-light border-gray-200">
            <CardContent className="p-3 sm:p-4">
              <p className="text-watt-navy/70 text-center leading-relaxed text-sm sm:text-base">
                Each successive fund builds on our established track record, expanding our capability to finance larger projects with significant 
                environmental and financial returns. Our proven methodology scales from strategic land acquisition to full infrastructure deployment.
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};
