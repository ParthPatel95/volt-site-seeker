
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingUp, 
  MapPin, 
  Brain, 
  Shield, 
  ArrowRight,
  BarChart3,
  Globe,
  Cpu,
  Building,
  Users,
  Lock
} from 'lucide-react';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', { email, message });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-indigo-600/10"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Wattbyte
            </h1>
            <p className="text-xs text-slate-400">Infrastructure Fund</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link to="/voltscout" className="text-slate-300 hover:text-blue-400 transition-colors">
            VoltScout
          </Link>
          <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
            Request Access
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 border-blue-500/50 text-blue-400 bg-blue-500/10">
            Fund I • $25M Target • 2.0-2.5x MOIC
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Turning Power<br />into Profit
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Next-generation infrastructure fund acquiring power-rich land across North America 
            for AI, HPC, and crypto data centers. Backed by 675MW+ of deal experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
              Join Investor Room
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg">
              View Pipeline
            </Button>
          </div>
        </div>
      </section>

      {/* Fund Overview */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Fund I Overview
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Strategic acquisition and development of undervalued power assets for premium digital infrastructure
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Target Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">2.0-2.5x</div>
                  <div className="text-slate-400">MOIC</div>
                  <div className="text-2xl font-bold text-purple-400">30-40%</div>
                  <div className="text-slate-400">Net IRR</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Current Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-400">700MW+</div>
                  <div className="text-slate-400">Power Capacity</div>
                  <div className="text-2xl font-bold text-blue-400">1,000+</div>
                  <div className="text-slate-400">Acres</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Exit Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-purple-400">~2 Year</div>
                  <div className="text-slate-400">Hold Period</div>
                  <div className="text-lg font-semibold text-pink-400">Data Center Premium</div>
                  <div className="text-slate-400">Exit Value</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Thesis */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Our Thesis
            </h2>
            <p className="text-2xl text-slate-300 font-semibold">
              Power Arbitrage → Data Center Gold
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mt-1">
                  <Cpu className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">AI/HPC Explosion</h3>
                  <p className="text-slate-300">Exponential demand for compute power driving unprecedented data center expansion</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mt-1">
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Power Scarcity</h3>
                  <p className="text-slate-300">Limited high-capacity power sites creating massive value arbitrage opportunities</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mt-1">
                  <Building className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Industrial Transformation</h3>
                  <p className="text-slate-300">Converting undervalued industrial sites into premium digital infrastructure real estate</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-2xl font-bold mb-6 text-center text-white">Value Creation Model</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-300">Industrial Land</span>
                  <span className="text-green-400 font-bold">$50k/acre</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-300">Power Infrastructure</span>
                  <span className="text-blue-400 font-bold">+$200k/MW</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                  <span className="text-white font-semibold">Data Center Ready</span>
                  <span className="text-yellow-400 font-bold">$500k+/acre</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VoltScout Demo */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                VoltScout
              </h2>
            </div>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our proprietary AI-powered energy scouting platform that autonomously discovers and analyzes power-rich opportunities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all group">
              <CardHeader>
                <Globe className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">Live Infrastructure Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Real-time substation and transformer mapping across USA/Canada</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all group">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">VoltScore™ AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">AI-based scoring to rank energy sites by development potential</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all group">
              <CardHeader>
                <Cpu className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">Data Center Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Hyperscaler suitability analysis and development feasibility</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Link to="/voltscout">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Access VoltScout Platform
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Leadership Team
            </h2>
            <p className="text-slate-300 text-lg">
              675MW+ of historical power deal experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all group hover:shadow-2xl hover:shadow-blue-500/20">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-white">Team Member {i}</CardTitle>
                  <CardDescription className="text-slate-400">Co-Founder & Managing Partner</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-300 text-sm">
                    Former energy infrastructure executive with 15+ years experience in power development and data center construction.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* LP Portal Access */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Lock className="w-8 h-8 text-blue-400" />
            <h2 className="text-4xl font-bold text-white">Secure LP Portal</h2>
          </div>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Exclusive access to VoltScout's internal reports, site leads, and fund investment dashboards
          </p>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-white">Portal Features</h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Real-time fund performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-slate-300">Property acquisition reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">VoltScout analytics dashboard</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-slate-300">Monthly investor updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-slate-300">Exit opportunity pipeline</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span className="text-slate-300">Direct team communication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Get Access
            </h2>
            <p className="text-slate-300 text-lg">
              Join accredited investors backing the future of digital infrastructure
            </p>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Request Investor Access</CardTitle>
              <CardDescription className="text-slate-400 text-center">
                Connect with our team to explore Fund I opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">First Name</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Last Name</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <Input 
                    type="email" 
                    className="bg-slate-700/50 border-slate-600 text-white" 
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Investment Interest</label>
                  <Textarea 
                    className="bg-slate-700/50 border-slate-600 text-white" 
                    placeholder="Tell us about your investment goals and interest in digital infrastructure..."
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Wattbyte
            </span>
          </div>
          <p className="text-slate-400 mb-4">
            Turning power into profit through intelligent infrastructure investment
          </p>
          <p className="text-slate-500 text-sm">
            © 2024 Wattbyte Infrastructure Fund. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
