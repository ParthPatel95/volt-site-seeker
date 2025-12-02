import React, { useState, useEffect, useRef } from 'react';
import { Zap, Building2, Globe, TrendingUp, LineChart, Server, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Circular Progress Ring Component
const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8 
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-gray-200"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-watt-bitcoin transition-all duration-2000 ease-out"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Animated Counter Component
const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ 
  end, 
  duration = 2000, 
  suffix = '' 
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <div ref={countRef}>{count.toLocaleString()}{suffix}</div>;
};

// Hero Stat Card with Progress Ring
const HeroStatCard: React.FC<{
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  percentage: number;
  description: string;
  color: string;
}> = ({ icon, value, suffix, label, percentage, description, color }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
    bitcoin: { bg: 'bg-watt-bitcoin/10', text: 'text-watt-bitcoin', hover: 'hover:border-watt-bitcoin/50' },
    trust: { bg: 'bg-watt-trust/10', text: 'text-watt-trust', hover: 'hover:border-watt-trust/50' },
    success: { bg: 'bg-watt-success/10', text: 'text-watt-success', hover: 'hover:border-watt-success/50' },
  };

  const colors = colorClasses[color];

  return (
    <Card 
      className={`p-8 bg-white border-2 border-gray-200 shadow-institutional hover:shadow-xl transition-all duration-500 cursor-pointer ${colors.hover} ${isExpanded ? 'scale-105' : 'hover:scale-105'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 ${colors.bg} rounded-2xl mb-6 ${colors.text}`}>
          {icon}
        </div>
        
        <div className="relative mb-6">
          <CircularProgress percentage={percentage} size={140} strokeWidth={10} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-watt-navy">
              <AnimatedCounter end={value} suffix={suffix} />
            </div>
            <div className={`text-sm font-semibold ${colors.text} mt-1`}>
              {percentage}%
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-watt-navy mb-2">{label}</h3>
        
        <div 
          className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <p className="text-sm text-watt-navy/70 mt-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};

// Flip Card for Secondary Stats
const FlipStatCard: React.FC<{
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  details: string[];
  color: string;
}> = ({ icon, value, suffix, label, details, color }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const colorClasses: Record<string, { bg: string; text: string }> = {
    bitcoin: { bg: 'bg-watt-bitcoin/10', text: 'text-watt-bitcoin' },
    trust: { bg: 'bg-watt-trust/10', text: 'text-watt-trust' },
    success: { bg: 'bg-watt-success/10', text: 'text-watt-success' },
  };

  const colors = colorClasses[color];

  return (
    <div 
      className="relative h-64 cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={`absolute inset-0 transition-all duration-500 transform-gpu ${isFlipped ? 'rotate-y-180 opacity-0' : 'rotate-y-0 opacity-100'}`}>
        <Card className="h-full p-6 bg-white border-gray-200 shadow-institutional flex flex-col items-center justify-center text-center">
          <div className={`p-3 ${colors.bg} rounded-xl mb-4 ${colors.text}`}>
            {icon}
          </div>
          <div className="text-4xl font-bold text-watt-navy mb-2">
            <AnimatedCounter end={value} suffix={suffix} />
          </div>
          <div className="text-sm text-watt-navy/70">{label}</div>
          <Badge className="mt-4 bg-gray-100 text-watt-navy border-none text-xs">
            Hover for details
          </Badge>
        </Card>
      </div>

      <div className={`absolute inset-0 transition-all duration-500 transform-gpu ${isFlipped ? 'rotate-y-0 opacity-100' : 'rotate-y-180 opacity-0'}`}>
        <Card className="h-full p-6 bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white shadow-xl flex flex-col justify-center">
          <h4 className="text-lg font-bold mb-4 text-center">{label}</h4>
          <ul className="space-y-3">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start text-sm">
                <div className="w-1.5 h-1.5 bg-watt-bitcoin rounded-full mr-3 mt-1.5 flex-shrink-0"></div>
                <span className="text-white/90">{detail}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar: React.FC<{ label: string; percentage: number; color: string }> = ({ 
  label, 
  percentage, 
  color 
}) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setAnimatedWidth(percentage), 100);
        }
      },
      { threshold: 0.5 }
    );

    if (barRef.current) {
      observer.observe(barRef.current);
    }

    return () => observer.disconnect();
  }, [percentage]);

  const colorClasses: Record<string, string> = {
    bitcoin: 'bg-watt-bitcoin',
    trust: 'bg-watt-trust',
    success: 'bg-watt-success',
  };

  return (
    <div ref={barRef} className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-watt-navy">{label}</span>
        <span className="text-watt-navy/70">{percentage}%</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} transition-all duration-2000 ease-out rounded-full`}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  );
};

// Growth Timeline Component
const GrowthTimeline: React.FC = () => {
  const milestones = [
    { year: '2023', title: 'Founded', description: '675MW+ team experience', color: 'trust' },
    { year: 'Q1 2024', title: 'First Assets', description: '135MW Alberta secured', color: 'bitcoin' },
    { year: 'Q3 2024', title: 'Global Expansion', description: '6 countries, 1,429MW', color: 'success' },
    { year: '2025', title: 'Scale Phase', description: 'Multi-GW development', color: 'trust' },
  ];

  return (
    <div className="relative">
      <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-watt-trust via-watt-bitcoin to-watt-success"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {milestones.map((milestone, index) => {
          const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
            trust: { bg: 'bg-watt-trust/10', text: 'text-watt-trust', border: 'border-watt-trust' },
            bitcoin: { bg: 'bg-watt-bitcoin/10', text: 'text-watt-bitcoin', border: 'border-watt-bitcoin' },
            success: { bg: 'bg-watt-success/10', text: 'text-watt-success', border: 'border-watt-success' },
          };
          const colors = colorClasses[milestone.color];

          return (
            <div key={index} className="relative">
              <div className={`w-4 h-4 ${colors.bg} ${colors.border} border-4 rounded-full mx-auto mb-4 animate-pulse`}></div>
              <Card className={`p-4 bg-white border-gray-200 shadow-institutional hover:shadow-lg transition-all duration-300 ${colors.border} border-t-4`}>
                <div className={`text-lg font-bold ${colors.text} mb-1`}>{milestone.year}</div>
                <h4 className="text-sm font-bold text-watt-navy mb-1">{milestone.title}</h4>
                <p className="text-xs text-watt-navy/70">{milestone.description}</p>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Interactive Stats Section
export const InteractiveStats: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Stats */}
      <div>
        <h3 className="text-2xl font-bold text-watt-navy mb-8 text-center">Key Metrics</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <HeroStatCard
            icon={<Zap className="w-10 h-10" />}
            value={1429}
            suffix="MW"
            label="Global Pipeline"
            percentage={95}
            description="Across 6 countries with diverse energy sources including hydro, solar, wind, and natural gas"
            color="bitcoin"
          />
          <HeroStatCard
            icon={<Building2 className="w-10 h-10" />}
            value={135}
            suffix="MW"
            label="Under Development"
            percentage={45}
            description="Alberta Heartland 135 facility currently under development with 26 acres and 20,000 sqft capacity"
            color="trust"
          />
          <HeroStatCard
            icon={<Globe className="w-10 h-10" />}
            value={6}
            suffix=" Countries"
            label="Global Presence"
            percentage={75}
            description="Strategic presence across North America, Asia, and Africa for optimal power arbitrage"
            color="success"
          />
        </div>
      </div>

      {/* Secondary Stats with Flip Cards */}
      <div>
        <h3 className="text-2xl font-bold text-watt-navy mb-8 text-center">Track Record</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <FlipStatCard
            icon={<TrendingUp className="w-8 h-8" />}
            value={675}
            suffix="MW+"
            label="Deal Experience"
            color="bitcoin"
            details={[
              'Combined team experience across multiple large-scale power projects',
              'Deep expertise in stranded asset identification',
              'Proven track record in infrastructure development'
            ]}
          />
          <FlipStatCard
            icon={<LineChart className="w-8 h-8" />}
            value={275}
            suffix="MW+"
            label="Transactions Led"
            color="trust"
            details={[
              'Successfully led transactions totaling 275MW+ of capacity',
              'Fast execution with regulatory expertise',
              'Strong relationships with utilities and operators'
            ]}
          />
          <FlipStatCard
            icon={<Server className="w-8 h-8" />}
            value={1000}
            suffix="+"
            label="Pipeline Acres"
            color="success"
            details={[
              'Over 1,000 acres of strategic land under development',
              'Purpose-built for AI, HPC, and Bitcoin operations',
              'Optimized for power density and cooling efficiency'
            ]}
          />
        </div>
      </div>

      {/* Progress Bars */}
      <div>
        <h3 className="text-2xl font-bold text-watt-navy mb-8 text-center">Development Progress</h3>
        <Card className="p-8 bg-white border-gray-200 shadow-institutional">
          <div className="space-y-6">
            <ProgressBar label="Pipeline Development" percentage={95} color="bitcoin" />
            <ProgressBar label="Active Construction" percentage={45} color="trust" />
            <ProgressBar label="Regulatory Approvals" percentage={80} color="success" />
          </div>
        </Card>
      </div>

      {/* Growth Timeline */}
      <div>
        <h3 className="text-2xl font-bold text-watt-navy mb-8 text-center">Growth Journey</h3>
        <GrowthTimeline />
      </div>
    </div>
  );
};
