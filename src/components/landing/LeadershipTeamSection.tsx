import React from 'react';
import { User, Award, Building, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollReveal } from './ScrollAnimations';

export const LeadershipTeamSection = () => {
  const teamMembers = [
    {
      name: "Jay Hao",
      role: "Chairman",
      icon: <User className="w-6 h-6" />,
      achievements: [
        "Former CEO of OKX Exchange, one of the world's largest crypto trading platforms with multi-billion dollar transaction volumes",
        "Brings extensive experience leading global fintech, crypto infrastructure, and digital asset strategy",
        "Deep LP relationships across Asia, MENA, and emerging markets, with access to sovereign wealth and private capital networks",
        "Oversees fund governance, investor relations, and capital raising strategy for Wattbyte"
      ]
    },
    {
      name: "Parth Patel",
      role: "CEO",
      icon: <Award className="w-6 h-6" />,
      achievements: [
        "Led the consulting and transaction of over 275MW of power assets across North America",
        "Building a pipeline of 700MW+ and over 1,000 acres of power-rich real estate for data centers and HPC deployment",
        "Manages site sourcing, power negotiations, underwriting, and investment strategy",
        "Hands-on experience in low-cost energy procurement, crypto/AI hosting, and infrastructure buildouts"
      ]
    },
    {
      name: "Vivek Patel",
      role: "COO",
      icon: <Building className="w-6 h-6" />,
      achievements: [
        "Experienced infrastructure operator, responsible for due diligence, permitting, entitlements, and construction oversight",
        "Leads execution and compliance across all Wattbyte projects in North America",
        "Coordinates business relationships, environmental review, and legal frameworks to accelerate site readiness",
        "Proven track record in scaling teams and managing multi-site operations under complex regulatory conditions"
      ]
    },
    {
      name: "Lucas Elliott",
      role: "CSO",
      icon: <TrendingUp className="w-6 h-6" />,
      achievements: [
        "Drives strategic expansion across North American and international energy markets, identifying high-growth opportunities in stranded power",
        "Architects partnership frameworks with utilities and IPPs to secure favorable power purchase agreements",
        "Leads market intelligence and competitive positioning using AI-driven analytics for optimal site selection",
        "Oversees strategic M&A pipeline, targeting distressed energy infrastructure and underutilized industrial real estate"
      ]
    }
  ];
 
  return (
    <ScrollReveal>
      <section className="relative py-16 md:py-20 px-6 bg-watt-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
              Leadership Team
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Experienced operators with proven track records in power infrastructure and digital asset operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => {
              const roleColors = {
                'Chairman': { text: 'text-watt-trust', bg: 'bg-watt-trust/10' },
                'CEO': { text: 'text-watt-success', bg: 'bg-watt-success/10' },
                'COO': { text: 'text-watt-bitcoin', bg: 'bg-watt-bitcoin/10' },
                'CSO': { text: 'text-watt-trust', bg: 'bg-watt-trust/10' }
              };
              const colors = roleColors[member.role as keyof typeof roleColors] || { text: 'text-watt-trust', bg: 'bg-watt-trust/10' };
              
              // Get initials for avatar
              const initials = member.name.split(' ').map(n => n[0]).join('');
              
              return (
                <Card 
                  key={index} 
                  className="p-8 bg-white border-gray-200 shadow-institutional hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="h-16 w-16 border-2 border-watt-navy/10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-watt-trust to-watt-bitcoin text-white text-xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-watt-navy mb-1">{member.name}</h3>
                      <p className={`${colors.text} font-medium mb-3`}>{member.role}</p>
                      <div className={`inline-flex items-center p-2 ${colors.bg} ${colors.text} rounded-lg`}>
                        {member.icon}
                      </div>
                    </div>
                  </div>
                  
                  <ul className="space-y-3">
                    {member.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-start text-watt-navy/70">
                        <div className="w-1.5 h-1.5 bg-watt-trust rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-sm leading-relaxed">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};
