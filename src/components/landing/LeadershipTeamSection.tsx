import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Zap } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

interface ImpactStat {
  value: string;
  label: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: 'success' | 'bitcoin' | 'trust' | 'navy';
  tagline: string;
  impactStats: ImpactStat[];
  badges: string[];
  wattbyteRole: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 'jay',
    name: 'Jay Hao',
    role: 'Chairman',
    initials: 'JH',
    gradientFrom: 'from-watt-bitcoin',
    gradientTo: 'to-watt-orange',
    accentColor: 'bitcoin',
    tagline: 'Leading WattByte with deep LP relationships across Asia, MENA, and access to sovereign wealth networks.',
    impactStats: [
      { value: '#2', label: 'OKX CEO (Former)' },
      { value: 'Global', label: 'Fintech Leader' },
      { value: '21+', label: 'Years Tech' },
      { value: 'MENA', label: 'LP Networks' },
    ],
    badges: ['Digital Asset Strategy', 'Crypto Infrastructure', 'Investor Relations'],
    wattbyteRole: 'Fund Governance & Capital Strategy',
  },
  {
    id: 'snehal',
    name: 'SnehalKumar Patel',
    role: 'President',
    initials: 'SP',
    gradientFrom: 'from-watt-trust',
    gradientTo: 'to-watt-success',
    accentColor: 'trust',
    tagline: 'Engineering expertise behind the world\'s most ambitious infrastructure megaprojects across 5 continents.',
    impactStats: [
      { value: '1,000+', label: 'Super-Cells Deployed' },
      { value: '6', label: 'Megaprojects' },
      { value: '5', label: 'Continents' },
      { value: '20+', label: 'Years' },
    ],
    badges: ['Global Infrastructure', 'Super-Cell® Pioneer', 'Engineering Excellence'],
    wattbyteRole: 'Strategic Vision & Infrastructure Leadership',
  },
  {
    id: 'parth',
    name: 'Parth Patel',
    role: 'CEO',
    initials: 'PP',
    gradientFrom: 'from-watt-success',
    gradientTo: 'to-watt-trust',
    accentColor: 'success',
    tagline: 'Hands-on experience in low-cost energy procurement, crypto/AI hosting, and infrastructure buildouts.',
    impactStats: [
      { value: '275MW', label: 'Transacted' },
      { value: '700MW+', label: 'Pipeline' },
      { value: '1,000+', label: 'Acres Sourced' },
      { value: 'N. America', label: 'Operations' },
    ],
    badges: ['Power Procurement', 'Site Sourcing', 'Investment Strategy'],
    wattbyteRole: 'Power Negotiations & Deal Execution',
  },
  {
    id: 'vivek',
    name: 'Vivek Patel',
    role: 'COO',
    initials: 'VP',
    gradientFrom: 'from-watt-trust',
    gradientTo: 'to-watt-navy',
    accentColor: 'trust',
    tagline: 'Proven track record scaling teams and managing multi-site operations under complex regulatory conditions.',
    impactStats: [
      { value: 'Multi-Site', label: 'Operations Lead' },
      { value: 'Full', label: 'Due Diligence' },
      { value: 'Permits', label: '& Entitlements' },
      { value: 'Compliance', label: 'Oversight' },
    ],
    badges: ['Infrastructure Operations', 'Regulatory Compliance', 'Construction Oversight'],
    wattbyteRole: 'Execution & Site Readiness',
  },
  {
    id: 'lucas',
    name: 'Lucas Elliott',
    role: 'CSO',
    initials: 'LE',
    gradientFrom: 'from-watt-navy',
    gradientTo: 'to-watt-trust',
    accentColor: 'navy',
    tagline: 'Architects partnership frameworks with utilities and IPPs to secure favorable power purchase agreements.',
    impactStats: [
      { value: 'N. America', label: '& International' },
      { value: 'AI-Driven', label: 'Site Analytics' },
      { value: 'M&A', label: 'Pipeline Lead' },
      { value: 'PPA', label: 'Negotiations' },
    ],
    badges: ['Strategic Expansion', 'Market Intelligence', 'Utility Partnerships'],
    wattbyteRole: 'Strategic Growth & M&A',
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

// Get accent color classes
const getAccentClasses = (accentColor: TeamMember['accentColor']) => {
  const colorMap = {
    success: {
      text: 'text-watt-success',
      bg: 'bg-watt-success/10',
      bgHover: 'hover:bg-watt-success/15',
      border: 'border-watt-success/30',
      bgLight: 'bg-watt-success/5',
      borderLight: 'border-watt-success/20',
      iconBg: 'bg-watt-success/20',
    },
    bitcoin: {
      text: 'text-watt-bitcoin',
      bg: 'bg-watt-bitcoin/10',
      bgHover: 'hover:bg-watt-bitcoin/15',
      border: 'border-watt-bitcoin/30',
      bgLight: 'bg-watt-bitcoin/5',
      borderLight: 'border-watt-bitcoin/20',
      iconBg: 'bg-watt-bitcoin/20',
    },
    trust: {
      text: 'text-watt-trust',
      bg: 'bg-watt-trust/10',
      bgHover: 'hover:bg-watt-trust/15',
      border: 'border-watt-trust/30',
      bgLight: 'bg-watt-trust/5',
      borderLight: 'border-watt-trust/20',
      iconBg: 'bg-watt-trust/20',
    },
    navy: {
      text: 'text-foreground',
      bg: 'bg-muted',
      bgHover: 'hover:bg-muted/80',
      border: 'border-border',
      bgLight: 'bg-muted/50',
      borderLight: 'border-border/50',
      iconBg: 'bg-muted',
    },
  };
  return colorMap[accentColor];
};

// Impact stat card
const ImpactStatCard: React.FC<{ stat: ImpactStat; accentColor: TeamMember['accentColor'] }> = ({ stat, accentColor }) => {
  const colors = getAccentClasses(accentColor);
  return (
    <div className={`text-center p-3 md:p-4 rounded-xl transition-all duration-300 hover:scale-105 ${colors.bg} ${colors.bgHover}`}>
      <div className={`text-lg md:text-2xl font-bold ${colors.text}`}>
        {stat.value}
      </div>
      <div className="text-xs text-muted-foreground mt-1 font-medium">
        {stat.label}
      </div>
    </div>
  );
};

export const LeadershipTeamSection = () => {
  return (
    <section id="leadership" className="py-16 md:py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Hero Stats Banner */}
        <ScrollReveal>
          <div className="relative mb-16 rounded-2xl overflow-hidden bg-watt-navy">
            <div className="absolute inset-0 bg-gradient-to-r from-watt-navy via-watt-navy to-watt-navy/95" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-watt-success/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-watt-bitcoin/15 via-transparent to-transparent" />
            
            <div className="relative px-8 py-12 md:py-16">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-watt-success/20 text-watt-success border-watt-success/30">
                  <Users className="w-3 h-3 mr-1" />
                  Executive Leadership
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Leadership Team
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Experienced operators with proven track records in power infrastructure and digital asset operations
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <AnimatedStat value={700} suffix="MW+" label="Pipeline" />
                <AnimatedStat value={275} suffix="MW" label="Transacted" />
                <AnimatedStat value={5} label="Executives" />
                <AnimatedStat value={5} label="Continents" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Team Member Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {teamMembers.map((member, index) => {
            const colors = getAccentClasses(member.accentColor);
            
            return (
              <ScrollReveal key={member.id} delay={index * 150}>
                <div className="bg-background rounded-2xl border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
                  {/* Top accent bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${member.gradientFrom} ${member.gradientTo}`} />
                  
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <Avatar className={`w-16 h-16 bg-gradient-to-br ${member.gradientFrom} ${member.gradientTo} ring-4 ring-muted`}>
                        <AvatarFallback className="text-white font-bold text-xl bg-transparent">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground">
                          {member.name}
                        </h3>
                        <p className={`font-medium text-sm ${colors.text}`}>
                          {member.role}
                        </p>
                      </div>
                    </div>

                    {/* Impact Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {member.impactStats.map((stat, i) => (
                        <ImpactStatCard key={i} stat={stat} accentColor={member.accentColor} />
                      ))}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {member.badges.map((badge, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className={`text-xs ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    {/* Tagline */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                      "{member.tagline}"
                    </p>

                    {/* WattByte Role */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl ${colors.bgLight} border ${colors.borderLight}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.iconBg}`}>
                        <Zap className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">WattByte Role</p>
                        <p className={`font-semibold text-sm ${colors.text}`}>
                          {member.wattbyteRole}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
