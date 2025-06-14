
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Globe, 
  BarChart3, 
  Satellite, 
  Activity, 
  AlertTriangle, 
  Target, 
  Eye, 
  Database, 
  Bot, 
  Zap, 
  ArrowRight 
} from 'lucide-react';

export const VoltScoutSection = () => {
  return (
    <section className="relative z-10 py-12 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-neon-green rounded-xl flex items-center justify-center mr-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-4xl font-bold text-white mb-1">
                VoltScout
              </h2>
              <p className="text-lg text-slate-300 text-left">AI-Powered Energy Discovery Platform</p>
            </div>
          </div>
          <p className="text-lg text-slate-200 max-w-4xl mx-auto leading-relaxed">
            Our proprietary AI-powered energy scouting platform that autonomously discovers, analyzes, and ranks power-rich opportunities across North America in real-time
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group hover:shadow-xl hover:shadow-electric-blue/20">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-6 h-6 text-electric-blue group-hover:scale-110 transition-transform" />
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              </div>
              <CardTitle className="text-white text-base">Live Infrastructure Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 mb-2 text-sm">Real-time substation and transformer mapping across USA/Canada with 24/7 grid monitoring</p>
              <div className="text-xs text-electric-blue font-semibold">• 50,000+ substations tracked</div>
              <div className="text-xs text-electric-yellow font-semibold">• Live capacity updates</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-yellow/50 transition-all group hover:shadow-xl hover:shadow-electric-yellow/20">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-6 h-6 text-electric-yellow group-hover:scale-110 transition-transform" />
                <Badge className="bg-electric-yellow/20 text-electric-yellow text-xs">AI-Powered</Badge>
              </div>
              <CardTitle className="text-white text-base">VoltScore™ AI Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 mb-2 text-sm">Proprietary machine learning algorithm scoring sites 0-100 based on development potential</p>
              <div className="text-xs text-neon-green font-semibold">• 97% accuracy rate</div>
              <div className="text-xs text-electric-yellow font-semibold">• 15+ scoring factors</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group hover:shadow-xl hover:shadow-neon-green/20">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2 mb-2">
                <Satellite className="w-6 h-6 text-neon-green group-hover:scale-110 transition-transform" />
                <Badge className="bg-neon-green/20 text-neon-green text-xs">Computer Vision</Badge>
              </div>
              <CardTitle className="text-white text-base">Satellite Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 mb-2 text-sm">AI-powered satellite analysis detecting industrial sites, cooling infrastructure, and land use patterns</p>
              <div className="text-xs text-electric-blue font-semibold">• 1m resolution imagery</div>
              <div className="text-xs text-electric-yellow font-semibold">• Monthly updates</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-warm-orange/50 transition-all group hover:shadow-xl hover:shadow-warm-orange/20">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-6 h-6 text-warm-orange group-hover:scale-110 transition-transform" />
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              </div>
              <CardTitle className="text-white text-base">Power Rate Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 mb-2 text-sm">Predictive analytics for electricity pricing based on grid congestion and weather patterns</p>
              <div className="text-xs text-warm-orange font-semibold">• 3-year forecasts</div>
              <div className="text-xs text-electric-yellow font-semibold">• Climate modeling</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-electric-blue/50 transition-all group hover:shadow-xl hover:shadow-electric-blue/20">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-6 h-6 text-electric-blue group-hover:scale-110 transition-transform" />
                <Badge className="bg-electric-blue/20 text-electric-blue text-xs">Auto-Alert</Badge>
              </div>
              <CardTitle className="text-white text-base">Broker Auto-Alerting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 mb-2 text-sm">Automated broker outreach and utility interconnect queue monitoring with instant notifications</p>
              <div className="text-xs text-bright-cyan font-semibold">• 2,000+ broker network</div>
              <div className="text-xs text-electric-yellow font-semibold">• Queue position tracking</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-neon-green/50 transition-all group hover:shadow-xl hover:shadow-neon-green/20">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-6 h-6 text-neon-green group-hover:scale-110 transition-transform" />
                <Badge className="bg-neon-green/20 text-neon-green text-xs">Hyperscaler Ready</Badge>
              </div>
              <CardTitle className="text-white text-base">Data Center Suitability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 mb-2 text-sm">Advanced scoring for hyperscaler requirements including AWS, Google Cloud, and Meta specifications</p>
              <div className="text-xs text-electric-blue font-semibold">• Tier compliance check</div>
              <div className="text-xs text-electric-yellow font-semibold">• Latency modeling</div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics Section */}
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-6 border border-slate-700/50 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Advanced Analytics Dashboard</h3>
            <p className="text-slate-200">Real-time market intelligence powered by machine learning</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
              <Eye className="w-6 h-6 text-bright-cyan mb-2" />
              <div className="text-xl font-bold text-white mb-1">24/7</div>
              <div className="text-slate-300 text-xs">Market Surveillance</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
              <Database className="w-6 h-6 text-neon-green mb-2" />
              <div className="text-xl font-bold text-white mb-1">50TB+</div>
              <div className="text-slate-300 text-xs">Data Processed Daily</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
              <Bot className="w-6 h-6 text-electric-yellow mb-2" />
              <div className="text-xl font-bold text-white mb-1">AI Scout</div>
              <div className="text-slate-300 text-xs">Autonomous Discovery</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
              <Zap className="w-6 h-6 text-electric-blue mb-2" />
              <div className="text-xl font-bold text-white mb-1">&lt; 1s</div>
              <div className="text-slate-300 text-xs">Alert Response Time</div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link to="/app">
            <Button size="lg" className="bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white px-8 py-4 text-lg">
              Access VoltScout Platform
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-slate-300 mt-3 text-sm">
            Exclusive access for accredited investors and fund LPs
          </p>
        </div>
      </div>
    </section>
  );
};
