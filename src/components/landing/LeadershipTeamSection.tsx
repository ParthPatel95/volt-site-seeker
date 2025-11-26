
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Award, Globe, Building, TrendingUp } from 'lucide-react';

export const LeadershipTeamSection = () => {
  const teamMembers = [
    {
      name: "Jay Hao",
      role: "Chairman",
      icon: <User className="w-6 h-6 text-electric-blue" />,
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
      icon: <Award className="w-6 h-6 text-neon-green" />,
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
      icon: <Building className="w-6 h-6 text-electric-yellow" />,
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
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
      achievements: [
        "Drives strategic expansion across North American and international energy markets, identifying high-growth opportunities in stranded power assets",
        "Architects partnership frameworks with utilities, independent power producers, and regional grid operators to secure favorable power purchase agreements",
        "Leads market intelligence and competitive positioning, leveraging AI-driven analytics to optimize site selection and capital deployment timing",
        "Oversees strategic M&A pipeline development, targeting distressed energy infrastructure and underutilized industrial real estate for value creation"
      ]
    }
  ];

  return (
    <section className="relative z-10 py-12 px-6 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-white">
            Leadership Team
          </h2>
          <p className="text-slate-200 text-lg max-w-2xl mx-auto">
            Proven operators with 675MW+ of power infrastructure experience
          </p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  {member.icon}
                  <div>
                    <CardTitle className="text-white text-xl">{member.name}</CardTitle>
                    <p className="text-electric-blue font-semibold">{member.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {member.achievements.map((achievement, achievementIndex) => (
                    <li key={achievementIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-electric-blue rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-300 text-sm leading-relaxed">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
