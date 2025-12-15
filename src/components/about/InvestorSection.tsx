import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, GraduationCap, Briefcase, Globe, Cpu, Bitcoin, Award, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const investors = [
  {
    id: 'satt',
    name: 'SnehalKumar Patel',
    title: 'Principal Geotechnical Engineer',
    company: 'SATT Engineering Ltd.',
    location: 'Edmonton, Alberta',
    initials: 'SP',
    gradientFrom: 'from-watt-success',
    gradientTo: 'to-watt-trust',
    accentColor: 'success',
    bio: 'A Canadian engineering consultancy specializing in geotechnical investigations, foundation design, and construction supervision. With over two decades of experience across government, public and private-sector projects, his firm is known for using Super-Cell® bi-directional static load tests to validate large-diameter pile foundations—a technology that has enabled some of the world\'s most ambitious megaprojects.',
    badges: ['20+ Years Experience', 'Global Megaprojects', 'Super-Cell® Technology'],
    stats: { years: 20, projects: 6, countries: 5 },
    projects: [
      { name: 'Hangzhou Bay Bridge', country: '🇨🇳', year: '2006-2008', description: 'World\'s longest cross-sea bridge at the time' },
      { name: 'Zhengzhou Yellow River Bridge', country: '🇨🇳', year: '2007', description: 'Longest combined highway/railway bridge' },
      { name: 'Hong Kong–Zhuhai–Macao Bridge', country: '🇨🇳', year: '2011-2018', description: '1,000+ load tests for world\'s longest sea-bridge complex' },
      { name: 'Port Sudan & University of Ha\'il', country: '🇸🇩🇸🇦', year: '2015', description: 'First Africa & Middle East projects' },
      { name: 'Sabiha Gökçen Airport', country: '🇹🇷', year: '2016', description: '2,000+ load cells for runway expansion' },
      { name: 'Meikarta New City', country: '🇮🇩', year: '2017', description: '1,000 Super-Cell units for high-rise towers' },
    ],
    timeline: [
      { year: '2003', event: 'Founded SATT Engineering', highlight: true },
      { year: '2006', event: 'Hangzhou Bay Bridge Project' },
      { year: '2011', event: 'HK-Zhuhai-Macao Bridge' },
      { year: '2015', event: 'Expanded to Africa & Middle East' },
      { year: '2024', event: 'WattByte Investment', highlight: true },
    ],
  },
  {
    id: 'jay',
    name: 'Jay Hao',
    title: 'Chairman',
    company: 'WattByte',
    location: 'Global',
    initials: 'JH',
    gradientFrom: 'from-watt-bitcoin',
    gradientTo: 'to-watt-orange',
    accentColor: 'bitcoin',
    education: [
      { degree: 'B.S. Electrical Engineering', school: 'University of Mississippi', year: '1994' },
      { degree: 'M.S. Electrical Engineering', school: 'Georgia Institute of Technology', year: '1996' },
    ],
    semiconductorExperience: [
      'ASIC Director at Anyka SZ',
      'VP of Engineering at Amedia Networks',
      'CEO of Unichip Technology',
      'Chairman of Nurotech Inc.',
    ],
    blockchainExperience: [
      { role: 'Chairman', company: 'WattByte', period: 'Present', description: 'Leading Bitcoin infrastructure company', highlight: true },
      { role: 'CEO', company: 'OKX (formerly OKEx)', period: '2018-2023', description: 'One of world\'s largest cryptocurrency exchanges' },
      { role: 'Managing Director', company: 'Mahant Capital', period: 'Present', description: 'Investment fund' },
    ],
    badges: ['21+ Years Semiconductors', 'Former OKX CEO', 'WattByte Chairman'],
    stats: { years: 21, exchanges: 1, chips: 50 },
    bio: 'A veteran technologist and investor with a rich background in both semiconductors and blockchain. He spent over 21 years in the semiconductor industry, designing Bluetooth-enabled SoCs, ASICs, FPGAs, and multimedia codec chips. After leading OKX as CEO from 2018-2023, he now serves as Chairman of WattByte, bringing his expertise in technology and digital assets to guide the company\'s vision for Bitcoin infrastructure development.',
    timeline: [
      { year: '1996', event: 'Georgia Tech M.S. Engineering' },
      { year: '2003', event: 'CEO, Unichip Technology' },
      { year: '2018', event: 'CEO, OKX Exchange', highlight: true },
      { year: '2023', event: 'Managing Director, Mahant Capital' },
      { year: '2024', event: 'Chairman, WattByte', highlight: true },
    ],
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

// Tab button component
const TabButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  accentColor: string;
}> = ({ active, onClick, icon, label, accentColor }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      active 
        ? accentColor === 'success' 
          ? 'bg-watt-success text-white shadow-md' 
          : 'bg-watt-bitcoin text-white shadow-md'
        : 'bg-gray-100 text-watt-navy hover:bg-gray-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Timeline component
const Timeline: React.FC<{ items: { year: string; event: string; highlight?: boolean }[]; accentColor: string }> = ({ items, accentColor }) => (
  <div className="relative pl-6 space-y-4">
    <div className={`absolute left-2 top-2 bottom-2 w-0.5 ${accentColor === 'success' ? 'bg-watt-success/30' : 'bg-watt-bitcoin/30'}`} />
    {items.map((item, i) => (
      <div key={i} className="relative flex items-start gap-4 group">
        <div className={`absolute left-[-16px] w-4 h-4 rounded-full border-2 transition-all duration-300 ${
          item.highlight 
            ? accentColor === 'success' 
              ? 'bg-watt-success border-watt-success' 
              : 'bg-watt-bitcoin border-watt-bitcoin'
            : accentColor === 'success'
              ? 'bg-white border-watt-success/50 group-hover:border-watt-success'
              : 'bg-white border-watt-bitcoin/50 group-hover:border-watt-bitcoin'
        }`} />
        <div className="flex-1">
          <div className={`text-xs font-bold ${accentColor === 'success' ? 'text-watt-success' : 'text-watt-bitcoin'}`}>
            {item.year}
          </div>
          <div className={`text-sm ${item.highlight ? 'font-semibold text-watt-navy' : 'text-watt-navy/80'}`}>
            {item.event}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const InvestorSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({
    satt: 'projects',
    jay: 'career',
  });

  return (
    <section className="py-16 md:py-20 px-6 bg-watt-light">
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

        {/* Investor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {investors.map((investor, index) => (
            <ScrollReveal key={investor.id} delay={index * 150}>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-institutional hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                {/* Top accent bar */}
                <div className={`h-1 bg-gradient-to-r ${investor.gradientFrom} ${investor.gradientTo}`} />
                
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className={`w-16 h-16 bg-gradient-to-br ${investor.gradientFrom} ${investor.gradientTo} ring-4 ring-gray-100`}>
                      <AvatarFallback className="text-white font-bold text-xl bg-transparent">
                        {investor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-watt-navy">
                        {investor.name}
                      </h3>
                      <p className={`font-medium ${investor.accentColor === 'success' ? 'text-watt-success' : 'text-watt-bitcoin'}`}>
                        {investor.title}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-watt-navy/70">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {investor.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {investor.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
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

                  {/* Bio */}
                  <p className="text-watt-navy/80 text-sm mb-6 leading-relaxed">
                    {investor.bio}
                  </p>

                  {/* Tab Navigation */}
                  <div className="flex flex-wrap gap-2 mb-6 border-t border-gray-200 pt-6">
                    {investor.id === 'satt' ? (
                      <>
                        <TabButton
                          active={activeTab.satt === 'projects'}
                          onClick={() => setActiveTab({ ...activeTab, satt: 'projects' })}
                          icon={<Building2 className="w-4 h-4" />}
                          label="Projects"
                          accentColor="success"
                        />
                        <TabButton
                          active={activeTab.satt === 'timeline'}
                          onClick={() => setActiveTab({ ...activeTab, satt: 'timeline' })}
                          icon={<TrendingUp className="w-4 h-4" />}
                          label="Journey"
                          accentColor="success"
                        />
                      </>
                    ) : (
                      <>
                        <TabButton
                          active={activeTab.jay === 'career'}
                          onClick={() => setActiveTab({ ...activeTab, jay: 'career' })}
                          icon={<Briefcase className="w-4 h-4" />}
                          label="Career"
                          accentColor="bitcoin"
                        />
                        <TabButton
                          active={activeTab.jay === 'education'}
                          onClick={() => setActiveTab({ ...activeTab, jay: 'education' })}
                          icon={<GraduationCap className="w-4 h-4" />}
                          label="Education"
                          accentColor="bitcoin"
                        />
                        <TabButton
                          active={activeTab.jay === 'timeline'}
                          onClick={() => setActiveTab({ ...activeTab, jay: 'timeline' })}
                          icon={<TrendingUp className="w-4 h-4" />}
                          label="Journey"
                          accentColor="bitcoin"
                        />
                      </>
                    )}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    {/* SATT Projects Tab */}
                    {investor.id === 'satt' && activeTab.satt === 'projects' && (
                      <div className="space-y-3 animate-fade-in">
                        {investor.projects?.map((project, i) => (
                          <div 
                            key={i} 
                            className="group/item flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-watt-success/5 transition-all duration-300"
                          >
                            <span className="text-2xl">{project.country}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-watt-navy text-sm group-hover/item:text-watt-success transition-colors">
                                  {project.name}
                                </span>
                                <Badge variant="outline" className="text-xs bg-white border-gray-200 text-watt-navy/70">
                                  {project.year}
                                </Badge>
                              </div>
                              <p className="text-xs text-watt-navy/70 mt-0.5">{project.description}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-watt-success opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SATT Timeline Tab */}
                    {investor.id === 'satt' && activeTab.satt === 'timeline' && (
                      <div className="animate-fade-in">
                        <Timeline items={investor.timeline || []} accentColor="success" />
                      </div>
                    )}

                    {/* Jay Career Tab */}
                    {investor.id === 'jay' && activeTab.jay === 'career' && (
                      <div className="space-y-4 animate-fade-in">
                        {/* Blockchain Experience */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Bitcoin className="w-4 h-4 text-watt-bitcoin" />
                            <span className="font-semibold text-watt-navy text-sm">Leadership Roles</span>
                          </div>
                          <div className="space-y-2">
                            {investor.blockchainExperience?.map((exp, i) => (
                              <div 
                                key={i} 
                                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                                  exp.highlight 
                                    ? 'bg-watt-bitcoin/10 border border-watt-bitcoin/20' 
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <div>
                                  <span className={`text-sm font-medium ${exp.highlight ? 'text-watt-bitcoin' : 'text-watt-navy'}`}>
                                    {exp.role}
                                  </span>
                                  <span className="text-watt-navy/60 mx-1">•</span>
                                  <span className="text-sm text-watt-navy/80">{exp.company}</span>
                                  <p className="text-xs text-watt-navy/70 mt-0.5">{exp.description}</p>
                                </div>
                                <Badge variant="outline" className={`text-xs ${exp.highlight ? 'bg-watt-bitcoin/10 border-watt-bitcoin/30 text-watt-bitcoin' : 'bg-white border-gray-200 text-watt-navy/70'}`}>
                                  {exp.period}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Semiconductor Experience */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Cpu className="w-4 h-4 text-watt-trust" />
                            <span className="font-semibold text-watt-navy text-sm">Semiconductor Leadership</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {investor.semiconductorExperience?.map((role, i) => (
                              <div key={i} className="text-xs text-watt-navy/80 bg-watt-trust/10 px-3 py-2 rounded-lg hover:bg-watt-trust/20 transition-colors">
                                {role}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Jay Education Tab */}
                    {investor.id === 'jay' && activeTab.jay === 'education' && (
                      <div className="space-y-4 animate-fade-in">
                        {investor.education?.map((edu, i) => (
                          <div key={i} className="p-4 bg-watt-bitcoin/5 rounded-xl border border-watt-bitcoin/10">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-watt-bitcoin/10 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-watt-bitcoin" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-watt-navy">{edu.degree}</h4>
                                <p className="text-sm text-watt-navy/80">{edu.school}</p>
                                <Badge variant="outline" className="mt-2 text-xs bg-white border-gray-200 text-watt-navy/70">
                                  {edu.year}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Jay Timeline Tab */}
                    {investor.id === 'jay' && activeTab.jay === 'timeline' && (
                      <div className="animate-fade-in">
                        <Timeline items={investor.timeline || []} accentColor="bitcoin" />
                      </div>
                    )}
                  </div>

                  {/* WattByte Connection Footer */}
                  <div className={`mt-6 p-4 rounded-xl border ${
                    investor.accentColor === 'success' 
                      ? 'bg-watt-success/5 border-watt-success/20' 
                      : 'bg-watt-bitcoin/5 border-watt-bitcoin/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        investor.accentColor === 'success' ? 'bg-watt-success/10' : 'bg-watt-bitcoin/10'
                      }`}>
                        <Zap className={`w-4 h-4 ${investor.accentColor === 'success' ? 'text-watt-success' : 'text-watt-bitcoin'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-watt-navy">
                          {investor.id === 'satt' ? 'Engineering Excellence for WattByte' : 'Leading WattByte\'s Vision'}
                        </p>
                        <p className="text-xs text-watt-navy/70">
                          {investor.id === 'satt' 
                            ? 'Bringing megaproject expertise to infrastructure development' 
                            : 'Guiding Bitcoin infrastructure strategy as Chairman'}
                        </p>
                      </div>
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
