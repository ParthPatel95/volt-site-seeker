import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Award, Zap } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

interface ImpactStat {
  value: string;
  label: string;
}

interface Investor {
  id: string;
  name: string;
  title: string;
  company: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: 'success' | 'bitcoin';
  tagline: string;
  impactStats: ImpactStat[];
  badges: string[];
  wattbyteRole: string;
}

const investors: Investor[] = [
  {
    id: 'satt',
    name: 'SnehalKumar Patel',
    title: 'Visionary Chairman & Veteran Engineer',
    company: 'SATT Engineering Ltd.',
    initials: 'SP',
    gradientFrom: 'from-watt-success',
    gradientTo: 'to-watt-trust',
    accentColor: 'success',
    tagline: 'Engineering expertise behind the world\'s most ambitious infrastructure megaprojects.',
    impactStats: [
      { value: '1,000+', label: 'Super-Cells Deployed' },
      { value: '6', label: 'Megaprojects' },
      { value: '5', label: 'Continents' },
      { value: '20+', label: 'Years' },
    ],
    badges: ['Global Infrastructure', 'Super-Cell® Pioneer', 'Engineering Excellence'],
    wattbyteRole: 'Strategic Investor & Infrastructure Advisor',
  },
  {
    id: 'jay',
    name: 'Jay Hao',
    title: 'Chairman',
    company: 'WattByte',
    initials: 'JH',
    gradientFrom: 'from-watt-bitcoin',
    gradientTo: 'to-watt-orange',
    accentColor: 'bitcoin',
    tagline: 'Veteran technologist bridging semiconductors and blockchain infrastructure.',
    impactStats: [
      { value: '#2', label: 'Former OKX CEO' },
      { value: '21+', label: 'Years Semiconductors' },
      { value: '50+', label: 'Chip Designs' },
      { value: '2018-23', label: 'Led OKX' },
    ],
    badges: ['Crypto Exchange Leader', 'ASIC Expert', 'Tech Visionary'],
    wattbyteRole: 'Chairman of WattByte',
  },
];

// Animated counter component
const AnimatedStat: React.FC<{ value: number; suffix?: string; label: string }> = ({ value, suffix = '', label }) => {
  const [count, setCount] = useState(0);
  
  React.useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white">
        {count}{suffix}
      </div>
      <div className="text-sm text-white/80 mt-1">{label}</div>
    </div>
  );
};

// Impact stat card
const ImpactStatCard: React.FC<{ stat: ImpactStat; accentColor: 'success' | 'bitcoin' }> = ({ stat, accentColor }) => (
  <div className={`text-center p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
    accentColor === 'success' 
      ? 'bg-watt-success/10 hover:bg-watt-success/15' 
      : 'bg-watt-bitcoin/10 hover:bg-watt-bitcoin/15'
  }`}>
    <div className={`text-2xl md:text-3xl font-bold ${
      accentColor === 'success' ? 'text-watt-success' : 'text-watt-bitcoin'
    }`}>
      {stat.value}
    </div>
    <div className="text-xs text-muted-foreground mt-1 font-medium">
      {stat.label}
    </div>
  </div>
);

export const InvestorSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Hero Stats Banner */}
        <ScrollReveal>
          <div className="relative mb-16 rounded-2xl overflow-hidden bg-watt-navy">
            <div className="absolute inset-0 bg-gradient-to-r from-watt-navy via-watt-navy to-watt-navy/95" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-watt-bitcoin/20 via-transparent to-transparent" />
            
            <div className="relative px-8 py-12 md:py-16">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-watt-bitcoin/20 text-watt-bitcoin border-watt-bitcoin/30">
                  <Award className="w-3 h-3 mr-1" />
                  Backed by Industry Leaders
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Our Investors
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Decades of combined expertise in engineering, technology, and digital assets
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <AnimatedStat value={40} suffix="+" label="Years Combined Experience" />
                <AnimatedStat value={6} suffix="+" label="Global Megaprojects" />
                <AnimatedStat value={5} label="Continents Reached" />
                <AnimatedStat value={21} suffix="+" label="Years in Semiconductors" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Investor Cards - Simplified */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {investors.map((investor, index) => (
            <ScrollReveal key={investor.id} delay={index * 150}>
              <div className="bg-background rounded-2xl border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
                {/* Top accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${investor.gradientFrom} ${investor.gradientTo}`} />
                
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className={`w-16 h-16 bg-gradient-to-br ${investor.gradientFrom} ${investor.gradientTo} ring-4 ring-muted`}>
                      <AvatarFallback className="text-white font-bold text-xl bg-transparent">
                        {investor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">
                        {investor.name}
                      </h3>
                      <p className={`font-medium text-sm ${investor.accentColor === 'success' ? 'text-watt-success' : 'text-watt-bitcoin'}`}>
                        {investor.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {investor.company}
                      </p>
                    </div>
                  </div>

                  {/* Impact Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {investor.impactStats.map((stat, i) => (
                      <ImpactStatCard key={i} stat={stat} accentColor={investor.accentColor} />
                    ))}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {investor.badges.map((badge, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className={`text-xs ${
                          investor.accentColor === 'success'
                            ? 'bg-watt-success/10 text-watt-success border-watt-success/30'
                            : 'bg-watt-bitcoin/10 text-watt-bitcoin border-watt-bitcoin/30'
                        }`}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>

                  {/* Tagline */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                    "{investor.tagline}"
                  </p>

                  {/* WattByte Connection */}
                  <div className={`flex items-center gap-3 p-4 rounded-xl ${
                    investor.accentColor === 'success' 
                      ? 'bg-watt-success/5 border border-watt-success/20' 
                      : 'bg-watt-bitcoin/5 border border-watt-bitcoin/20'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      investor.accentColor === 'success' 
                        ? 'bg-watt-success/20' 
                        : 'bg-watt-bitcoin/20'
                    }`}>
                      <Zap className={`w-5 h-5 ${
                        investor.accentColor === 'success' ? 'text-watt-success' : 'text-watt-bitcoin'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">WattByte Role</p>
                      <p className={`font-semibold text-sm ${
                        investor.accentColor === 'success' ? 'text-watt-success' : 'text-watt-bitcoin'
                      }`}>
                        {investor.wattbyteRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
