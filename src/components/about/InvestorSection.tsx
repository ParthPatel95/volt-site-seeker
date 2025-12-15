import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, GraduationCap, Briefcase, ChevronDown, ChevronUp, Globe, Cpu, Bitcoin, Award } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const investors = [
  {
    id: 'satt',
    name: 'SnehalKumar Patel',
    title: 'Principal Geotechnical Engineer',
    company: 'SATT Engineering Ltd.',
    location: 'Edmonton, Alberta',
    initials: 'SP',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    bio: 'A Canadian engineering consultancy specializing in geotechnical investigations, foundation design, and construction supervision. With over two decades of experience across government, public and private-sector projects, his firm is known for using Super-Cell® bi-directional static load tests to validate large-diameter pile foundations—a technology that has enabled some of the world\'s most ambitious megaprojects.',
    badges: ['20+ Years Experience', 'Global Megaprojects', 'Super-Cell® Technology'],
    projects: [
      { name: 'Hangzhou Bay Bridge', country: '🇨🇳', year: '2006-2008', description: 'World\'s longest cross-sea bridge at the time' },
      { name: 'Zhengzhou Yellow River Bridge', country: '🇨🇳', year: '2007', description: 'Longest combined highway/railway bridge' },
      { name: 'Hong Kong–Zhuhai–Macao Bridge', country: '🇨🇳', year: '2011-2018', description: '1,000+ load tests for world\'s longest sea-bridge complex' },
      { name: 'Port Sudan & University of Ha\'il', country: '🇸🇩🇸🇦', year: '2015', description: 'First Africa & Middle East projects' },
      { name: 'Sabiha Gökçen Airport', country: '🇹🇷', year: '2016', description: '2,000+ load cells for runway expansion' },
      { name: 'Meikarta New City', country: '🇮🇩', year: '2017', description: '1,000 Super-Cell units for high-rise towers' },
    ],
  },
  {
    id: 'jay',
    name: 'Jay Hao',
    title: 'Investor & Technology Executive',
    company: 'Crypto Hawk',
    location: 'Global',
    initials: 'JH',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
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
      { role: 'CEO', company: 'OKX (formerly OKEx)', period: '2018-2023', description: 'One of world\'s largest cryptocurrency exchanges' },
      { role: 'CEO', company: 'Crypto Hawk', period: '2023-Present', description: 'AI-powered quantitative trading' },
      { role: 'Managing Director', company: 'Mahant Capital', period: 'Present', description: 'Investment fund' },
    ],
    badges: ['21+ Years Semiconductors', 'Former OKX CEO', 'Blockchain Pioneer'],
    bio: 'A veteran technologist and investor with a rich background in both semiconductors and blockchain. He spent over 21 years in the semiconductor industry, designing Bluetooth-enabled SoCs, ASICs, FPGAs, and multimedia codec chips. His track record of innovation and leadership across hardware and fintech sectors underscores the depth of expertise he brings to our investor group.',
  },
];

export const InvestorSection: React.FC = () => {
  const [expandedProjects, setExpandedProjects] = useState<string | null>(null);

  return (
    <section className="relative py-16 md:py-20 px-6 bg-watt-light/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-watt-orange/10 text-watt-orange border-watt-orange/20">
              <Award className="w-3 h-3 mr-1" />
              Backed by Industry Leaders
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
              Our Investors
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Championing Groundbreaking Engineering and Blockchain Innovation
            </p>
          </div>
        </ScrollReveal>

        {/* Investor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SATT Engineering Card */}
          <ScrollReveal delay={100}>
            <Card className="bg-white border-none shadow-institutional hover:shadow-xl transition-all duration-300 h-full">
              <CardContent className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className={`w-16 h-16 bg-gradient-to-br ${investors[0].gradientFrom} ${investors[0].gradientTo}`}>
                    <AvatarFallback className="text-white font-bold text-xl bg-transparent">
                      {investors[0].initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-watt-navy">{investors[0].name}</h3>
                    <p className="text-watt-navy/70">{investors[0].title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-watt-navy/60">{investors[0].company}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-watt-navy/60">{investors[0].location}</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {investors[0].badges.map((badge, i) => (
                    <Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-watt-navy/70 text-sm mb-6 leading-relaxed">
                  {investors[0].bio}
                </p>

                {/* Key Projects */}
                <div className="border-t border-watt-navy/10 pt-4">
                  <button
                    onClick={() => setExpandedProjects(expandedProjects === 'satt' ? null : 'satt')}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <span className="font-semibold text-watt-navy flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      Key Megaprojects ({investors[0].projects.length})
                    </span>
                    {expandedProjects === 'satt' ? (
                      <ChevronUp className="w-5 h-5 text-watt-navy/50 group-hover:text-watt-navy transition-colors" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-watt-navy/50 group-hover:text-watt-navy transition-colors" />
                    )}
                  </button>
                  
                  {expandedProjects === 'satt' && (
                    <div className="mt-4 space-y-3 animate-fade-in">
                      {investors[0].projects.map((project, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-lg">
                          <span className="text-lg">{project.country}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-watt-navy text-sm">{project.name}</span>
                              <Badge variant="outline" className="text-xs bg-white">{project.year}</Badge>
                            </div>
                            <p className="text-xs text-watt-navy/60 mt-0.5">{project.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Jay Hao Card */}
          <ScrollReveal delay={200}>
            <Card className="bg-white border-none shadow-institutional hover:shadow-xl transition-all duration-300 h-full">
              <CardContent className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className={`w-16 h-16 bg-gradient-to-br ${investors[1].gradientFrom} ${investors[1].gradientTo}`}>
                    <AvatarFallback className="text-white font-bold text-xl bg-transparent">
                      {investors[1].initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-watt-navy">{investors[1].name}</h3>
                    <p className="text-watt-navy/70">{investors[1].title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-watt-navy/60">CEO, {investors[1].company}</span>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-watt-navy">Education</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {investors[1].education?.map((edu, i) => (
                      <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {edu.degree} • {edu.year}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {investors[1].badges.map((badge, i) => (
                    <Badge key={i} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-watt-navy/70 text-sm mb-6 leading-relaxed">
                  {investors[1].bio}
                </p>

                {/* Semiconductor Experience */}
                <div className="border-t border-watt-navy/10 pt-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-watt-navy text-sm">Semiconductor Leadership</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {investors[1].semiconductorExperience?.map((role, i) => (
                      <div key={i} className="text-xs text-watt-navy/70 bg-slate-50 px-2 py-1.5 rounded">
                        {role}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blockchain Experience */}
                <div className="border-t border-watt-navy/10 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bitcoin className="w-4 h-4 text-watt-orange" />
                    <span className="font-semibold text-watt-navy text-sm">Blockchain & Fintech</span>
                  </div>
                  <div className="space-y-2">
                    {investors[1].blockchainExperience?.map((exp, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-orange-50/50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-watt-navy">{exp.role}</span>
                          <span className="text-watt-navy/50 mx-1">•</span>
                          <span className="text-sm text-watt-navy/70">{exp.company}</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-white">{exp.period}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
