
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
  Lock,
  Satellite,
  Activity,
  Target,
  AlertTriangle,
  Database,
  Eye,
  Bot
} from 'lucide-react';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', { email, message });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Enhanced gradient overlays with logo colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 via-electric-yellow/5 to-neon-green/10"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-electric-yellow rounded-lg flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Wattbyte
            </h1>
            <p className="text-xs text-slate-300">Infrastructure Fund</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link to="/voltscout" className="text-slate-200 hover:text-electric-blue transition-colors">
            VoltScout
          </Link>
          <Button variant="outline" className="border-electric-blue/50 text-electric-blue hover:bg-electric-blue/10">
            Request Access
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="mb-6 border-electric-blue/50 text-electric-blue bg-electric-blue/10">
            Fund I • $25M Target • 2.0-2.5x MOIC
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Turning Power<br />into Profit
          </h1>
          
          <p className="text-xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Next-generation infrastructure fund acquiring power-rich land across North America 
            for AI, HPC, and crypto data centers. Backed by 675MW+ of deal experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white px-8 py-4 text-lg">
              Join Investor Room
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-500 text-slate-200 hover:bg-slate-800 hover:text-white px-8 py-4 text-lg">
              View Pipeline
            </Button>
          </div>
        </div>
      </section>

      {/* Fund Overview */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Fund I Overview
            </h2>
            <p className="text-slate-200 text-lg max-w-2xl mx-auto">
              Strategic acquisition and development of undervalued power assets for premium digital infrastructure
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-electric-yellow rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Target Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-electric-blue">2.0-2.5x</div>
                  <div className="text-slate-300">MOIC</div>
                  <div className="text-2xl font-bold text-electric-yellow">30-40%</div>
                  <div className="text-slate-300">Net IRR</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Current Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-neon-green">700MW+</div>
                  <div className="text-slate-300">Power Capacity</div>
                  <div className="text-2xl font-bold text-electric-blue">1,000+</div>
                  <div className="text-slate-300">Acres</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-warm-orange/50 transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-electric-yellow to-warm-orange rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Exit Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-electric-yellow">~2 Year</div>
                  <div className="text-slate-300">Hold Period</div>
                  <div className="text-lg font-semibold text-warm-orange">Data Center Premium</div>
                  <div className="text-slate-300">Exit Value</div>
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
            <h2 className="text-4xl font-bold mb-4 text-white">
              Our Thesis
            </h2>
            <p className="text-2xl text-slate-200 font-semibold">
              Power Arbitrage → Data Center Gold
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-electric-blue/20 rounded-lg flex items-center justify-center mt-1">
                  <Cpu className="w-4 h-4 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">AI/HPC Explosion</h3>
                  <p className="text-slate-200">Exponential demand for compute power driving unprecedented data center expansion</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-electric-yellow/20 rounded-lg flex items-center justify-center mt-1">
                  <Zap className="w-4 h-4 text-electric-yellow" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Power Scarcity</h3>
                  <p className="text-slate-200">Limited high-capacity power sites creating massive value arbitrage opportunities</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-neon-green/20 rounded-lg flex items-center justify-center mt-1">
                  <Building className="w-4 h-4 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Industrial Transformation</h3>
                  <p className="text-slate-200">Converting undervalued industrial sites into premium digital infrastructure real estate</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-2xl font-bold mb-6 text-center text-white">Value Creation Model</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-200">Industrial Land</span>
                  <span className="text-neon-green font-bold">$50k/acre</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-electric-blue" />
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-200">Power Infrastructure</span>
                  <span className="text-electric-blue font-bold">+$200k/MW</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-electric-yellow" />
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-electric-blue/20 to-electric-yellow/20 rounded-lg border border-electric-blue/30">
                  <span className="text-white font-semibold">Data Center Ready</span>
                  <span className="text-electric-yellow font-bold">$500k+/acre</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VoltScout Platform */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-neon-green rounded-lg flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-5xl font-bold text-white">
                  VoltScout
                </h2>
                <p className="text-sm text-slate-300">Powered by Advanced AI</p>
              </div>
            </div>
            <p className="text-xl text-slate-200 max-w-4xl mx-auto leading-relaxed">
              Our proprietary AI-powered energy scouting platform that autonomously discovers, analyzes, and ranks power-rich opportunities across North America in real-time
            </p>
          </div>

          {/* Core Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group hover:shadow-2xl hover:shadow-electric-blue/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <Globe className="w-8 h-8 text-electric-blue group-hover:scale-110 transition-transform" />
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                </div>
                <CardTitle className="text-white">Live Infrastructure Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Real-time substation and transformer mapping across USA/Canada with 24/7 grid monitoring</p>
                <div className="text-sm text-electric-blue font-semibold">• 50,000+ substations tracked</div>
                <div className="text-sm text-electric-yellow font-semibold">• Live capacity updates</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-yellow/50 transition-all group hover:shadow-2xl hover:shadow-electric-yellow/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="w-8 h-8 text-electric-yellow group-hover:scale-110 transition-transform" />
                  <Badge className="bg-electric-yellow/20 text-electric-yellow text-xs">AI-Powered</Badge>
                </div>
                <CardTitle className="text-white">VoltScore™ AI Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Proprietary machine learning algorithm scoring sites 0-100 based on development potential</p>
                <div className="text-sm text-neon-green font-semibold">• 97% accuracy rate</div>
                <div className="text-sm text-electric-yellow font-semibold">• 15+ scoring factors</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group hover:shadow-2xl hover:shadow-neon-green/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <Satellite className="w-8 h-8 text-neon-green group-hover:scale-110 transition-transform" />
                  <Badge className="bg-neon-green/20 text-neon-green text-xs">Computer Vision</Badge>
                </div>
                <CardTitle className="text-white">Satellite Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">AI-powered satellite analysis detecting industrial sites, cooling infrastructure, and land use patterns</p>
                <div className="text-sm text-electric-blue font-semibold">• 1m resolution imagery</div>
                <div className="text-sm text-electric-yellow font-semibold">• Monthly updates</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-warm-orange/50 transition-all group hover:shadow-2xl hover:shadow-warm-orange/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <Activity className="w-8 h-8 text-warm-orange group-hover:scale-110 transition-transform" />
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </div>
                <CardTitle className="text-white">Power Rate Forecasting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Predictive analytics for electricity pricing based on grid congestion and weather patterns</p>
                <div className="text-sm text-warm-orange font-semibold">• 3-year forecasts</div>
                <div className="text-sm text-electric-yellow font-semibold">• Climate modeling</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group hover:shadow-2xl hover:shadow-electric-blue/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <AlertTriangle className="w-8 h-8 text-electric-blue group-hover:scale-110 transition-transform" />
                  <Badge className="bg-electric-blue/20 text-electric-blue text-xs">Auto-Alert</Badge>
                </div>
                <CardTitle className="text-white">Broker Auto-Alerting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Automated broker outreach and utility interconnect queue monitoring with instant notifications</p>
                <div className="text-sm text-bright-cyan font-semibold">• 2,000+ broker network</div>
                <div className="text-sm text-electric-yellow font-semibold">• Queue position tracking</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group hover:shadow-2xl hover:shadow-neon-green/20">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="w-8 h-8 text-neon-green group-hover:scale-110 transition-transform" />
                  <Badge className="bg-neon-green/20 text-neon-green text-xs">Hyperscaler Ready</Badge>
                </div>
                <CardTitle className="text-white">Data Center Suitability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 mb-3">Advanced scoring for hyperscaler requirements including AWS, Google Cloud, and Meta specifications</p>
                <div className="text-sm text-electric-blue font-semibold">• Tier compliance check</div>
                <div className="text-sm text-electric-yellow font-semibold">• Latency modeling</div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics Section */}
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-8 border border-slate-700/50 mb-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">Advanced Analytics Dashboard</h3>
              <p className="text-slate-200">Real-time market intelligence powered by machine learning</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                <Eye className="w-8 h-8 text-bright-cyan mb-3" />
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-slate-300 text-sm">Market Surveillance</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                <Database className="w-8 h-8 text-neon-green mb-3" />
                <div className="text-2xl font-bold text-white mb-1">50TB+</div>
                <div className="text-slate-300 text-sm">Data Processed Daily</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                <Bot className="w-8 h-8 text-electric-yellow mb-3" />
                <div className="text-2xl font-bold text-white mb-1">AI Scout</div>
                <div className="text-slate-300 text-sm">Autonomous Discovery</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
                <Zap className="w-8 h-8 text-electric-blue mb-3" />
                <div className="text-2xl font-bold text-white mb-1">&lt; 1s</div>
                <div className="text-slate-300 text-sm">Alert Response Time</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/voltscout">
              <Button size="lg" className="bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white px-12 py-6 text-xl">
                Access VoltScout Platform
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <p className="text-slate-300 mt-4 text-sm">
              Exclusive access for accredited investors and fund LPs
            </p>
          </div>
        </div>
      </section>

      {/* LP Portal Access */}
      <section className="relative z-10 py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Lock className="w-8 h-8 text-electric-blue" />
            <h2 className="text-4xl font-bold text-white">Secure LP Portal</h2>
          </div>
          
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Exclusive access to VoltScout's internal reports, site leads, and fund investment dashboards
          </p>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-white">Portal Features</h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
                  <span className="text-slate-200">Real-time fund performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-electric-yellow rounded-full"></div>
                  <span className="text-slate-200">Property acquisition reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                  <span className="text-slate-200">VoltScout analytics dashboard</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warm-orange rounded-full"></div>
                  <span className="text-slate-200">Monthly investor updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-bright-cyan rounded-full"></div>
                  <span className="text-slate-200">Exit opportunity pipeline</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
                  <span className="text-slate-200">Direct team communication</span>
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
            <h2 className="text-4xl font-bold mb-4 text-white">
              Get Access
            </h2>
            <p className="text-slate-200 text-lg">
              Join accredited investors backing the future of digital infrastructure
            </p>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Request Investor Access</CardTitle>
              <CardDescription className="text-slate-300 text-center">
                Connect with our team to explore Fund I opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">First Name</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Last Name</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Email</label>
                  <Input 
                    type="email" 
                    className="bg-slate-700/50 border-slate-600 text-white" 
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Investment Interest</label>
                  <Textarea 
                    className="bg-slate-700/50 border-slate-600 text-white" 
                    placeholder="Tell us about your investment goals and interest in digital infrastructure..."
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white">
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
            <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-white">
              Wattbyte
            </span>
          </div>
          <p className="text-slate-300 mb-4">
            Turning power into profit through intelligent infrastructure investment
          </p>
          <p className="text-slate-400 text-sm">
            © 2024 Wattbyte Infrastructure Fund. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
