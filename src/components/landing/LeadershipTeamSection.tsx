
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Award, Globe, Building, TrendingUp } from 'lucide-react';

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
    <section className="relative z-10 py-12 md:py-16 px-6 bg-watt-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-watt-navy">
            Leadership Team
          </h2>
          <p className="text-base md:text-lg text-watt-navy/70 max-w-2xl mx-auto">
            Proven operators with 675MW+ of power infrastructure experience
          </p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => {
            const roleColors = {
              'Chairman': 'text-watt-trust',
              'CEO': 'text-watt-success',
              'COO': 'text-watt-bitcoin',
              'CSO': 'text-watt-trust'
            };
            const roleColor = roleColors[member.role as keyof typeof roleColors] || 'text-watt-trust';
            
            return (
              <Card key={index} className="bg-white border-gray-200 shadow-institutional hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={roleColor}>
                      {member.icon}
                    </div>
                    <div>
                      <CardTitle className="text-watt-navy text-xl">{member.name}</CardTitle>
                      <p className={`${roleColor} font-semibold`}>{member.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {member.achievements.map((achievement, achievementIndex) => (
                      <li key={achievementIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-watt-trust rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-watt-navy/70 text-sm leading-relaxed">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
